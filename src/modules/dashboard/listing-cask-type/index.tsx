"use client";

import PaginationBar from "@/components/shared/pagination-bar";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
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
import { useDebounce } from "@/hooks/useDebounce";
import { FILTER_KEYS } from "@/lib/constants";
import { PATH_CASKS, PATH_FILTER_OPTIONS } from "@/lib/constants/path";
import { cn, formatDateTime, getErrorMessage } from "@/lib/utils";
import caskService from "@/services/cask";
import caskTypesServices from "@/services/cask-types";
import { cask } from "@/types/cask";
import { caskType } from "@/types/cask-type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import CaskTypeDialog, { CaskTypeFormValues } from "./cask-type-dialog";

const GRID_COLS =
    "grid-cols-[minmax(0,1.55fr)_minmax(0,0.95fr)_minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,0.25fr)] tb:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,0.25fr)] mb:grid-cols-[minmax(0,1fr)_minmax(0,0.28fr)]";

const QUERY_KEY = [PATH_CASKS, PATH_FILTER_OPTIONS, FILTER_KEYS.CASK_TYPE];

type ListingCaskTypeModuleProps = {
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    createRequest?: number;
};

export default function ListingCaskTypeModule({
    searchQuery: externalSearchQuery,
    createRequest = 0,
}: ListingCaskTypeModuleProps = {}) {
    const [internalSearchQuery, setInternalSearchQuery] = useState("");

    const searchQuery = externalSearchQuery ?? internalSearchQuery;

    const [page, setPage] = useState(1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [selectedCaskType, setSelectedCaskType] =
        useState<caskType.TCaskType | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const pageSize = 10;
    const queryClient = useQueryClient();
    const debouncedSearch = useDebounce(searchQuery.trim(), 400);

    // Fetch all cask types via the existing filter-options endpoint
    const { data, isLoading, isFetching, isError, error } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => caskService.getCaskTypes(""),
    });

    const isSearching = searchQuery.trim() !== debouncedSearch;
    const isTableLoading = isLoading || isFetching || isSearching;

    const createMutation = useMutation({
        mutationFn: (data: caskType.TCaskTypeCreateInput) =>
            caskTypesServices.createCaskType(data),
        onSuccess: () => {
            toast.success("Cask type created successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to create cask type"));
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: caskType.TCaskTypeUpdateInput;
        }) => caskTypesServices.updateCaskType(id, data),
        onSuccess: () => {
            toast.success("Cask type updated successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to update cask type"));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => caskTypesServices.deleteCaskType(id),
        onSuccess: () => {
            toast.success("Cask type deleted successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to delete cask type"));
        },
    });

    // Client-side search filter
    const filteredCaskTypes = useMemo(() => {
        let result = data?.caskTypes ?? [];

        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            result = result.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchLower) ||
                    item.description?.toLowerCase().includes(searchLower)
            );
        }

        return result;
    }, [data?.caskTypes, debouncedSearch]);

    // Client-side pagination
    const totalRecords = filteredCaskTypes.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const paginatedCaskTypes = useMemo(() => {
        const startIndex = (page - 1) * pageSize;
        return filteredCaskTypes.slice(startIndex, startIndex + pageSize);
    }, [filteredCaskTypes, page, pageSize]);

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const handleAdd = useCallback(() => {
        setSelectedCaskType(null);
        setDialogMode("add");
        setDialogOpen(true);
    }, []);

    const handledCreateRequest = useRef(createRequest);
    useEffect(() => {
        if (createRequest === handledCreateRequest.current) return;
        handledCreateRequest.current = createRequest;
        handleAdd();
    }, [createRequest, handleAdd]);

    const handleEdit = (item: cask.TCaskType & { count: number }) => {
        const mapped: caskType.TCaskType = {
            id: item.id,
            name: item.name,
            typicalCapacityLiters: item.typicalCapacityLiters,
            description: item.description ?? undefined,
            count: item.count,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
        setSelectedCaskType(mapped);
        setDialogMode("edit");
        setDialogOpen(true);
    };

    const handleDelete = (item: cask.TCaskType & { count: number }) => {
        setPendingDelete({ id: String(item.id), name: item.name });
        setConfirmOpen(true);
    };

    const handleSave = async (formData: CaskTypeFormValues) => {
        if (dialogMode === "add") {
            await createMutation.mutateAsync(formData);
        } else if (selectedCaskType) {
            await updateMutation.mutateAsync({
                id: String(selectedCaskType.id),
                data: formData,
            });
        }
    };

    if (isError) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-destructive">
                    {getErrorMessage(error, "Failed to load cask types")}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Table */}
                <Table className="block w-full table-fixed border-b">
                    <TableHeader className="block w-full">
                        <TableRow
                            className={cn(
                                "grid w-full items-center gap-4 border-b border-t border-bd-main",
                                GRID_COLS
                            )}
                        >
                            <TableHead className="flex items-center gap-1 p-0 py-3">
                                <span className="text-xs font-normal text-typo-sub">
                                    Name
                                </span>
                            </TableHead>
                            <TableHead className="flex items-center gap-1 p-0 py-3 mb:hidden">
                                <span className="text-xs font-normal text-typo-sub">
                                    Typical capacity liters
                                </span>
                            </TableHead>
                            <TableHead className="flex items-center gap-1 p-0 py-3 tb:hidden">
                                <span className="text-xs font-normal text-typo-sub">
                                    Description
                                </span>
                            </TableHead>

                            <TableHead className="flex items-center gap-1 p-0 py-3 mb:hidden">
                                <span className="text-xs font-normal text-typo-sub">
                                    Last updated
                                </span>
                            </TableHead>
                            <TableHead className="p-0 py-3">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="block w-full">
                        {isTableLoading ? (
                            <CaskTypeListingSkeleton />
                        ) : paginatedCaskTypes.length === 0 ? (
                            <TableRow className="grid w-full justify-center py-12">
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-sm text-typo-soft"
                                >
                                    No cask types found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedCaskTypes.map((item) => (
                                <TableRow
                                    key={item.id}
                                    className={cn(
                                        "grid w-full items-center gap-4 border-b border-bd-main py-4 last:border-b-0 hover:bg-bg-sf1 mb:gap-3 mb:py-3",
                                        GRID_COLS
                                    )}
                                >
                                    <TableCell className="min-w-0 p-0">
                                        <span className="block truncate text-sm font-semibold text-typo-primary mb:text-[0.8125rem]">
                                            {item.name}
                                        </span>
                                    </TableCell>
                                    <TableCell className="p-0 mb:hidden">
                                        <span className="text-sm text-typo-primary">
                                            {item.typicalCapacityLiters ?? "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="min-w-0 p-0 tb:hidden">
                                        <span className="line-clamp-1 text-sm text-typo-primary">
                                            {item.description || "-"}
                                        </span>
                                    </TableCell>

                                    <TableCell className="p-0 mb:hidden">
                                        <span className="text-sm font-medium text-typo-primary">
                                            {item.updatedAt
                                                ? (() => {
                                                      const dt = formatDateTime(
                                                          item.updatedAt
                                                      );
                                                      return (
                                                          <>
                                                              {
                                                                  dt.dataOnlyNumber
                                                              }{" "}
                                                              <span className="text-typo-sub">
                                                                  {
                                                                      dt.timeOnly24
                                                                  }
                                                              </span>
                                                          </>
                                                      );
                                                  })()
                                                : "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="p-0">
                                        <Select
                                            value=""
                                            onValueChange={(val) => {
                                                if (val === "edit")
                                                    handleEdit(item);
                                                if (val === "delete")
                                                    handleDelete(item);
                                            }}
                                        >
                                            <SelectTrigger
                                                variant="button"
                                                inputSize="md"
                                                className="flex size-9 touch-manipulation items-center justify-center rounded-md border-none bg-transparent px-0 text-center transition-colors hover:bg-bg-sf2 focus-visible:ring-2 focus-visible:ring-bd-brown-lighter"
                                                hideCaret
                                                aria-label={`Actions for ${item.name}`}
                                            >
                                                <MoreHorizontal
                                                    className="mx-auto size-4 text-typo-sub"
                                                    aria-hidden="true"
                                                />
                                            </SelectTrigger>
                                            <SelectContent
                                                align="end"
                                                className="w-[120px] border-bd-main bg-white-100 px-4 py-1 shadow-[0px_4px_6px_0px_rgba(15,0,0,0.1),0px_3px_8px_0px_rgba(23,0,0,0.1)]"
                                            >
                                                <SelectItem
                                                    value="hidden-empty"
                                                    className="hidden"
                                                />
                                                <SelectItem
                                                    value="edit"
                                                    className="flex cursor-pointer items-center border-b border-bd-main px-0 py-3 text-sm font-medium text-typo-primary"
                                                >
                                                    <div className="flex w-full items-center gap-3">
                                                        Edit
                                                    </div>
                                                </SelectItem>
                                                <SelectItem
                                                    value="delete"
                                                    className="cursor-pointer px-0 py-3 text-sm font-medium text-typo-sub"
                                                >
                                                    Delete
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {!isLoading && paginatedCaskTypes.length > 0 && (
                    <PaginationBar
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                        showTextDetails
                        pageParams={page}
                        sizeParams={pageSize}
                        totalRecords={totalRecords}
                        currentCount={paginatedCaskTypes.length}
                        size={pageSize}
                        changeParams="page"
                        keyRefetch={QUERY_KEY.join(",")}
                        className="mb-0 pt-8 mb:pt-5"
                        visibleItems={5}
                    />
                )}
            </div>

            <CaskTypeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                caskType={selectedCaskType}
                onSave={handleSave}
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
                            Delete this Cask type?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="w-full text-center text-sm font-normal leading-[1.5] text-typo-soft">
                            {pendingDelete
                                ? `Are you sure you want to delete "${pendingDelete.name}"?`
                                : "Are you sure you want to delete this cask type?"}
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
                            {deleteMutation.isPending
                                ? "Deleting..."
                                : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

const CaskTypeListingSkeleton = () => {
    const skeletonRows = Array.from({ length: 12 });
    return (
        <>
            {skeletonRows.map((_, index) => (
                <TableRow
                    key={index}
                    className={cn(
                        "grid w-full items-center gap-4 py-4 hover:bg-transparent mb:gap-3 mb:py-3",
                        GRID_COLS
                    )}
                >
                    <TableCell className="p-0">
                        <Skeleton className="h-4 w-3/4 rounded-none" />
                    </TableCell>
                    <TableCell className="p-0 mb:hidden">
                        <Skeleton className="h-4 w-10 rounded-none" />
                    </TableCell>
                    <TableCell className="p-0 tb:hidden">
                        <Skeleton className="h-4 w-full rounded-none" />
                    </TableCell>

                    <TableCell className="p-0 mb:hidden">
                        <Skeleton className="h-4 w-28 rounded-none" />
                    </TableCell>
                    <TableCell className="p-0">
                        <Skeleton className="size-9 rounded-none" />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
};
