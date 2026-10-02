"use client";

import { TTableRow } from "@/types";
import { createContext, useContext } from "react";
import { MARKET_ORDER_OVERLAY } from "../constants";
import {
    MarketOrderKind,
    MarketOrderManagementAdapter,
    MarketOrderOverlay,
} from "../types";

export type MarketOrderManagementContextValue = {
    adapter: MarketOrderManagementAdapter;
    selectedOrder: TTableRow | null;
    activeOverlay: MarketOrderOverlay | null;
    openUpdate: (order: TTableRow, kind: MarketOrderKind) => void;
    openCancel: (order: TTableRow, kind: MarketOrderKind) => void;
    openDuplicate: (order: TTableRow, kind: MarketOrderKind) => void;
    closeOverlay: () => void;
};

export const MarketOrderManagementContext =
    createContext<MarketOrderManagementContextValue | null>(null);

export function useMarketOrderManagement() {
    const context = useContext(MarketOrderManagementContext);
    if (!context) {
        throw new Error(
            "useMarketOrderManagement must be used within MarketOrderManagementProvider"
        );
    }

    return {
        ...context,
        isUpdateOpen: context.activeOverlay === MARKET_ORDER_OVERLAY.UPDATE,
        isCancelOpen: context.activeOverlay === MARKET_ORDER_OVERLAY.CANCEL,
        isDuplicateOpen:
            context.activeOverlay === MARKET_ORDER_OVERLAY.DUPLICATE,
        closeUpdate: context.closeOverlay,
        closeCancel: context.closeOverlay,
        closeDuplicate: context.closeOverlay,
    } as const;
}
