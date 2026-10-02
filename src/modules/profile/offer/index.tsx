"use client";

import EmptyState from "@/components/shared/empty-state";
import IconSelectVlt from "@/components/shared/icons/icon-select-vlt";
import PaginationBar from "@/components/shared/pagination-bar";
import { RowActionsDropdown } from "@/components/shared/row-actions-dropdown";
import SearchInput from "@/components/shared/search-input";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { KEY_ASK, KEY_BID, ROUTE_PUBLIC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { caskBidService } from "@/services/cask-bid";
import { TTableRow } from "@/types";
import { caskAsk } from "@/types/cask-ask";
import { useQuery } from "@tanstack/react-query";
import { type UIEvent, useMemo, useState } from "react";
import FilterPopover, { type TPartialFillFilter } from "./filter-popover";
import {
    TProfileOfferFilters,
    useProfileOfferTable,
} from "./hooks/use-offer-table";
import { MobileOfferCard, MobileOfferCardSkeleton } from "./mobile-offer-card";
import StatsCards from "./stats-cards";
import TableSkeleton from "./table-skeleton";

type TOfferSortField = NonNullable<caskAsk.TOrderListFilters["sortBy"]>;

const SORTABLE_COLUMNS: Partial<Record<string, TOfferSortField>> = {
    status: "status",
    requested: "quantity",
    offerPrice: "unitPrice",
    expires: "expirationDate",
};

const PAGE_SIZE = 10;
const EMPTY_OFFERS: TTableRow[] = [];

function getStatusLabel(status: string) {
    return status.replaceAll("_", " ");
}

function ProfileOfferContent() {
    const [searchVal, setSearchVal] = useState("");
    const debouncedSearch = useDebounce(searchVal, 300);
    const [activeTab, setActiveTab] = useState("all");
    const [page, setPage] = useState(1);
    const [isTableScrolled, setIsTableScrolled] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>();
    const [selectedPartialFill, setSelectedPartialFill] =
        useState<TPartialFillFilter>();

    const statusCountsQuery = useQuery({
        queryKey: [KEY_BID.BID_MY_BIDS, KEY_ASK.ASK_STATUS_COUNT],
        queryFn: () => caskBidService.getStatusCountBids(),
    });
    const statsQuery = useQuery({
        queryKey: [KEY_BID.BID_MY_BIDS, "profile-offer-stats"],
        queryFn: () => caskBidService.getMyBidsTotal(),
    });

    const statusCounts = statusCountsQuery.data;
    const statusOptions = useMemo(() => {
        if (!statusCounts) return [];

        return Object.entries(statusCounts)
            .filter(
                ([status, count]) =>
                    status !== "total" && typeof count === "number"
            )
            .map(([status, count]) => ({
                value: status,
                label: getStatusLabel(status),
                count,
            }));
    }, [statusCounts]);
    const statusTotal = useMemo(() => {
        if (!statusCounts) return 0;

        const counts = statusCounts as Record<string, number | undefined>;
        return (
            counts.total ??
            statusOptions.reduce((sum, option) => sum + option.count, 0)
        );
    }, [statusCounts, statusOptions]);
    const statusTabs = useMemo(
        () => [
            { value: "all", label: "All", count: statusTotal },
            ...statusOptions,
        ],
        [statusOptions, statusTotal]
    );

    const hasAnyBids = useMemo(() => {
        if (!statusCounts) return true;
        return statusTotal > 0;
    }, [statusCounts, statusTotal]);

    // Sort state
    const [sortBy, setSortBy] = useState<TOfferSortField>();
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const executionPolicy =
        selectedPartialFill === "yes"
            ? EBidExecutionPolicy.PARTIAL_ALLOWED
            : selectedPartialFill === "no"
              ? EBidExecutionPolicy.FULL_AT_ONCE
              : undefined;

    // Handle sort toggle: empty -> desc -> asc -> empty
    const handleSort = (field: TOfferSortField) => {
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

    // Build API filters
    const apiFilters: TProfileOfferFilters = useMemo(
        () => ({
            search: debouncedSearch || undefined,
            page,
            limit: PAGE_SIZE,
            size: PAGE_SIZE,
            status:
                selectedStatus ?? (activeTab === "all" ? undefined : activeTab),
            executionPolicy,
            sortBy,
            order: sortBy ? sortOrder : undefined,
        }),
        [
            debouncedSearch,
            page,
            selectedStatus,
            activeTab,
            executionPolicy,
            sortBy,
            sortOrder,
        ]
    );
    const {
        offers,
        total,
        totalPages,
        isLoading,
        renderCell,
        TABLE_CONFIG,
        renderAction,
    } = useProfileOfferTable(apiFilters);
    const handleClearAll = () => {
        setActiveTab("all");
        setSearchVal("");
        setSelectedStatus(undefined);
        setSelectedPartialFill(undefined);
        setPage(1);
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status === "all" ? undefined : status);
        setActiveTab("all");
        setPage(1);
    };

    const handlePartialFillChange = (option: TPartialFillFilter) => {
        setSelectedPartialFill(option);
        setPage(1);
    };

    // Render helpers
    const renderHeading = () => (
        <div className="flex flex-col gap-2">
            <h1 className="font-reckless text-3xl font-medium leading-tight text-typo-primary tb:text-2xl mb:text-xl">
                Offer
            </h1>
            <p className="text-sm font-normal text-typo-soft">
                Track your marketplace offers, matching progress and activity.
            </p>
        </div>
    );

    const renderNoBidsState = () => (
        <EmptyState
            title="Awaiting Your Bids"
            description={
                <>
                    <p>
                        You haven&apos;t placed any bids. Casks you&apos;ve bid
                        on will be listed here.
                    </p>
                </>
            }
            action={{
                label: "View Marketplace",
                href: ROUTE_PUBLIC.CASK_DETAILS,
                variant: "action",
            }}
        />
    );

    const renderTabs = () => (
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
            className="min-w-0 tb:px-0 mb:order-2 mb:-mx-4"
            aria-label="Offer status tabs"
        >
            <CarouselContent
                className="gap-1 mb:px-4"
                classNameParent="no-scrollbar"
            >
                {statusTabs.map(({ value, label, count }) => {
                    const isActive = activeTab === value;
                    return (
                        <CarouselItem key={value} className="basis-auto pl-0">
                            <Button
                                variant="tab"
                                onClick={() => {
                                    setActiveTab(value);
                                    setSelectedStatus(undefined);
                                    setPage(1);
                                }}
                                className={cn(
                                    "flex h-10 min-w-0 flex-row items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors duration-200 mb:h-[1.875rem] mb:gap-2 mb:rounded-none mb:px-3 mb:py-1.5",
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
    );

    const renderControls = () => (
        <div className="flex flex-row items-center gap-1 mb:order-1 mb:w-full">
            <SearchInput
                value={searchVal}
                onChange={(value) => {
                    setSearchVal(value);
                    setPage(1);
                }}
                placeholder="Search offers"
                className="h-10 w-[20.5rem] tb:w-auto tb:flex-1"
            />
            <FilterPopover
                selectedStatus={selectedStatus}
                statusOptions={statusOptions}
                selectedPartialFill={selectedPartialFill}
                onStatusChange={handleStatusChange}
                onPartialFillChange={handlePartialFillChange}
            />
        </div>
    );

    const renderNoResultsState = () => (
        <EmptyState
            title="No matching results"
            description={
                <>
                    <p>We couldn&apos;t find anything matching.</p>
                    <p>Try checking your spelling or adjusting your filters.</p>
                </>
            }
            action={{
                label: "Clear All",
                variant: "link",
                onClick: handleClearAll,
            }}
        />
    );

    const renderTableHeader = () => (
        <TableHeader>
            <TableRow className="border-b border-t border-bd-main hover:bg-transparent">
                {TABLE_CONFIG.columns.map((column) => {
                    const sortField = SORTABLE_COLUMNS[column.key];
                    const isSortable = !!sortField;
                    const isSorted = sortBy === sortField;
                    const isCaskName = column.key === "caskName";

                    return (
                        <TableHead
                            key={column.key}
                            className={cn(
                                "px-2 py-3 text-left font-normal text-typo-soft first:pl-0 last:pr-0",
                                isCaskName &&
                                    "sticky left-0 z-20 bg-bg-main pr-4",
                                isCaskName &&
                                    isTableScrolled &&
                                    "after:absolute after:-bottom-3 after:-top-3 after:right-0 after:border-r after:border-bd-main"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex min-w-0 cursor-pointer items-center gap-1 text-xs",
                                    isSortable &&
                                        "transition-colors hover:text-typo-primary",
                                    column.key === "action" && "justify-end"
                                )}
                                onClick={
                                    isSortable
                                        ? () => handleSort(sortField)
                                        : undefined
                                }
                            >
                                <span className={cn(isSorted && "font-medium")}>
                                    {typeof column.label === "function"
                                        ? column.label()
                                        : column.label}
                                </span>
                                {isSortable && (
                                    <span className="h-3 w-3 shrink-0">
                                        <IconSelectVlt
                                            state={
                                                isSorted ? sortOrder : "none"
                                            }
                                        />
                                    </span>
                                )}
                            </div>
                        </TableHead>
                    );
                })}
            </TableRow>
        </TableHeader>
    );

    const renderTableRows = () => {
        if (isLoading) {
            return (
                <TableSkeleton
                    tableConfig={TABLE_CONFIG}
                    rows={10}
                    showStickyDivider={isTableScrolled}
                />
            );
        }

        return offers.map((item: TTableRow) => {
            const actions = renderAction(item);
            return (
                <TableRow
                    key={item.id}
                    className="group !border-b border-bd-main hover:bg-bg-sf4/20"
                >
                    {TABLE_CONFIG.columns.map((column) => {
                        const isAction = column.key === "action";
                        const isCaskName = column.key === "caskName";

                        return (
                            <TableCell
                                key={column.key}
                                className={cn(
                                    "min-w-0 px-2 py-4 align-middle first:pl-0 last:pr-0",
                                    isAction && "text-right",
                                    isCaskName &&
                                        "sticky left-0 z-10 bg-bg-main pr-4 group-hover:bg-bg-sf4/20",
                                    isCaskName &&
                                        isTableScrolled &&
                                        "after:absolute after:-inset-y-5 after:right-0 after:z-[1] after:border-r after:border-bd-main"
                                )}
                            >
                                {isAction ? (
                                    <div className="flex justify-end tb:ml-auto">
                                        <RowActionsDropdown items={actions} />
                                    </div>
                                ) : (
                                    renderCell(column.key, item)
                                )}
                            </TableCell>
                        );
                    })}
                </TableRow>
            );
        });
    };

    const handleTableScroll = (event: UIEvent<HTMLDivElement>) => {
        const nextIsScrolled = event.currentTarget.scrollLeft > 0;
        setIsTableScrolled((currentIsScrolled) =>
            currentIsScrolled === nextIsScrolled
                ? currentIsScrolled
                : nextIsScrolled
        );
    };

    const renderTable = () => (
        <div
            className="no-scrollbar w-full overflow-x-auto overflow-y-hidden overscroll-x-contain mb:hidden"
            onScroll={handleTableScroll}
        >
            <Table className="w-full min-w-[82.625rem] table-auto border-collapse text-left">
                {renderTableHeader()}
                <TableBody className="[&_tr:last-child]:border-b">
                    {renderTableRows()}
                </TableBody>
            </Table>
        </div>
    );

    const renderMobileCards = () => (
        <div className="hidden mb:block">
            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <MobileOfferCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <Accordion
                    type="single"
                    collapsible
                    className="flex flex-col gap-2"
                >
                    {offers.map((item: TTableRow) => (
                        <MobileOfferCard
                            key={item.id}
                            offer={item}
                            actions={renderAction(item)}
                            renderCell={renderCell}
                        />
                    ))}
                </Accordion>
            )}
        </div>
    );

    const renderContent = () => {
        // When not loading and has no bids at all across all statuses
        if (!isLoading && !hasAnyBids) {
            return renderNoBidsState();
        }

        // If user has bids but current tab/search returns empty
        if (!isLoading && offers.length === 0) {
            return (
                <>
                    <div className="flex w-full flex-row flex-wrap items-center justify-between gap-6 tb:flex-row tb:flex-nowrap tb:items-stretch tb:gap-1 mb:flex-col mb:gap-4">
                        {renderTabs()}
                        {renderControls()}
                    </div>
                    {renderNoResultsState()}
                </>
            );
        }

        // Normal state with table (or loading state with skeletons)
        return (
            <>
                <div className="flex w-full flex-row flex-wrap items-center justify-between gap-6 tb:flex-row tb:flex-nowrap tb:items-stretch tb:gap-1 mb:flex-col mb:gap-4">
                    {renderTabs()}
                    {renderControls()}
                </div>
                {renderTable()}
                {renderMobileCards()}
                {totalPages > 1 ? (
                    <PaginationBar
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                        pageParams={page}
                        sizeParams={PAGE_SIZE}
                        totalRecords={total}
                        currentCount={offers.length}
                        size={PAGE_SIZE}
                        changeParams="page"
                        keyRefetch={KEY_BID.BID_MY_BIDS}
                        showTextDetails
                    />
                ) : null}
            </>
        );
    };

    return (
        <div className="flex w-full flex-col gap-8 tb:gap-6">
            {renderHeading()}
            <div className="flex w-full flex-col gap-6 tb:gap-4">
                <StatsCards
                    offers={statsQuery.data ?? EMPTY_OFFERS}
                    isLoading={statsQuery.isLoading}
                />
                {renderContent()}
            </div>
        </div>
    );
}

export default function ProfileOfferModule() {
    return <ProfileOfferContent />;
}
