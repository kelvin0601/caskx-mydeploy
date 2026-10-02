import caskAskService from "@/services/cask-ask";
import { useQuery } from "@tanstack/react-query";
import { MARKET_ORDER_KEYS } from "../query-keys";

type BuyOrderMatchingParams = {
    caskId: string | undefined;
    maximumPrice: number | undefined;
    quantity: number | undefined;
    enabled?: boolean;
};

export default function useBuyOrderMatching({
    caskId,
    maximumPrice,
    quantity,
    enabled = true,
}: BuyOrderMatchingParams) {
    const queryKey = MARKET_ORDER_KEYS.buyMatching(
        caskId,
        maximumPrice,
        quantity
    );
    const matchingQuery = useQuery({
        queryKey,
        queryFn: () =>
            caskAskService.getMatchingBids({
                maxBidAmount: Number(maximumPrice),
                caskId: String(caskId),
                desiredQuantity: Number(quantity),
            }),
        enabled:
            enabled &&
            Boolean(caskId) &&
            Number(maximumPrice) > 0 &&
            Number(quantity) > 0,
    });

    const fulfillmentSummary = matchingQuery.data?.fulfillmentSummary;
    const fulfilledQuantity = fulfillmentSummary?.fulfilledQuantity ?? 0;
    const remainingQuantity = fulfillmentSummary?.remainingQuantity ?? 0;
    const requestedQuantity =
        fulfillmentSummary?.desiredQuantity ?? quantity ?? 0;
    const canFullyFulfill = Boolean(fulfillmentSummary?.canFullyFulfill);
    const matchFully = canFullyFulfill;
    const matchPartially = !canFullyFulfill && fulfilledQuantity > 0;
    const notMatch = !canFullyFulfill && fulfilledQuantity === 0;

    return {
        matchingQuery,
        fulfillmentSummary,
        fulfilledQuantity,
        remainingQuantity,
        requestedQuantity,
        canFullyFulfill,
        hasAnyFulfillment: fulfilledQuantity > 0,
        isPartialPossible: matchPartially,
        matchFully,
        matchPartially,
        notMatch,
        isFullyFulfilled: matchFully,
        isPartiallyFulfilled: matchPartially,
        isUnfulfilled: notMatch,
        scenarioPartialSomeNow: matchPartially,
        scenarioPartialOverTime: notMatch,
        scenarioFullNow: matchFully,
        isLoading: matchingQuery.isLoading,
        isFetching: matchingQuery.isFetching,
        error: matchingQuery.error,
        queryKey,
    } as const;
}
