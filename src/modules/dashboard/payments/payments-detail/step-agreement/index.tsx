"use client";

import PaymentStepCard from "@/components/shared/payment-step-card";
import StatusAlert from "@/components/shared/status-alert";
import StepRowAccordion from "@/components/shared/step-row-accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CHECKOUT_STATUS } from "@/enum/checkout";
import { EDocuSignStatus } from "@/enum/docusign";
import { CHECKOUT_KEYS, KEY_DOCUSIGN } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import AgreementReviewSheet from "@/modules/dashboard/payments/payments-detail/agreement-review-sheet";
import { checkoutServices } from "@/services/checkout";
import docusignServices from "@/services/docusign";
import { transaction } from "@/types/transaction";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getAgreementState } from "../agreement-status";

type StepAgreementProps = {
    status: EDocuSignStatus;
    agreementId: string | string[];
    agreementType?: string | null;
    processedAt: string;
    isAccordion?: boolean;
    isDisabled?: boolean;
    checkoutSessionId?: string;
    currentStatus: CHECKOUT_STATUS;
    buyerDocuSignAdminSignedAt: string | null;
    transactions: transaction.TTransaction[];
    userId: string;
};

export default function StepAgreement({
    status,
    agreementId,
    transactions,
    agreementType,
    processedAt,
    isAccordion = true,
    isDisabled = false,
    checkoutSessionId,
    currentStatus,
    buyerDocuSignAdminSignedAt,
    userId,
}: StepAgreementProps) {
    const transactionMapping = useMemo(() => {
        const seen = new Set<string>();
        return transactions.filter((t) => {
            const isDirect = agreementType === "direct";
            if (
                !t?.buyerDocuSignEnvelopeId &&
                !isDirect &&
                !t.sellerAgreementDocuSignEnvelopeId
            )
                return false;
            const envelopeId = isDirect
                ? t.sellerAgreementDocuSignEnvelopeId
                : t.buyerDocuSignEnvelopeId;
            if (!envelopeId) return false;
            if (seen?.has(envelopeId)) return false;
            seen?.add(envelopeId);
            return true;
        });
    }, [transactions, agreementType]);

    const queryClient = useQueryClient();
    const [reviewSheetOpen, setReviewSheetOpen] = useState(false);

    const invalidateSessionDetail = () => {
        if (!checkoutSessionId) return;
        queryClient.invalidateQueries({
            queryKey: [CHECKOUT_KEYS.GET_ADMIN_SESSIONS, checkoutSessionId],
        });
        queryClient.refetchQueries({
            queryKey: [CHECKOUT_KEYS.GET_ADMIN_SESSIONS, checkoutSessionId],
        });
    };

    const approveAgreementMutation = useMutation({
        mutationFn: async (transactionId: string) => {
            await checkoutServices.approveBuyerAgreement(transactionId);
        },
        mutationKey: [CHECKOUT_KEYS.BUYER_AGREEMENT_APPROVE, checkoutSessionId],
        onSuccess: () => {
            toast.success("Agreement approved successfully");
            invalidateSessionDetail();
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to approve agreement"));
        },
    });

    const rejectAgreementMutation = useMutation({
        mutationFn: async (payload: {
            reason: string;
            transactionId: string;
        }) => {
            const { reason, transactionId } = payload;
            await checkoutServices.rejectBuyerAgreement(transactionId, reason);
        },
        mutationKey: [CHECKOUT_KEYS.BUYER_AGREEMENT_REJECT, checkoutSessionId],
        onSuccess: () => {
            setReviewSheetOpen(false);
            invalidateSessionDetail();
            toast.success("Agreement rejected successfully");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to reject agreement"));
        },
    });

    const getAdminSigningLinkMutation = useMutation({
        mutationFn: async () => {
            if (!checkoutSessionId) return;
            return await docusignServices.getAdminBuyerAgreementLink(
                checkoutSessionId
            );
        },
        mutationKey: [
            KEY_DOCUSIGN.GET_BUYER_AGREEMENT_LINK,
            "admin",
            checkoutSessionId,
        ],
        onSuccess: (data) => {
            if (data?.signingUrl) {
                window.open(data.signingUrl, "_blank");
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to get signing link"));
        },
    });

    const requestUpdateBuyerAgreementMutation = useMutation({
        mutationFn: async ({
            reason,
            transactionIds,
        }: {
            reason: string;
            transactionIds: string[];
        }) => {
            if (!checkoutSessionId) return;
            await checkoutServices.requestUpdateBuyerAgreement(
                checkoutSessionId,
                reason,
                transactionIds
            );
        },
        mutationKey: [
            CHECKOUT_KEYS.BUYER_AGREEMENT_REQUEST_UPDATE,
            checkoutSessionId,
        ],
        onSuccess: () => {
            toast.success("Update requested successfully");
            invalidateSessionDetail();
        },
        onError: (error) => {
            toast.error(
                getErrorMessage(error, "Failed to request agreement update")
            );
        },
    });

    const handleRejectAgreement = async (payload: {
        reason: string;
        transactionId: string;
    }) => {
        await rejectAgreementMutation.mutateAsync(payload);
    };

    const handleRequestUpdateAgreement = ({
        reason,
        transactionIds,
    }: {
        reason: string;
        transactionIds: string[];
    }) => {
        requestUpdateBuyerAgreementMutation.mutate({
            reason: reason,
            transactionIds: transactionIds,
        });
    };

    const isActionLoading =
        approveAgreementMutation.isPending ||
        rejectAgreementMutation.isPending ||
        getAdminSigningLinkMutation.isPending ||
        requestUpdateBuyerAgreementMutation.isPending;

    const showReviewActions = transactionMapping.some(
        (transaction) =>
            getAgreementState(
                transaction,
                agreementType,
                buyerDocuSignAdminSignedAt,
                currentStatus
            ).canReview
    );

    const renderAgreementActionCell = (
        transaction: transaction.TTransaction
    ) => {
        const agreementState = getAgreementState(
            transaction,
            agreementType,
            buyerDocuSignAdminSignedAt,
            currentStatus
        );
        if (status === "expired" || agreementState.isFailed) {
            return null;
        }

        if (agreementState.isWaiting) {
            return (
                <div className="text-xs text-typo-note">
                    Waiting for{" "}
                    {agreementType === "direct" ? "seller" : "buyer"} to sign
                </div>
            );
        }
        return (
            <Button
                size="sm"
                variant="secondary"
                className="h-8 px-3 text-xs font-semibold"
                onClick={() => setReviewSheetOpen(true)}
                disabled={!transactionMapping.length}
            >
                Preview
            </Button>
        );
    };

    return (
        <StepRowAccordion
            title="Step 2: Agreement"
            value="step-2"
            status={status}
            isActive={!isDisabled}
            isAccordion={isAccordion}
            isDisabled={isDisabled}
        >
            <PaymentStepCard>
                <div className="overflow-hidden rounded-lg border border-bd-brown bg-bg-main">
                    <div className="">
                        <Table>
                            <TableHeader className="bg-bg-sf1">
                                <TableRow className="grid grid-cols-[2fr_1.2fr_1.2fr_0.8fr] gap-0">
                                    <TableHead className="p-3 text-sm">
                                        Agreement
                                    </TableHead>
                                    <TableHead className="p-3 text-sm">
                                        Agreement Type
                                    </TableHead>
                                    <TableHead className="p-3 text-sm">
                                        Status
                                    </TableHead>
                                    <TableHead className="p-3 text-right text-sm">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="p-3">
                                {transactionMapping.map((transaction) => {
                                    const tableStatus = getAgreementState(
                                        transaction,
                                        agreementType,
                                        buyerDocuSignAdminSignedAt,
                                        currentStatus
                                    );
                                    return (
                                        <TableRow
                                            key={transaction.id}
                                            className="grid grid-cols-[2fr_1.2fr_1.2fr_0.8fr] gap-0 px-3"
                                        >
                                            <TableCell className="flex flex-col gap-0.5">
                                                <span className="line-clamp-1 text-sm font-medium text-typo-primary">
                                                    {
                                                        transaction.sellerAgreementDocuSignEnvelopeId
                                                    }
                                                </span>
                                                <span className="text-xs text-typo-note">
                                                    {userId}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-typo-primary">
                                                {(agreementType
                                                    ?.slice(0, 1)
                                                    .toUpperCase() ?? "") +
                                                    (agreementType?.slice(1) ??
                                                        "")}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        tableStatus.variant
                                                    }
                                                    className="text-xs font-medium"
                                                >
                                                    {tableStatus.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-right">
                                                {renderAgreementActionCell(
                                                    transaction
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </PaymentStepCard>
            {transactionMapping.some(
                (transaction) =>
                    getAgreementState(
                        transaction,
                        agreementType,
                        buyerDocuSignAdminSignedAt,
                        currentStatus
                    ).isFailed
            ) && (
                <StatusAlert
                    variant="expired"
                    title="Agreement rejected or expired"
                />
            )}
            <AgreementReviewSheet
                open={reviewSheetOpen}
                onOpenChange={setReviewSheetOpen}
                transactions={transactionMapping}
                userId={userId}
                agreementType={agreementType}
                buyerDocuSignAdminSignedAt={buyerDocuSignAdminSignedAt}
                sessionStatus={currentStatus}
                onReject={handleRejectAgreement}
                onApprove={(transactionId) =>
                    approveAgreementMutation.mutateAsync(transactionId)
                }
                onSign={() => getAdminSigningLinkMutation.mutateAsync()}
                isActionLoading={isActionLoading}
                showActions={showReviewActions}
                onRequestUpdate={handleRequestUpdateAgreement}
                checkoutSessionId={checkoutSessionId}
                onRequestUpdateSuccess={invalidateSessionDetail}
            />
        </StepRowAccordion>
    );
}
