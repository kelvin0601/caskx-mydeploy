"use client";

import EmptyState from "@/components/shared/empty-state";
import IconCheck from "@/components/shared/icons/icon-check";
import IconCoppy from "@/components/shared/icons/icon-coppy";
import IconEdit from "@/components/shared/icons/icon-edit";
import IconEye from "@/components/shared/icons/icon-eye";
import IconFilterLines from "@/components/shared/icons/icon-filter-lines";
import IconSelectVlt from "@/components/shared/icons/icon-select-vlt";
import IconTrash from "@/components/shared/icons/icon-trash";
import PaginationBar from "@/components/shared/pagination-bar";
import {
    RowActionsDropdown,
    TRowActionsDropdownItem,
} from "@/components/shared/row-actions-dropdown";
import SearchInput from "@/components/shared/search-input";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import { useAskStatusCounts } from "@/hooks/useTransactionStatusCounts";
import { KEY_ASK, ROUTE_PUBLIC } from "@/lib/constants";
import {
    cn,
    formatCurrency,
    formatDateTime,
    handleRenderFallbackText,
} from "@/lib/utils";
import { MARKET_ORDER_KIND } from "@/modules/market-orders/constants";
import { useMarketOrderManagement } from "@/modules/market-orders/management/provider";
import {
    MobileListingCard,
    MobileListingCardSkeleton,
} from "./mobile-listing-card";
import caskAskService from "@/services/cask-ask";
import { caskAsk } from "@/types/cask-ask";
import { TTableRow } from "@/types";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type UIEvent, useCallback, useMemo, useState } from "react";

const PAGE_SIZE = 10;
const PARTIAL_EXECUTION_POLICIES = new Set([
    "partial_fill",
    "PARTIAL_FILL",
    "partial_allowed",
]);
const EMPTY_LISTINGS: TTableRow[] = [];
const LISTING_STATUS_FILTER_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "expired", label: "Expired" },
] as const;
const TABLE_COLUMNS = [
    {
        key: "cask",
        label: "Cask",
        sortField: undefined,
        width: "w-[13.875rem] min-w-[13.875rem]",
    },
    {
        key: "vintage",
        label: "Vintage",
        sortField: "type",
        width: "w-28",
    },
    {
        key: "partialFill",
        label: "Partial fill allowed?",
        sortField: "type",
        width: "w-[9.125rem]",
    },
    {
        key: "status",
        label: "Status",
        sortField: "status",
        width: "w-[10.375rem]",
    },
    {
        key: "listed",
        label: "Listed",
        sortField: "quantity",
        width: "w-24",
    },
    {
        key: "matched",
        label: "Matched",
        sortField: undefined,
        width: "w-24",
    },
    {
        key: "sold",
        label: "Sold",
        sortField: undefined,
        width: "w-24",
    },
    {
        key: "available",
        label: "Available",
        sortField: undefined,
        width: "w-24",
    },
    {
        key: "sellPrice",
        label: "Sell price",
        sortField: "unitPrice",
        width: "w-24",
    },
    {
        key: "expires",
        label: "Expires",
        sortField: "expirationDate",
        width: "w-[10.375rem]",
    },
    {
        key: "action",
        label: "",
        sortField: undefined,
        width: "w-[1.875rem]",
    },
] as const;

type PartialFillFilter = "yes" | "no";
type SortField = NonNullable<caskAsk.TOrderListFilters["sortBy"]>;
type SortOrder = "asc" | "desc";
type StatusOption = {
    value: string;
    label: string;
    count: number;
};

function isPartialFillAllowed(row: TTableRow) {
    return PARTIAL_EXECUTION_POLICIES.has(row.executionPolicy ?? "");
}

function getStatusLabel(status?: string) {
    const fallbackStatus = handleRenderFallbackText(status);
    if (fallbackStatus === "-") return fallbackStatus;

    const normalizedStatus = fallbackStatus.toLowerCase().replaceAll("_", " ");
    return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
}

