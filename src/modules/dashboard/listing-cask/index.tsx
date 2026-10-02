"use client";

import IconEdit from "@/components/shared/icons/icon-edit";
import IconEye from "@/components/shared/icons/icon-eye";
import IconPlus from "@/components/shared/icons/icon-plus";
import SearchInput from "@/components/shared/search-input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EBadgeVariant } from "@/enum/transaction";
import { useDebounce } from "@/hooks/useDebounce";
import {
    CASK_KEYS,
    DISTILLERY_KEYS,
    ROUTE_DASHBOARD,
    ROUTE_PUBLIC,
} from "@/lib/constants";
import { cn, formatDateTime, getErrorMessage } from "@/lib/utils";
import PaginationBar from "@/components/shared/pagination-bar";
import caskMasterServices from "@/services/cask-master";
import distilleriesServices from "@/services/distilleries";
import { caskMaster, distillery } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const GRID_COLS =
    "grid-cols-[minmax(0,0.25fr)_minmax(0,2.25fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.75fr)_minmax(0,1.25fr)_minmax(0,1.25fr)_minmax(0,0.25fr)] tb:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.25fr)_minmax(0,0.3fr)] mb:grid-cols-[minmax(0,4.5fr)_minmax(0,1.25fr)_minmax(0,1fr)]";

