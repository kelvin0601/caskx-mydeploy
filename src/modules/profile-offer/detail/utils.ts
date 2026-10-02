import type { TBadgeVariant } from "@/components/ui/badge";
import type { caskBid } from "@/types/cask-bid";

export function mergeTransactions(
    transactions: caskBid.TBidTransaction[]
): caskBid.TBidTransaction[] {
    const grouped = new Map<string, caskBid.TBidTransaction>();

    transactions.forEach((transaction) => {
        const key =
            transaction.checkoutSessionId || transaction.caskTransactionId;
        const existing = grouped.get(key);

        if (!existing) {
            grouped.set(key, { ...transaction });
            return;
        }

        const latest =
            new Date(transaction.updatedAt).getTime() >=
            new Date(existing.updatedAt).getTime()
                ? transaction
                : existing;
        const existingTotal = Number(existing.totalPrice) || 0;
        const transactionTotal = Number(transaction.totalPrice) || 0;
        const netPayoutAmount =
            existing.netPayoutAmount == null &&
            transaction.netPayoutAmount == null
                ? existing.netPayoutAmount
                : (existing.netPayoutAmount ?? 0) +
                  (transaction.netPayoutAmount ?? 0);

        grouped.set(key, {
            ...existing,
            ...latest,
            quantity: existing.quantity + transaction.quantity,
            totalPrice: (existingTotal + transactionTotal).toFixed(2),
            netPayoutAmount,
            createdAt:
                new Date(transaction.createdAt).getTime() <
                new Date(existing.createdAt).getTime()
                    ? transaction.createdAt
                    : existing.createdAt,
            updatedAt:
                new Date(transaction.updatedAt).getTime() >
                new Date(existing.updatedAt).getTime()
                    ? transaction.updatedAt
                    : existing.updatedAt,
        });
    });

    return Array.from(grouped.values());
}

export function labelize(value?: string | null) {
    return value ? value.replaceAll("_", " ") : "-";
}

export function badgeVariant(status = ""): TBadgeVariant {
    const normalized = status.toLowerCase();
    if (normalized.includes("complete") || normalized.includes("paid")) {
        return "success";
    }
    if (normalized.includes("partial")) return "warning";
    if (
        normalized.includes("processing") ||
        normalized.includes("deposit") ||
        normalized.includes("awaiting") ||
        normalized.includes("pending")
    ) {
        return "progressing";
    }
    if (
        normalized.includes("cancel") ||
        normalized.includes("failed") ||
        normalized.includes("reject")
    ) {
        return "destructive";
    }
    if (normalized.includes("expired")) return "errorDarker";
    return "info";
}

function sentenceCase(value: string) {
    return value
        ? `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`
        : value;
}

export function getOfferStatus(
    bidStatus: string,
    transactionStatus?: string,
    payoutStatus?: string
) {
    const status =
        `${transactionStatus || ""} ${payoutStatus || ""}`.toLowerCase();
    if (status.includes("deposit") || status.includes("processing")) {
        return "Payment processing";
    }
    return sentenceCase(labelize(bidStatus));
}
