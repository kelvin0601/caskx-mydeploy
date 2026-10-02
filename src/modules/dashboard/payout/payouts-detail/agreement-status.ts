import { TBadgeVariant } from "@/components/ui/badge";
import { EDocuSignStatus } from "@/enum/docusign";
import { handleSnakeCaseToSimpleText } from "@/lib/utils";
import { payout } from "@/types";
import { global } from "@/types/global/global";

export function getPayoutAgreementState(
    agreement: Partial<payout.TAdminSettlementDetail>
): {
    status: global.TParticipantStatus;
    label: string;
    variant: TBadgeVariant;
    canReview: boolean;
    isWaiting: boolean;
    failureReason?: string | null;
} {
    const normalized = (agreement.sellerAgreementStatus || "").toLowerCase();
    const expired =
        normalized.includes("expired") ||
        Boolean(agreement.sellerAgreementExpiredAt);
    const rejected =
        ["rejected", "declined", "cancelled", "voided"].some((value) =>
            normalized.includes(value)
        ) ||
        Boolean(
            agreement.sellerAgreementAdminRejectedAt ||
            agreement.sellerAgreementRejectedAt
        );
    if (expired || rejected) {
        return {
            status: "expired",
            label: expired ? "Expired" : "Rejected",
            variant: "outline",
            canReview: false,
            isWaiting: false,
            failureReason: agreement.sellerAgreementAdminRejectionReason,
        };
    }

    const updateRequested =
        normalized === EDocuSignStatus.SELLER_UPDATE_REQUESTED ||
        normalized === "update_requested";
    if (updateRequested) {
        return {
            status: "pending",
            label: "Update Requested",
            variant: "complete",
            canReview: false,
            isWaiting: true,
        };
    }

    const adminApproved = Boolean(
        agreement.sellerAgreementAdminSignedAt ||
        agreement.sellerAgreementAdminSignerId ||
        normalized === EDocuSignStatus.ALL_SIGNED ||
        normalized === "all_signed" ||
        normalized === "approved" ||
        normalized === "completed"
    );
    const sellerSigned = Boolean(
        agreement.sellerAgreementSignedAt ||
        normalized.includes("signed") ||
        normalized === "completed"
    );
    if (sellerSigned && adminApproved) {
        return {
            status: "completed",
            label: "Completed",
            variant: "success",
            canReview: false,
            isWaiting: false,
        };
    }
    if (sellerSigned) {
        return {
            status: "pending",
            label: "In Review",
            variant: "warning",
            canReview: Boolean(agreement.sellerAgreementDocuSignEnvelopeId),
            isWaiting: false,
        };
    }
    const awaitingSignature = normalized === EDocuSignStatus.AWAITING_SIGNATURE;
    return {
        status: "pending",
        label: awaitingSignature
            ? "Awaiting Signature"
            : handleSnakeCaseToSimpleText(normalized || "pending"),
        variant: awaitingSignature ? "pending" : "warning",
        canReview: false,
        isWaiting: true,
    };
}
