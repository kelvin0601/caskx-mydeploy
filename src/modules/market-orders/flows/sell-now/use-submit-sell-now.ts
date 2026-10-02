import { KEY_ASK, KEY_TRADING } from "@/lib/constants";
import caskAskService from "@/services/cask-ask";
import { marketOrderService } from "@/services/market-order";
import { useMutation } from "@tanstack/react-query";
import { MarketOrderSubmitOutcome } from "../../flow/types";
import { MARKET_ORDER_OUTCOME } from "../../constants";
import { OrderDraft } from "../../types";

type SubmitSellNowInput = {
    caskId: string;
    draft: OrderDraft;
    fulfilledQuantity: number;
    isFullyFulfilled: boolean;
    isPartiallyFulfilled: boolean;
    isUnfulfilled: boolean;
    placeRemainingOrder: boolean;
};

export default function useSubmitSellNow() {
    const sellNowMutation = useMutation({
        mutationFn: marketOrderService.sellNow,
        mutationKey: [KEY_TRADING.SELL_NOW],
    });
    const createListingMutation = useMutation({
        mutationFn: caskAskService.createAsk,
        mutationKey: [KEY_ASK.ASK_CREATE],
    });
    const currentPriceMutation = useMutation({
        mutationFn: marketOrderService.getCurrentPrice,
        mutationKey: [KEY_TRADING.CURRENT_PRICE],
    });

    const submit = async ({
        caskId,
        draft,
        fulfilledQuantity,
        isFullyFulfilled,
        isPartiallyFulfilled,
        isUnfulfilled,
        placeRemainingOrder,
    }: SubmitSellNowInput): Promise<MarketOrderSubmitOutcome> => {
        if (isUnfulfilled) {
            const response = await createListingMutation.mutateAsync({
                caskId,
                askPrice: Number(draft.price),
                quantity: draft.quantity,
                expirationDays: parseInt(draft.expirationDays, 10) || 30,
                executionPolicy: draft.executionPolicy,
                sellNow: true,
            });
            return {
                type: MARKET_ORDER_OUTCOME.OPEN_ORDER,
                orderId: response.id,
            };
        }

        if (!isFullyFulfilled && !isPartiallyFulfilled) {
            throw new Error("Order matching state is not ready");
        }

        const { highestBid } = await currentPriceMutation.mutateAsync({
            caskId,
        });
        if (Number(highestBid) !== Number(draft.price)) {
            return {
                type: MARKET_ORDER_OUTCOME.PRICE_CHANGED,
                price: Number(highestBid),
            };
        }

        const quantity =
            isPartiallyFulfilled && !placeRemainingOrder
                ? fulfilledQuantity
                : draft.quantity;
        const response = await sellNowMutation.mutateAsync({
            caskId,
            displayedPrice: Number(draft.price),
            quantity,
        });
        const payoutId =
            response.id || response.bidId || response.remainderOrder?.orderId;

        if (payoutId && response.matchSummary.totalMatchedQuantity > 0) {
            return {
                type: MARKET_ORDER_OUTCOME.PAYOUT,
                payoutId,
                hasRemainingOrder: response.matchSummary.remainingQuantity > 0,
            };
        }
        if (response.matchSummary.totalMatchedQuantity === 0) {
            return {
                type: MARKET_ORDER_OUTCOME.OPEN_ORDER,
                orderId: response.remainderOrder?.orderId || response.id,
            };
        }
        return { type: MARKET_ORDER_OUTCOME.COMPLETED };
    };

    return {
        submit,
        isPending:
            sellNowMutation.isPending ||
            createListingMutation.isPending ||
            currentPriceMutation.isPending,
    } as const;
}
