import useSellOrderMatching from "@/modules/market-orders/hooks/use-sell-order-matching";

export default function useMatchingAsk({
    caskId,
    minAskAmount,
    desiredQuantity,
}: {
    caskId: string | undefined;
    minAskAmount: number | undefined;
    desiredQuantity: number | undefined;
}) {
    const result = useSellOrderMatching({
        caskId,
        minimumPrice: minAskAmount,
        quantity: desiredQuantity,
    });

    return { ...result, matchingAsksQuery: result.matchingQuery } as const;
}

export { useMatchingAsk };
