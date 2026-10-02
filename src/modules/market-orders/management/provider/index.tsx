"use client";

import { TTableRow } from "@/types";
import { useCallback, useContext, useMemo, useState } from "react";
import {
    MarketOrderKind,
    MarketOrderManagementAdapter,
    MarketOrderOverlay,
} from "../../types";
import { MARKET_ORDER_KIND, MARKET_ORDER_OVERLAY } from "../../constants";
import { listingOrderAdapter } from "../../adapters/listing-order-adapter";
import { offerOrderAdapter } from "../../adapters/offer-order-adapter";
import {
    MarketOrderManagementContext,
    useMarketOrderManagement,
} from "../context";
import MarketOrderManagementOverlayGroup from "../overlay-group";

export function MarketOrderManagementProvider({
    children,
    adapter,
}: {
    children: React.ReactNode;
    adapter?: MarketOrderManagementAdapter;
}) {
    const parentContext = useContext(MarketOrderManagementContext);
    const [selectedOrder, setSelectedOrder] = useState<TTableRow | null>(null);
    const [activeOverlay, setActiveOverlay] =
        useState<MarketOrderOverlay | null>(null);
    const [activeAdapter, setActiveAdapter] =
        useState<MarketOrderManagementAdapter>(adapter ?? offerOrderAdapter);

    const resolveAdapter = useCallback(
        (kind: MarketOrderKind) =>
            adapter ??
            (kind === MARKET_ORDER_KIND.LISTING
                ? listingOrderAdapter
                : offerOrderAdapter),
        [adapter]
    );

    const openOverlay = useCallback(
        (
            order: TTableRow,
            kind: MarketOrderKind,
            overlay: MarketOrderOverlay
        ) => {
            setActiveAdapter(resolveAdapter(kind));
            setSelectedOrder(order);
            setActiveOverlay(overlay);
        },
        [resolveAdapter]
    );
    const openUpdate = useCallback(
        (order: TTableRow, kind: MarketOrderKind) =>
            openOverlay(order, kind, MARKET_ORDER_OVERLAY.UPDATE),
        [openOverlay]
    );
    const openCancel = useCallback(
        (order: TTableRow, kind: MarketOrderKind) =>
            openOverlay(order, kind, MARKET_ORDER_OVERLAY.CANCEL),
        [openOverlay]
    );
    const openDuplicate = useCallback(
        (order: TTableRow, kind: MarketOrderKind) =>
            openOverlay(order, kind, MARKET_ORDER_OVERLAY.DUPLICATE),
        [openOverlay]
    );
    const closeOverlay = useCallback(() => setActiveOverlay(null), []);

    const value = useMemo(
        () => ({
            adapter: activeAdapter,
            selectedOrder,
            activeOverlay,
            openUpdate,
            openCancel,
            openDuplicate,
            closeOverlay,
        }),
        [
            activeOverlay,
            activeAdapter,
            closeOverlay,
            openCancel,
            openDuplicate,
            openUpdate,
            selectedOrder,
        ]
    );

    if (parentContext) {
        throw new Error(
            "MarketOrderManagementProvider must not be nested. Mount one provider at the route layout and pass an explicit MarketOrderKind to its actions."
        );
    }

    return (
        <MarketOrderManagementContext.Provider value={value}>
            {children}
            <MarketOrderManagementOverlayGroup />
        </MarketOrderManagementContext.Provider>
    );
}

export { useMarketOrderManagement };
