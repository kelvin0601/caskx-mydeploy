import { KEY_BID } from "@/lib/constants";
import { caskBidService } from "@/services/cask-bid";
import { offerOrderDefinition } from "../definitions/offer-definition";
import { MarketOrderCommandAdapter, MarketOrderEditorAdapter } from "../types";

export const offerEditorAdapter: MarketOrderEditorAdapter = {
    definition: offerOrderDefinition,
    getSuggestions: async (caskId) => {
        const data = await caskBidService.getCaskBidSuggestion(caskId);
        return [
            {
                id: "goodBid",
                label: "Match quickly",
                price: Number(data.goodBid),
            },
            {
                id: "betterBid",
                label: "Better offer",
                price: Number(data.betterBid),
            },
            {
                id: "buyFaster",
                label: "Best offer",
                price: Number(data.buyFaster),
                badgeVariant: "success" as const,
            },
        ].filter((item) => Number.isFinite(item.price) && item.price > 0);
    },
    getMarketData: (caskId) => caskBidService.getCaskBidMarketData(caskId),
    validatePrice: async (caskId, price) => {
        const result = await caskBidService.validatePriceBid({
            caskId,
            bidAmount: price,
        });
        return {
            message: result.message,
            warningType: result.warningType,
        };
    },
};

export const offerOrderAdapter = {
    editor: offerEditorAdapter,
    listQueryKey: [KEY_BID.BID_MY_BIDS],
    create: ({ caskId, draft }) =>
        caskBidService.createCaskBids({
            caskId,
            bidPrice: draft.price,
            quantity: draft.quantity,
            expirationDays: Number(draft.expirationDays),
            executionPolicy: draft.executionPolicy,
        }),
    update: ({ orderId, draft }) =>
        caskBidService.updateBid(orderId, {
            bidPrice: draft.price,
            remainingQuantity: draft.quantity,
            expirationDays: Number(draft.expirationDays),
        }),
    cancel: (orderId) => caskBidService.cancelBid(orderId),
    duplicate: ({ caskId, draft }) =>
        caskBidService.createCaskBids({
            caskId,
            bidPrice: draft.price,
            quantity: draft.quantity,
            expirationDays: Number(draft.expirationDays),
            executionPolicy: draft.executionPolicy,
        }),
} satisfies MarketOrderCommandAdapter;
