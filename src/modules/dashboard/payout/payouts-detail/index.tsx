"use client";

import IconArrowRight from "@/components/shared/icons/icon-arrow-right";
import InfoField from "@/components/shared/info-field";
import LinkedPayoutRow from "@/components/shared/linked-payout-row";
import StepHistoryRow from "@/components/shared/step-history-row";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPayoutStatus } from "@/enum/payout";
import { KEY_PAYOUT, ROUTE_DASHBOARD } from "@/lib/constants";
import {
    formatCurrency,
    formatDateTime,
    handleRenderFallbackText,
} from "@/lib/utils";
import payoutServices from "@/services/payout";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import StepAgreement from "./step-agreement";
import StepPayoutBreakdown from "./step-payout-breakdown";
import StepPayoutMethod from "./step-payout-method";
import { global } from "@/types/global/global";
import { getPayoutAgreementState } from "./agreement-status";

export default function PayoutsDetailModule({
    transactionId,
}: {
    transactionId: string;
}) {
    const router = useRouter();

    const {
        data: payout,
        isLoading,
        isError,
    } = useQuery({
        queryKey: [KEY_PAYOUT.GET_ADMIN_SETTLEMENTS, transactionId],
        queryFn: () => payoutServices.getAdminSettlementDetail(transactionId),
    });

    if (isLoading) {
        return <PayoutDetailSkeleton />;
    }

    if (isError || !payout) {
        return (
            <div className="rounded-lg border border-error bg-error/5 p-4 text-sm text-error">
                Payout not found
            </div>
        );
    }

    const createdAtLabel = payout.createdAt
        ? formatDateTime(payout.createdAt).dateTime
        : "-";

    const quantityLabel =
        payout.quantity != null ? `${payout.quantity} casks` : "-";

    const totalValueLabel =
        payout.totalAmount != null ? formatCurrency(payout.totalAmount) : "-";

    const sellerEmail =
        payout.sellers?.[0]?.email ||
        payout.seller?.email ||
        handleRenderFallbackText("");

    const buyerEmail =
        payout.buyer?.email || handleRenderFallbackText(payout.buyerId);

    const agreementStatus = getPayoutAgreementState(payout).status;

    const payoutStatusAsParticipant: global.TParticipantStatus =
        payout.payoutStatus === AdminPayoutStatus.COMPLETED
            ? "completed"
            : payout.payoutStatus === AdminPayoutStatus.FAILED
                ? "expired"
                : "pending";

    const processingFee = (payout.totalAmount ?? 0) * 0.05;
    const payoutAmount = (payout.totalAmount ?? 0) - processingFee;

    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between">
                <h2 className="m-0 text-lg font-bold">Payout Details</h2>
                <div className="flex flex-row items-center gap-3">
                    <div className="flex flex-row items-center gap-1.5">
                        <div className="text-sm text-typo-primary">
                            All transaction
                        </div>
                        <div className="size-4 text-typo-note">
                            <IconArrowRight />
                        </div>
                        <div className="text-sm text-typo-note">
                            {handleRenderFallbackText(transactionId)}
                        </div>
                    </div>
                </div>
            </div>
            <Card className="bg-bg-main">
                <CardContent className="flex flex-col px-6 py-5">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold text-typo-primary">
                            {handleRenderFallbackText(payout.references.askId)}
                        </h2>
                        <div className="text-sm text-typo-note">
                            Created: {createdAtLabel}
                        </div>
                    </div>
                </CardContent>
                <div className="h-px w-full bg-bd-brown" />
                <CardContent className="px-6 py-5">
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr] !gap-x-0">
                        <div className="flex flex-col gap-1">
                            <InfoField label="Seller" value={sellerEmail} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <InfoField label="Buyer" value={buyerEmail} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <InfoField label="Quantity" value={quantityLabel} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <InfoField
                                label="Total Value"
                                value={totalValueLabel}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-10">
                <div className="col-span-7 -mr-4">
                    <div className="space-y-4">
                        <StepAgreement
                            {...payout}
                            status={agreementStatus}
                            agreementId={
                                payout?.sellerAgreementDocuSignEnvelopeId
                            }
                            transactionId={payout.id}
                            sellerAgreementReleaseFormUrl={
                                payout.sellerAgreementReleaseFormUrl
                            }
                            agreementType={payout.agreementType}
                            signedAt={payout?.sellerAgreementSignedAt}
                            isActive
                            isAccordion={false}
                        />
                        <StepPayoutBreakdown
                            caskValue={payout.totalAmount ?? 0}
                            processingFee={processingFee}
                            processingFeePercentage={5}
                            payoutAmount={payoutAmount}
                            payoutStatus={payout.payoutStatus}
                            payoutAt={payout.payoutProcessedAt}
                            linkedPaymentId={
                                payout.references?.checkoutSessionId
                            }
                            status={payoutStatusAsParticipant}
                            isActive
                            isAccordion={false}
                        />
                        {!!payout?.sellerPaymentInformation?.bankAccounts
                            .length && (
                                <StepPayoutMethod
                                    bankName={
                                        payout?.sellerPaymentInformation
                                            ?.bankAccounts[0]?.bankName as string
                                    }
                                    bankAccount={
                                        payout?.sellerPaymentInformation
                                            ?.bankAccounts[0]?.last4 as string
                                    }
                                    isActive
                                />
                            )}
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
                                {[
                                    {
                                        title: "Payout created",
                                        by: "System",
                                        at: createdAtLabel,
                                    },
                                    payout.payoutReadyAt && {
                                        title: "Payout ready",
                                        by: "System",
                                        at: new Date(
                                            payout.payoutReadyAt
                                        ).toLocaleString(),
                                    },
                                    payout.payoutProcessedAt && {
                                        title: "Payout processed",
                                        by: "System",
                                        at: new Date(
                                            payout.payoutProcessedAt
                                        ).toLocaleString(),
                                    },
                                    payout?.sellerAgreementSignedAt && {
                                        title: "Agreement signed",
                                        by:
                                            payout.sellers?.[0]?.email ||
                                            "Seller",
                                        at: new Date(
                                            payout.sellerAgreementSignedAt
                                        ).toLocaleString(),
                                    },
                                    payout.sellerAgreementAdminSignedAt && {
                                        title:
                                            payout.agreementType === "indirect"
                                                ? "Agreement signed"
                                                : "Agreement approved",
                                        by: "Admin",
                                        at: new Date(
                                            payout.sellerAgreementAdminSignedAt
                                        ).toLocaleString(),
                                    },
                                ]
                                    .filter(
                                        (
                                            h
                                        ): h is {
                                            title: string;
                                            by: string;
                                            at: string;
                                        } => Boolean(h)
                                    )
                                    .map((h) => (
                                        <StepHistoryRow
                                            key={`${h.title}-${h.at}`}
                                            title={h.title}
                                            by={h.by}
                                            at={h.at}
                                        />
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-bg-main">
                        <CardHeader className="flex flex-row items-center justify-between px-5 py-4">
                            <div className="text-base font-semibold text-typo-primary">
                                Linked Payment
                            </div>
                        </CardHeader>
                        <div className="mx-4 h-px bg-bd-brown" />
                        <CardContent className="px-5 pt-2">
                            <div className="flex flex-col">
                                {[
                                    {
                                        code:
                                            payout.references
                                                ?.checkoutSessionId || "",
                                        email: payout.seller?.email || "",
                                        amount: totalValueLabel,
                                    },
                                ].map((item) => (
                                    <LinkedPayoutRow
                                        key={item.code + item.email}
                                        code={item.code}
                                        email={item.email}
                                        amount={item.amount}
                                        onClick={() =>
                                            router.push(
                                                `${ROUTE_DASHBOARD.PAYMENTS}/${payout.references?.checkoutSessionId}`
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

const PayoutDetailSkeleton = () => {
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
                {/* Left Column - Steps */}
                <div className="col-span-7 -mr-4">
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
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
                        </CardHeader>
                        <div className="mx-4 h-px bg-bd-brown" />
                        <CardContent className="px-5 pt-2">
                            <div className="flex flex-col gap-3">
                                {[1].map((i) => (
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
