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
import { CHECKOUT_KEYS, KEY_DOCUSIGN, KEY_PAYOUT } from "@/lib/constants";
import { getErrorMessage, handleRenderFallbackText } from "@/lib/utils";
import PayoutAgreementReviewSheet from "@/modules/dashboard/payout/payouts-detail/payout-agreement-review-sheet";
import { checkoutServices } from "@/services/checkout";
import docusignServices from "@/services/docusign";
import { payout } from "@/types";
import { global } from "@/types/global/global";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getPayoutAgreementState } from "../agreement-status";

type StepAgreementProps = {
    status: global.TParticipantStatus;
    agreementId?: string | null;
    sellerAgreementReleaseFormUrl?: string | null;
    agreementType?: string | null;
    signedAt?: string | null;
    isActive?: boolean;
    isAccordion?: boolean;
    transactionId?: string;
} & Partial<payout.TAdminSettlementDetail>;

export default function StepAgreement({
    status,
    agreementId,
    agreementType,
    signedAt,
    sellerAgreementReleaseFormUrl,
    isActive = true,
    isAccordion = false,
    transactionId,
    sellerAgreementRejectedAt,
    sellerAgreementAdminSignedAt,
    sellerAgreementAdminSignerId,
    sellerAgreementAdminRejectedAt,
    sellerAgreementAdminRejectionReason,
    sellerAgreementExpiredAt,
    sellerAgreementStatus,
    seller,
    buyer,
    buyerId,
}: StepAgreementProps) {
    const queryClient = useQueryClient();
    const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
    const agreementIds = agreementId ? [agreementId] : [];
    const documentUrls =
        sellerAgreementReleaseFormUrl && agreementId
            ? [sellerAgreementReleaseFormUrl]
            : [];

    const invalidatePayoutDetail = () => {
        if (!transactionId) return;
        queryClient.invalidateQueries({
            queryKey: [KEY_PAYOUT.GET_ADMIN_SETTLEMENTS, transactionId],
        });
        queryClient.refetchQueries({
            queryKey: [KEY_PAYOUT.GET_ADMIN_SETTLEMENTS, transactionId],
        });
    };

    const renderAgreementActionCell = () => {
        if (status === "expired") {
            return null;
        }
        if (agreementState.isWaiting) {
            return (
                <div className="text-xs text-typo-note">
                    Waiting for Seller to sign
                </div>
            );
        }
        if (agreementId) {
            return (
                <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 px-3 text-xs font-semibold"
                    onClick={() => setReviewSheetOpen(true)}
                    disabled={!agreementId}
                >
                    Preview
                </Button>
            );
        }
        return null;
    };

    const approveAgreementMutation = useMutation({
        mutationFn: async () => {
            if (!transactionId) return;
            await checkoutServices.approveSellerAgreement(transactionId);
        },
        mutationKey: [CHECKOUT_KEYS.SELLER_AGREEMENT_APPROVE, transactionId],
        onSuccess: () => {
            invalidatePayoutDetail();
            toast.success("Agreement approved successfully");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to approve agreement"));
        },
    });

    const rejectAgreementMutation = useMutation({
        mutationFn: async (reason: string) => {
            if (!transactionId) return;
            await checkoutServices.rejectSellerAgreement(transactionId, reason);
        },
        mutationKey: [CHECKOUT_KEYS.SELLER_AGREEMENT_REJECT, transactionId],
        onSuccess: () => {
            setReviewSheetOpen(false);
            invalidatePayoutDetail();
            toast.success("Agreement rejected successfully");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to reject agreement"));
        },
    });

    const getAdminSigningLinkMutation = useMutation({
        mutationFn: async () => {
            if (!transactionId) return;
            return await docusignServices.getAdminSellerAgreementLink(
                transactionId
            );
        },
        mutationKey: [
            KEY_DOCUSIGN.GET_SELLER_AGREEMENT_LINK,
            "admin",
            transactionId,
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
    const requestUpdateSellerAgreementMutation = useMutation({
        mutationFn: async (reason: string) => {
            if (!transactionId) return;
            await checkoutServices.requestUpdateSellerAgreement(
                transactionId,
                reason
            );
        },
        mutationKey: [
            CHECKOUT_KEYS.SELLER_AGREEMENT_REQUEST_UPDATE,
            transactionId,
        ],
        onSuccess: () => {
            invalidatePayoutDetail();
            toast.success("Agreement updated successfully");
        },

        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to update agreement"));
        },
    });

    const handleRejectAgreement = async (reason: string) => {
        await rejectAgreementMutation.mutateAsync(reason);
    };

    const handleRequestUpdateAgreement = async (reason: string) => {
        await requestUpdateSellerAgreementMutation.mutateAsync(reason);
    };

    const isActionLoading =
        approveAgreementMutation.isPending ||
        rejectAgreementMutation.isPending ||
        getAdminSigningLinkMutation.isPending ||
        requestUpdateSellerAgreementMutation.isPending;

    const agreementState = getPayoutAgreementState({
        sellerAgreementStatus,
        sellerAgreementSignedAt: signedAt,
        sellerAgreementRejectedAt,
        sellerAgreementAdminSignedAt,
        sellerAgreementAdminSignerId,
        sellerAgreementAdminRejectedAt,
        sellerAgreementAdminRejectionReason,
        sellerAgreementExpiredAt,
        sellerAgreementDocuSignEnvelopeId: agreementId,
    });
    const sellerLabel =
        seller?.email || seller?.fullName || handleRenderFallbackText("");
    const buyerLabel = buyer?.email || handleRenderFallbackText(buyerId || "");

    const showReviewActions = agreementState.canReview;

    return (
        <StepRowAccordion
            title="Agreement"
            value="agreement"
            status={status}
            isActive={isActive}
            isAccordion={isAccordion}
        >
            <PaymentStepCard>
                <div className="overflow-hidden rounded-lg border border-bd-brown bg-bg-main">
                    <Table>
                        <TableHeader className="bg-bg-sf1">
                            <TableRow className="grid grid-cols-[1.5fr_1fr_1.2fr_1.4fr_1fr] gap-0">
                                <TableHead className="p-3 text-sm">
                                    Agreement
                                </TableHead>
                                <TableHead className="p-3 text-sm">
                                    Seller
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
                        <TableBody>
                            <TableRow className="grid grid-cols-[1.5fr_1fr_1.2fr_1.4fr_1fr] gap-0">
                                <TableCell className="flex flex-col gap-0.5 px-3 py-3">
                                    <span className="line-clamp-1 text-sm font-medium text-typo-primary">
                                        {handleRenderFallbackText(
                                            agreementId || ""
                                        )}
                                    </span>
                                    <span className="text-xs text-typo-note">
                                        {buyerLabel}
                                    </span>
                                </TableCell>
                                <TableCell className="px-3 py-3 text-sm text-typo-primary">
                                    {sellerLabel}
                                </TableCell>
                                <TableCell className="px-3 py-3 text-sm text-typo-primary">
                                    {(agreementType
                                        ?.slice(0, 1)
                                        .toUpperCase() ?? "") +
                                        (agreementType?.slice(1) ?? "")}
                                </TableCell>
                                <TableCell className="px-3 py-3 text-sm text-typo-primary">
                                    <Badge variant={agreementState.variant}>
                                        {agreementState.label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-3 py-3 text-right">
                                    {renderAgreementActionCell()}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </PaymentStepCard>

            {agreementState.status === "expired" && (
                <StatusAlert
                    variant="expired"
                    title={agreementState.label}
                    description={agreementState.failureReason || undefined}
                />
            )}
            <PayoutAgreementReviewSheet
                open={reviewSheetOpen}
                onOpenChange={setReviewSheetOpen}
                agreementIds={agreementIds}
                documentUrls={documentUrls}
                userId={
                    seller?.email ||
                    seller?.fullName ||
                    handleRenderFallbackText("")
                }
                agreementType={agreementType}
                statusLabel={agreementState.label}
                statusVariant={agreementState.variant}
                onReject={handleRejectAgreement}
                onRequestUpdate={handleRequestUpdateAgreement}
                onApprove={() => approveAgreementMutation.mutateAsync()}
                onSign={() => getAdminSigningLinkMutation.mutateAsync()}
                isActionLoading={isActionLoading}
                showActions={showReviewActions}
            />
        </StepRowAccordion>
    );
}
