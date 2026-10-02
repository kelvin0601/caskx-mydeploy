"use client";

import DataChip from "@/components/shared/data-chip";

import IconCoinsStacked from "@/components/shared/icons/icon-coins-stacked";
import IconLayers from "@/components/shared/icons/icon-layers";

import IconShoppingBag from "@/components/shared/icons/icon-shopping-bag";
import IconTag from "@/components/shared/icons/icon-tag";
import SidebarListing from "@/components/shared/sidebar-listing";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import useResponsive from "@/hooks/useResponsive";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { useMarketOrderFlowActions } from "@/modules/market-orders/flow/provider";
import { MARKET_ORDER_INTENT } from "@/modules/market-orders/constants";
import { MarketOperations } from "@/types/market-operations";
import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import { formatVolume } from "../utils";
import { MarketOrdersAccordion } from "./components/market-orders-accordion";
import { SalesHistoryAccordion } from "./components/sales-history-accordion";

const ChartHistory = dynamic(
    () => import("../../chart-history").then((module) => module.ChartHistory),
    { loading: () => <Skeleton className="h-64 w-full" /> }
);

const EMPTY_MARKET_DATA: MarketOperations.TMarketDataView = {
    asks: [],
    bids: [],
    sales: [],
};

type TMarketDataSidebarProps = {
    isOpen: boolean;
    isLoading: boolean;
    marketData?: MarketOperations.TMarketDataView;
};

