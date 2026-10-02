"use client";

import { cn, formatCurrency, handleRenderFallbackText } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/shared/search-input";
import IconTag from "@/components/shared/icons/icon-tag";
import IconShoppingBag from "@/components/shared/icons/icon-shopping-bag";
import EmptyState from "@/components/shared/empty-state";
import PaginationBar from "@/components/shared/pagination-bar";
import useResponsive from "@/hooks/useResponsive";

type TMarketActivityItem = {
    id: string;
    caskName: string;
    type: "Listing" | "Offer";
    vintage: number;
    price: number;
    floorDiff?: number;
    expiryDate?: string;
    expiryTime?: string;
    action: "Buy now" | "Sell now";
};

type TMarketActivityTabProps = {
    items?: TMarketActivityItem[];
    isLoading?: boolean;
    className?: string;
};

export default function MarketActivityTab({
    items = [],
    isLoading = false,
    className,
}: TMarketActivityTabProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<"All" | "Listing" | "Offer">(
        "All"
    );
    const { isDesktop } = useResponsive();
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Filter items
    const filteredItems = items.filter((item) => {
        const matchesSearch = item.caskName
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "All" || item.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const totalPages = Math.ceil(filteredItems.length / pageSize);
    const paginatedItems = filteredItems.slice(
        (page - 1) * pageSize,
        page * pageSize
    );
    const hasActiveFilters = searchQuery.length > 0 || typeFilter !== "All";

    if (isLoading) {
        return <MarketActivitySkeleton className={className} />;
    }

    return (
        <div className={cn("flex flex-col gap-6 tb:gap-5 mb:gap-4", className)}>
            {/* Search and Filter */}
            <div className="flex items-center justify-between gap-4 mb:flex-row mb:gap-2">
                {/* Search */}
                <SearchInput
                    value={searchQuery}
                    onChange={(val) => {
                        setSearchQuery(val);
                        setPage(1);
                    }}
                    placeholder="Search by cask name or vintage"
                    className="h-12 w-[20.625rem] min-w-0 border-0 bg-bg-sf4 pr-0 tb:h-10 mb:h-10 mb:w-auto mb:flex-1"
                />

                {/* Type Filter */}
                <div className="flex shrink-0 items-center gap-2 mb:gap-1.5">
                    <span className="text-sm text-typo-soft mb:hidden">
                        Type
                    </span>
                    <Select
                        value={typeFilter}
                        onValueChange={(val) => {
                            setTypeFilter(val as "All" | "Listing" | "Offer");
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="h-12 min-w-[8.6875rem] rounded-none bg-bg-sf4 px-4 font-medium placeholder:font-normal tb:h-10 mb:h-10 mb:w-[6.25rem] mb:min-w-[6.25rem]">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent
                            className="rounded-none border border-bd-main bg-bg-main mb:w-[6.25rem]"
                            align={isDesktop ? "start" : "end"}
                        >
                            <SelectItem
                                value="All"
                                className="rounded-none border-b border-bd-main px-0 py-3 text-sm font-medium"
                            >
                                All
                            </SelectItem>
                            <SelectItem
                                value="Listing"
                                className="rounded-none border-b border-bd-main px-0 py-3 text-sm font-medium"
                            >
                                Listing
                            </SelectItem>
                            <SelectItem
                                value="Offer"
                                className="rounded-none px-0 py-3 text-sm font-medium"
                            >
                                Offer
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {filteredItems.length > 0 ? (
                <div className="w-full min-w-0 overflow-x-auto tb:overflow-visible">
                    <div className="min-w-[50rem] tb:min-w-0">
                        {/* Table Header */}
                        <div className="grid grid-cols-[4fr_1.5fr_1.5fr_1.5fr_1.5fr_2.5fr_1fr] items-center !gap-4 border-b border-bd-main py-3 tb:grid-cols-[4fr_1.5fr_1.5fr_2.5fr_1fr] mb:grid-cols-[4fr_1.5fr_1.5fr_2.5fr_1fr] mb:gap-2 [&_div]:leading-[1]">
                            <div className="sticky left-0 z-10 pr-2">
                                <span className="text-xs text-typo-soft">
                                    Cask Name
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-typo-soft">
                                    Type
                                </span>
                            </div>
                            <div className="tb:hidden">
                                <span className="text-xs text-typo-soft">
                                    Vintage
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-typo-soft">
                                    Price
                                </span>
                            </div>
                            <div className="tb:hidden">
                                <span className="text-xs text-typo-soft">
                                    Floor Diff
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-typo-soft">
                                    Expiry Date
                                </span>
                            </div>
                            <div className="text-right mb:hidden" />
                            <div className="hidden mb:block" />
                        </div>

                        {/* Table Rows */}
                        {paginatedItems.map((item) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-[4fr_1.5fr_1.5fr_1.5fr_1.5fr_2.5fr_1fr] items-center !gap-4 border-b border-bd-main py-4 tb:grid-cols-[4fr_1.5fr_1.5fr_2.5fr_1fr] mb:grid-cols-[4fr_1.5fr_1.5fr_2.5fr_1fr] mb:gap-2 mb:py-3"
                            >
                                <div className="sticky left-0 z-10 flex min-w-0 flex-col gap-1 pr-2">
                                    <span className="truncate text-sm font-semibold text-typo-primary mb:text-xs">
                                        {item.caskName}
                                    </span>
                                    <span className="hidden text-xs font-normal leading-none text-typo-soft mb:inline">
                                        Vintage{" "}
                                        <span className="font-semibold text-typo-primary">
                                            {handleRenderFallbackText(
                                                item?.vintage
                                            )}
                                        </span>
                                    </span>
                                </div>
                                <div>
                                    <span className="align-top text-sm text-typo-primary mb:text-xs">
                                        {item.type}
                                    </span>
                                </div>
                                <div className="tb:hidden">
                                    <span className="text-sm font-medium text-typo-primary">
                                        {item.vintage}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-typo-primary mb:text-xs">
                                        {formatCurrency(item.price)}
                                    </span>
                                    <span className="hidden text-xs font-normal leading-none text-typo-soft mb:inline">
                                        {item.floorDiff
                                            ? `${item.floorDiff}%`
                                            : "-"}
                                    </span>
                                </div>
                                <div className="tb:hidden">
                                    <span className="text-sm font-medium text-typo-primary">
                                        {item.floorDiff
                                            ? `${item.floorDiff}%`
                                            : "-"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="whitespace-nowrap text-sm font-medium text-typo-primary mb:text-xs">
                                        {item.expiryDate}
                                    </span>
                                    {item.expiryTime && (
                                        <span className="hidden text-xs leading-none text-typo-soft mb:inline">
                                            {item.expiryTime}
                                        </span>
                                    )}
                                </div>
                                <div className="text-right mb:hidden">
                                    <Button
                                        variant={"link"}
                                        className="capitalize"
                                    >
                                        {item.action}
                                    </Button>
                                </div>
                                <div className="hidden items-center justify-end mb:flex">
                                    <Button
                                        type="button"
                                        variant="empty"
                                        className="flex size-[1.875rem] !min-w-0 items-center justify-center bg-bg-dark-main !p-0 text-typo-dark-primary transition-colors hover:bg-bg-dark-main/90 dark:bg-bg-main dark:text-typo-primary dark:hover:bg-bg-main/90"
                                        aria-label={item.action}
                                    >
                                        {item.action
                                            .toLowerCase()
                                            .includes("sell") ? (
                                            <IconTag className="h-3.5 w-3.5" />
                                        ) : (
                                            <IconShoppingBag className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <EmptyState
                    title={
                        hasActiveFilters
                            ? "No matching results"
                            : "No market activity found"
                    }
                    description={
                        hasActiveFilters
                            ? "Try adjusting your search or filters."
                            : "Check back later for the latest market activity."
                    }
                    action={
                        hasActiveFilters
                            ? {
                                  label: "Clear filters",
                                  variant: "link",
                                  onClick: () => {
                                      setSearchQuery("");
                                      setTypeFilter("All");
                                      setPage(1);
                                  },
                              }
                            : undefined
                    }
                />
            )}

            {totalPages > 1 && (
                <div className="flex justify-center">
                    <PaginationBar
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                        pageParams={page}
                        sizeParams={pageSize}
                        totalRecords={filteredItems.length}
                        currentCount={paginatedItems.length}
                        size={pageSize}
                        changeParams=""
                        keyRefetch="market-activity"
                    />
                </div>
            )}
        </div>
    );
}

function MarketActivitySkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col", className)}>
            {/* Search and Filter Skeleton */}
            <div className="flex items-center justify-between gap-4 border-b border-bd-main py-3 mb:flex-row mb:gap-2">
                <div className="h-12 w-[20.625rem] animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3 mb:h-10 mb:w-[253px] mb:flex-1" />
                <div className="flex shrink-0 items-center gap-2 mb:gap-1.5">
                    <div className="h-4 w-8 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3 mb:hidden" />
                    <div className="h-12 w-[11.25rem] animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3 mb:h-10 mb:w-[100px] mb:min-w-[100px]" />
                </div>
            </div>

            {/* Scrollable table skeleton */}
            <div className="w-full min-w-0 overflow-x-auto tb:overflow-visible">
                <div className="min-w-[50rem] tb:min-w-0">
                    {/* Table Header Skeleton */}
                    <div className="grid grid-cols-[4fr_1.5fr_1.5fr_1.5fr_1.5fr_2.5fr_1fr] items-center gap-4 border-b border-bd-main py-3.5 tb:grid-cols-[4fr_1.5fr_1.5fr_2.5fr_1fr] mb:grid-cols-[4fr_1.5fr_1.5fr_2.5fr_1fr] mb:gap-2">
                        <div className="sticky left-0 z-10 pr-2">
                            <div className="h-3 w-16 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3" />
                        </div>
                        <div className="h-3 w-8 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3" />
                        <div className="h-3 w-12 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3 tb:hidden" />
                        <div className="h-3 w-10 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3" />
                        <div className="h-3 w-14 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3 tb:hidden" />
                        <div className="h-3 w-20 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3" />
                        <div className="mb:hidden" />
                        <div className="hidden mb:block" />
                    </div>

                    {/* Table Rows Skeleton */}
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="grid grid-cols-[4fr_1.5fr_1.5fr_1.5fr_1.5fr_2.5fr_1fr] items-center gap-4 border-b border-bd-main py-4 tb:grid-cols-[4fr_1.5fr_1.5fr_2.5fr_1fr] mb:grid-cols-[4fr_1.5fr_1.5fr_2.5fr_1fr] mb:gap-2 mb:py-3"
                        >
                            <div className="sticky left-0 z-10 pr-2">
                                <div className="h-4 w-48 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3 mb:w-[100px]" />
                            </div>
                            <div className="h-4 w-12 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3" />
                            <div className="h-4 w-10 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3 tb:hidden" />
                            <div className="h-4 w-16 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3" />
                            <div className="h-4 w-8 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3 tb:hidden" />
                            <div className="h-4 w-24 animate-pulse bg-bg-sf3 dark:bg-bg-dark-sf3 mb:w-[50px]" />
                            <div className="mb:hidden" />
                            <div className="hidden h-[30px] w-[30px] animate-pulse rounded-full bg-bg-sf3 dark:bg-bg-dark-sf3 mb:block" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
