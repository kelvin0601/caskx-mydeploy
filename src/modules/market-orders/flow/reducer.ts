import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { MarketOrderFlowState, MarketOrderIntent } from "./types";
import { OrderDraft } from "../types";
import { MARKET_ORDER_STEP } from "../constants";

export const DEFAULT_MARKET_ORDER_DRAFT: OrderDraft = {
    price: 0,
    quantity: 1,
    expirationDays: "30",
    executionPolicy: EBidExecutionPolicy.PARTIAL_ALLOWED,
};

export const INITIAL_MARKET_ORDER_FLOW_STATE: MarketOrderFlowState = {
    intent: null,
    step: MARKET_ORDER_STEP.EDIT,
    draft: DEFAULT_MARKET_ORDER_DRAFT,
    placeRemainingOrder: false,
};

export type MarketOrderFlowAction =
    | { type: "start"; intent: MarketOrderIntent }
    | { type: "switch"; intent: MarketOrderIntent }
    | { type: "confirm" }
    | { type: "edit" }
    | { type: "close" }
    | { type: "set-draft"; draft: OrderDraft }
    | { type: "update-draft"; draft: Partial<OrderDraft> }
    | { type: "set-place-remaining"; value: boolean };

export function marketOrderFlowReducer(
    state: MarketOrderFlowState,
    action: MarketOrderFlowAction
): MarketOrderFlowState {
    switch (action.type) {
        case "start":
            return {
                ...INITIAL_MARKET_ORDER_FLOW_STATE,
                intent: action.intent,
            };
        case "switch":
            return {
                ...state,
                intent: action.intent,
                step: MARKET_ORDER_STEP.EDIT,
                placeRemainingOrder: false,
            };
        case "confirm":
            return { ...state, step: MARKET_ORDER_STEP.CONFIRM };
        case "edit":
            return { ...state, step: MARKET_ORDER_STEP.EDIT };
        case "close":
            return INITIAL_MARKET_ORDER_FLOW_STATE;
        case "set-draft":
            return { ...state, draft: action.draft };
        case "update-draft":
            return { ...state, draft: { ...state.draft, ...action.draft } };
        case "set-place-remaining":
            return { ...state, placeRemainingOrder: action.value };
    }
}
