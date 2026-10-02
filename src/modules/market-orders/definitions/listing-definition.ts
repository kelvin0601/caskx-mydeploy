import { MarketOrderDefinition } from "../types";
import { MARKET_ORDER_KIND } from "../constants";

export const listingOrderDefinition: MarketOrderDefinition = {
    kind: MARKET_ORDER_KIND.LISTING,
    labels: {
        updateTitle: "Update Listing",
        updateNote: "Changes will apply only to available casks.",
        marketPriceLabel: "Top Offer",
        suggestionSectionLabel: "Suggested listing prices",
        expirationLabel: "Listing expiration",
        customPriceLabel: "Or set your own price",
        pricePlaceholder: "Enter your listing price",
        zeroPriceMessage: "Listing price cannot be 0",
        cancelTitle: "Cancel listing?",
        cancelDescription:
            "Your listing hasn’t matched any offer yet. Cancelling will remove it from the marketplace.",
        keepLabel: "Keep listing",
        cancelLabel: "Confirm cancel",
        partialQuantityLabel: "casks",
        successName: "Listing",
    },
    getInitialPrice: (order) => Number(order.askPrice ?? order.price ?? 0),
    getMarketPrice: (order, marketData, fallbackPrice = 0) => {
        const candidates = [
            marketData?.highestBid,
            order?.cask?.highestBid,
            order?.master?.highestBid,
            order?.cask?.master?.highestBid,
            fallbackPrice,
        ];
        for (const candidate of candidates) {
            const num = Number(candidate);
            if (Number.isFinite(num) && num > 0) {
                return num;
            }
        }
        return 0;
    },
};
