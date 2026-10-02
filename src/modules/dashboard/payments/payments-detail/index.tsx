"use client";

import IconArrowRight from "@/components/shared/icons/icon-arrow-right";
import InfoField from "@/components/shared/info-field";
import LinkedPayoutRow from "@/components/shared/linked-payout-row";
import StepHistoryRow from "@/components/shared/step-history-row";
import { Accordion } from "@/components/ui/accordion";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CHECKOUT_STATUS } from "@/enum/checkout";
import { EDocuSignStatus } from "@/enum/docusign";
import { useAdminTransferOwnership } from "@/hooks/useAdminTransferOwnership";
import { ROUTE_DASHBOARD } from "@/lib/constants";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import {
    formatCurrency,
    formatDateTime,
    handleRenderFallbackText,
    isCheckoutStatusExpired,
} from "@/lib/utils";
import { checkoutServices } from "@/services/checkout";
import payoutServices from "@/services/payout";
import { checkout } from "@/types/checkout";
import {
    useQuery,
    useQueryClient,
    UseQueryResult,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import AlertPayments from "./alert-payments";
import StepAgreement from "./step-agreement";
import StepDeposit from "./step-deposit";
import StepFinalPayment from "./step-final-payment";
import StepOwnershipTransfer from "./step-ownership-transfer";
import StepPendingPre from "./step-pending-pre";
import { global } from "@/types/global/global";
import { getAgreementState } from "./agreement-status";

// Map API currentStep to step order
const STEP_ORDER = {
    deposit_payment: 1,
    agreement_signing: 2,
    invoice_payment: 3,
    ownership_transfer: 4,
};

const STEP_NAME_TO_ORDER = {
    pending: 0,
    deposit: 1,
    agreement: 2,
    invoice: 3,
    ownership: 4,
};

// Helper to determine step status based on session data and currentStep
function getStepStatus(
    sessionStatus: string,
    currentStep: string,
    stepName: "pending" | "deposit" | "agreement" | "invoice" | "ownership"
): global.TParticipantStatus {
    // If session is expired or cancelled
    if (
        sessionStatus === CHECKOUT_STATUS.CANCELLED ||
        isCheckoutStatusExpired(sessionStatus)
    ) {
        return "expired";
    }

    // If session is completed, all steps are completed
    if (sessionStatus === CHECKOUT_STATUS.COMPLETED) return "completed";

    // Get current step order from API
    const currentStepOrder =
        STEP_ORDER[currentStep as keyof typeof STEP_ORDER] || 0;
    const thisStepOrder = STEP_NAME_TO_ORDER[stepName];

    // If this step is before current step, it's completed
    if (thisStepOrder < currentStepOrder) {
        return "completed";
    }

    // If this step is the current step, it's pending (active)
    if (thisStepOrder === currentStepOrder) {
        return "pending";
    }

    // If this step is after current step, it's pending (disabled/future)
    return "pending";
}

function normalizeParticipantStatus(
    status?: string
): global.TParticipantStatus {
    if (!status) return "pending";
    const normalized = status.toLowerCase();
    if (
        ["expired", "rejected", "declined", "cancelled", "voided"].some(
            (value) => normalized.includes(value)
        )
    ) {
        return "expired";
    }
    if (
        normalized.includes("signed") ||
        normalized.includes("completed") ||
        normalized.includes("processed")
    ) {
        return "completed";
    }
    return "pending";
}

// Helper to check if step should be disabled
function isStepDisabled(
    currentStep: string,
    stepName: "pending" | "deposit" | "agreement" | "invoice" | "ownership"
): boolean {
    const currentStepOrder =
        STEP_ORDER[currentStep as keyof typeof STEP_ORDER] || 0;
    const thisStepOrder = STEP_NAME_TO_ORDER[stepName];

    // Disable if this step is after the current step
    return thisStepOrder > currentStepOrder;
}

// Helper to check if step should be expanded (accordion)
function isStepExpanded(
    currentStep: string,
    stepName: "pending" | "deposit" | "agreement" | "invoice" | "ownership"
): boolean {
    const currentStepOrder =
        STEP_ORDER[currentStep as keyof typeof STEP_ORDER] || 0;
    const thisStepOrder = STEP_NAME_TO_ORDER[stepName];

    // Only expand the current step
    return thisStepOrder === currentStepOrder;
}

export default function PaymentsDetailModule({
    id,
    setOpenAlert,
    onFileUploaded,
    onTransferOwnership,
    sessionDetailQuery,
}: {
    id: string;
    setOpenAlert: (open: boolean) => void;
    onFileUploaded?: (file: File) => void;
    onTransferOwnership?: (file: File) => Promise<void>;
    sessionDetailQuery?: UseQueryResult<
        checkout.TAdminCheckoutSessionDetail,
        Error
    >;
}) {
    const router = useRouter();
    // Fetch checkout session detail from API

    const sessionData = sessionDetailQuery?.data;
    const participants = React.useMemo(() => {
        if (!sessionData?.transactions?.length) return [];
        const map = new Map<
            string,
            {
                code: string;
                email: string;
                statuses: global.TParticipantStatus[];
            }
        >();
        sessionData.transactions.forEach((tx) => {
            const email =
                tx.seller?.email ||
                tx.seller?.fullName ||
                tx.sellerId ||
                "Unknown seller";
            const status = normalizeParticipantStatus(
                tx.sellerAgreementStatus || tx.payoutStatus || ""
            );
            const existing = map.get(email);
            if (!existing) {
                map.set(email, { code: tx.id, email, statuses: [status] });
            } else {
                existing.statuses.push(status);
            }
        });
        return Array.from(map.values()).map(({ statuses, ...participant }) => ({
            ...participant,
            status: statuses.every((value) => value === "completed")
                ? ("completed" as const)
                : statuses.every((value) => value === "expired")
                  ? ("expired" as const)
                  : ("pending" as const),
        }));
    }, [sessionData?.transactions]);

    const stepHistoryItems = React.useMemo(() => {
        if (!sessionData?.transactions?.length) return [];
        return sessionData.transactions
            .map((tx) => {
                const timestamp = tx.updatedAt || tx.createdAt;
                return {
                    title: tx.transactionType
                        ? tx.transactionType.replace(/_/g, " ")
                        : `${tx.id}`,
                    by: `by ${
                        tx.seller?.email ||
                        tx.buyer?.email ||
                        tx.seller?.fullName ||
                        tx.buyer?.fullName ||
                        "System"
                    }`,
                    at: handleRenderFallbackText(
                        formatDateTime(timestamp).dateTime
                    ),
                    timestamp,
                };
            })
            .sort((a, b) => {
                const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                return bTime - aTime;
            })
            .map(({ timestamp, ...rest }) => rest);
    }, [sessionData?.transactions]);

    const linkedPayouts = React.useMemo(() => {
        if (!sessionData?.transactions?.length) return [];
        return sessionData.transactions.map((tx) => ({
            code: tx.id,
            email:
                tx.seller?.email ||
                tx.seller?.fullName ||
                tx.sellerId ||
                "Unknown seller",
            amount: formatCurrency(tx.totalAmount || 0),
        }));
    }, [sessionData?.transactions]);

    const sellerValue = React.useMemo(() => {
        if (sessionData?.sellers && sessionData.sellers.length > 0) {
            return sessionData.sellers
                .map(
                    (seller) =>
                        seller.fullName ||
                        seller.email ||
                        handleRenderFallbackText(seller.id)
                )
                .join(", ");
        }
        if (sessionData?.transactions && sessionData.transactions.length > 0) {
            const unique = Array.from(
                new Set(
                    sessionData.transactions.map(
                        (tx) =>
                            tx.seller?.fullName ||
                            tx.seller?.email ||
                            tx.sellerId
                    )
                )
            ).filter(Boolean);
            if (unique.length) {
                return unique.join(", ");
            }
        }
        return "N/A";
    }, [sessionData?.sellers, sessionData?.transactions]);

    const buyerValue =
        sessionData?.buyer?.fullName ||
        sessionData?.buyer?.email ||
        handleRenderFallbackText(sessionData?.buyerId || "");

    // ParticipantRow moved inside StepPendingPre
    const handleGetStatus = (
        data: { status: global.TParticipantStatus }[]
    ): global.TParticipantStatus => {
        if (data.length && data.every((item) => item.status === "completed"))
            return "completed";
        if (data.every((item) => item.status === "expired")) return "expired";
        if (data.every((item) => item.status === "pending")) return "pending";
        // fallback
        return "pending";
    };

    // Show loading state
    if (sessionDetailQuery?.isLoading) {
        return <PaymentDetailSkeleton />;
    }
    if (!sessionData) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-typo-note">Session not found</div>
            </div>
        );
    }
    console.log("sessionData", sessionData);
    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-row items-center justify-between">
                    <h2 className="m-0 text-lg font-bold">Payment Details</h2>
                    <div className="flex flex-row items-center gap-3">
                        <div className="flex flex-row items-center gap-1.5">
                            <div className="text-sm text-typo-primary">
                                All transaction
                            </div>
                            <div className="size-4 text-typo-note">
                                <IconArrowRight />
                            </div>
                            <div className="text-sm text-typo-note">
                                {handleRenderFallbackText(id)}
                            </div>
                        </div>
                    </div>
                </div>
                <Card className="bg-bg-main">
                    <CardContent className="flex flex-col px-6 py-5">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-typo-primary">
                                {handleRenderFallbackText(
                                    sessionData?.id || id
                                )}
                            </h2>
                            <div className="text-sm text-typo-note">
                                Created:{" "}
                                {sessionData
                                    ? formatDateTime(sessionData.createdAt)
                                          .dateTime
                                    : "N/A"}
                            </div>
                        </div>
                    </CardContent>
                    <div className="h-px w-full bg-bd-brown" />
                    <CardContent className="px-6 py-5">
                        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] !gap-x-0">
                            <InfoField label="Buyer" value={buyerValue} />
                            <InfoField
                                label="Seller"
                                value={
                                    sessionData?.sellers?.length === 1
                                        ? sellerValue
                                        : `${sessionData?.sellers?.length} sellers`
                                }
                            />
                            <InfoField
                                label="Quantity"
                                value={
                                    sessionData?.quantity
                                        ? `${sessionData.quantity} ${sessionData.quantity > 1 ? "casks" : "cask"}`
                                        : "N/A"
                                }
                            />
                            <InfoField
                                label="Total Value"
                                value={
                                    sessionData?.totalAmount
                                        ? formatCurrency(
                                              sessionData.totalAmount
                                          )
                                        : "N/A"
                                }
                            />
                        </div>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-10">
                    <div className="col-span-7 -mr-4">
                        <div className="space-y-4">
                            <Accordion
                                type="multiple"
                                className="w-full space-y-3"
                                defaultValue={[
                                    isStepExpanded(
                                        sessionData.currentStep,
                                        "pending"
                                    )
                                        ? "pending-pre-step-1"
                                        : "",
                                    isStepExpanded(
                                        sessionData.currentStep,
                                        "deposit"
                                    )
                                        ? "step-1"
                                        : "",
                                    isStepExpanded(
                                        sessionData.currentStep,
                                        "agreement"
                                    )
                                        ? "step-2"
                                        : "",
                                    isStepExpanded(
                                        sessionData.currentStep,
                                        "invoice"
                                    )
                                        ? "step-3"
                                        : "",
                                    isStepExpanded(
                                        sessionData.currentStep,
                                        "ownership"
                                    )
                                        ? "step-4"
                                        : "",
                                ].filter(Boolean)}
                            >
                                <StepPendingPre
                                    participants={participants}
                                    status={
                                        participants.length
                                            ? handleGetStatus(participants)
                                            : getStepStatus(
                                                  sessionData.status,
                                                  sessionData.currentStep,
                                                  "pending"
                                              )
                                    }
                                    expiryDate={sessionData.expiryDate}
                                    isDisabled={isStepDisabled(
                                        sessionData.currentStep,
                                        "pending"
                                    )}
                                />

                                <StepDeposit
                                    status={getStepStatus(
                                        sessionData.status,
                                        sessionData.currentStep,
                                        "deposit"
                                    )}
                                    amount={sessionData.depositAmount}
                                    transactionId={
                                        sessionData.stripePaymentIntentId ||
                                        "N/A"
                                    }
                                    processedAt={handleRenderFallbackText(
                                        formatDateTime(
                                            sessionData.depositPaidAt as string
                                        ).dateTime
                                    )}
                                    checkoutSessionId={id}
                                    isDisabled={isStepDisabled(
                                        sessionData.currentStep,
                                        "deposit"
                                    )}
                                />
                                <StepAgreement
                                    checkoutSessionId={id}
                                    status={
                                        sessionData.transactions.some(
                                            (tx) =>
                                                getAgreementState(
                                                    tx,
                                                    sessionData.agreementType,
                                                    sessionData.buyerDocuSignAdminSignedAt,
                                                    sessionData.status
                                                ).canReview
                                        )
                                            ? EDocuSignStatus.PENDING
                                            : (getStepStatus(
                                                  sessionData.status,
                                                  sessionData.currentStep,
                                                  "agreement"
                                              ) as EDocuSignStatus)
                                    }
                                    // buyerDocuSignStatus={
                                    //     sessionData.buyerDocuSignStatus
                                    // }
                                    buyerDocuSignAdminSignedAt={
                                        sessionData.buyerDocuSignAdminSignedAt
                                    }
                                    agreementType={sessionData.agreementType}
                                    agreementId={
                                        sessionData.agreementType === "indirect"
                                            ? (sessionData?.buyerDocuSignEnvelopeId as string)
                                            : sessionData?.transactions.map(
                                                  (transaction) =>
                                                      transaction.sellerAgreementDocuSignEnvelopeId as string
                                              )
                                    }
                                    currentStatus={sessionData.status}
                                    processedAt={handleRenderFallbackText(
                                        formatDateTime(
                                            sessionData.buyerDocuSignSignedAt as string
                                        ).dateTime
                                    )}
                                    isDisabled={isStepDisabled(
                                        sessionData.currentStep,
                                        "agreement"
                                    )}
                                    transactions={sessionData.transactions.map(
                                        (transaction) => ({
                                            ...transaction,
                                            ...(!transaction?.buyerDocuSignEnvelopeId && {
                                                buyerDocuSignEnvelopeId:
                                                    sessionData?.buyerDocuSignEnvelopeId,
                                            }),
                                        })
                                    )}
                                    userId={
                                        sessionData?.buyer?.email ||
                                        sessionData?.buyerId ||
                                        ""
                                    }
                                />
                                <StepFinalPayment
                                    status={getStepStatus(
                                        sessionData.status,
                                        sessionData.currentStep,
                                        "invoice"
                                    )}
                                    manualPaymentEvidenceUrl={
                                        sessionData.manualPaymentEvidenceUrl
                                    }
                                    manualPaymentStatus={
                                        sessionData.manualPaymentStatus ||
                                        sessionData.paymentDetails
                                            ?.manualPaymentStatus
                                    }
                                    manualPaymentRejectionReason={
                                        sessionData.manualPaymentRejectionReason ||
                                        sessionData.paymentDetails
                                            ?.manualPaymentRejectionReason
                                    }
                                    paymentStatus={sessionData.status}
                                    amount={sessionData.remainingAmount}
                                    transactionId={
                                        sessionData.transactions[0]?.id || "N/A"
                                    }
                                    processedAt={handleRenderFallbackText(
                                        formatDateTime(
                                            sessionData.invoicePaidAt as string
                                        ).dateTime
                                    )}
                                    paymentMethod={sessionData.paymentMethod}
                                    checkoutSessionId={id}
                                    isDisabled={isStepDisabled(
                                        sessionData.currentStep,
                                        "invoice"
                                    )}
                                />
                                <StepOwnershipTransfer
                                    status={getStepStatus(
                                        sessionData.status,
                                        sessionData.currentStep,
                                        "ownership"
                                    )}
                                    isCompleted={
                                        sessionData.status ===
                                        CHECKOUT_STATUS.COMPLETED
                                    }
                                    ownership={{
                                        documentUrl:
                                            sessionData.ownershipTransferDocumentUrl ||
                                            "",
                                        documentUploadedAt:
                                            sessionData.ownershipTransferDocumentUploadedAt ||
                                            "",
                                    }}
                                    id={id}
                                    onOpenAlert={() => setOpenAlert(true)}
                                    onFileUploaded={onFileUploaded}
                                    isDisabled={isStepDisabled(
                                        sessionData.currentStep,
                                        "ownership"
                                    )}
                                />
                            </Accordion>
                        </div>
                    </div>
                    <div className="col-start-8 col-end-11 flex flex-col gap-6">
                        <Card className="bg-bg-main">
                            <CardHeader className="px-5 py-4">
                                <div className="text-base font-semibold text-typo-primary">
                                    Step History
                                </div>
                            </CardHeader>
                            <div className="mx-4 h-px bg-bd-brown" />
                            <CardContent className="px-5 pt-2">
                                <div className="flex flex-col">
                                    {stepHistoryItems.length > 0 ? (
                                        stepHistoryItems.map(
                                            (history, index) => (
                                                <StepHistoryRow
                                                    key={history.title + index}
                                                    title={history.title}
                                                    by={history.by}
                                                    at={history.at}
                                                />
                                            )
                                        )
                                    ) : (
                                        <div className="py-3 text-sm text-typo-note">
                                            No history available yet.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-bg-main">
                            <CardHeader className="flex flex-row items-center justify-between px-5 py-4">
                                <div className="text-base font-semibold text-typo-primary">
                                    Linked Payouts
                                </div>
                                <div className="text-sm text-typo-note">
                                    {linkedPayouts.length} payout(s)
                                </div>
                            </CardHeader>
                            <div className="mx-4 h-px bg-bd-brown" />
                            <CardContent className="px-5 pt-2">
                                <div className="flex flex-col">
                                    {linkedPayouts.length > 0 ? (
                                        linkedPayouts.map((payout) => (
                                            <LinkedPayoutRow
                                                key={payout.code + payout.email}
                                                code={payout.code}
                                                email={payout.email}
                                                amount={payout.amount}
                                                onClick={() =>
                                                    router.push(
                                                        `${ROUTE_DASHBOARD.PAYOUT}/${payout.code}`
                                                    )
                                                }
                                            />
                                        ))
                                    ) : (
                                        <div className="py-3 text-sm text-typo-note">
                                            No payouts linked yet.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                {/* Dialog & AlertDialog setup (similar to /wallet), separated components */}
            </div>
        </>
    );
}

export const PaymentDetailModuleWrap = ({ id }: { id: string }) => {
    const [openAlert, setOpenAlert] = React.useState(false);
    const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
    const { transferOwnership } = useAdminTransferOwnership(id);
    const queryClient = useQueryClient();
    const sessionDetailQuery = useQuery({
        queryKey: [CHECKOUT_KEYS.GET_ADMIN_SESSIONS, id],
        queryFn: async () => {
            try {
                const result =
                    await checkoutServices.getAdminCheckoutSessionDetail(id);
                return result;
            } catch (error) {
                const err = error as Error & { code?: string };
                if (
                    err?.message === "canceled" ||
                    err?.name === "CanceledError" ||
                    err?.code === "ERR_CANCELED"
                ) {
                    throw error;
                }
                console.error("Error fetching session detail:", error);
                return null;
            }
        },
        enabled: !!id,
        staleTime: 30 * 1000, // 30 seconds
    });
    const handleTransferOwnership = async (file: File) => {
        await transferOwnership(file);
        setOpenAlert(false);
    };
    // handle in BE
    // const handlePayout = async (transactionId: string) => {
    //     const id = sessionDetailQuery.data?.transactions[0]?.id;
    //     console.log('id', id)
    //     if (id) {
    //         await payoutServices.triggerPayout(id);
    //     }
    // };

    const handleConfirm = async () => {
        if (uploadedFile) {
            await handleTransferOwnership(uploadedFile);
            queryClient.invalidateQueries({
                queryKey: [CHECKOUT_KEYS.GET_ADMIN_SESSIONS, id],
            });
        } else {
            toast.error("Please upload a file first");
        }
    };
    return (
        <>
            <PaymentsDetailModule
                id={id}
                sessionDetailQuery={
                    sessionDetailQuery as UseQueryResult<
                        checkout.TAdminCheckoutSessionDetail,
                        Error
                    >
                }
                setOpenAlert={setOpenAlert}
                onFileUploaded={(file) => setUploadedFile(file)}
                onTransferOwnership={handleTransferOwnership}
            />

            <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
                <AlertPayments onConfirm={handleConfirm} />
            </AlertDialog>
        </>
    );
};

const PaymentDetailSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-row items-center justify-between">
                <Skeleton className="h-7 w-48" />
                <div className="flex flex-row items-center gap-1.5">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </div>

            {/* Main Info Card Skeleton */}
            <Card className="bg-bg-main">
                <CardContent className="flex flex-col px-6 py-5">
                    <Skeleton className="mb-2 h-7 w-64" />
                    <Skeleton className="h-5 w-48" />
                </CardContent>
                <div className="h-px w-full bg-bd-brown" />
                <CardContent className="px-6 py-5">
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr] !gap-x-0">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <Skeleton className="mb-1 h-4 w-16" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Grid Layout Skeleton */}
            <div className="grid grid-cols-10">
                {/* Left Column - Accordion Steps */}
                <div className="col-span-7 -mr-4">
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Card key={i} className="bg-bg-main">
                                <CardHeader className="px-6 py-4">
                                    <div className="flex flex-row items-center justify-between">
                                        <div className="flex flex-row items-center gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <Skeleton className="h-6 w-48" />
                                        </div>
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right Column - Sidebar Cards */}
                <div className="col-start-8 col-end-11 flex flex-col gap-6">
                    {/* Step History Card Skeleton */}
                    <Card className="bg-bg-main">
                        <CardHeader className="px-5 py-4">
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <div className="mx-4 h-px bg-bd-brown" />
                        <CardContent className="px-5 pt-2">
                            <div className="flex flex-col gap-4">
                                {[1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col gap-1 py-2"
                                    >
                                        <Skeleton className="mb-1 h-5 w-full" />
                                        <Skeleton className="mb-1 h-4 w-32" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Linked Payouts Card Skeleton */}
                    <Card className="bg-bg-main">
                        <CardHeader className="flex flex-row items-center justify-between px-5 py-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-5 w-20" />
                        </CardHeader>
                        <div className="mx-4 h-px bg-bd-brown" />
                        <CardContent className="px-5 pt-2">
                            <div className="flex flex-col gap-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="flex flex-row items-center justify-between py-2"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="mb-1 h-5 w-24" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                        <Skeleton className="h-5 w-20" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
