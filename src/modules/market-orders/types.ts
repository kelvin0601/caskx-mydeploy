import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { TTableRow } from "@/types";
import { caskBid } from "@/types/cask-bid";
import { MARKET_ORDER_KIND, MARKET_ORDER_OVERLAY } from "./constants";

export type MarketOrderKind =
    (typeof MARKET_ORDER_KIND)[keyof typeof MARKET_ORDER_KIND];

export type MarketOrderOverlay =
    (typeof MARKET_ORDER_OVERLAY)[keyof typeof MARKET_ORDER_OVERLAY];

export type OrderSuggestion = {
    id: string;
    label: string;
    price: number;
    badgeVariant?: "default" | "success";
    badgeClassName?: string;
};

export type OrderDraft = {
    price: number;
    quantity: number;
    expirationDays: string;
    executionPolicy: EBidExecutionPolicy;
};

export type OrderCaskSummary = {
    id: string;
    name?: string;
    imageUrl?: string;
    vintageYear?: string | number | null;
    priceReference?: number | string | null;
    referencePrice?: number | string | null;
};

export type PriceValidationResult = {
    message: string;
    warningType: "none" | "warning" | "error";
};

export type MarketOrderLabels = {
    updateTitle: string;
    updateNote: string;
    marketPriceLabel: string;
    suggestionSectionLabel: string;
    expirationLabel: string;
    customPriceLabel: string;
    pricePlaceholder: string;
    zeroPriceMessage: string;
    cancelTitle: string;
    cancelDescription: string;
    keepLabel: string;
    cancelLabel: string;
    partialQuantityLabel: string;
    successName: string;
};

export type MarketOrderDefinition = {
    kind: MarketOrderKind;
    labels: MarketOrderLabels;
    getInitialPrice: (order: TTableRow) => number;
    getMarketPrice: (
        order: TTableRow | undefined,
        marketData: caskBid.TCaskBidMarketData | undefined,
        fallbackPrice?: number
    ) => number;
};

export type MarketOrderEditorAdapter = {
    definition: MarketOrderDefinition;
    getSuggestions: (caskId: string) => Promise<OrderSuggestion[]>;
    getMarketData: (caskId: string) => Promise<caskBid.TCaskBidMarketData>;
    validatePrice: (
        caskId: string,
        price: number
    ) => Promise<PriceValidationResult>;
};

export type UpdateOrderInput = {
    orderId: string;
    caskId: string;
    draft: OrderDraft;
};

export type CreateOrderInput = {
    caskId: string;
    draft: OrderDraft;
};

export type MarketOrderCommandAdapter = {
    editor: MarketOrderEditorAdapter;
    listQueryKey: readonly unknown[];
    create: (input: CreateOrderInput) => Promise<unknown>;
    update: (input: UpdateOrderInput) => Promise<unknown>;
    cancel: (orderId: string) => Promise<unknown>;
    duplicate: (input: CreateOrderInput) => Promise<unknown>;
};

export type MarketOrderManagementAdapter = Pick<
    MarketOrderCommandAdapter,
    "editor" | "listQueryKey" | "update" | "cancel" | "duplicate"
>;
