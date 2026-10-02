import { KEY_ASK } from "@/lib/constants";
import caskAskService from "@/services/cask-ask";
import { caskBidService } from "@/services/cask-bid";
import { listingOrderDefinition } from "../definitions/listing-definition";
import { MarketOrderCommandAdapter, MarketOrderEditorAdapter } from "../types";

export const listingEditorAdapter: MarketOrderEditorAdapter = {
    definition: listingOrderDefinition,
    getSuggestions: async (caskId) => {
        const data = await caskAskService.getAskSuggestions(caskId);
        return [
            {
                id: "conservativeAsk",
                label: "Higher demand",
                price: Number(data.conservativeAsk),
                badgeClassName: "rounded-full font-semibold",
            },
            {
                id: "moderateAsk",
                label: "Balanced pricing",
                price: Number(data.moderateAsk),
                badgeClassName: "rounded-full font-semibold",
            },
            {
                id: "aggressiveAsk",
                label: "Maximize value",
                price: Number(data.aggressiveAsk),
                badgeClassName: "rounded-full font-semibold",
            },
        ].filter((item) => Number.isFinite(item.price) && item.price > 0);
    },
    getMarketData: (caskId) => caskBidService.getCaskBidMarketData(caskId),
    validatePrice: async (caskId, price) => {
        const result = await caskAskService.validateAskPrice(caskId, price);
        return {
            message: result.message,
            warningType: result.warningType,
        };
    },
};

export const listingOrderAdapter = {
    editor: listingEditorAdapter,
    listQueryKey: [KEY_ASK.ASK_MY_ASKS],
    create: ({ caskId, draft }) =>
        caskAskService.createAsk({
            caskId,
            askPrice: draft.price,
            quantity: draft.quantity,
            expirationDays: Number(draft.expirationDays),
            executionPolicy: draft.executionPolicy,
        }),
    update: ({ orderId, caskId, draft }) =>
        caskAskService.updateAsk(orderId, {
            caskId,
            askPrice: draft.price,
            quantity: draft.quantity,
            expirationDays: Number(draft.expirationDays),
        }),
    cancel: (orderId) => caskAskService.cancelAsk(orderId),
    duplicate: ({ caskId, draft }) =>
        caskAskService.createAsk({
            caskId,
            askPrice: draft.price,
            quantity: draft.quantity,
            expirationDays: Number(draft.expirationDays),
            executionPolicy: draft.executionPolicy,
        }),
} satisfies MarketOrderCommandAdapter;
