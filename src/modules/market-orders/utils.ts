import { EXPIRATION_OPTIONS } from "@/lib/constants";
import type { caskBid } from "@/types/cask-bid";

function extractCheckoutSessionIdFromObject(obj: unknown): string | undefined {
    if (!obj || typeof obj !== "object") {
        return undefined;
    }

    const record = obj as Record<string, unknown>;

    if (
        "checkoutSession" in record &&
        record.checkoutSession &&
        typeof record.checkoutSession === "object"
    ) {
        const cs = record.checkoutSession as Record<string, unknown>;
        if (typeof cs.id === "string" && cs.id.trim()) {
            return cs.id;
        }
    }

    if (
        "checkoutSessionId" in record &&
        typeof record.checkoutSessionId === "string" &&
        record.checkoutSessionId.trim()
    ) {
        return record.checkoutSessionId;
    }

    return undefined;
}

function extractFromBreakdown(breakdown: unknown): string | undefined {
    if (!breakdown || typeof breakdown !== "object") {
        return undefined;
    }

    if (Array.isArray(breakdown)) {
        for (const item of breakdown) {
            const id =
                extractCheckoutSessionIdFromObject(item) ||
                extractFromBreakdown(item);
            if (id) return id;
        }
        return undefined;
    }

    const directId = extractCheckoutSessionIdFromObject(breakdown);
    if (directId) return directId;

    const record = breakdown as Record<string, unknown>;

    if (Array.isArray(record.matchingBreakdown)) {
        for (const item of record.matchingBreakdown) {
            const id =
                extractCheckoutSessionIdFromObject(item) ||
                extractFromBreakdown(item);
            if (id) return id;
        }
    }

    return undefined;
}

export function getCheckoutSessionId(result: unknown): string | undefined {
    if (!result || typeof result !== "object") {
        return undefined;
    }

    const directId = extractCheckoutSessionIdFromObject(result);
    if (directId) return directId;

    const r = result as Record<string, unknown>;

    const breakdownCandidates = [
        r.costBreakdown,
        r.breakdown,
        r.matchingBreakdown,
    ];

    for (const candidate of breakdownCandidates) {
        const id = extractFromBreakdown(candidate);
        if (id) return id;
    }

    if (r.data && typeof r.data === "object") {
        const dataRecord = r.data as Record<string, unknown>;
        const dataId =
            extractCheckoutSessionIdFromObject(dataRecord) ||
            extractFromBreakdown(dataRecord.costBreakdown) ||
            extractFromBreakdown(dataRecord.breakdown) ||
            extractFromBreakdown(dataRecord.matchingBreakdown);
        if (dataId) return dataId;

        if (Array.isArray(dataRecord.transactions)) {
            for (const tx of dataRecord.transactions) {
                const txId = extractCheckoutSessionIdFromObject(tx);
                if (txId) return txId;
            }
        }
    }

    return undefined;
}

export function hasOfferMatch(result: unknown): boolean {
    if (!result || typeof result !== "object") {
        return false;
    }

    if (getCheckoutSessionId(result)) {
        return true;
    }

    const r = result as Record<string, unknown>;

    if (r.costBreakdown && typeof r.costBreakdown === "object") {
        const cb = r.costBreakdown as Record<string, unknown>;
        if (
            Array.isArray(cb.matchingBreakdown) &&
            cb.matchingBreakdown.length > 0
        ) {
            return true;
        }
        if (
            typeof cb.fulfillableQuantity === "number" &&
            cb.fulfillableQuantity > 0
        ) {
            return true;
        }
    }

    if (r.matchSummary && typeof r.matchSummary === "object") {
        const ms = r.matchSummary as Record<string, unknown>;
        if (
            typeof ms.totalMatchedQuantity === "number" &&
            ms.totalMatchedQuantity > 0
        ) {
            return true;
        }
    }

    if (r.matchingSummary && typeof r.matchingSummary === "object") {
        const ms = r.matchingSummary as Record<string, unknown>;
        if (
            typeof ms.totalMatchedQuantity === "number" &&
            ms.totalMatchedQuantity > 0
        ) {
            return true;
        }
    }

    if (Array.isArray(r.immediateMatches) && r.immediateMatches.length > 0) {
        return true;
    }

    return false;
}

export async function resolveCheckoutSessionId(
    result: unknown,
    bidId?: string
): Promise<string | undefined> {
    const directSessionId = getCheckoutSessionId(result);
    if (directSessionId) return directSessionId;

    const targetBidId =
        bidId ||
        (result &&
        typeof result === "object" &&
        "id" in result &&
        typeof (result as { id: unknown }).id === "string"
            ? (result as { id: string }).id
            : undefined) ||
        (result &&
        typeof result === "object" &&
        "bidId" in result &&
        typeof (result as { bidId: unknown }).bidId === "string"
            ? (result as { bidId: string }).bidId
            : undefined);

    if (targetBidId && !targetBidId.startsWith("ask_")) {
        try {
            const { caskBidService } = await import("@/services/cask-bid");
            let detail = await caskBidService.getTransactionsFormBidId({
                bidId: targetBidId,
            });
            let txSessionId =
                detail.data?.transactions?.find((t: caskBid.TBidTransaction) =>
                    Boolean(t.checkoutSessionId)
                )?.checkoutSessionId ||
                detail.data?.transactions?.[0]?.checkoutSessionId;

            if (txSessionId) return txSessionId;

            // Small retry in case backend matching/transaction creation is async
            await new Promise((resolve) => setTimeout(resolve, 500));
            detail = await caskBidService.getTransactionsFormBidId({
                bidId: targetBidId,
            });
            txSessionId =
                detail.data?.transactions?.find((t: caskBid.TBidTransaction) =>
                    Boolean(t.checkoutSessionId)
                )?.checkoutSessionId ||
                detail.data?.transactions?.[0]?.checkoutSessionId;

            if (txSessionId) return txSessionId;
        } catch (error) {
            console.warn(
                "Failed to fetch checkoutSessionId from bid transactions",
                error
            );
        }
    }

    return undefined;
}

export function getClosestExpirationDays(days?: number) {
    if (days === undefined || !Number.isFinite(days)) return undefined;

    return EXPIRATION_OPTIONS.reduce((closest, option) => {
        const candidate = Number(option.value);
        const closestDistance = Math.abs(closest - days);
        const candidateDistance = Math.abs(candidate - days);

        return candidateDistance < closestDistance ? candidate : closest;
    }, Number(EXPIRATION_OPTIONS[0].value));
}
