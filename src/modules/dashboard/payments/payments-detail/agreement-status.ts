import { TBadgeVariant } from "@/components/ui/badge";
import { CHECKOUT_STATUS } from "@/enum/checkout";
import { EDocuSignStatus } from "@/enum/docusign";
import { handleSnakeCaseToSimpleText } from "@/lib/utils";
import { transaction } from "@/types/transaction";

type AgreementState = {
    label: string;
    variant: TBadgeVariant;
    canReview: boolean;
    isWaiting: boolean;
    isFailed: boolean;
    failureReason?: string | null;
};

export function getAgreementState(
    transaction: transaction.TTransaction,
    agreementType?: string | null,
    buyerAdminSignedAt?: string | null,
    sessionStatus?: CHECKOUT_STATUS
): AgreementState {
    const isDirect = (transaction.agreementType || agreementType) === "direct";
    const rawStatus = isDirect
        ? transaction.sellerAgreementStatus
        : transaction.buyerAgreementStatus;
    const normalized = (rawStatus || "").toLowerCase();
    const expired =
        normalized.includes("expired") ||
        Boolean(
            isDirect
                ? transaction.sellerAgreementExpiredAt
                : transaction.buyerAgreementExpiredAt
        );
    const rejected =
        ["rejected", "declined", "cancelled", "voided"].some((value) =>
            normalized.includes(value)
        ) ||
        Boolean(
            isDirect
                ? transaction.sellerAgreementAdminRejectedAt ||
                      transaction.sellerAgreementRejectedAt
                : transaction.buyerAgreementAdminRejectedAt ||
                      transaction.buyerAgreementRejectedAt
        );
    const failureReason = isDirect
        ? transaction.sellerAgreementAdminRejectionReason
        : transaction.buyerAgreementAdminRejectionReason;
    if (expired || rejected) {
        return {
            label: expired ? "Expired" : "Rejected",
            variant: "outline",
            canReview: false,
            isWaiting: false,
            isFailed: true,
            failureReason,
        };
    }

    const updateRequested =
        normalized === EDocuSignStatus.SELLER_UPDATE_REQUESTED ||
        normalized === "update_requested";
    if (updateRequested) {
        return {
            label: "Update Requested",
            variant: "complete",
            canReview: false,
            isWaiting: true,
            isFailed: false,
        };
    }

    const adminApproved = isDirect
        ? Boolean(
              transaction.sellerAgreementAdminSignedAt ||
              transaction.sellerAgreementAdminSignerId
          )
        : Boolean(
              buyerAdminSignedAt || transaction.buyerAgreementAdminSignedAt
          );
    if (
        adminApproved ||
        normalized === EDocuSignStatus.ALL_SIGNED ||
        normalized === "all_signed" ||
        normalized === "approved"
    ) {
        return {
            label: "Completed",
            variant: "success",
            canReview: false,
            isWaiting: false,
            isFailed: false,
        };
    }

    const signerSigned = Boolean(
        (isDirect
            ? transaction.sellerAgreementSignedAt
            : transaction.buyerAgreementSignedAt) ||
        normalized.includes("signed") ||
        normalized === "completed" ||
        (!isDirect && sessionStatus === CHECKOUT_STATUS.AGREEMENT_BUYER_SIGNED)
    );
    if (signerSigned) {
        return {
            label: "In Review",
            variant: "warning",
            canReview: true,
            isWaiting: false,
            isFailed: false,
        };
    }

    const awaitingSignature = normalized === EDocuSignStatus.AWAITING_SIGNATURE;
    return {
        label: awaitingSignature
            ? "Awaiting Signature"
            : handleSnakeCaseToSimpleText(rawStatus || "pending"),
        variant: awaitingSignature ? "pending" : "warning",
        canReview: false,
        isWaiting: true,
        isFailed: false,
    };
}
