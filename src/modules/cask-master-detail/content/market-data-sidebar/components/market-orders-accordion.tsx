import { HoverRow } from "@/components/shared/hover-row";
import IconShoppingBag from "@/components/shared/icons/icon-shopping-bag";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import useResponsive from "@/hooks/useResponsive";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { MarketOperations } from "@/types/market-operations";
import React from "react";

type TMarketOrder =
    | MarketOperations.TAggregatedAskDto
    | MarketOperations.TAggregatedBidDto;

const getMarketDifference = (item: TMarketOrder) =>
    "percentageFromLowest" in item
        ? item.percentageFromLowest
        : item.percentageFromHighest;

export type MarketOrdersAccordionProps = {
    value: string;
    title: string;
    icon: React.ReactNode;
    list: TMarketOrder[];
    isLoading: boolean;
    emptyText: string;
    priceColumnHeader: string;
    onTrade: (data: { quantity: number; price: number }) => void;
    TableRowSkeleton: React.ComponentType;
};

export function MarketOrdersAccordion({
    value,
    title,
    icon,
    list,
    isLoading,
    emptyText,
    priceColumnHeader,
    onTrade,
    TableRowSkeleton,
}: MarketOrdersAccordionProps) {
    const { isMobile } = useResponsive();

    return (
        <AccordionItem
            value={value}
            className="rounded-none border border-bd-main bg-bg-main py-6 tb:py-5 mb:py-4"
        >
            <AccordionTrigger
                className="select-none p-0 px-6 tb:px-5 mb:px-4"
                classNameChevron="text-typo-note"
            >
                <div className="flex items-center gap-2 text-typo-primary">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center text-typo-primary">
                        {icon}
                    </div>
                    <span className="text-lg font-semibold tb:text-base">
                        {title}
                    </span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-0 pt-2 tb:px-5 mb:px-4">
                {isLoading ? (
                    <>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <TableRowSkeleton key={i} />
                        ))}
                    </>
                ) : list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-typo-soft">
                        {emptyText}
                    </div>
                ) : (
                    <>
                        <p className="mb-4 text-sm text-typo-sub">
                            The prices below do not include applicable fees
                            calculated at checkout.
                        </p>
                        <div>
                            {!isMobile ? (
                                <>
                                    <div className="grid grid-cols-[3fr_2fr_3fr_2fr_4fr] !gap-x-4 border-b border-bd-main py-3 text-xs text-typo-soft">
                                        <div className="text-left">
                                            {priceColumnHeader}
                                        </div>
                                        <div className="text-left">
                                            Quantity
                                        </div>
                                        <div className="text-left">Total</div>
                                        <div className="text-center">Type</div>
                                        <div className="text-right">
                                            Expiry date
                                        </div>
                                    </div>
                                    <ScrollArea className="-ml-3 -mr-4 -mt-px max-h-[33vh] w-auto pr-1">
                                        <div className="w-full">
                                            {list.map((item, index) => {
                                                const total =
                                                    item.price * item.quantity;
                                                return (
                                                    <HoverRow
                                                        key={index}
                                                        insetX="3"
                                                        className="group/row mx-3 grid grid-cols-[3fr_2fr_3fr_2fr_4fr] items-center !gap-x-4 border-b border-bd-main py-4 text-sm font-medium text-typo-primary first:after:top-0"
                                                    >
                                                        <div className="relative text-left font-medium text-typo-primary">
                                                            {formatCurrency(
                                                                item.price
                                                            )}
                                                        </div>
                                                        <div className="relative text-left text-typo-primary">
                                                            {item.quantity}
                                                        </div>
                                                        <div className="relative text-left text-typo-primary">
                                                            {formatCurrency(
                                                                total
                                                            )}
                                                        </div>
                                                        <div className="relative text-center capitalize text-typo-primary">
                                                            {item.type
                                                                ?.split("_")
                                                                .join(" ") ||
                                                                "Partial allowed"}
                                                        </div>
                                                        <div className="relative flex items-center justify-end whitespace-nowrap text-right font-medium text-typo-primary">
                                                            <span className="transition-opacity duration-200 group-hover/row:opacity-0">
                                                                {
                                                                    formatDateTime(
                                                                        item?.expiryDate
                                                                    )
                                                                        .dataOnlyNumber
                                                                }{" "}
                                                                <span className="text-typo-soft">
                                                                    {
                                                                        formatDateTime(
                                                                            item?.expiryDate
                                                                        )
                                                                            .timeOnly24
                                                                    }
                                                                </span>
                                                            </span>
                                                            <Button
                                                                size="sm"
                                                                variant="action"
                                                                onClick={() =>
                                                                    onTrade({
                                                                        quantity:
                                                                            item.quantity,
                                                                        price: item.price,
                                                                    })
                                                                }
                                                                className="pointer-events-none absolute right-0 h-7 min-w-0 px-4 py-2 text-xs font-semibold opacity-0 transition-opacity duration-200 group-hover/row:pointer-events-auto group-hover/row:opacity-100"
                                                            >
                                                                Trade
                                                            </Button>
                                                        </div>
                                                    </HoverRow>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </>
                            ) : (
                                <>
                                    <div className="-ml-3 -mr-4 pr-1">
                                        <div className="mx-3 grid grid-cols-[8fr_2fr_9.5fr_8fr_3fr] gap-x-1.5 border-b border-bd-main py-3 text-xs text-typo-soft">
                                            <div className="text-left">
                                                Total
                                            </div>
                                            <div className="text-left">Qty</div>
                                            <div className="text-left">
                                                Type
                                            </div>
                                            <div className="text-left">
                                                Market diff.
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                    <ScrollArea className="-ml-3 -mr-4 -mt-px max-h-[33vh] w-auto pr-1">
                                        <div className="w-full">
                                            {list.map((item, index) => {
                                                const total =
                                                    item.price * item.quantity;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="mx-3 grid grid-cols-[8fr_2fr_9.5fr_8fr_3fr] items-center border-b border-bd-main py-4 text-xs text-typo-primary mb:!gap-x-1.5 mb:py-3"
                                                    >
                                                        <div className="flex flex-col gap-1 text-left">
                                                            <span className="text-xs font-semibold text-typo-primary">
                                                                {formatCurrency(
                                                                    total
                                                                )}
                                                            </span>
                                                            <span className="text-xs font-normal text-typo-soft">
                                                                <span className="font-medium text-typo-primary">
                                                                    {formatCurrency(
                                                                        item.price
                                                                    )}
                                                                </span>
                                                                /cask
                                                            </span>
                                                        </div>
                                                        <div className="text-left font-medium text-typo-primary">
                                                            {item.quantity}
                                                        </div>
                                                        <div className="text-left font-medium capitalize text-typo-primary">
                                                            {item.type
                                                                ?.split("_")
                                                                .join(" ") ||
                                                                "Partial allowed"}
                                                        </div>
                                                        <div className="text-left text-xs font-medium text-typo-primary">
                                                            {
                                                                formatDateTime(
                                                                    item?.expiryDate
                                                                ).dataOnlyNumber
                                                            }{" "}
                                                            <span className="text-typo-soft">
                                                                {
                                                                    formatDateTime(
                                                                        item?.expiryDate
                                                                    ).timeOnly24
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-end">
                                                            <Button
                                                                size="icon"
                                                                variant="action"
                                                                aria-label="Trade this market order"
                                                                className="flex h-[1.875rem] w-[1.875rem] min-w-0 items-center justify-center rounded-none bg-bg-dark-main p-0 text-typo-dark-primary hover:bg-bg-dark-main/90"
                                                                onClick={() =>
                                                                    onTrade({
                                                                        quantity:
                                                                            item.quantity,
                                                                        price: item.price,
                                                                    })
                                                                }
                                                            >
                                                                <IconShoppingBag className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </>
                            )}
                        </div>
                    </>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}
