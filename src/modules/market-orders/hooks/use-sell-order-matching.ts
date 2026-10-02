import { caskBidService } from "@/services/cask-bid";
import { useQuery } from "@tanstack/react-query";
import { MARKET_ORDER_KEYS } from "../query-keys";

type SellOrderMatchingParams = {
    caskId: string | undefined;
    minimumPrice: number | undefined;
    quantity: number | undefined;
    enabled?: boolean;
};

export default function useSellOrderMatching({
    caskId,
    minimumPrice,
    quantity,
    enabled = true,
}: SellOrderMatchingParams) {
    const matchingQuery = useQuery({
        queryKey: MARKET_ORDER_KEYS.sellMatching(
            caskId,
            minimumPrice,
            quantity
        ),
        queryFn: () =>
            caskBidService.getMatchingBids({
                minAskAmount: Number(minimumPrice),
                caskId: String(caskId),
                desiredQuantity: Number(quantity),
            }),
        enabled:
            enabled &&
            Boolean(caskId) &&
            typeof minimumPrice === "number" &&
            minimumPrice > 0 &&
            typeof quantity === "number" &&
            quantity > 0,
    });

    const fulfillmentSummary = matchingQuery.data?.fulfillmentSummary;
    const fulfilledQuantity = fulfillmentSummary?.fulfilledQuantity ?? 0;
    const remainingQuantity = fulfillmentSummary?.remainingQuantity ?? 0;
    const requestedQuantity =
        fulfillmentSummary?.desiredQuantity ?? quantity ?? 0;
    const canFullyFulfill =
        fulfilledQuantity === requestedQuantity && requestedQuantity > 0;
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
    } as const;
}
