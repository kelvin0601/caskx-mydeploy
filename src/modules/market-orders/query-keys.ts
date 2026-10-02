import { KEY_ASK, KEY_BID, KEY_TRADING } from "@/lib/constants";
import { MarketOrderKind } from "./types";
import { MARKET_ORDER_KIND } from "./constants";

const ORDER_OPERATION_KEYS = {
    [MARKET_ORDER_KIND.LISTING]: {
        suggestion: KEY_ASK.ASK_SUGGEST,
        validation: KEY_ASK.ASK_VALIDATE_PRICE,
        update: KEY_ASK.ASK_UPDATE,
        cancel: KEY_ASK.ASK_CANCEL,
    },
    [MARKET_ORDER_KIND.OFFER]: {
        suggestion: KEY_BID.BID_SUGGESTION,
        validation: KEY_BID.BID_VALIDATE,
        update: KEY_BID.BID_UPDATE,
        cancel: KEY_BID.BID_CANCEL,
    },
} as const satisfies Record<
    MarketOrderKind,
    {
        suggestion: string;
        validation: string;
        update: string;
        cancel: string;
    }
>;

export const MARKET_ORDER_KEYS = {
    root: [KEY_TRADING.MARKET_ORDERS] as const,
    suggestions: (kind: MarketOrderKind, caskId: string) =>
        [
            KEY_TRADING.MARKET_ORDERS,
            kind,
            ORDER_OPERATION_KEYS[kind].suggestion,
            caskId,
        ] as const,
    marketData: (caskId: string) => [KEY_BID.BID_MARKET_DATA, caskId] as const,
    buyMatching: (
        caskId: string | undefined,
        price?: number,
        quantity?: number
    ) => [KEY_ASK.ASK_MATCHING_BIDS, price, quantity, caskId] as const,
    sellMatching: (
        caskId: string | undefined,
        price?: number,
        quantity?: number
    ) => [KEY_BID.BID_MATCHING_ASKS, price, quantity, caskId] as const,
    buyCalculation: (data: unknown) =>
        [KEY_BID.BID_CALCULATE_PRICE, data] as const,
    sellCalculation: (data: unknown) =>
        [KEY_ASK.ASK_CALCULATE_PRICE, data] as const,
    validation: (kind: MarketOrderKind, caskId: string) =>
        [
            KEY_TRADING.MARKET_ORDERS,
            kind,
            ORDER_OPERATION_KEYS[kind].validation,
            caskId,
        ] as const,
    create: (kind: MarketOrderKind) =>
        [
            KEY_TRADING.MARKET_ORDERS,
            kind,
            kind === MARKET_ORDER_KIND.LISTING
                ? KEY_ASK.ASK_CREATE
                : KEY_BID.BID_CREATE,
        ] as const,
    update: (kind: MarketOrderKind, orderId?: string) =>
        [
            KEY_TRADING.MARKET_ORDERS,
            kind,
            ORDER_OPERATION_KEYS[kind].update,
            orderId,
        ] as const,
    cancel: (kind: MarketOrderKind, orderId?: string) =>
        [
            KEY_TRADING.MARKET_ORDERS,
            kind,
            ORDER_OPERATION_KEYS[kind].cancel,
            orderId,
        ] as const,
};