export default function ListingCaskModule() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusTab, setStatusTab] = useState<"all" | "active" | "inactive">(
        "all"
    );
    const [page, setPage] = useState(1);
    const [selectedDistilleryId, setSelectedDistilleryId] = useState("all");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const pageSize = 10;
    const debouncedSearch = useDebounce(searchQuery.trim(), 400);
    const queryClient = useQueryClient();

    const distilleriesQuery = useQuery({
        queryKey: [DISTILLERY_KEYS.LISTING, "all-pages"],
        queryFn: async (): Promise<distillery.TDistillery[]> => {
            const pageSize = 100;
            const firstPage = await distilleriesServices.getDistilleriesListing(
                `page=1&size=${pageSize}`
            );

            const remainingPages = Array.from(
                { length: Math.max(0, firstPage.totalPages - 1) },
                (_, index) => index + 2
            );
            const remainingResponses = await Promise.all(
                remainingPages.map((distilleryPage) =>
                    distilleriesServices.getDistilleriesListing(
                        `page=${distilleryPage}&size=${pageSize}`
                    )
                )
            );

            return [
                ...firstPage.data,
                ...remainingResponses.flatMap((response) => response.data),
            ].sort((first, second) =>
                first.name.localeCompare(second.name, undefined, {
                    sensitivity: "base",
                })
            );
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data, isLoading, isError, error } = useQuery({
        queryKey: [
            CASK_KEYS.LISTING_PAGE,
            {
                page,
                size: pageSize,
                search: debouncedSearch,
                status: statusTab,
                distilleryId: selectedDistilleryId,
            },
        ],
        queryFn: () =>
            caskMasterServices.getCaskMastersAdmin({
                page,
                size: pageSize,
                search: debouncedSearch,
                includeAllStatuses: statusTab === "all",
                ...(selectedDistilleryId !== "all" && {
                    distilleryIds: [selectedDistilleryId],
                }),
                ...(statusTab !== "all" && { status: statusTab }),
            }),
        staleTime: 5 * 60 * 1000,
    });

    const deleteCaskMutation = useMutation({
        mutationFn: (id: string) => caskMasterServices.deleteCaskMaster(id),
        onSuccess: () => {
            toast.success("Cask deleted successfully");
            queryClient.invalidateQueries({
                queryKey: [CASK_KEYS.LISTING_PAGE],
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to delete cask"));
        },
    });

    const filteredCasks = data?.data ?? [];
    const totalPages = data?.totalPages || 1;
    const totalRecords = data?.totalRecords || 0;

    const handleAddCask = () => {
        router.push(ROUTE_DASHBOARD.CASK_ADD);
    };

    const handleEdit = (id: string) => {
        router.push(`${ROUTE_DASHBOARD.CASK}/${id}`);
    };

    const handleDelete = (item: caskMaster.TCaskMaster) => {
        setPendingDelete({ id: String(item.id), name: item.name });
        setConfirmOpen(true);
    };

    if (isError) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-error bg-error/10 p-4 text-error">
                    Error loading casks: {getErrorMessage(error, "")}
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full min-w-0 flex-col">
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent
                    isShowClose
                    className="w-full max-w-[31.25rem] gap-0 border-0 bg-bg-main p-0 shadow-none"
                    classClose="rounded-lg p-2 text-icon-main hover:text-icon-highlight"
                >
                    <AlertDialogHeader className="space-y-0 text-center sm:text-center">
                        <AlertDialogTitle className="mb-2 w-full font-reckless text-xl font-medium leading-none text-typo-primary">
                            Delete Cask?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="w-full text-center text-sm font-normal leading-[1.5] text-typo-soft">
                            This will permanently delete this cask and all
                            associated vintages. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 w-full items-start gap-1">
                        <AlertDialogCancel
                            className="h-12 min-w-[9.375rem] flex-1 rounded-none border border-bd-main bg-transparent px-8 py-4 text-sm font-medium leading-none text-typo-primary outline-none hover:bg-transparent hover:text-typo-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typo-primary"
                            disabled={deleteCaskMutation.isPending}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-12 min-w-[9.375rem] flex-1 rounded-none border-0 !bg-bg-dark-main px-8 py-4 text-sm font-medium leading-none !text-typo-dark-primary outline-none hover:!bg-bg-dark-main focus-visible:!bg-bg-dark-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typo-primary"
                            disabled={deleteCaskMutation.isPending}
                            onClick={async () => {
                                if (!pendingDelete) return;
                                await deleteCaskMutation.mutateAsync(
                                    pendingDelete.id
                                );
                                setConfirmOpen(false);
                                setPendingDelete(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex min-h-20 items-center justify-between gap-4 border-b border-bd-main px-10 py-4 tb:px-6 mb:flex-col mb:items-stretch mb:px-4">
                <div className="flex min-w-0 flex-col gap-1">
                    <h1 className="text-balance font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                        Casks
                    </h1>
                    <p className="text-pretty text-sm font-normal leading-snug text-typo-sub mb:text-xs">
                        View and manage all cask listings.
                    </p>
                </div>
                <Button
                    variant="action"
                    onClick={handleAddCask}
                    className="shrink-0 mb:w-full"
                >
                    Create Cask
                    <div className="size-3.5" aria-hidden="true">
                        <IconPlus />
                    </div>
                </Button>
            </div>

            <div className="mx-auto flex w-full min-w-0 max-w-[112.5rem] flex-1 flex-col px-10 pb-8 pt-10 tb:px-6 tb:pt-6 mb:px-4 mb:pb-5 mb:pt-5">
                <div className="flex flex-col gap-6">
                    <div className="flex w-full items-center justify-between gap-6 tb:flex-col tb:items-stretch tb:gap-4">
                        <div className="flex max-w-full items-center gap-1 overflow-x-auto overscroll-x-contain pb-1">
                            {(["all", "active", "inactive"] as const).map(
                                (tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        aria-pressed={statusTab === tab}
                                        onClick={() => {
                                            setStatusTab(tab);
                                            setPage(1);
                                        }}
                                        className={cn(
                                            // Figma: padding 10px 16px, height 40px, gap 6px
                                            "flex h-10 shrink-0 touch-manipulation items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bd-brown-lighter",
                                            statusTab === tab
                                                ? // Active: bg #0E0702 (bg-bg-dark-main), text #FFFCF6 (text-typo-dark-primary)
                                                  "bg-bg-dark-main text-typo-dark-primary"
                                                : // Inactive: bg rgba(14,7,2,0.08) (bg-bg-sf3), text rgba(27,13,3,0.5) (text-typo-soft)
                                                  "bg-bg-sf3 text-typo-soft hover:bg-bg-dark-main hover:text-typo-dark-primary"
                                        )}
                                    >
                                        {tab.charAt(0).toUpperCase() +
                                            tab.slice(1)}
                                        <span
                                            className={cn(
                                                // Figma: padding 2px 4px, rounded full, font B12/Data (12px 600)
                                                "flex items-center justify-center rounded-full px-1 py-0.5 text-xs font-semibold leading-none",
                                                statusTab === tab
                                                    ? // Active badge: bg rgba(255,255,255,0.15), text #FFFCF6
                                                      "bg-white/[0.15] text-typo-dark-primary"
                                                    : // Inactive badge: bg rgba(14,7,2,0.08) (bg-bg-sf3), text #1B0D03 (text-typo-primary)
                                                      "bg-bg-sf3 text-typo-primary"
                                            )}
                                        >
                                            {statusTab === tab
                                                ? totalRecords
                                                : 0}
                                        </span>
                                    </button>
                                )
                            )}
                        </div>

                        {/* Search and Filter — Figma: gap 4px, search width fill in 424px container */}
                        <div className="flex min-w-0 items-center gap-1 mb:flex-col mb:items-stretch mb:gap-2">
                            {/* Figma: Search bg rgba(14,7,2,0.04) = bg-bg-sf4, height 40px */}
                            <SearchInput
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search offers"
                                className="h-10 w-[18.75rem] max-w-full tb:w-full"
                            />
                            {/* Figma: Category dropdown — bg rgba(14,7,2,0.04), padding 0 10px 0 12px, gap 4px */}
                            <Select
                                value={selectedDistilleryId}
                                onValueChange={(value) => {
                                    setSelectedDistilleryId(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="h-10 w-[12rem] shrink-0 bg-bg-sf4 px-3 text-sm font-medium text-typo-primary shadow-none hover:bg-bg-sf3 mb:w-full">
                                    <SelectValue placeholder="All Distilleries" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Distilleries
                                    </SelectItem>
                                    {distilleriesQuery.data?.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex flex-col border-t border-bd-main">
                        <Table>
                            <TableHeader>
                                <TableRow
                                    className={cn(
                                        "grid !gap-x-4 !rounded-none",
                                        GRID_COLS
                                    )}
                                >
                                    <TableHead className="py-3 pl-0 pr-0 text-xs font-normal leading-none text-typo-soft tb:hidden">
                                        No.
                                    </TableHead>
                                    <TableHead className="py-3 pl-0 pr-0 text-xs font-normal leading-none text-typo-soft">
                                        Cask name
                                    </TableHead>
                                    <TableHead className="py-3 pl-0 pr-0 text-xs font-normal leading-none text-typo-soft mb:hidden">
                                        Distillery
                                    </TableHead>
                                    <TableHead className="py-3 pl-0 pr-0 text-xs font-normal leading-none text-typo-soft tb:hidden">
                                        Cask Type
                                    </TableHead>
                                    <TableHead className="py-3 pl-0 pr-0 text-xs font-normal leading-none text-typo-soft tb:hidden">
                                        Vintage Count
                                    </TableHead>
                                    <TableHead className="py-3 pl-0 pr-0 text-xs font-normal leading-none text-typo-soft">
                                        Status
                                    </TableHead>
                                    <TableHead className="py-3 pl-0 pr-0 text-xs font-normal leading-none text-typo-soft mb:hidden">
                                        Last updated
                                    </TableHead>
                                    <TableHead className="py-3 pl-0 pr-0" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <CaskListingSkeleton />
                                ) : filteredCasks.length === 0 ? (
                                    <TableRow className="border-b-0 hover:bg-transparent">
                                        <TableCell
                                            colSpan={8}
                                            className="h-32 text-center text-sm text-typo-soft"
                                        >
                                            {searchQuery
                                                ? "No casks found matching your search"
                                                : "No casks available"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCasks.map(
                                        (
                                            item: caskMaster.TCaskMaster,
                                            index: number
                                        ) => {
                                            const isActive =
                                                item.status === "active";
                                            const rowNumber =
                                                (page - 1) * pageSize +
                                                index +
                                                1;

                                            return (
                                                <TableRow
                                                    key={item.id}
                                                    className={cn(
                                                        "grid w-full cursor-pointer items-center gap-4 py-4 transition-colors hover:bg-bg-sf4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bd-brown-lighter",
                                                        GRID_COLS
                                                    )}
                                                    onClick={() =>
                                                        handleEdit(
                                                            String(item.id)
                                                        )
                                                    }
                                                    onKeyDown={(event) => {
                                                        if (
                                                            event.key ===
                                                                "Enter" ||
                                                            event.key === " "
                                                        ) {
                                                            event.preventDefault();
                                                            handleEdit(
                                                                String(item.id)
                                                            );
                                                        }
                                                    }}
                                                    role="link"
                                                    tabIndex={0}
                                                    aria-label={`View ${item.name}`}
                                                >
                                                    <TableCell className="p-0 text-sm font-normal leading-normal text-typo-primary tb:hidden">
                                                        {rowNumber}
                                                    </TableCell>
                                                    <TableCell className="min-w-0 p-0">
                                                        <p className="truncate text-sm font-semibold leading-normal text-typo-primary">
                                                            {item.name}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="min-w-0 truncate p-0 text-sm font-normal leading-normal text-typo-primary mb:hidden">
                                                        {item.distillery
                                                            ?.name || "-"}
                                                    </TableCell>
                                                    <TableCell className="p-0 text-sm font-normal leading-normal text-typo-primary tb:hidden">
                                                        {item.caskType?.name ||
                                                            "-"}
                                                    </TableCell>
                                                    <TableCell className="p-0 text-sm font-normal tabular-nums leading-normal text-typo-primary tb:hidden">
                                                        {item.childCount ?? "-"}
                                                    </TableCell>
                                                    <TableCell className="p-0">
                                                        <Badge
                                                            variant={
                                                                isActive
                                                                    ? EBadgeVariant.SUCCESS
                                                                    : EBadgeVariant.STATIC
                                                            }
                                                            className={cn(
                                                                // Figma: B12/Semibold 600 12px, bg rgba(14,7,2,0.08), rounded-full, h-5, px-2
                                                                "h-5 rounded-full px-2 py-0 text-xs font-semibold leading-none",
                                                                isActive
                                                                    ? // Active badge: text #058134, bg rgba(14,7,2,0.08)
                                                                      "bg-bg-sf3 text-success"
                                                                    : // Inactive badge
                                                                      "bg-bg-sf3 text-typo-primary"
                                                            )}
                                                        >
                                                            {isActive
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </Badge>
                                                    </TableCell>
                                                    {/* Last updated */}
                                                    <TableCell className="p-0 text-sm font-medium tabular-nums leading-normal text-typo-primary mb:hidden">
                                                        {item.updatedAt
                                                            ? (() => {
                                                                  const dt =
                                                                      formatDateTime(
                                                                          item.updatedAt
                                                                      );
                                                                  return `${dt.dataOnlyNumber} ${dt.timeOnly24}`;
                                                              })()
                                                            : "-"}
                                                    </TableCell>
                                                    {/* Action — Figma: eye icon 16x16, justified end in 30px col */}
                                                    <TableCell className="flex items-center justify-end p-0">
                                                        <Link
                                                            href={`${ROUTE_PUBLIC.CASK_DETAILS}/${item.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            onKeyDown={(e) => {
                                                                e.stopPropagation();
                                                                if (
                                                                    e.key ===
                                                                    " "
                                                                ) {
                                                                    e.preventDefault();
                                                                    window.open(
                                                                        `${ROUTE_PUBLIC.CASK_DETAILS}/${item.id}`,
                                                                        "_blank",
                                                                        "noopener,noreferrer"
                                                                    );
                                                                }
                                                            }}
                                                            className="flex size-9 touch-manipulation items-center justify-center text-icon-main transition-colors hover:text-typo-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bd-brown-lighter"
                                                            aria-label={`View ${item.name}`}
                                                        >
                                                            <span
                                                                className="size-4"
                                                                aria-hidden="true"
                                                            >
                                                                <IconEye />
                                                            </span>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>{" "}
                </div>

                {/* Pagination */}
                {!isLoading && filteredCasks.length > 0 && (
                    <PaginationBar
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                        showTextDetails
                        pageParams={page}
                        sizeParams={pageSize}
                        totalRecords={totalRecords}
                        currentCount={filteredCasks.length}
                        size={pageSize}
                        changeParams="page"
                        keyRefetch={CASK_KEYS.LISTING_PAGE}
                        baseFilters={{
                            size: pageSize,
                            search: debouncedSearch,
                            ...(selectedDistilleryId !== "all" && {
                                distilleryIds: [selectedDistilleryId],
                            }),
                            ...(statusTab !== "all" && { status: statusTab }),
                        }}
                        prefetchFn={(filters) =>
                            caskMasterServices.getCaskMastersAdmin({
                                page: filters.page as number,
                                size: filters.size as number,
                                search: filters.search as string,
                                includeAllStatuses: statusTab === "all",
                                ...(selectedDistilleryId !== "all" && {
                                    distilleryIds: [selectedDistilleryId],
                                }),
                                ...(statusTab !== "all" && {
                                    status: statusTab,
                                }),
                            })
                        }
                        className="mb-0 border-t pt-8"
                        visibleItems={5}
                    />
                )}
            </div>
        </div>
    );
}

const CaskListingSkeleton = () => {
    const skeletonRows = Array.from({ length: 10 });

    return (
        <>
            {skeletonRows.map((_, index) => (
                <TableRow
                    key={index}
                    className={cn(
                        "grid w-full items-center gap-4 py-4 hover:bg-transparent",
                        GRID_COLS
                    )}
                >
                    <TableCell className="p-0 tb:hidden">
                        <Skeleton className="h-4 w-5 rounded-none" />
                    </TableCell>
                    <TableCell className="p-0">
                        <Skeleton className="h-4 w-3/4 rounded-none" />
                    </TableCell>
                    <TableCell className="p-0 mb:hidden">
                        <Skeleton className="h-4 w-2/3 rounded-none" />
                    </TableCell>
                    <TableCell className="p-0 tb:hidden">
                        <Skeleton className="h-4 w-2/3 rounded-none" />
                    </TableCell>
                    <TableCell className="p-0 tb:hidden">
                        <Skeleton className="h-4 w-10 rounded-none" />
                    </TableCell>
                    <TableCell className="p-0">
                        <Skeleton className="h-5 w-14 rounded-none" />
                    </TableCell>
                    <TableCell className="p-0 mb:hidden">
                        <Skeleton className="h-4 w-28 rounded-none" />
                    </TableCell>
                    <TableCell className="flex items-center justify-end p-0">
                        <Skeleton className="size-9 rounded-none" />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
};