function MarketDataSidebar({
    isOpen,
    isLoading,
    marketData,
}: TMarketDataSidebarProps) {
    const {
        asks: asksList,
        bids: bidsList,
        sales: salesList,
    } = marketData ?? EMPTY_MARKET_DATA;

    // Calculate Overview Metrics internally
    const { startFlow, updateDraft } = useMarketOrderFlowActions();
    const { topOffer, spread, spreadPercentage, lastSale, lifetimeVolume } =
        useMemo(() => {
            const nextTopOffer = bidsList.reduce(
                (highest, bid) => Math.max(highest, bid.price),
                0
            );
            const lowestAsk = asksList.reduce(
                (lowest, ask) => Math.min(lowest, ask.price),
                Infinity
            );
            const normalizedLowestAsk = Number.isFinite(lowestAsk)
                ? lowestAsk
                : 0;
            const nextSpread =
                normalizedLowestAsk > 0 && nextTopOffer > 0
                    ? normalizedLowestAsk - nextTopOffer
                    : 0;

            let latestSaleTimestamp = -Infinity;
            let nextLastSale = 0;
            let nextLifetimeVolume = 0;

            salesList.forEach((sale) => {
                nextLifetimeVolume += sale.salePrice * sale.quantity;
                const timestamp = new Date(sale.completedDate).getTime();
                if (timestamp > latestSaleTimestamp) {
                    latestSaleTimestamp = timestamp;
                    nextLastSale = sale.salePrice;
                }
            });

            return {
                topOffer: nextTopOffer,
                spread: nextSpread,
                spreadPercentage:
                    normalizedLowestAsk > 0
                        ? (nextSpread / normalizedLowestAsk) * 100
                        : 0,
                lastSale: nextLastSale,
                lifetimeVolume: nextLifetimeVolume,
            };
        }, [asksList, bidsList, salesList]);

    const handleOpenBid = ({
        quantity,
        price,
    }: {
        quantity: number;
        price: number;
    }) => {
        startFlow(MARKET_ORDER_INTENT.PLACE_BID);
        updateDraft({ quantity, price });
    };
    const handleOpenAsk = ({
        quantity,
        price,
    }: {
        quantity: number;
        price: number;
    }) => {
        startFlow(MARKET_ORDER_INTENT.PLACE_ASK);
        updateDraft({ quantity, price });
    };

    const renderAccordion = () => (
        <Accordion
            type="multiple"
            defaultValue={[
                "overview",
                "listings",
                "offers",
                "sales",
                "price_history",
            ]}
            className="flex w-full flex-col gap-6 tb:gap-5 mb:gap-4"
        >
            {/* Overview */}
            <AccordionItem
                value="overview"
                className="rounded-none border border-bd-main bg-bg-main p-6 tb:p-5 mb:p-4"
            >
                <AccordionTrigger
                    className="select-none p-0"
                    classNameChevron="text-typo-note"
                >
                    <div className="flex items-center gap-2 text-typo-primary">
                        <div className="h-5 w-5 shrink-0">
                            <IconLayers />
                        </div>
                        <span className="text-lg font-semibold tb:text-base">
                            Overview
                        </span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="mb:gap pb-0 pt-6 tb:pt-5 mb:pt-4">
                    {isLoading ? (
                        <div className="grid grid-cols-2 !gap-2 dk:grid-cols-2 tb:grid-cols-4 mb:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-14 w-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 !gap-2 dk:grid-cols-2 tb:grid-cols-4 mb:grid-cols-2">
                            <DataChip
                                label="Current Top Offer"
                                value={
                                    topOffer > 0
                                        ? formatCurrency(topOffer)
                                        : "N/A"
                                }
                            />
                            <DataChip
                                label="Current Spread"
                                value={
                                    spread > 0
                                        ? `${formatCurrency(spread)} (${spreadPercentage.toFixed(1)}%)`
                                        : "N/A"
                                }
                            />
                            <DataChip
                                label="Last Sale"
                                value={
                                    lastSale > 0
                                        ? formatCurrency(lastSale)
                                        : "N/A"
                                }
                            />
                            <DataChip
                                label="Lifetime Volume"
                                value={formatVolume(lifetimeVolume)}
                            />
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>

            {/* Available Listings */}
            <MarketOrdersAccordion
                value="listings"
                title="Available Listing"
                icon={<IconTag className="h-5 w-5" />}
                list={asksList}
                isLoading={isLoading}
                emptyText="No listings available"
                priceColumnHeader="Listing Price"
                onTrade={handleOpenBid}
                TableRowSkeleton={TableRowSkeleton}
            />

            {/* Available Offers */}
            <MarketOrdersAccordion
                value="offers"
                title="Available Offer"
                icon={<IconShoppingBag className="h-5 w-5" />}
                list={bidsList}
                isLoading={isLoading}
                emptyText="No offers available"
                priceColumnHeader="Offer Price"
                onTrade={handleOpenAsk}
                TableRowSkeleton={TableRowSkeleton}
            />

            {/* Sales History */}
            <SalesHistoryAccordion
                salesList={salesList}
                isLoading={isLoading}
            />

            {/* Price History */}
            {/* <AccordionItem
                value="price_history"
                className="rounded-none border border-bd-main bg-bg-main py-6 tb:py-5 mb:py-4"
            >
                <AccordionTrigger
                    className="select-none p-0 px-6 tb:px-5 mb:px-4"
                    classNameChevron="text-typo-note"
                >
                    <div className="flex items-center gap-2 text-typo-primary">
                        <div className="h-5 w-5 shrink-0">
                            <IconCoinsStacked className="h-5 w-5 text-typo-primary" />
                        </div>
                        <span className="text-lg font-semibold tb:text-base">
                            Price History
                        </span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0 pt-4">
                    <ChartHistory />
                </AccordionContent>
            </AccordionItem> */}
        </Accordion>
    );

    return (
        <>
            <div className="h-full w-full flex-1 tb:hidden">
                <SidebarListing
                    bgClass="bg-transparent gap-4"
                    className={cn(
                        "ease-[cubic-bezier(0.34,1.56,0.64,1)] sticky top-[calc(var(--height-header)+2.5rem)] z-[25] max-h-[calc(100vh-var(--height-header)-4.5rem)] min-h-full w-auto pb-6 pt-4 transition-all [&_[data-sidebar=content]]:overflow-visible",
                        isOpen
                            ? "-mr-[var(--padding-container)] ml-6 flex-1 border-l border-bd-main duration-200"
                            : "flex-0 w-0 delay-100 duration-200"
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center justify-between py-2.5",
                            isOpen ? "px-6" : ""
                        )}
                    >
                        <h3 className="font-reckless text-xl font-medium leading-[1] text-typo-primary">
                            Market Data
                        </h3>
                    </div>
                    <ScrollArea
                        className={cn(
                            "!sticky top-28 max-h-[calc(100vh-var(--height-header)-4.5rem)] max-w-[calc(100%-1.5rem)] pr-0 transition-all"
                        )}
                    >
                        <div
                            className={cn(
                                "flex h-full flex-col gap-4 transition-opacity",
                                isOpen
                                    ? "px-6 opacity-100 delay-150 duration-500"
                                    : "opacity-0 duration-100"
                            )}
                        >
                            {renderAccordion()}
                        </div>
                    </ScrollArea>
                </SidebarListing>
            </div>

            <div className="dk:hidden">
                <div className="flex items-center justify-between py-2.5 tb:hidden">
                    <h3 className="font-reckless text-xl font-medium leading-[1] text-typo-primary">
                        Market Data
                    </h3>
                </div>
                <div className="flex h-full flex-col gap-4">
                    {renderAccordion()}
                </div>
            </div>
        </>
    );
}

/** Reusable skeleton row for listings/offers tables (5-column grid) */
function TableRowSkeleton() {
    const { isDesktop } = useResponsive();

    if (isDesktop) {
        return (
            <div className="grid grid-cols-[3fr_2fr_3fr_2fr_4fr] items-center gap-x-2 border-b border-bd-main py-4">
                <Skeleton className="h-4 w-16 text-left" />
                <Skeleton className="h-4 w-8 text-left" />
                <Skeleton className="h-4 w-16 text-left" />
                <Skeleton className="h-4 w-12 text-center" />
                <Skeleton className="ml-auto h-4 w-20 text-right" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-[2.5fr_1fr_2fr_2.5fr_30px] items-center gap-x-2 border-b border-bd-main py-4">
            <div className="flex flex-col gap-1 text-left">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-4 text-left" />
            <Skeleton className="h-4 w-16 text-left" />
            <div className="flex flex-col gap-1 text-left">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="ml-auto h-[30px] w-[30px] rounded-none" />
        </div>
    );
}

/** Reusable skeleton row for sales history (3-column grid) */
function SalesRowSkeleton() {
    return (
        <div className="grid grid-cols-[3fr_2fr_3fr] items-center gap-x-2 border-b border-bd-main py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mx-auto h-4 w-8" />
            <Skeleton className="ml-auto h-4 w-16" />
        </div>
    );
}

export default memo(MarketDataSidebar);
