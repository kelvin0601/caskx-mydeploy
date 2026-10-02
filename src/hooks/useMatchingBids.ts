import useBuyOrderMatching from "@/modules/market-orders/hooks/use-buy-order-matching";

export default function useMatchingBids({
    caskId,
    maxBidAmount,
    desiredQuantity,
}: {
    caskId: string | undefined;
    maxBidAmount: number | undefined;
    desiredQuantity: number | undefined;
}) {
    const result = useBuyOrderMatching({
        caskId,
        maximumPrice: maxBidAmount,
        quantity: desiredQuantity,
    });

    return {
        ...result,
        matchingBidsQuery: result.matchingQuery,
        key: [...result.queryKey],
    };
}

export { useMatchingBids };
