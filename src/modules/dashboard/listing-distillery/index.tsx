"use client";

import IconEdit from "@/components/shared/icons/icon-edit";
import IconPlus from "@/components/shared/icons/icon-plus";
import IconTrash from "@/components/shared/icons/icon-trash";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EBadgeVariant } from "@/enum/transaction";
import { useDebounce } from "@/hooks/useDebounce";
import {
    DISTILLERY_KEYS,
    PATH_DISTILLERIES,
    ROUTE_DASHBOARD,
} from "@/lib/constants";
import { cn, getErrorMessage } from "@/lib/utils";
import PaginationBar from "@/components/shared/pagination-bar";
import distilleriesServices from "@/services/distilleries";
import { distillery } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import DistilleryDialog, { DistilleryFormValues } from "./distillery-dialog";
import { toast } from "sonner";

const GRID_COLS =
    "grid-cols-[minmax(0,1.5fr)_minmax(0,1.25fr)_minmax(0,1.25fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_minmax(0,0.5fr)] tb:grid-cols-[minmax(0,1.5fr)_minmax(0,1.25fr)_minmax(0,0.75fr)_minmax(0,0.5fr)] mb:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,0.75fr)]";

export default function ListingDistilleryModule() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [selectedDistillery, setSelectedDistillery] =
        useState<distillery.TDistillery | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const pageSize = 20;
    const queryClient = useQueryClient();
    const debouncedSearch = useDebounce(searchQuery.trim(), 400);

    // Fetch distilleries with pagination
    const { data, isLoading, isError, error } = useQuery({
        queryKey: [
            PATH_DISTILLERIES,
            DISTILLERY_KEYS.LISTING,
            { page, size: pageSize, search: debouncedSearch },
        ],
        queryFn: () =>
            distilleriesServices.getDistilleriesListing(
                `page=${page}&size=${pageSize}${
                    debouncedSearch
                        ? `&search=${encodeURIComponent(debouncedSearch)}`
                        : ""
                }`
            ),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => distilleriesServices.deleteDistillery(id),
        onSuccess: () => {
            toast.success("Distillery deleted successfully");
            queryClient.invalidateQueries({
                queryKey: [PATH_DISTILLERIES, DISTILLERY_KEYS.LISTING],
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to delete distillery"));
        },
    });

    // Filter by search query
    const filteredDistilleries = useMemo(() => {
        // Results are already filtered by server using `search`
        return data?.data ?? [];
    }, [data?.data]);

    const totalPages = data?.totalPages || 1;
    const totalRecords = data?.totalRecords || 0;

    const handleDelete = async (id: string, name: string) => {
        setPendingDelete({ id, name });
        setConfirmOpen(true);
    };

    const handleEdit = (distillery: distillery.TDistillery) => {
        const url = `${ROUTE_DASHBOARD.DISTILLERY}/${distillery.id}`;
        router.push(url);
    };

    const handleAddDistillery = () => {
        router.push(ROUTE_DASHBOARD.DISTILLERY_ADD);
    };

    const handleSaveDistillery = async (values: DistilleryFormValues) => {
        try {
            console.log("values", values);
            // await saveMutation.mutateAsync({
            //     values,
            //     id: selectedDistillery?.id,
            //     mode: dialogMode,
            // });
        } catch (error) {
            console.error("Error saving distillery:", error);
            throw error;
        }
    };

    if (isError) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-error bg-error/10 p-4 text-error">
                    Error loading distilleries: {getErrorMessage(error, "")}
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full min-w-0 flex-col">
            <DistilleryDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                distillery={selectedDistillery}
                onSave={handleSaveDistillery}
                mode={dialogMode}
            />
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent
                    isShowClose
                    className="w-full max-w-[31.25rem] gap-0 border-0 bg-bg-main p-0 shadow-none"
                    classClose="rounded-lg p-2 text-icon-main hover:text-icon-highlight"
                >
                    <AlertDialogHeader className="space-y-0 text-center sm:text-center">
                        <AlertDialogTitle className="mb-2 w-full font-reckless text-xl font-medium leading-none text-typo-primary">
                            Delete Distillery?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="w-full text-center text-sm font-normal leading-[1.5] text-typo-soft">
                            {pendingDelete
                                ? `This will permanently delete "${pendingDelete.name}". This action cannot be undone.`
                                : "This will permanently delete this distillery. This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 w-full items-start gap-1">
                        <AlertDialogCancel
                            className="h-12 min-w-[9.375rem] flex-1 rounded-none border border-bd-main bg-transparent px-8 py-4 text-sm font-medium leading-none text-typo-primary outline-none hover:bg-transparent hover:text-typo-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typo-primary"
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-12 min-w-[9.375rem] flex-1 rounded-none border-0 !bg-bg-dark-main px-8 py-4 text-sm font-medium leading-none !text-typo-dark-primary outline-none hover:!bg-bg-dark-main focus-visible:!bg-bg-dark-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typo-primary"
                            disabled={deleteMutation.isPending}
                            onClick={async () => {
                                if (!pendingDelete) return;
                                await deleteMutation.mutateAsync(
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
                        Distilleries
                    </h1>
                    <p className="text-pretty text-sm font-normal leading-snug text-typo-sub mb:text-xs">
                        Manage distillery listings and their details.
                    </p>
                </div>
                <Button
                    variant="action"
                    onClick={handleAddDistillery}
                    className="shrink-0 mb:w-full"
                    onMouseEnter={() => {
                        router.prefetch(ROUTE_DASHBOARD.DISTILLERY_ADD);
                    }}
                >
                    Create Distillery
                    <div className="size-3.5" aria-hidden="true">
                        <IconPlus />
                    </div>
                </Button>
            </div>

            <div className="mx-auto flex w-full min-w-0 max-w-[112.5rem] flex-1 flex-col px-10 pb-8 pt-10 tb:px-6 tb:pt-6 mb:px-4 mb:pb-5 mb:pt-5">
                <div className="flex flex-col gap-6">
                    <div className="flex w-full justify-end">
                        <div className="w-[18.75rem] max-w-full tb:w-full">
                            <SearchInput
                                value={searchQuery}
                                onChange={(value) => {
                                    setSearchQuery(value);
                                    setPage(1);
                                }}
                                placeholder="Search distilleries"
                                className="h-10 w-full"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col border-t border-bd-main">
                        <Table>
                            <TableHeader className="block">
                                <TableRow
                                    className={cn(
                                        "grid !gap-x-4 !rounded-none",
                                        GRID_COLS
                                    )}
                                >
                                    <TableHead className="py-3 pl-0 pr-0 text-xs font-normal leading-none text-typo-soft">
                                        Distillery
                                    </TableHead>
                                    <TableHead className="py-3 pl-0 pr-0 text-xs font-normal leading-none text-typo-soft mb:hidden">
                                        Country, Region
                                    </TableHead>
                                    <TableHead className="py-3 pl-0 pr-0 text-xs font-normal leading-none text-typo-soft tb:hidden">
                                        Company
                                    </TableHead>
                                    <TableHead className="py-3 pl-0 pr-0 text-xs font-normal leading-none text-typo-soft tb:hidden">
                                        Founding Year
                                    </TableHead>
                                    <TableHead className="py-3 pl-0 pr-0 text-xs font-normal leading-none text-typo-soft">
                                        Status
                                    </TableHead>
                                    <TableHead className="py-3 pl-0 pr-0" />
                                </TableRow>
                            </TableHeader>
                            <TableBody className="block">
                                {isLoading ? (
                                    <DistilleryListingSkeleton />
                                ) : filteredDistilleries.length === 0 ? (
                                    <TableRow className="block border-b-0 hover:bg-transparent">
                                        <TableCell className="flex h-32 items-center justify-center p-0 text-center text-sm text-typo-soft">
                                            {searchQuery
                                                ? "No distilleries found matching your search"
                                                : "No distilleries available"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDistilleries.map((item) => {
                                        const isActive =
                                            item.status === "active";

                                        return (
                                            <TableRow
                                                key={item.id}
                                                className={cn(
                                                    "grid w-full cursor-pointer items-center gap-4 py-4 transition-colors hover:bg-bg-sf4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bd-brown-lighter",
                                                    GRID_COLS
                                                )}
                                                onClick={() => handleEdit(item)}
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === "Enter" ||
                                                        event.key === " "
                                                    ) {
                                                        event.preventDefault();
                                                        handleEdit(item);
                                                    }
                                                }}
                                                role="link"
                                                tabIndex={0}
                                                aria-label={`Edit ${item.name}`}
                                            >
                                                <TableCell className="min-w-0 p-0">
                                                    <p className="truncate text-sm font-semibold leading-normal text-typo-primary">
                                                        {item.name}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="min-w-0 truncate p-0 text-sm font-normal leading-normal text-typo-primary mb:hidden">
                                                    {[item.country, item.region]
                                                        .filter(Boolean)
                                                        .join(", ") || "-"}
                                                </TableCell>
                                                <TableCell className="min-w-0 truncate p-0 text-sm font-normal leading-normal text-typo-primary tb:hidden">
                                                    {item.company || "-"}
                                                </TableCell>
                                                <TableCell className="p-0 text-sm font-normal tabular-nums leading-normal text-typo-primary tb:hidden">
                                                    {item.establishedYear ||
                                                        "-"}
                                                </TableCell>
                                                <TableCell className="p-0">
                                                    <Badge
                                                        variant={
                                                            isActive
                                                                ? EBadgeVariant.SUCCESS
                                                                : EBadgeVariant.STATIC
                                                        }
                                                        className={cn(
                                                            "h-5 rounded-full px-2 py-0 text-xs font-semibold capitalize leading-none",
                                                            isActive
                                                                ? "bg-bg-sf3 text-success"
                                                                : "bg-bg-sf3 text-typo-primary"
                                                        )}
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="flex items-center justify-end gap-1 p-0">
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleDelete(
                                                                item.id,
                                                                item.name
                                                            );
                                                        }}
                                                        onKeyDown={(event) =>
                                                            event.stopPropagation()
                                                        }
                                                        className="flex size-9 touch-manipulation items-center justify-center text-icon-main transition-colors hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bd-brown-lighter"
                                                        aria-label={`Delete ${item.name}`}
                                                    >
                                                        <span
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        >
                                                            <IconTrash />
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onMouseEnter={() => {
                                                            router.prefetch(
                                                                `${ROUTE_DASHBOARD.DISTILLERY}/${item.id}`
                                                            );
                                                        }}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleEdit(item);
                                                        }}
                                                        onKeyDown={(event) =>
                                                            event.stopPropagation()
                                                        }
                                                        className="flex size-9 touch-manipulation items-center justify-center text-icon-main transition-colors hover:text-typo-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bd-brown-lighter"
                                                        aria-label={`Edit ${item.name}`}
                                                    >
                                                        <span
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        >
                                                            <IconEdit />
                                                        </span>
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {!isLoading && filteredDistilleries.length > 0 && (
                    <PaginationBar
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                        showTextDetails
                        detailsLabel="distilleries"
                        pageParams={page}
                        sizeParams={pageSize}
                        totalRecords={totalRecords}
                        currentCount={filteredDistilleries.length}
                        size={pageSize}
                        changeParams="page"
                        keyRefetch={
                            PATH_DISTILLERIES + "," + DISTILLERY_KEYS.LISTING
                        }
                        baseFilters={{
                            size: pageSize,
                            search: debouncedSearch,
                        }}
                        prefetchFn={(filters) =>
                            distilleriesServices.getDistilleriesListing(
                                `page=${filters.page}&size=${filters.size}${
                                    filters.search
                                        ? `&search=${encodeURIComponent(String(filters.search))}`
                                        : ""
                                }`
                            )
                        }
                        className="mb-0 border-t pt-8"
                        visibleItems={5}
                    />
                )}
            </div>
        </div>
    );
}

const DistilleryListingSkeleton = () => {
    const skeletonRows = Array.from({ length: 20 });

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
                        <Skeleton className="h-4 w-16 rounded-none" />
                    </TableCell>
                    <TableCell className="p-0">
                        <Skeleton className="h-5 w-14 rounded-none" />
                    </TableCell>
                    <TableCell className="p-0">
                        <div className="flex items-center justify-end gap-1">
                            <Skeleton className="size-9 rounded-none" />
                            <Skeleton className="size-9 rounded-none" />
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
};
