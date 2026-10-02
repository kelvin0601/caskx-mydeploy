import { MarketOrderDefinition } from "../types";
import { MARKET_ORDER_KIND } from "../constants";

function parsePrice(val: unknown): number {
    if (Array.isArray(val)) {
        return parsePrice(val[0]);
    }
    if (typeof val === "string") {
        const cleaned = val.replace(/[^0-9.]/g, "");
        const num = Number(cleaned);
        return Number.isFinite(num) && num > 0 ? num : 0;
    }
    const num = Number(val);
    return Number.isFinite(num) && num > 0 ? num : 0;
}

export const offerOrderDefinition: MarketOrderDefinition = {
    kind: MARKET_ORDER_KIND.OFFER,
    labels: {
        updateTitle: "Update Offer",
        updateNote: "Changes will apply only to the remaining open quantity.",
        marketPriceLabel: "Floor price",
        suggestionSectionLabel: "Suggested offer prices",
        expirationLabel: "Offer expiration",
        customPriceLabel: "Or set your own price",
        pricePlaceholder: "Enter your price",
        zeroPriceMessage: "Bid price cannot be 0",
        cancelTitle: "Cancel order?",
        cancelDescription:
            "Your order hasn’t filled yet. Cancelling will remove it from the marketplace.",
        keepLabel: "Keep order",
        cancelLabel: "Cancel order",
        partialQuantityLabel: "unmatched casks",
        successName: "Offer",
    },
    getInitialPrice: (order) => Number(order.bidPrice ?? order.price ?? 0),
    getMarketPrice: (order, marketData, fallbackPrice = 0) => {
        const lowestAskCandidates = [
            marketData?.lowestAsk,
            order?.cask?.lowestAsk,
            order?.master?.lowestAsk,
            order?.cask?.master?.lowestAsk,
            order?.cask?.master?.lowestAskPrev30D,
        ];

        for (const candidate of lowestAskCandidates) {
            const num = parsePrice(candidate);
            if (num > 0) {
                return num;
            }
        }

        const orderRecord = order as Record<string, unknown> | undefined;
        const caskRecord = order?.cask as Record<string, unknown> | undefined;
        const masterRecord = (order?.master ?? order?.cask?.master) as
            | Record<string, unknown>
            | undefined;
        const marketRecord = marketData as Record<string, unknown> | undefined;

        const referencePriceCandidates = [
            fallbackPrice,
            order?.cask?.referencePriceMin,
            order?.cask?.priceReference,
            order?.master?.minReferencePrice,
            order?.cask?.master?.minReferencePrice,
            caskRecord?.referencePrice,
            caskRecord?.minReferencePrice,
            masterRecord?.referencePrice,
            masterRecord?.priceReference,
            orderRecord?.referencePrice,
            orderRecord?.priceReference,
            marketRecord?.referencePrice,
            marketRecord?.referencePriceMin,
            marketRecord?.minReferencePrice,
        ];

        for (const candidate of referencePriceCandidates) {
            const num = parsePrice(candidate);
            if (num > 0) {
                return num;
            }
        }

        return 0;
    },
};
