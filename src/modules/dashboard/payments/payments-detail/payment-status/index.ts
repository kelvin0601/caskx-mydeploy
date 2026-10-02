import { global } from "@/types/global/global";

export function getPaymentStatusText(
    status: global.TParticipantStatus
): string {
    if (status === "completed") {
        return "Payment Succeeded";
    }

    if (status === "expired") {
        return "Payment Expired";
    }

    return "Pending Buyer Payment";
}
