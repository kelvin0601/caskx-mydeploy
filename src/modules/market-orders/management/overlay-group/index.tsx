"use client";

import DrawerWrapper from "@/components/shared/drawer-wrapper";
import { Drawer } from "@/components/ui/drawer";
import { useCallback, useEffect, useMemo, useState } from "react";
import CancelOrderAlert from "../../components/cancel-order-alert";
import {
    ConfirmDuplicateListingBody,
    ConfirmDuplicateListingFooter,
    ConfirmDuplicateOfferBody,
    ConfirmDuplicateOfferFooter,
    DuplicateListingBody,
    DuplicateListingFooter,
    DuplicateOfferBody,
    DuplicateOfferFooter,
} from "../../components/duplicate-order-drawer";
import {
    UpdateOrderBody,
    UpdateOrderFooter,
} from "../../components/update-order-drawer";
import {
    MARKET_ORDER_DRAWER,
    MARKET_ORDER_KIND,
    MARKET_ORDER_OVERLAY,
} from "../../constants";
import type { MarketOrderOverlay } from "../../types";
import { useMarketOrderManagement } from "../context";
import {
    MarketOrderDrawerFlowProvider,
    useMarketOrderDrawerFlow,
} from "../drawer-flow/context";
import { getDrawerState } from "../drawer-flow/model";

type MarketOrderDrawerOverlay = Exclude<
    MarketOrderOverlay,
    typeof MARKET_ORDER_OVERLAY.CANCEL
>;
type MarketOrderDrawer =
    (typeof MARKET_ORDER_DRAWER)[keyof typeof MARKET_ORDER_DRAWER];
type MarketOrderDrawerConfig = {
    title: string;
    description: string;
    body: React.ReactNode;
    footer: React.ReactNode;
    headerAside?: React.ReactNode;
    fullHeight?: boolean;
};

const OVERLAY_EXIT_DURATION_MS = 500;

function isDrawerOverlay(
    overlay: MarketOrderOverlay
): overlay is MarketOrderDrawerOverlay {
    return overlay !== MARKET_ORDER_OVERLAY.CANCEL;
}

function RenderDrawer({ overlay }: { overlay: MarketOrderDrawerOverlay }) {
    const { activeOverlay, closeOverlay } = useMarketOrderManagement();
    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) closeOverlay();
        },
        [closeOverlay]
    );

    return (
        <MarketOrderDrawerFlowProvider overlay={overlay}>
            <Drawer
                repositionInputs={false}
                open={activeOverlay === overlay}
                onOpenChange={handleOpenChange}
            >
                <DrawerBody overlay={overlay} />
            </Drawer>
        </MarketOrderDrawerFlowProvider>
    );
}

function DrawerBody({ overlay }: { overlay: MarketOrderDrawerOverlay }) {
    const { adapter, selectedOrder } = useMarketOrderManagement();
    const { step } = useMarketOrderDrawerFlow();
    const { definition } = adapter.editor;
    const isListing = definition.kind === MARKET_ORDER_KIND.LISTING;
    const drawerCurrent: MarketOrderDrawer = getDrawerState(overlay, step);
    const drawerMap: Record<MarketOrderDrawer, MarketOrderDrawerConfig> =
        useMemo(
            () => ({
                [MARKET_ORDER_DRAWER.UPDATE]: {
                    title: definition.labels.updateTitle,
                    description:
                        "Update the remaining quantity, price, and expiration for this order.",
                    body: <UpdateOrderBody />,
                    footer: <UpdateOrderFooter />,
                    headerAside: (
                        <span className="shrink-0 text-xs text-typo-note mb:hidden">
                            {definition.labels.updateNote}
                        </span>
                    ),
                },
                [MARKET_ORDER_DRAWER.CONFIRM_UPDATE]: {
                    title: isListing ? "Review Listing" : "Confirm Offer",
                    description: isListing
                        ? "Review the updated listing and matching status before confirming."
                        : "Review the updated offer and matching listings before confirming.",
                    body: <UpdateOrderBody />,
                    footer: <UpdateOrderFooter />,
                    fullHeight: true,
                },
                [MARKET_ORDER_DRAWER.DUPLICATE]: {
                    title: isListing ? "List For Sale" : "Make Offer",
                    description: `Create a new ${definition.kind} from the selected order.`,
                    body: isListing ? (
                        <DuplicateListingBody />
                    ) : (
                        <DuplicateOfferBody />
                    ),
                    footer: isListing ? (
                        <DuplicateListingFooter />
                    ) : (
                        <DuplicateOfferFooter />
                    ),
                },
                [MARKET_ORDER_DRAWER.CONFIRM_DUPLICATE]: {
                    title: isListing ? "Review Listing" : "Confirm Offer",
                    description: `Review the duplicated ${definition.kind} before confirming.`,
                    body: isListing ? (
                        <ConfirmDuplicateListingBody />
                    ) : (
                        <ConfirmDuplicateOfferBody />
                    ),
                    footer: isListing ? (
                        <ConfirmDuplicateListingFooter />
                    ) : (
                        <ConfirmDuplicateOfferFooter />
                    ),
                },
            }),
            [definition.kind, definition.labels, isListing]
        );
    const config = drawerMap[drawerCurrent];

    return (
        <DrawerWrapper
            title={config.title}
            description={config.description}
            headerAside={config.headerAside}
            fullHeight={config.fullHeight}
            contentKey={`${selectedOrder?.id ?? definition.kind}-${drawerCurrent}`}
            footer={config.footer}
        >
            {config.body}
        </DrawerWrapper>
    );
}

export default function MarketOrderManagementOverlayGroup() {
    const { activeOverlay } = useMarketOrderManagement();
    const [renderedOverlay, setRenderedOverlay] =
        useState<MarketOrderOverlay | null>(activeOverlay);

    useEffect(() => {
        if (activeOverlay) {
            setRenderedOverlay(activeOverlay);
            return;
        }
        const timer = setTimeout(
            () => setRenderedOverlay(null),
            OVERLAY_EXIT_DURATION_MS
        );
        return () => clearTimeout(timer);
    }, [activeOverlay]);

    const overlay = activeOverlay ?? renderedOverlay;
    if (!overlay) return null;
    if (overlay === MARKET_ORDER_OVERLAY.CANCEL) {
        return <CancelOrderAlert />;
    }
    if (!isDrawerOverlay(overlay)) return null;
    return <RenderDrawer overlay={overlay} />;
}
