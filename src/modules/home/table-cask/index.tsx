"use client";

import { useState } from "react";
import HeadingContent, {
    HeadingContentSkeleton,
} from "@/components/shared/heading";
import RankBadge from "@/components/shared/rank-badge";
import IconStar from "@/components/shared/icons/icon-start";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency, isEmpty } from "@/lib/utils";
import { hoverRowClasses } from "@/components/shared/hover-row";

import LinkCustom from "@/components/shared/link-custom";
import { CASK_KEYS, CASK_MASTER_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import caskMasterServices from "@/services/cask-master";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { handleRenderFallbackText } from "../../../lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

import TrendDelta from "@/components/shared/trend-delta";
import TrendingBadge from "@/components/shared/trending-badge";

export default function TableCask() {
    const queryClient = useQueryClient();
    const [favorites, setFavorites] = useState<Record<string, boolean>>({});

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const moversFilter = "page=1&size=10&sortBy=volumeDelta30D";

    const { data, isLoading } = useQuery({
        queryKey: [CASK_KEYS.LIST_CASK, moversFilter],
        queryFn: () => caskMasterServices.getCaskMastersListing(moversFilter),
    });

    if (isLoading) {
        return <TableCaskSkeleton />;
    }

    const casks = data?.data || [];
    if (isEmpty(data?.data)) return null;
    return (
        <div className="mb-[3.25rem] flex flex-col tb:mb-8">
            <HeadingContent className="mb-4 py-1.5 tb:py-2 mb:py-2.5">
                Market Movers
            </HeadingContent>
            <ScrollArea
                className="w-full max-w-[calc(100vw-var(--padding-container)*2)]"
                orientation="horizontal"
            >
                <Table className="w-full dk:block">
                    <TableHeader className="dk:block">
                        <TableRow className="pointer-events-none border-y border-bd-main bg-transparent hover:bg-transparent dk:grid dk:w-full dk:grid-cols-[5.625rem_5.6fr_3.2fr_3.2fr_2.4fr] dk:items-center">
                            <TableHead className="sticky left-0 z-20 min-w-[5.625rem] bg-bg-main py-3 pr-2 text-xs text-typo-note dk:block tb:w-[7%] tb:pr-1.5 mb:hidden">
                                Rank
                            </TableHead>
                            <TableHead className="sticky left-[5.625rem] z-20 border-bd-main bg-bg-main px-2 py-3 text-xs text-typo-note dk:block tb:static tb:w-[32%] tb:min-w-0 tb:border-none tb:bg-transparent tb:px-1.5 mb:w-[49%] mb:px-1 mb:pl-0">
                                Cask
                            </TableHead>
                            <TableHead className="px-2 py-3 text-xs text-typo-note dk:block tb:w-[21%] tb:min-w-0 tb:px-1.5 mb:w-[23%] mb:px-1">
                                Volume
                            </TableHead>
                            <TableHead className="px-2 py-3 text-xs text-typo-note dk:block tb:w-[21%] tb:min-w-0 tb:px-1.5 mb:w-auto mb:px-1 mb:pr-0">
                                Med. Price
                            </TableHead>
                            <TableHead className="py-3 pl-2 text-xs text-typo-note dk:block tb:w-[12%] tb:pl-1.5 mb:hidden mb:pl-1">
                                Live Floor
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="w-full dk:block">
                        {casks.map((item, index) => (
                            <TableRow
                                key={item.id || index}
                                className={cn(
                                    "!border-b border-bd-main transition-colors dk:grid dk:w-full dk:grid-cols-[5.625rem_5.6fr_3.2fr_3.2fr_2.4fr] dk:items-center tb:h-16 mb:h-14"
                                )}
                            >
                                <TableCell className="sticky left-0 z-10 py-3.5 pr-2 dk:block tb:bg-bg-main tb:pr-1.5 mb:hidden mb:py-3 mb:pr-1">
                                    <RankBadge rank={index + 1} showCount />
                                </TableCell>
                                <TableCell className="sticky left-[5.625rem] z-10 min-w-0 border-bd-main px-2 py-3.5 dk:block tb:static tb:border-none tb:bg-transparent tb:px-1.5 tb:py-3.5 mb:px-1 mb:py-3 mb:pl-0">
                                    <div className="flex items-center gap-1.5">
                                        <LinkCustom
                                            href={`${ROUTE_PUBLIC.CASK_DETAILS}/${item.id}`}
                                            className="line-clamp-1 text-base font-semibold !text-typo-primary tb:break-all tb:text-sm mb:text-xs"
                                            onMouseEnter={() => {
                                                if (item.id) {
                                                    queryClient.prefetchQuery({
                                                        queryKey: [
                                                            CASK_MASTER_KEYS.CASK_MASTER_DETAIL,
                                                            item.id,
                                                        ],
                                                        queryFn: () =>
                                                            caskMasterServices.getDetailCaskMaster(
                                                                item.id
                                                            ),
                                                    });
                                                }
                                            }}
                                        >
                                            <span className="hover-line">
                                                {item.name}
                                            </span>
                                        </LinkCustom>
                                    </div>
                                    <div className="hidden tb:mt-1 tb:items-center tb:gap-1.5 tb:text-xs tb:text-typo-note mb:flex mb:gap-1">
                                        <span>Live Floor</span>
                                        <span className="whitespace-nowrap text-xs font-semibold text-typo-primary">
                                            {item?.lowestAsk
                                                ? handleRenderFallbackText(
                                                      formatCurrency(
                                                          item.lowestAsk
                                                      )
                                                  )
                                                : "-"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="z-10 px-2 py-3.5 dk:block tb:px-1.5 tb:py-3.5 mb:px-1 mb:py-3 mb:text-right">
                                    <div className="flex items-baseline gap-1 text-sm font-medium text-typo-primary mb:flex-col mb:items-start mb:text-xs">
                                        <span className="whitespace-nowrap">
                                            {handleRenderFallbackText(
                                                formatCurrency(
                                                    item.lifetimeVolume
                                                )
                                            )}
                                        </span>
                                        <TrendDelta
                                            value={item.volumeDelta30D}
                                            className="whitespace-nowrap mb:text-cap"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="z-10 px-2 py-3.5 dk:block tb:px-1.5 tb:py-3.5 mb:px-1 mb:py-3 mb:pr-0 mb:text-right">
                                    <div className="flex items-baseline gap-1 text-sm font-medium text-typo-primary mb:flex-col mb:items-start mb:text-xs">
                                        <span className="whitespace-nowrap">
                                            {handleRenderFallbackText(
                                                formatCurrency(item.medianPrice)
                                            )}
                                        </span>
                                        <TrendDelta
                                            value={item.medianPriceDelta30D}
                                            className="whitespace-nowrap mb:text-cap"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="z-10 py-3.5 pl-2 pr-4 dk:block tb:py-3.5 tb:pl-1.5 tb:pr-3 mb:hidden mb:py-3 mb:pl-1">
                                    <div className="flex h-full w-full items-center justify-between">
                                        <div className="whitespace-nowrap text-sm font-medium text-typo-primary">
                                            {item.lowestAsk
                                                ? handleRenderFallbackText(
                                                      formatCurrency(
                                                          item.lowestAsk
                                                      )
                                                  )
                                                : "-"}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (item.id) {
                                                    toggleFavorite(item.id);
                                                }
                                            }}
                                            className={cn(
                                                "size-5 text-icon opacity-0 transition-all group-hover/row:opacity-100"
                                            )}
                                            aria-label="Add to favorites"
                                        >
                                            <IconStar />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
}

export function TableCaskSkeleton() {
    return (
        <div className="mb-[3.25rem] flex flex-col tb:mb-8">
            <div className="mb-4 py-1.5 tb:py-2 mb:py-2.5">
                <HeadingContentSkeleton />
            </div>
            <div className="w-full tb:overflow-x-auto">
                <Table className="w-full dk:block">
                    <TableHeader className="dk:block">
                        <TableRow className="pointer-events-none border-y border-bd-main bg-transparent hover:bg-transparent dk:grid dk:w-full dk:grid-cols-[5.625rem_5.6fr_3.2fr_3.2fr_2.4fr] dk:items-center">
                            <TableHead className="sticky left-0 z-20 min-w-[5.625rem] bg-bg-main py-3 pr-2 text-xs text-typo-note dk:block tb:w-[7%] tb:pr-1.5 mb:hidden">
                                Rank
                            </TableHead>
                            <TableHead className="sticky left-[5.625rem] z-20 border-bd-main bg-bg-main px-2 py-3 text-xs text-typo-note dk:block tb:static tb:w-[32%] tb:min-w-0 tb:border-none tb:bg-transparent tb:px-1.5 mb:w-[49%] mb:px-1 mb:pl-0">
                                Cask
                            </TableHead>
                            <TableHead className="min-w-[16.375rem] px-2 py-3 text-xs text-typo-note dk:block tb:w-[21%] tb:min-w-0 tb:px-1.5 mb:w-[23%] mb:px-1">
                                Volume
                            </TableHead>
                            <TableHead className="min-w-[16.375rem] px-2 py-3 text-xs text-typo-note dk:block tb:w-[21%] tb:min-w-0 tb:px-1.5 mb:w-[23%] mb:px-1 mb:pr-0 mb:text-right">
                                Med. Price
                            </TableHead>
                            <TableHead className="py-3 pl-2 text-xs text-typo-note dk:block tb:w-[12%] tb:pl-1.5 mb:hidden mb:pl-1">
                                Live Floor
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="w-full dk:block">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <TableRow
                                key={index}
                                className="border-b border-bd-main dk:grid dk:w-full dk:grid-cols-[5.625rem_5.6fr_3.2fr_3.2fr_2.4fr] dk:items-center tb:h-16 mb:h-14"
                            >
                                <TableCell className="sticky left-0 z-10 py-3.5 pr-2 dk:block tb:bg-bg-main tb:pr-1.5 mb:hidden mb:py-3 mb:pr-1">
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                </TableCell>
                                <TableCell className="sticky left-[5.625rem] z-10 min-w-0 border-bd-main px-2 py-3.5 dk:block tb:static tb:border-none tb:bg-transparent tb:px-1.5 tb:py-3.5 mb:px-1 mb:py-3 mb:pl-0">
                                    <Skeleton className="h-5 w-48 tb:h-4 tb:w-32" />
                                    <div className="hidden tb:mt-1 tb:flex tb:gap-1.5 mb:flex mb:gap-1">
                                        <Skeleton className="h-3.5 w-14" />
                                        <Skeleton className="h-3.5 w-10" />
                                    </div>
                                </TableCell>
                                <TableCell className="z-10 px-2 py-3.5 dk:block tb:px-1.5 tb:py-3.5 mb:px-1 mb:py-3 mb:text-right">
                                    <div className="flex flex-col gap-1 mb:items-start">
                                        <Skeleton className="h-5 w-24 tb:h-4 tb:w-20" />
                                        <Skeleton className="h-3.5 w-12" />
                                    </div>
                                </TableCell>
                                <TableCell className="z-10 px-2 py-3.5 dk:block tb:px-1.5 tb:py-3.5 mb:px-1 mb:py-3 mb:pr-0 mb:text-right">
                                    <div className="flex flex-col gap-1 mb:items-start">
                                        <Skeleton className="h-5 w-24 tb:h-4 tb:w-20" />
                                        <Skeleton className="h-3.5 w-12" />
                                    </div>
                                </TableCell>
                                <TableCell className="z-10 py-3.5 pl-2 pr-4 dk:block tb:py-3.5 tb:pl-1.5 tb:pr-3 mb:hidden mb:py-3 mb:pl-1">
                                    <Skeleton className="h-5 w-20 tb:h-4 tb:w-16" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
