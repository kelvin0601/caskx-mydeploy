import type { TBadgeVariant } from "@/components/ui/badge";

export function listingStatusLabel(status?: string) {
    if (!status) return "-";
    const normalized = status.toLowerCase();
    if (normalized.includes("partial")) return "Partially matched";
    if (normalized === "filled" || normalized === "completed") {
        return "Complete";
    }
    return normalized
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function listingStatusVariant(status?: string): TBadgeVariant {
    const normalized = status?.toLowerCase() ?? "";
    if (normalized.includes("partial")) return "warning";
    if (normalized.includes("complete") || normalized === "filled") {
        return "success";
    }
    if (normalized.includes("cancel") || normalized.includes("failed")) {
        return "destructive";
    }
    if (
        normalized.includes("processing") ||
        normalized.includes("pending") ||
        normalized.includes("awaiting")
    ) {
        return "progressing";
    }
    if (normalized.includes("expired")) return "errorDarker";
    return "info";
}

export function getListingStatus(
    askStatus: string | undefined,
    transaction?: {
        status?: string | null;
        payoutStatus?: string | null;
    }
) {
    if (askStatus?.toLowerCase().includes("partial")) {
        return listingStatusLabel(askStatus);
    }

    const transactionStatus =
        `${transaction?.status ?? ""} ${transaction?.payoutStatus ?? ""}`.toLowerCase();

    if (
        /deposit|payment|processing|agreement|pending|awaiting/.test(
            transactionStatus
        )
    ) {
        return "Payment processing";
    }

    return listingStatusLabel(askStatus);
}
