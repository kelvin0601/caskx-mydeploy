import type { BadgeProps } from "@/components/ui/badge";
import type { ButtonProps } from "@/components/ui/button";
import { EDocuSignStatus } from "@/enum/docusign";
import type { SellerPayout } from "@/types/seller-payout";

export const payoutSummaryHelpers = {
    getPaymentStatusVariant: (status: string): BadgeProps["variant"] => {
        switch (status) {
            case "awaiting_signature":
                return "pending";
            case "signed":
                return "complete";
            case "completed":
                return "success";
            case "pending":
                return "warning";
            case "expired":
            case "failed":
                return "destructive";
            default:
                return "outline";
        }
    },

    getPaymentStatusText: (status?: string) => {
        if (!status) return "Unknown";

        const normalizedStatus = status.split("_").join(" ");
        return (
            normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
        );
    },

    getReleaseFormButtonProps: (
        status: SellerPayout.TAgreementStatus,
        envelopeId: string | null
    ): {
        variant: ButtonProps["variant"];
        text: string;
        showDate?: boolean;
    } => {
        if (
            (envelopeId && status === "paid") ||
            status === EDocuSignStatus.SELLER_SIGNED ||
            status === EDocuSignStatus.ALL_SIGNED
        ) {
            return {
                text: "Download",
                variant: "outline",
                showDate: true,
            };
        }

        switch (status) {
            case "awaiting_signature":
                return { text: "Sign Form", variant: "secondary" };
            case "paid":
                return {
                    text: "Download",
                    variant: "outline",
                    showDate: true,
                };
            case "processing":
                return { text: "Download", variant: "outline" };
            case "failed":
                return { text: "Invalid Signature", variant: "empty" };
            case "rejected":
                return { text: "Rejected", variant: "empty" };
            case "cancelled":
                return { text: "Cancelled", variant: "empty" };
            case "expired":
                return { text: "Expired", variant: "empty" };
            case "update_requested":
                return { text: "Update Agreement", variant: "secondary" };
            default:
                return { text: "Unknown", variant: "outline" };
        }
    },
};
