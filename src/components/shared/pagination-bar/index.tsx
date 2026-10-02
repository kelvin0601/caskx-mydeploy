"use client";

import IconChevonLeft from "@/components/shared/icons/icon-chevon-left";
import IconChevonRight from "@/components/shared/icons/icon-chevon-right";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo } from "react";

type Props = {
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
    pageParams: number;
    sizeParams: number;
    totalRecords: number;
    currentCount: number;
    size: number;
    changeParams: string;
    className?: string;
    visibleItems?: number;
    keyRefetch: string;
    baseFilters?: Record<string, unknown>;
    prefetchFn?: (filters: Record<string, unknown>) => Promise<unknown> | void;
    actionTrigger?: () => void;
    showTextDetails?: boolean;
    detailsLabel?: string;
};
export default function PaginationBar(props: Props) {
    const {
        page,
        setPage,
        totalPages,
        pageParams,
        sizeParams,
        totalRecords,
        currentCount,
        size,
        changeParams,
        className,
        actionTrigger,
        visibleItems = 7,
        keyRefetch,
        baseFilters,
        prefetchFn,
        showTextDetails = false,
        detailsLabel = "results",
    } = props;

    const queryClient = useQueryClient();

    function generatePagination(
        total: number,
        currentPage: number,
        maxItems = 7
    ) {
        currentPage = Math.max(1, Math.min(currentPage, total));

        if (total <= maxItems) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const pagination: Array<number | string> = [];
        const half = Math.floor((maxItems - 3) / 2);

        if (currentPage <= half + 2) {
            for (let i = 1; i <= Math.min(total, maxItems - 2); i++) {
                pagination.push(i);
            }
            pagination.push("...");
            pagination.push(total);
        } else if (currentPage >= total - half - 1) {
            pagination.push(1);
            pagination.push("...");
            for (let i = total - maxItems + 3; i <= total; i++) {
                pagination.push(i);
            }
        } else {
            pagination.push(1);
            pagination.push("...");
            for (let i = currentPage - half; i <= currentPage + half; i++) {
                pagination.push(i);
            }
            pagination.push("...");
            pagination.push(total);
        }

        return pagination;
    }

    const pages = useMemo(
        () => generatePagination(totalPages, page, visibleItems),
        [totalPages, page, visibleItems]
    );

    const isDisabled = useMemo(() => {
        return totalPages === 0 || totalPages === 1;
    }, [totalPages]);

    return (
        <div
            className={cn(
                "relative flex w-full items-center justify-center border-bd-main py-5 mb:flex-col mb:gap-4",
                className
            )}
        >
            <Pagination className="flex-center gap-1 mb:gap-1">
                <Button
                    variant={"outline"}
                    size={"icon"}
                    disabled={isDisabled || page === 1}
                    onClick={() => {
                        if (isDisabled || page === 1) return;
                        setPage(page - 1);
                        actionTrigger?.();
                    }}
                >
                    <div className="size-5 shrink-0 text-current">
                        <IconChevonLeft />
                    </div>
                </Button>
                <PaginationContent>
                    {pages.map((num, i) => {
                        const isActive = num === pageParams;
                        const isNonClick = num === "..." || num === pageParams;
                        return (
                            <React.Fragment key={i}>
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() => {
                                            setPage(num as number);
                                            actionTrigger?.();
                                        }}
                                        onMouseEnter={() => {
                                            if (
                                                typeof num !== "number" ||
                                                !prefetchFn
                                            )
                                                return;
                                            queryClient.prefetchQuery({
                                                queryKey: [
                                                    keyRefetch,
                                                    {
                                                        ...(baseFilters || {}),
                                                        page: num,
                                                    },
                                                ],
                                                queryFn: () =>
                                                    prefetchFn?.({
                                                        ...(baseFilters || {}),
                                                        size,
                                                        page: num,
                                                    }),
                                                staleTime: 5 * 60 * 1000, // 5 minutes
                                                gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
                                            });
                                        }}
                                        className={cn(
                                            "h-10 w-10 bg-transparent text-base font-medium",
                                            isActive
                                                ? "text-typo-primary"
                                                : "text-typo-soft",
                                            isNonClick && "!pointer-events-none"
                                        )}
                                        isActive={isActive}
                                    >
                                        {num}
                                    </PaginationLink>
                                </PaginationItem>
                            </React.Fragment>
                        );
                    })}
                </PaginationContent>
                <Button
                    variant={"outline"}
                    size={"icon"}
                    onClick={() => {
                        if (isDisabled || page === totalPages) return;
                        setPage(page + 1);
                    }}
                    disabled={isDisabled || page === totalPages}
                >
                    <div className="size-5 shrink-0 text-current">
                        <IconChevonRight />
                    </div>
                </Button>
            </Pagination>
            {showTextDetails && (
                <div className="absolute left-0 flex items-center gap-1 whitespace-nowrap text-sm text-typo-soft mb:relative mb:text-sm">
                    Showing{" "}
                    <span className="font-medium text-typo-primary">
                        {Math.min(
                            sizeParams * pageParams - sizeParams + 1,
                            totalRecords
                        )}{" "}
                        - {Math.min(sizeParams * pageParams, totalRecords)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-typo-primary">
                        {totalRecords}
                    </span>{" "}
                    {detailsLabel}
                </div>
            )}
        </div>
    );
}
