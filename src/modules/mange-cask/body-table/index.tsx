"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTriggerCustom,
} from "@/components/ui/tabs";
import { KEY_ASK } from "@/lib/constants";
import PaginationBar from "@/components/shared/pagination-bar";
import type { TColumn, TTableRow } from "@/types";
import { TTableConfig } from "@/types";
import {
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useManageCask } from "../provider";
import Search from "../search";
import { cn, isEmpty } from "@/lib/utils";
import BodyTableEmpty from "./empty";

export default function BodyTable({
    data,
    renderCell,
    dataHeader,
    TABLE_CONFIG,
    totalPages,
    totalRecords,
    currentCount,
    prefetchFn,
    queryKey,
    contentError,
}: {
    data: TTableRow[];
    dataHeader: {
        [key: string]: {
            label: string;
            value: string;
            count: number;
        };
    };
    contentError: string;
    renderCell: (key: string, row: TTableRow) => ReactNode;
    TABLE_CONFIG: TTableConfig;
    totalPages: number;
    totalRecords: number;
    currentCount: number;
    prefetchFn?: (filters: Record<string, unknown>) => Promise<unknown>;
    queryKey?: string;
}) {
    const refWrap = useRef<HTMLDivElement>(null);
    const {
        page,
        limit,
        setPage,
        status,
        setStatus,
        sortBy,
        order,
        search,
        setStep,
    } = useManageCask();
    const queryClient = useQueryClient();
    const size = limit;

    // Get the first key from dataHeader safely
    const defaultTabValue = useMemo(() => {
        const entries = Object.entries(dataHeader);
        return entries.length > 0 ? entries[0][0] : "";
    }, [dataHeader]);

    // Keep the selected table tab in local UI state.
    const [activeTab, setActiveTab] = useState<string>(defaultTabValue);

    // Sync activeTab when defaultTabValue changes (e.g., when dataHeader is initially empty then populated)
    useEffect(() => {
        if (defaultTabValue && (!activeTab || !dataHeader[activeTab])) {
            setActiveTab(defaultTabValue);
        }
    }, [defaultTabValue, activeTab, dataHeader]);

    const visibleItems = 7;
    const sizeParams = size;
    const pageParams = page;

    const renderPagination = useCallback(() => {
        return (
            <PaginationBar
                page={page}
                setPage={(page) => setPage(page)}
                totalPages={totalPages}
                pageParams={pageParams}
                sizeParams={sizeParams}
                totalRecords={totalRecords}
                currentCount={currentCount}
                changeParams=""
                size={size}
                keyRefetch={queryKey || KEY_ASK.ASK_MY_ASKS}
                baseFilters={{ status, limit, sortBy, order, search }}
                actionTrigger={() => {
                    refWrap.current?.scrollIntoView({
                        behavior: "instant",
                        block: "start",
                    });
                }}
                prefetchFn={prefetchFn || ((filters) => Promise.resolve())}
                visibleItems={visibleItems}
                className={cn(
                    "mb-0 rounded-b-md border border-t-0 border-solid px-6 py-5"
                )}
            />
        );
    }, [
        page,
        pageParams,
        sizeParams,
        totalRecords,
        totalPages,
        size,
        queryKey,
        prefetchFn,
        currentCount,
    ]);
    return (
        <div className="pb-14" ref={refWrap}>
            <Tabs
                value={activeTab}
                defaultValue={defaultTabValue}
                onValueChange={(val) => {
                    const status = val === "all" ? "" : val;
                    setPage(1);
                    setActiveTab(status);
                    setStatus(status);
                    setStep(status);
                }}
                className="relative bg-transparent p-0"
            >
                <div className="bg-bg-main">
                    <div className="mb-6 flex flex-row items-center justify-between">
                        <TabsList
                            className={`overflow-hiddenp-1 flex w-max flex-row items-start gap-1 rounded-lg border border-bd-brown bg-bg-main`}
                        >
                            {Object?.entries(dataHeader).map(
                                ([key, value], index) => {
                                    return (
                                        <TabsTriggerCustom
                                            key={index}
                                            className="flex flex-row items-center gap-2 text-sm font-semibold text-typo-soft"
                                            value={key}
                                            onPrefetch={() => {
                                                if (!prefetchFn || !queryKey)
                                                    return;

                                                const tabStatus =
                                                    key === "all" ? "" : key;

                                                // Use the same query key structure as the actual query
                                                const prefetchQueryKey = [
                                                    queryKey,
                                                    {
                                                        status: tabStatus,
                                                        page: 1,
                                                        limit,
                                                        sortBy,
                                                        order,
                                                        search,
                                                    },
                                                ];

                                                const prefetchFilters = {
                                                    status: tabStatus,
                                                    page: 1,
                                                    limit,
                                                    size: limit,
                                                    sortBy,
                                                    order,
                                                    search,
                                                };

                                                queryClient.prefetchQuery({
                                                    queryKey: prefetchQueryKey,
                                                    queryFn: () =>
                                                        prefetchFn(
                                                            prefetchFilters
                                                        ),
                                                    staleTime: 5 * 60 * 1000, // 5 minutes
                                                    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
                                                });
                                            }}
                                        >
                                            <div className="flex flex-row">
                                                {key
                                                    .split("_")
                                                    .join(" ")
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    key
                                                        .split("_")
                                                        .join(" ")
                                                        .slice(1)}
                                                {value && (
                                                    <div className="flex flex-row items-center bg-bg-sf1 px-2 py-0.5">
                                                        <span className="text-xs font-medium text-typo-soft">
                                                            {value.count}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsTriggerCustom>
                                    );
                                }
                            )}
                        </TabsList>
                        <Search />
                    </div>
                </div>
                {Object?.entries(dataHeader).map(([key, rows], index) => {
                    return (
                        <TabsContent
                            key={rows.value}
                            value={key}
                            className={cn(
                                "flex-1 rounded-t-md border border-bd-brown p-0",
                                isEmpty(data) && "rounded-b-md"
                            )}
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow
                                        className={`grid ${TABLE_CONFIG.gridCols} !gap-x-0 rounded-none rounded-t-md bg-bg-sf1`}
                                    >
                                        {TABLE_CONFIG.columns.map(
                                            (column: TColumn) => (
                                                <TableHead
                                                    key={column.key}
                                                    className="cursor-pointer p-0"
                                                >
                                                    <div className="p-3">
                                                        <div className="flex flex-row gap-1">
                                                            <span className="text-typo-pr text-sm">
                                                                {typeof column.label ===
                                                                "function"
                                                                    ? column.label()
                                                                    : column.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableHead>
                                            )
                                        )}
                                    </TableRow>
                                </TableHeader>
                                {!isEmpty(data) ? (
                                    <TableBody>
                                        {data?.map((row, index) => (
                                            <TableRow
                                                key={`${index}-${row.id}`}
                                                className={`grid ${TABLE_CONFIG.gridCols} !gap-x-0 rounded-none hover:bg-transparent`}
                                            >
                                                {/* Render data cells using TABLE_CONFIG */}
                                                {TABLE_CONFIG.columns.map(
                                                    (column: TColumn) => (
                                                        <TableCell
                                                            key={column.key}
                                                            className="p-3"
                                                        >
                                                            {column.key &&
                                                                renderCell(
                                                                    column.key,
                                                                    row
                                                                )}
                                                        </TableCell>
                                                    )
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                ) : (
                                    <BodyTableEmpty
                                        title={`No ${contentError} found`}
                                    />
                                )}
                            </Table>
                        </TabsContent>
                    );
                })}
                {!isEmpty(data) && renderPagination()}
            </Tabs>
        </div>
    );
}
