import { HoverRow } from "@/components/shared/hover-row";
import IconSale from "@/components/shared/icons/icon-sale";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { MarketOperations } from "@/types/market-operations";
import React from "react";

function SalesRowSkeleton() {
    return (
        <div className="grid grid-cols-[3fr_2fr_3fr] items-center gap-x-2 border-b border-bd-main py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mx-auto h-4 w-8" />
            <Skeleton className="ml-auto h-4 w-16" />
        </div>
    );
}

export type SalesHistoryAccordionProps = {
    salesList: MarketOperations.TMarketSaleDto[];
    isLoading: boolean;
};

export function SalesHistoryAccordion({
    salesList,
    isLoading,
}: SalesHistoryAccordionProps) {
    const sortedSales = salesList.toSorted(
        (a, b) =>
            new Date(b.completedDate).getTime() -
            new Date(a.completedDate).getTime()
    );

    return (
        <AccordionItem
            value="sales"
            className="rounded-none border border-bd-main bg-bg-main py-6 tb:py-5 mb:py-4"
        >
            <AccordionTrigger
                className="select-none p-0 px-6 tb:px-5 mb:px-4"
                classNameChevron="text-typo-note"
            >
                <div className="flex items-center gap-2 text-typo-primary">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center text-typo-primary">
                        <IconSale />
                    </div>
                    <span className="text-lg font-semibold tb:text-base">
                        Sales History
                    </span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-0 pt-4 tb:px-5 tb:pt-4 mb:px-4">
                {isLoading ? (
                    <>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SalesRowSkeleton key={i} />
                        ))}
                    </>
                ) : salesList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-typo-soft">
                        No sales history available
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-[3fr_2fr_3fr] gap-x-2 border-b border-bd-main py-3 text-xs text-typo-soft">
                            <div className="text-left">Date</div>
                            <div className="text-left">Quantity</div>
                            <div className="text-right">Price</div>
                        </div>
                        <ScrollArea className="-ml-3 -mr-4 -mt-px max-h-[33vh] w-auto pr-1">
                            {sortedSales.map((sale) => (
                                <HoverRow
                                    key={sale.transactionId}
                                    insetX="3"
                                    className="pointer-events-none mx-3 grid grid-cols-[3fr_2fr_3fr] items-center !gap-x-4 border-b border-bd-main py-4 text-sm font-medium text-typo-primary first:after:top-0"
                                >
                                    <div className="relative z-10 text-left font-medium text-typo-primary mb:text-xs">
                                        {
                                            formatDateTime(sale.completedDate)
                                                .dataOnlyNumber
                                        }{" "}
                                        <span className="text-typo-soft">
                                            {
                                                formatDateTime(
                                                    sale.completedDate
                                                ).timeOnly24
                                            }
                                        </span>
                                    </div>
                                    <div className="relative z-10 text-left font-medium text-typo-primary mb:text-xs">
                                        {sale.quantity}
                                    </div>
                                    <div className="relative z-10 text-right font-medium text-typo-primary mb:text-xs">
                                        {formatCurrency(sale.salePrice)}
                                    </div>
                                </HoverRow>
                            ))}
                        </ScrollArea>
                    </div>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}