function getBadgeVariant(status?: string) {
    const value = status?.toLowerCase() ?? "";
    if (value.includes("active") || value.includes("open"))
        return "info" as const;
    if (value.includes("partially")) return "warning" as const;
    if (value.includes("processing") || value.includes("transaction"))
        return "progressing" as const;
    if (value.includes("completed")) return "success" as const;
    if (value.includes("failed")) return "destructive" as const;
    if (value.includes("expired")) return "errorDarker" as const;
    return "default" as const;
}

function getTabStatus(tab: string) {
    if (tab === "all") return undefined;
    return tab;
}

function isPartialFillFilter(value: string): value is PartialFillFilter {
    return value === "yes" || value === "no";
}

function ListingStats({
    rows,
    isLoading,
}: {
    rows: caskAsk.TCaskOrder[];
    isLoading: boolean;
}) {
    const stats = useMemo(() => {
        let open = 0;
        let inTransaction = 0;
        let soldValue = 0;

        for (const row of rows) {
            const status = row.status?.toLowerCase() ?? "";
            if (status === "active" || status === "open") open += 1;
            if (
                status.includes("transaction") ||
                status.includes("processing") ||
                status === "pending"
            )
                inTransaction += 1;
            if (status === "completed") {
                soldValue +=
                    Number(row.askPrice ?? 0) *
                    Number(
                        row.filledQuantity ??
                            row.quantity - row.remainingQuantity
                    );
            }
        }

        return [
            [open, "Open listings"],
            [inTransaction, "In transaction"],
            [formatCurrency(soldValue), "Sold value"],
        ] as const;
    }, [rows]);

    return (
        <div className="no-scrollbar grid w-full grid-cols-3 !gap-x-2 gap-y-2 mb:flex mb:overflow-x-auto">
            {stats.map(([value, label]) => (
                <div
                    key={label}
                    className="flex min-w-0 flex-col gap-1 bg-bg-sf4 p-3 mb:w-[10.708rem] mb:shrink-0"
                >
                    {isLoading ? (
                        <Skeleton className="h-6 w-20" />
                    ) : (
                        <span className="truncate text-base font-semibold leading-6 text-typo-primary">
                            {value}
                        </span>
                    )}
                    <span className="text-sm leading-[1.5] text-typo-note">
                        {label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function ListingFilter({
    selectedStatus,
    selectedPartialFill,
    onStatusChange,
    onPartialFillChange,
}: {
    selectedStatus?: string;
    selectedPartialFill?: PartialFillFilter;
    onStatusChange: (status: string) => void;
    onPartialFillChange: (value: PartialFillFilter) => void;
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="h-10 min-w-0 gap-2 rounded-none py-[0.8125rem] pl-5 pr-4 text-sm font-medium outline-bd-main data-[state=open]:bg-bg-dark-main data-[state=open]:text-typo-dark-primary data-[state=open]:outline-bg-dark-main"
                >
                    <span>Filter</span>
                    <span className="size-3.5">
                        <IconFilterLines />
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="flex w-[15.625rem] flex-col gap-4 rounded-none border-bd-main bg-bg-main p-4 shadow-custom"
            >
                <div className="flex flex-col gap-2">
                    <p className="text-base font-semibold leading-[1.5] text-typo-primary">
                        Status
                    </p>
                    <RadioGroup
                        value={selectedStatus ?? "all"}
                        onValueChange={onStatusChange}
                        className="flex flex-col gap-2"
                    >
                        <label className="flex cursor-pointer items-center gap-2 text-sm leading-[1.5] text-typo-primary">
                            <RadioGroupItem
                                value="all"
                                aria-label="All statuses"
                            />
                            All
                        </label>
                        {LISTING_STATUS_FILTER_OPTIONS.map((option) => (
                            <label
                                key={option.value}
                                className="flex cursor-pointer items-center gap-2 text-sm leading-[1.5] text-typo-primary"
                            >
                                <RadioGroupItem
                                    value={option.value}
                                    aria-label={option.label}
                                />
                                <span
                                    className="min-w-0 truncate"
                                    title={option.label}
                                >
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </RadioGroup>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-base font-semibold leading-[1.5] text-typo-primary">
                        Partially fulfilled?
                    </p>
                    <RadioGroup
                        value={selectedPartialFill}
                        onValueChange={(value) => {
                            if (isPartialFillFilter(value)) {
                                onPartialFillChange(value);
                            }
                        }}
                        className="flex flex-col gap-2"
                    >
                        {(["yes", "no"] as const).map((option) => (
                            <label
                                key={option}
                                className="flex cursor-pointer items-center gap-2 text-sm capitalize leading-[1.5] text-typo-primary"
                            >
                                <RadioGroupItem
                                    value={option}
                                    aria-label={option === "yes" ? "Yes" : "No"}
                                />
                                {option === "yes" ? "Yes" : "No"}
                            </label>
                        ))}
                    </RadioGroup>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function ListingTableSkeleton({
    isTableScrolled,
}: {
    isTableScrolled: boolean;
}) {
    return (
        <TableBody className="[&_tr:last-child]:border-b">
            {Array.from({ length: PAGE_SIZE }).map((_, rowIndex) => (
                <TableRow
                    key={rowIndex}
                    className="h-[3.3125rem] border-b border-bd-main hover:bg-transparent [&_td:first-child]:!pr-0 [&_td:last-child]:!pr-0 [&_td:nth-child(2)]:!pl-4 [&_td]:py-0 [&_td]:!pl-0 [&_td]:!pr-4"
                >
                    {TABLE_COLUMNS.map((column) => {
                        const isCaskColumn = column.key === "cask";

                        return (
                            <TableCell
                                key={column.key}
                                className={cn(
                                    "bg-bg-main px-2 py-4 first:pl-0 last:pr-0",
                                    isCaskColumn &&
                                        "sticky left-0 z-10 !bg-bg-main !pr-0",
                                    column.key === "vintage" && "!pl-4",
                                    isCaskColumn &&
                                        isTableScrolled &&
                                        "after:absolute after:-inset-y-4 after:right-0 after:border-r after:border-bd-main"
                                )}
                            >
                                <Skeleton
                                    className={cn(
                                        "h-4",
                                        isCaskColumn
                                            ? "w-3/4"
                                            : column.key === "status"
                                              ? "h-5 w-24 rounded-full"
                                              : column.key === "action"
                                                ? "ml-auto w-4"
                                                : "w-10"
                                    )}
                                />
                            </TableCell>
                        );
                    })}
                </TableRow>
            ))}
        </TableBody>
    );
}

function ListingStickyCaskColumn({
    rows,
    isLoading,
}: {
    rows: TTableRow[];
    isLoading: boolean;
}) {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none sticky left-0 z-30 hidden h-0 w-[13.875rem] j-tb:block"
        >
            <div className="w-[13.875rem] border-r border-bd-main bg-bg-main">
                <div className="flex h-9 items-center border-y border-bd-main text-xs font-normal leading-none text-typo-soft">
                    Cask
                </div>
                {isLoading
                    ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
                          <div
                              key={index}
                              className="flex h-[3.3125rem] items-center border-b border-bd-main"
                          >
                              <Skeleton className="h-4 w-3/4" />
                          </div>
                      ))
                    : rows.map((row) => (
                          <div
                              key={row.id}
                              className="flex h-[3.3125rem] min-w-0 items-center border-b border-bd-main bg-bg-main text-sm font-semibold leading-[1.5] text-typo-primary"
                          >
                              <span className="block min-w-0 truncate">
                                  {handleRenderFallbackText(
                                      row.master?.name ??
                                          row.caskName ??
                                          row.cask?.name
                                  )}
                              </span>
                          </div>
                      ))}
            </div>
        </div>
    );
}

export default function ProfileListingsModule() {
    const router = useRouter();
    const { openUpdate, openCancel, openDuplicate } =
        useMarketOrderManagement();
    const [tab, setTab] = useState("all");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>();
    const [selectedPartialFill, setSelectedPartialFill] =
        useState<PartialFillFilter>();
    const [isTableScrolled, setIsTableScrolled] = useState(false);
    const [sortBy, setSortBy] = useState<SortField | undefined>();
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const debouncedSearch = useDebounce(search, 300);
    const executionPolicy =
        selectedPartialFill === "yes"
            ? EBidExecutionPolicy.PARTIAL_ALLOWED
            : selectedPartialFill === "no"
              ? EBidExecutionPolicy.FULL_AT_ONCE
              : undefined;
    const filters = useMemo(
        () => ({
            page,
            limit: PAGE_SIZE,
            size: PAGE_SIZE,
            status: selectedStatus ?? getTabStatus(tab),
            executionPolicy,
            search: debouncedSearch || undefined,
            sortBy,
            order: sortBy ? sortOrder : undefined,
        }),
        [
            page,
            tab,
            selectedStatus,
            executionPolicy,
            debouncedSearch,
            sortBy,
            sortOrder,
        ]
    );

    const statusCountsQuery = useAskStatusCounts();
    const asksQuery = useQuery({
        queryKey: [KEY_ASK.ASK_MY_ASKS, "profile-listings", filters],
        queryFn: () => caskAskService.getMyAsks(filters),
        placeholderData: keepPreviousData,
    });
    const statsQuery = useQuery({
        queryKey: [KEY_ASK.ASK_MY_ASKS, "profile-listing-stats"],
        queryFn: () => caskAskService.getMyAsksTotal(),
    });
    const rows = asksQuery.data?.data ?? EMPTY_LISTINGS;
    const total = asksQuery.data?.total ?? 0;
    const totalPages = asksQuery.data?.totalPages ?? 0;
    const statusOptions = useMemo(() => {
        if (!statusCountsQuery.data) return [];

        return Object.entries(statusCountsQuery.data)
            .filter(
                ([status, count]) =>
                    status !== "total" && typeof count === "number"
            )
            .map(([status, count]) => ({
                value: status,
                label: getStatusLabel(status),
                count,
            }));
    }, [statusCountsQuery.data]);
    const statusTotal = useMemo(() => {
        if (!statusCountsQuery.data) return 0;

        const counts = statusCountsQuery.data as Record<
            string,
            number | undefined
        >;
        return (
            counts.total ??
            statusOptions.reduce((sum, option) => sum + option.count, 0)
        );
    }, [statusCountsQuery.data, statusOptions]);
    const statusTabs = useMemo(
        () => [
            { value: "all", label: "All", count: statusTotal },
            ...statusOptions,
        ],
        [statusOptions, statusTotal]
    );

    const setListingTab = (value: string) => {
        setTab(value);
        setSelectedStatus(undefined);
        setPage(1);
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status === "all" ? undefined : status);
        setTab("all");
        setPage(1);
    };

    const handlePartialFillChange = (value: PartialFillFilter) => {
        setSelectedPartialFill(value);
        setPage(1);
    };

    const handleTableScroll = (event: UIEvent<HTMLDivElement>) => {
        const nextIsTableScrolled = event.currentTarget.scrollLeft > 0;
        setIsTableScrolled((currentIsTableScrolled) =>
            currentIsTableScrolled === nextIsTableScrolled
                ? currentIsTableScrolled
                : nextIsTableScrolled
        );
    };

    const getRowActions = useCallback(
        (row: TTableRow): TRowActionsDropdownItem[] => {
            const statusLower = handleRenderFallbackText(
                row.status
            ).toLowerCase();
            const quantity = Number(row.quantity ?? 0);
            const remainingQuantity = Number(row.remainingQuantity ?? quantity);
            const matchedQuantity = Math.max(0, quantity - remainingQuantity);
            const hasMatches = row.hasMatches ?? matchedQuantity > 0;
            const actions: TRowActionsDropdownItem[] = [];

            const handleViewDetails = () => {
                router.push(`${ROUTE_PUBLIC.PAYOUT}/${row.id}`);
            };
            const handleUpdate = () => {
                openUpdate(row, MARKET_ORDER_KIND.LISTING);
            };
            const handleCancel = () => {
                openCancel(row, MARKET_ORDER_KIND.LISTING);
            };
            const handleDuplicate = () => {
                openDuplicate(row, MARKET_ORDER_KIND.LISTING);
            };

            if (hasMatches) {
                actions.push({
                    label: "View details",
                    onClick: handleViewDetails,
                    icon: <IconEye />,
                });
            }

            if (statusLower === "open" || statusLower === "active") {
                actions.push({
                    label: "Update",
                    onClick: handleUpdate,
                    icon: <IconEdit />,
                });
                actions.push({
                    label: "Cancel",
                    onClick: handleCancel,
                    icon: <IconTrash />,
                });
            } else if (
                statusLower.includes("partially") ||
                statusLower.includes("partial")
            ) {
                if (!hasMatches) {
                    actions.push({
                        label: "View details",
                        onClick: handleViewDetails,
                        icon: <IconEye />,
                    });
                }
                actions.push({
                    label: "Update",
                    onClick: handleUpdate,
                    icon: <IconEdit />,
                });
                actions.push({
                    label: "Cancel",
                    onClick: handleCancel,
                    icon: <IconTrash />,
                });
            } else if (
                statusLower.includes("processing") ||
                statusLower.includes("payment")
            ) {
                if (!hasMatches) {
                    actions.push({
                        label: "View details",
                        onClick: handleViewDetails,
                        icon: <IconEye />,
                    });
                }
            } else if (
                statusLower.includes("completed") ||
                statusLower.includes("transaction")
            ) {
                if (!hasMatches) {
                    actions.push({
                        label: "View details",
                        onClick: handleViewDetails,
                        icon: <IconEye />,
                    });
                }
                actions.push({
                    label: "Duplicate",
                    onClick: handleDuplicate,
                    icon: <IconCoppy />,
                });
            } else if (statusLower.includes("cancelled")) {
                actions.push({
                    label: "Duplicate",
                    onClick: handleDuplicate,
                    icon: <IconCoppy />,
                });
            }

            return actions;
        },
        [router, openUpdate, openCancel, openDuplicate]
    );

    const handleSort = (field: SortField) => {
        if (sortBy !== field) {
            setSortBy(field);
            setSortOrder("desc");
        } else if (sortOrder === "desc") {
            setSortOrder("asc");
        } else {
            setSortBy(undefined);
            setSortOrder("desc");
        }
        setPage(1);
    };

    return (
        <section className="flex w-full flex-col gap-8 px-10 py-10 tb:gap-6 tb:px-0 tb:py-8 mb:px-0 mb:pb-4 mb:pt-6">
            <div className="flex min-w-0 flex-col gap-2">
                <h1 className="font-reckless text-[1.75rem] font-medium leading-none text-typo-primary tb:text-2xl mb:text-xl mb:leading-none">
                    Listings
                </h1>
                <p className="text-sm leading-[1.5] text-typo-soft">
                    Manage all casks you’ve listed for sale and track their
                    selling progress.
                </p>
            </div>

            <div className="flex w-full flex-col gap-6 tb:gap-4">
                <ListingStats
                    rows={statsQuery.data ?? []}
                    isLoading={statsQuery.isLoading}
                />

                <div className="flex w-full items-start justify-between gap-4 mb:flex-col mb:items-stretch mb:gap-4">
                    <Carousel
                        opts={{
                            align: "start",
                            dragFree: true,
                            breakpoints: {
                                "(min-width: 1024px)": {
                                    draggable: false,
                                },
                            },
                        }}
                        className="min-w-0 flex-1 tb:px-0 mb:order-2 mb:-mx-4"
                        aria-label="Listing status tabs"
                    >
                        <CarouselContent
                            className="gap-1 mb:px-4"
                            classNameParent="no-scrollbar"
                        >
                            {statusTabs.map(({ value, label, count }) => {
                                const isActive = tab === value;

                                return (
                                    <CarouselItem
                                        key={value}
                                        className="basis-auto pl-0"
                                    >
                                        <Button
                                            type="button"
                                            variant="tab"
                                            onClick={() => setListingTab(value)}
                                            className={cn(
                                                "flex h-10 min-w-0 flex-row items-center gap-1.5 rounded-none px-4 py-2.5 text-sm font-semibold transition-colors duration-200 mb:h-[1.875rem] mb:gap-2 mb:px-3 mb:py-1.5",
                                                isActive
                                                    ? "bg-bg-dark-main text-typo-dark-primary hover:bg-bg-dark-main hover:text-typo-dark-primary"
                                                    : "bg-bg-sf3 text-typo-soft hover:bg-bg-sf3 hover:text-typo-primary"
                                            )}
                                        >
                                            <span
                                                className="max-w-40 truncate capitalize"
                                                title={label}
                                            >
                                                {label}
                                            </span>
                                            <span
                                                className={cn(
                                                    "inline-flex h-4 min-w-4 select-none items-center justify-center rounded-full px-1 py-0.5 text-center text-xs font-semibold leading-none",
                                                    isActive
                                                        ? "bg-bg-dark-sf3 text-typo-dark-primary"
                                                        : "bg-bg-sf3 text-typo-primary"
                                                )}
                                            >
                                                {count}
                                            </span>
                                        </Button>
                                    </CarouselItem>
                                );
                            })}
                        </CarouselContent>
                    </Carousel>
                    <div className="flex w-[26.5rem] shrink-0 gap-1 tb:w-[20.25rem] mb:order-1 mb:w-full">
                        <SearchInput
                            value={search}
                            onChange={(value) => {
                                setSearch(value);
                                setPage(1);
                            }}
                            placeholder="Search offers"
                            className="h-10 min-w-0 flex-1 bg-bg-sf4"
                        />
                        <ListingFilter
                            selectedStatus={selectedStatus}
                            selectedPartialFill={selectedPartialFill}
                            onStatusChange={handleStatusChange}
                            onPartialFillChange={handlePartialFillChange}
                        />
                    </div>
                </div>

                <div
                    className="no-scrollbar w-full overflow-x-auto overflow-y-hidden overscroll-x-contain mb:hidden"
                    onScroll={handleTableScroll}
                >
                    {isTableScrolled ? (
                        <ListingStickyCaskColumn
                            rows={rows}
                            isLoading={asksQuery.isLoading}
                        />
                    ) : null}
                    <Table className="w-full min-w-[82.625rem] table-fixed text-left">
                        <TableHeader>
                            <TableRow className="h-9 border-y border-bd-main hover:bg-transparent [&_th:first-child]:!pr-0 [&_th:last-child]:!pr-0 [&_th:nth-child(2)]:!pl-4 [&_th]:py-0 [&_th]:!pl-0 [&_th]:!pr-4">
                                {TABLE_COLUMNS.map((column) => {
                                    const isSorted =
                                        column.sortField === sortBy;
                                    const isCaskColumn = column.key === "cask";
                                    return (
                                        <TableHead
                                            key={column.key}
                                            className={cn(
                                                "px-2 py-3 text-xs font-normal leading-none text-typo-soft first:pl-0 last:pr-0",
                                                column.width,
                                                isCaskColumn &&
                                                    "sticky left-0 z-20 bg-bg-main !pr-0",
                                                column.key === "vintage" &&
                                                    "!pl-4",
                                                isCaskColumn &&
                                                    isTableScrolled &&
                                                    "after:absolute after:-inset-y-3 after:right-0 after:border-r after:border-bd-main"
                                            )}
                                        >
                                            {column.sortField ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSort(
                                                            column.sortField
                                                        )
                                                    }
                                                    className="flex min-w-0 max-w-full items-center gap-1 transition-colors hover:text-typo-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    aria-label={`Sort by ${column.label}`}
                                                >
                                                    <span
                                                        className="truncate"
                                                        title={column.label}
                                                    >
                                                        {column.label}
                                                    </span>
                                                    <span
                                                        className="size-2.5 shrink-0"
                                                        aria-hidden="true"
                                                    >
                                                        <IconSelectVlt
                                                            state={
                                                                isSorted
                                                                    ? sortOrder
                                                                    : "none"
                                                            }
                                                        />
                                                    </span>
                                                </button>
                                            ) : (
                                                <span
                                                    className="block truncate"
                                                    title={column.label}
                                                >
                                                    {column.label}
                                                </span>
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        </TableHeader>
                        {asksQuery.isLoading ? (
                            <ListingTableSkeleton
                                isTableScrolled={isTableScrolled}
                            />
                        ) : (
                            <TableBody className="[&_tr:last-child]:border-b">
                                {rows.map((row: TTableRow) => {
                                    const quantity = Number(row.quantity ?? 0);
                                    const remaining = Number(
                                        row.remainingQuantity ?? 0
                                    );
                                    const matched = quantity - remaining;
                                    const statusLabel = getStatusLabel(
                                        row.status
                                    );
                                    const sellPrice = formatCurrency(
                                        row.askPrice ?? row.price ?? 0
                                    );
                                    const caskHref = `${ROUTE_PUBLIC.CASK_DETAILS}/${row.master?.id ?? row.caskId}`;
                                    const expiration = formatDateTime(
                                        row.expirationDate ?? ""
                                    );
                                    const date = expiration.dataOnlyNumber;
                                    const time = expiration.timeOnly24;
                                    const dateTime = `${date} ${time}`.trim();
                                    return (
                                        <TableRow
                                            key={row.id}
                                            className="group h-[3.3125rem] border-b border-bd-main hover:bg-bg-sf4/20 [&_td:first-child]:!pr-0 [&_td:last-child]:!pr-0 [&_td:nth-child(2)]:!pl-4 [&_td]:py-0 [&_td]:!pl-0 [&_td]:!pr-4"
                                        >
                                            <TableCell
                                                className={cn(
                                                    "sticky left-0 z-10 min-w-0 !bg-bg-main px-2 py-4 !pr-0 pl-0 text-sm font-semibold leading-[1.5] text-typo-primary group-hover:bg-bg-sf4/20",
                                                    isTableScrolled &&
                                                        "after:absolute after:-inset-y-4 after:right-0 after:border-r after:border-bd-main"
                                                )}
                                            >
                                                <Link
                                                    href={caskHref}
                                                    className="block truncate"
                                                    title={handleRenderFallbackText(
                                                        row.master?.name ??
                                                            row.caskName ??
                                                            row.cask?.name
                                                    )}
                                                >
                                                    {handleRenderFallbackText(
                                                        row.master?.name ??
                                                            row.caskName ??
                                                            row.cask?.name
                                                    )}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="min-w-0 overflow-hidden px-2 py-4 !pl-4 text-sm font-medium text-typo-primary">
                                                <span className="block truncate">
                                                    {handleRenderFallbackText(
                                                        row.vintageYear ??
                                                            row.cask
                                                                ?.vintageYear
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-2 py-4">
                                                {isPartialFillAllowed(row) ? (
                                                    <span className="block size-4 text-typo-primary">
                                                        <IconCheck />
                                                    </span>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="min-w-0 overflow-hidden px-2 py-4">
                                                <Badge
                                                    variant={getBadgeVariant(
                                                        row.status
                                                    )}
                                                    size="xs"
                                                    className="min-w-0 max-w-full border-transparent font-semibold normal-case"
                                                    title={statusLabel}
                                                >
                                                    <span className="truncate">
                                                        {statusLabel}
                                                    </span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="min-w-0 overflow-hidden px-2 py-4 text-sm text-typo-primary">
                                                <span
                                                    className="block truncate"
                                                    title={String(quantity)}
                                                >
                                                    {quantity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="min-w-0 overflow-hidden px-2 py-4 text-sm text-typo-primary">
                                                <span
                                                    className="block truncate"
                                                    title={String(
                                                        handleRenderFallbackText(
                                                            matched > 0
                                                                ? matched
                                                                : undefined
                                                        )
                                                    )}
                                                >
                                                    {handleRenderFallbackText(
                                                        matched > 0
                                                            ? matched
                                                            : undefined
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="min-w-0 overflow-hidden px-2 py-4 text-sm text-typo-primary">
                                                <span
                                                    className="block truncate"
                                                    title={String(
                                                        handleRenderFallbackText(
                                                            row.filledQuantity
                                                        )
                                                    )}
                                                >
                                                    {handleRenderFallbackText(
                                                        row.filledQuantity
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="min-w-0 overflow-hidden px-2 py-4 text-sm text-typo-primary">
                                                <span
                                                    className="block truncate"
                                                    title={String(remaining)}
                                                >
                                                    {remaining}
                                                </span>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap px-2 py-4 text-sm font-semibold leading-[1.5] text-typo-primary">
                                                {sellPrice}
                                            </TableCell>
                                            <TableCell className="min-w-0 overflow-hidden px-2 py-4 text-sm font-medium text-typo-primary">
                                                {row.expirationDate ? (
                                                    <span
                                                        className="block truncate whitespace-nowrap"
                                                        title={dateTime}
                                                    >
                                                        <span>{date} </span>
                                                        <span className="text-typo-soft">
                                                            {time}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell className="px-2 py-4 pr-0 text-right">
                                                <RowActionsDropdown
                                                    items={getRowActions(row)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        )}
                    </Table>
                </div>

                <div className="hidden mb:block">
                    {asksQuery.isLoading ? (
                        <div className="flex flex-col gap-2">
                            {Array.from({ length: PAGE_SIZE }).map(
                                (_, index) => (
                                    <MobileListingCardSkeleton
                                        key={index}
                                        expanded={index === 0}
                                    />
                                )
                            )}
                        </div>
                    ) : (
                        <Accordion
                            key={rows[0]?.id ?? "empty-listings"}
                            type="single"
                            collapsible
                            defaultValue={rows[0]?.id}
                            className="flex flex-col gap-2"
                        >
                            {rows.map((row: TTableRow) => {
                                const statusLabel = getStatusLabel(row.status);

                                return (
                                    <MobileListingCard
                                        key={row.id}
                                        listing={row}
                                        actions={getRowActions(row)}
                                        statusBadge={
                                            <Badge
                                                variant={getBadgeVariant(
                                                    row.status
                                                )}
                                                size="xs"
                                                className="min-w-0 max-w-full border-transparent font-semibold normal-case"
                                                title={statusLabel}
                                            >
                                                <span className="truncate">
                                                    {statusLabel}
                                                </span>
                                            </Badge>
                                        }
                                    />
                                );
                            })}
                        </Accordion>
                    )}
                </div>

                {!asksQuery.isLoading && rows.length === 0 ? (
                    <EmptyState
                        title="No listings found"
                        description="Try adjusting your search or filters."
                        action={{
                            label: "Clear filters",
                            variant: "link",
                            onClick: () => {
                                setSearch("");
                                setSelectedStatus(undefined);
                                setSelectedPartialFill(undefined);
                                setTab("all");
                                setPage(1);
                            },
                        }}
                    />
                ) : null}

                {!asksQuery.isLoading && totalPages > 1 ? (
                    <PaginationBar
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                        pageParams={page}
                        sizeParams={PAGE_SIZE}
                        totalRecords={total}
                        currentCount={rows.length}
                        size={PAGE_SIZE}
                        changeParams="page"
                        keyRefetch={KEY_ASK.ASK_MY_ASKS}
                        showTextDetails
                        detailsLabel="items"
                        className="py-0 mb:[&>div]:hidden tb:[&>nav]:justify-end mb:[&>nav]:justify-center"
                    />
                ) : null}
            </div>
        </section>
    );
}
