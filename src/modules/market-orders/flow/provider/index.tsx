"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useReducer,
} from "react";
import {
    INITIAL_MARKET_ORDER_FLOW_STATE,
    marketOrderFlowReducer,
} from "../reducer";
import {
    MarketOrderFlowActions,
    MarketOrderFlowState,
    MarketOrderIntent,
} from "../types";
import { OrderDraft } from "../../types";

const MarketOrderFlowStateContext = createContext<MarketOrderFlowState | null>(
    null
);
const MarketOrderFlowActionsContext =
    createContext<MarketOrderFlowActions | null>(null);

export function MarketOrderFlowProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [state, dispatch] = useReducer(
        marketOrderFlowReducer,
        INITIAL_MARKET_ORDER_FLOW_STATE
    );

    const startFlow = useCallback((intent: MarketOrderIntent) => {
        dispatch({ type: "start", intent });
    }, []);
    const switchFlow = useCallback((intent: MarketOrderIntent) => {
        dispatch({ type: "switch", intent });
    }, []);
    const goToConfirm = useCallback(() => dispatch({ type: "confirm" }), []);
    const backToEdit = useCallback(() => dispatch({ type: "edit" }), []);
    const closeFlow = useCallback(() => dispatch({ type: "close" }), []);
    const setDraft = useCallback((draft: OrderDraft) => {
        dispatch({ type: "set-draft", draft });
    }, []);
    const updateDraft = useCallback((draft: Partial<OrderDraft>) => {
        dispatch({ type: "update-draft", draft });
    }, []);
    const setPlaceRemainingOrder = useCallback((value: boolean) => {
        dispatch({ type: "set-place-remaining", value });
    }, []);

    const actions = useMemo(
        () => ({
            startFlow,
            switchFlow,
            goToConfirm,
            backToEdit,
            closeFlow,
            setDraft,
            updateDraft,
            setPlaceRemainingOrder,
        }),
        [
            backToEdit,
            closeFlow,
            goToConfirm,
            setDraft,
            setPlaceRemainingOrder,
            startFlow,
            switchFlow,
            updateDraft,
        ]
    );

    return (
        <MarketOrderFlowActionsContext.Provider value={actions}>
            <MarketOrderFlowStateContext.Provider value={state}>
                {children}
            </MarketOrderFlowStateContext.Provider>
        </MarketOrderFlowActionsContext.Provider>
    );
}

export function useMarketOrderFlowState() {
    const context = useContext(MarketOrderFlowStateContext);
    if (!context) {
        throw new Error(
            "useMarketOrderFlowState must be used within MarketOrderFlowProvider"
        );
    }
    return context;
}

export function useMarketOrderFlowActions() {
    const context = useContext(MarketOrderFlowActionsContext);
    if (!context) {
        throw new Error(
            "useMarketOrderFlowActions must be used within MarketOrderFlowProvider"
        );
    }
    return context;
}
