import { OrderDraft } from "../types";
import {
    MARKET_ORDER_INTENT,
    MARKET_ORDER_OUTCOME,
    MARKET_ORDER_STEP,
} from "../constants";

export type MarketOrderIntent =
    (typeof MARKET_ORDER_INTENT)[keyof typeof MARKET_ORDER_INTENT];

export type MarketOrderSide = "buy" | "sell";
export type MarketOrderExecution = "market" | "limit";
export type MarketOrderStep =
    (typeof MARKET_ORDER_STEP)[keyof typeof MARKET_ORDER_STEP];

export type MarketOrderIntentDefinition = {
    side: MarketOrderSide;
    execution: MarketOrderExecution;
};

export type MarketOrderFlowState = {
    intent: MarketOrderIntent | null;
    step: MarketOrderStep;
    draft: OrderDraft;
    placeRemainingOrder: boolean;
};

export type MarketOrderOutcome =
    | { type: typeof MARKET_ORDER_OUTCOME.CHECKOUT; sessionId: string }
    | {
          type: typeof MARKET_ORDER_OUTCOME.PAYOUT;
          payoutId: string;
          hasRemainingOrder?: boolean;
      }
    | { type: typeof MARKET_ORDER_OUTCOME.OPEN_ORDER; orderId?: string }
    | { type: typeof MARKET_ORDER_OUTCOME.COMPLETED };

export type MarketOrderSubmitOutcome =
    | MarketOrderOutcome
    | { type: typeof MARKET_ORDER_OUTCOME.PRICE_CHANGED; price: number };

export type MarketOrderFlowActions = {
    startFlow: (intent: MarketOrderIntent) => void;
    switchFlow: (intent: MarketOrderIntent) => void;
    goToConfirm: () => void;
    backToEdit: () => void;
    closeFlow: () => void;
    setDraft: (draft: OrderDraft) => void;
    updateDraft: (draft: Partial<OrderDraft>) => void;
    setPlaceRemainingOrder: (value: boolean) => void;
};
