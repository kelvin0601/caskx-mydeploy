import { KEY_BID, KEY_TRADING } from "@/lib/constants";
import { caskBidService } from "@/services/cask-bid";
import { marketOrderService } from "@/services/market-order";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offerOrderAdapter } from "../../adapters/offer-order-adapter";
import { MarketOrderSubmitOutcome } from "../../flow/types";
import { MARKET_ORDER_OUTCOME } from "../../constants";
import { OrderDraft } from "../../types";

type SubmitBuyNowInput = {
    caskId: string;
    draft: OrderDraft;
    fulfilledQuantity: number;
    canFullyFulfill: boolean;
    placeRemainingOrder: boolean;
};

export default function useSubmitBuyNow() {
    const queryClient = useQueryClient();
    const buyNowMutation = useMutation({
        mutationFn: marketOrderService.buyNow,
        mutationKey: [KEY_TRADING.BUY_NOW],
    });
    const createOfferMutation = useMutation({
        mutationFn: offerOrderAdapter.create,
        mutationKey: [KEY_BID.BID_CREATE],
    });
    const currentPriceMutation = useMutation({
        mutationFn: marketOrderService.getCurrentPrice,
        mutationKey: [KEY_TRADING.CURRENT_PRICE],
    });

    const submit = async ({
        caskId,
        draft,
        fulfilledQuantity,
        canFullyFulfill,
        placeRemainingOrder,
    }: SubmitBuyNowInput): Promise<MarketOrderSubmitOutcome> => {
        const { lowestAsk } = await currentPriceMutation.mutateAsync({
            caskId,
        });

        if (!fulfilledQuantity) {
            const response = await createOfferMutation.mutateAsync({
                caskId,
                draft,
            });
            return {
                type: MARKET_ORDER_OUTCOME.OPEN_ORDER,
                orderId: response.id,
            };
        }

        if (Number(lowestAsk) !== Number(draft.price)) {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: [KEY_BID.BID_MARKET_DATA, caskId],
                }),
                queryClient.invalidateQueries({
                    queryKey: [KEY_TRADING.CURRENT_PRICE, caskId],
                }),
            ]);
            return {
                type: MARKET_ORDER_OUTCOME.PRICE_CHANGED,
                price: Number(lowestAsk),
            };
        }

        const isPartiallyFilled = fulfilledQuantity > 0 && !canFullyFulfill;
        const quantity =
            isPartiallyFilled && !placeRemainingOrder
                ? fulfilledQuantity
                : draft.quantity;
        const response = await buyNowMutation.mutateAsync({
            caskId,
            quantity,
            maxPrice: Number(draft.price),
            displayedPrice: Number(draft.price),
        });
        const transactionResponse = await queryClient.fetchQuery({
            queryKey: [KEY_BID.BID_TRANSACTIONS, response.bidId],
            queryFn: () =>
                caskBidService.getTransactionsFormBidId({
                    bidId: response.bidId,
                }),
            staleTime: 1000 * 60 * 5,
        });
        const checkoutSessionId =
            transactionResponse.data?.transactions?.[0]?.checkoutSessionId;

        if (!checkoutSessionId) {
            throw new Error("Checkout session not found");
        }

        return {
            type: MARKET_ORDER_OUTCOME.CHECKOUT,
            sessionId: checkoutSessionId,
        };
    };

    return {
        submit,
        isPending:
            buyNowMutation.isPending ||
            createOfferMutation.isPending ||
            currentPriceMutation.isPending,
    } as const;
}
