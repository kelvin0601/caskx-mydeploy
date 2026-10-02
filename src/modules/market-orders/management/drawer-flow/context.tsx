"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from "react";
import { MARKET_ORDER_KIND, MARKET_ORDER_OVERLAY } from "../../constants";
import type { MarketOrderStep } from "../../flow/types";
import useBuyOrderMatching from "../../hooks/use-buy-order-matching";
import useSellOrderMatching from "../../hooks/use-sell-order-matching";
import type {
    MarketOrderOverlay,
    OrderDraft,
    PriceValidationResult,
} from "../../types";
import { useMarketOrderManagement } from "../context";
import { createManagementDraft, type PreviousOffer } from "./model";
import {
    INITIAL_DRAWER_FLOW_STATE,
    marketOrderDrawerFlowReducer,
} from "./reducer";

type MarketOrderDrawerFlowContextValue = {
    draft: OrderDraft;
    initialDraft: OrderDraft;
    previousOffer: PreviousOffer;
    step: MarketOrderStep;
    validation: PriceValidationResult;
    setDraft: React.Dispatch<React.SetStateAction<OrderDraft>>;
    setStep: React.Dispatch<React.SetStateAction<MarketOrderStep>>;
    setValidation: React.Dispatch<React.SetStateAction<PriceValidationResult>>;
    updateMatching:
        | ReturnType<typeof useBuyOrderMatching>
        | ReturnType<typeof useSellOrderMatching>;
};

const MarketOrderDrawerFlowContext =
    createContext<MarketOrderDrawerFlowContextValue | null>(null);

export function MarketOrderDrawerFlowProvider({
    overlay,
    children,
}: {
    overlay: Exclude<MarketOrderOverlay, typeof MARKET_ORDER_OVERLAY.CANCEL>;
    children: React.ReactNode;
}) {
    const { adapter, selectedOrder } = useMarketOrderManagement();
    const [state, dispatch] = useReducer(
        marketOrderDrawerFlowReducer,
        INITIAL_DRAWER_FLOW_STATE
    );
    const { draft, initialDraft, previousOffer, step, validation } = state;
    const setDraft: React.Dispatch<React.SetStateAction<OrderDraft>> =
        useCallback((value) => dispatch({ type: "set-draft", value }), []);
    const setStep: React.Dispatch<React.SetStateAction<MarketOrderStep>> =
        useCallback((value) => dispatch({ type: "set-step", value }), []);
    const setValidation: React.Dispatch<
        React.SetStateAction<PriceValidationResult>
    > = useCallback((value) => dispatch({ type: "set-validation", value }), []);

    const isOffer = adapter.editor.definition.kind === MARKET_ORDER_KIND.OFFER;

    const updateBuyMatching = useBuyOrderMatching({
        caskId:
            overlay === MARKET_ORDER_OVERLAY.UPDATE && isOffer
                ? selectedOrder?.caskId
                : undefined,
        maximumPrice:
            overlay === MARKET_ORDER_OVERLAY.UPDATE && isOffer
                ? draft.price
                : undefined,
        quantity:
            overlay === MARKET_ORDER_OVERLAY.UPDATE && isOffer
                ? draft.quantity
                : undefined,
        enabled: false,
    });

    const updateSellMatching = useSellOrderMatching({
        caskId:
            overlay === MARKET_ORDER_OVERLAY.UPDATE && !isOffer
                ? selectedOrder?.caskId
                : undefined,
        minimumPrice:
            overlay === MARKET_ORDER_OVERLAY.UPDATE && !isOffer
                ? draft.price
                : undefined,
        quantity:
            overlay === MARKET_ORDER_OVERLAY.UPDATE && !isOffer
                ? draft.quantity
                : undefined,
        enabled: false,
    });

    const updateMatching = isOffer ? updateBuyMatching : updateSellMatching;

    useEffect(() => {
        if (!selectedOrder) return;

        const { draft: nextDraft, previousOffer: nextPreviousOffer } =
            createManagementDraft(
                selectedOrder,
                overlay,
                adapter.editor.definition.getInitialPrice
            );

        dispatch({
            type: "initialize",
            draft: nextDraft,
            previousOffer: nextPreviousOffer,
        });
    }, [adapter.editor.definition, overlay, selectedOrder]);

    const value = useMemo(
        () => ({
            draft,
            initialDraft,
            previousOffer,
            step,
            validation,
            updateMatching,
            setDraft,
            setStep,
            setValidation,
        }),
        [
            draft,
            initialDraft,
            previousOffer,
            setDraft,
            setStep,
            setValidation,
            step,
            updateMatching,
            validation,
        ]
    );

    return (
        <MarketOrderDrawerFlowContext.Provider value={value}>
            {children}
        </MarketOrderDrawerFlowContext.Provider>
    );
}

export function useMarketOrderDrawerFlow() {
    const context = useContext(MarketOrderDrawerFlowContext);
    if (!context) {
        throw new Error(
            "useMarketOrderDrawerFlow must be used within MarketOrderDrawerFlowProvider"
        );
    }
    return context;
}
