import { MarketOrderIntent, MarketOrderIntentDefinition } from "./types";
import { MARKET_ORDER_INTENT } from "../constants";

export const MARKET_ORDER_INTENTS = {
    [MARKET_ORDER_INTENT.BUY_NOW]: { side: "buy", execution: "market" },
    [MARKET_ORDER_INTENT.PLACE_BID]: { side: "buy", execution: "limit" },
    [MARKET_ORDER_INTENT.SELL_NOW]: { side: "sell", execution: "market" },
    [MARKET_ORDER_INTENT.PLACE_ASK]: { side: "sell", execution: "limit" },
} as const satisfies Record<MarketOrderIntent, MarketOrderIntentDefinition>;
