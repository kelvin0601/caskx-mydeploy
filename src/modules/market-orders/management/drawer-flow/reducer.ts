import { EBidExecutionPolicy } from "@/enum/cask-bid";
import type { SetStateAction } from "react";
import { MARKET_ORDER_STEP } from "../../constants";
import type { MarketOrderStep } from "../../flow/types";
import type { OrderDraft, PriceValidationResult } from "../../types";
import type { PreviousOffer } from "./model";

export type MarketOrderDrawerFlowState = {
    draft: OrderDraft;
    initialDraft: OrderDraft;
    previousOffer: PreviousOffer;
    step: MarketOrderStep;
    validation: PriceValidationResult;
};

export type MarketOrderDrawerFlowAction =
    | {
          type: "initialize";
          draft: OrderDraft;
          previousOffer: PreviousOffer;
      }
    | { type: "set-draft"; value: SetStateAction<OrderDraft> }
    | { type: "set-step"; value: SetStateAction<MarketOrderStep> }
    | {
          type: "set-validation";
          value: SetStateAction<PriceValidationResult>;
      };

export const INITIAL_DRAWER_FLOW_STATE: MarketOrderDrawerFlowState = {
    draft: {
        price: 0,
        quantity: 1,
        expirationDays: "",
        executionPolicy: EBidExecutionPolicy.PARTIAL_ALLOWED,
    },
    initialDraft: {
        price: 0,
        quantity: 1,
        expirationDays: "",
        executionPolicy: EBidExecutionPolicy.PARTIAL_ALLOWED,
    },
    previousOffer: {
        price: 0,
        totalQuantity: 0,
        remainingQuantity: 0,
        expirationDays: 0,
    },
    step: MARKET_ORDER_STEP.EDIT,
    validation: {
        message: "",
        warningType: "none",
    },
};

function resolveStateAction<T>(current: T, value: SetStateAction<T>) {
    return typeof value === "function"
        ? (value as (current: T) => T)(current)
        : value;
}

export function marketOrderDrawerFlowReducer(
    state: MarketOrderDrawerFlowState,
    action: MarketOrderDrawerFlowAction
): MarketOrderDrawerFlowState {
    switch (action.type) {
        case "initialize":
            return {
                draft: action.draft,
                initialDraft: action.draft,
                previousOffer: action.previousOffer,
                step: MARKET_ORDER_STEP.EDIT,
                validation: {
                    message: "",
                    warningType: "none",
                },
            };
        case "set-draft":
            return {
                ...state,
                draft: resolveStateAction(state.draft, action.value),
            };
        case "set-step":
            return {
                ...state,
                step: resolveStateAction(state.step, action.value),
            };
        case "set-validation":
            return {
                ...state,
                validation: resolveStateAction(state.validation, action.value),
            };
    }
}
