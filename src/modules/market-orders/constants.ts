export const MARKET_ORDER_KIND = {
    LISTING: "listing",
    OFFER: "offer",
} as const;

export const MARKET_ORDER_INTENT = {
    BUY_NOW: "buy-now",
    SELL_NOW: "sell-now",
    PLACE_BID: "place-bid",
    PLACE_ASK: "place-ask",
} as const;

export const MARKET_ORDER_STEP = {
    EDIT: "edit",
    CONFIRM: "confirm",
} as const;

export const MARKET_ORDER_OUTCOME = {
    CHECKOUT: "checkout",
    PAYOUT: "payout",
    OPEN_ORDER: "open-order",
    COMPLETED: "completed",
    PRICE_CHANGED: "price-changed",
} as const;

export const MARKET_ORDER_OVERLAY = {
    UPDATE: "update",
    CANCEL: "cancel",
    DUPLICATE: "duplicate",
} as const;

export const MARKET_ORDER_DRAWER = {
    UPDATE: "update",
    CONFIRM_UPDATE: "confirm-update",
    DUPLICATE: "duplicate",
    CONFIRM_DUPLICATE: "confirm-duplicate",
} as const;
