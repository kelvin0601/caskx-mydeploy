"use client";

import ImagePlaceholder from "@/components/shared/image-placeholder";
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
import { PATH_CLASSIFICATION, PATH_META_DATA_CASK } from "@/lib/constants/path";
import { cn, formatDateTime, getErrorMessage } from "@/lib/utils";
import classificationsServices from "@/services/classifications";
import { classification } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ClassificationDialog, {
    ClassificationSubmitValues,
} from "./classification-dialog";

const GRID_COLS =
    "grid-cols-[minmax(0,0.45fr)_minmax(0,1.4fr)_minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,0.25fr)] tb:grid-cols-[minmax(0,0.5fr)_minmax(0,1.5fr)_minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,0.25fr)] mb:grid-cols-[minmax(0,0.5fr)_minmax(0,4fr)_minmax(0,0.5fr)]";

const QUERY_KEY = [PATH_META_DATA_CASK, PATH_CLASSIFICATION];

type ListingClassificationModuleProps = {
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    createRequest?: number;
};

export default function ListingClassificationModule({
    searchQuery: externalSearchQuery,
    onSearchChange,
    createRequest = 0,
}: ListingClassificationModuleProps = {}) {
    const [internalSearchQuery, setInternalSearchQuery] = useState("");
    const searchQuery = externalSearchQuery ?? internalSearchQuery;
    const [page, setPage] = useState(1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [selectedClassification, setSelectedClassification] =
        useState<classification.TClassification | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const pageSize = 10;
    const queryClient = useQueryClient();
    const debouncedSearch = useDebounce(searchQuery.trim(), 400);

    // Fetch all classifications via /api/cask-metadata/classifications
    const { data, isLoading, isFetching, isError, error } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => classificationsServices.getClassification(),
    });

    const isSearching = searchQuery.trim() !== debouncedSearch;
    const isTableLoading = isLoading || isFetching || isSearching;

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: classification.TClassificationCreateInput) =>
            classificationsServices.createClassification(data),
        onSuccess: () => {
            toast.success("Classification created successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            toast.error(
                getErrorMessage(error, "Failed to create classification")
            );
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: classification.TClassificationUpdateInput;
        }) => classificationsServices.updateClassification(id, data),
        onSuccess: () => {
            toast.success("Classification updated successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            toast.error(
                getErrorMessage(error, "Failed to update classification")
            );
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) =>
            classificationsServices.deleteClassification(id),
        onSuccess: () => {
            toast.success("Classification deleted successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            toast.error(
                getErrorMessage(error, "Failed to delete classification")
            );
        },
    });

    // Client-side search filter
    const filteredClassifications = useMemo(() => {
        let result = data?.classifications ?? [];

        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            result = result.filter(
                (item) =>
                    item.label.toLowerCase().includes(searchLower) ||
                    item.description?.toLowerCase().includes(searchLower) ||
                    item.value.toLowerCase().includes(searchLower)
            );
        }

        return result;
    }, [data?.classifications, debouncedSearch]);

    // Client-side pagination
    const totalRecords = filteredClassifications.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const paginatedClassifications = useMemo(() => {
        const startIndex = (page - 1) * pageSize;
        return filteredClassifications.slice(startIndex, startIndex + pageSize);
    }, [filteredClassifications, page, pageSize]);

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const handleSearchChange = useCallback(
        (value: string) => {
            if (onSearchChange) {
                onSearchChange(value);
            } else {
                setInternalSearchQuery(value);
            }
        },
        [onSearchChange]
    );

    const handleDelete = async (id: string, name: string) => {
        setPendingDelete({ id, name });
        setConfirmOpen(true);
    };

    const handleEdit = (item: classification.TClassification) => {
        setSelectedClassification(item);
        setDialogMode("edit");
        setDialogOpen(true);
    };

    const handleAddClassification = useCallback(() => {
        setSelectedClassification(null);
        setDialogMode("add");
        setDialogOpen(true);
    }, []);

    const handledCreateRequest = useRef(createRequest);
    useEffect(() => {
        if (createRequest === handledCreateRequest.current) return;
        handledCreateRequest.current = createRequest;
        handleAddClassification();
    }, [createRequest, handleAddClassification]);

    const handleSaveClassification = async (
        values: ClassificationSubmitValues
    ) => {
        try {
            const { image, ...classificationData } = values;
            const payload =
                image instanceof File
                    ? { ...classificationData, image }
                    : classificationData;

            if (dialogMode === "add") {
                await createMutation.mutateAsync(payload);
            } else if (selectedClassification) {
                await updateMutation.mutateAsync({
                    id: selectedClassification.id,
                    data: payload,
                });
            }
            setDialogOpen(false);
            setSelectedClassification(null);
        } catch (error) {
            console.error("Error saving classification:", error);
            throw error;
        }
    };

    if (isError) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-destructive">
                    {getErrorMessage(error, "Failed to load classifications")}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="flex min-w-0 flex-1 flex-col">
                <Table className="block w-full table-fixed border-b">
                    <TableHeader className="block w-full">
                        <TableRow
                            className={cn(
                                "grid w-full items-center gap-4 border-b border-t border-bd-main mb:gap-3",
                                GRID_COLS
                            )}
                        >
                            <TableHead className="flex items-center gap-1 p-0 py-3">
                                <span className="text-xs font-normal text-typo-sub mb:text-[0.6875rem]">
                                    Image
                                </span>
                            </TableHead>
                            <TableHead className="flex items-center gap-1 p-0 py-3">
                                <span className="text-xs font-normal text-typo-sub mb:text-[0.6875rem]">
                                    Name
                                </span>
                            </TableHead>
                            <TableHead className="flex items-center gap-1 p-0 py-3 mb:hidden">
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
                            <ClassificationListingSkeleton />
                        ) : paginatedClassifications.length === 0 ? (
                            <TableRow className="grid w-full justify-center py-12">
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-sm text-typo-soft"
                                >
                                    {searchQuery
                                        ? "No classifications found matching your search"
                                        : "No classifications available"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedClassifications.map((item) => (
                                <TableRow
                                    key={item.id || item.value}
                                    className={cn(
                                        "grid w-full items-center gap-4 border-b border-bd-main py-2 last:border-b-0 hover:bg-bg-sf1 mb:gap-3",
                                        GRID_COLS
                                    )}
                                >
                                    <TableCell className="min-w-0 overflow-hidden p-0">
                                        <div className="flex-center relative aspect-square w-full max-w-12 overflow-hidden mb:max-w-10">
                                            <ImagePlaceholder
                                                src={item.imageUrl!}
                                                alt={item.label}
                                                width={48}
                                                height={48}
                                                className="size-full object-cover"
                                                unoptimized
                                                typePlaceholder="classification"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="min-w-0 overflow-hidden p-0">
                                        <span className="block min-w-0 truncate text-sm font-semibold text-typo-primary mb:text-[0.8125rem] mb:leading-snug">
                                            {item.label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="min-w-0 p-0 mb:hidden">
                                        <span className="line-clamp-2 text-sm text-typo-primary">
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
                                    <TableCell className="justify-self-end p-0">
                                        <Select
                                            value=""
                                            onValueChange={(val) => {
                                                if (val === "edit")
                                                    handleEdit(item);
                                                if (val === "delete")
                                                    handleDelete(
                                                        item.id,
                                                        item.label
                                                    );
                                            }}
                                        >
                                            <SelectTrigger
                                                variant="button"
                                                inputSize="md"
                                                className="flex size-9 touch-manipulation items-center justify-center rounded-md border-none bg-transparent px-0 transition-colors hover:bg-bg-sf2 focus-visible:ring-2 focus-visible:ring-bd-brown-lighter mb:size-10"
                                                hideCaret
                                                aria-label={`Actions for ${item.label}`}
                                            >
                                                <MoreHorizontal
                                                    className="size-4 text-typo-sub"
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
                                                    className="cursor-pointer border-b border-bd-main px-0 py-3 text-sm font-medium text-typo-primary"
                                                >
                                                    Edit
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
                {!isLoading && paginatedClassifications.length > 0 && (
                    <PaginationBar
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                        showTextDetails
                        pageParams={page}
                        sizeParams={pageSize}
                        totalRecords={totalRecords}
                        currentCount={paginatedClassifications.length}
                        size={pageSize}
                        changeParams="page"
                        keyRefetch={QUERY_KEY.join(",")}
                        className="mb-0 pt-8 mb:pt-5"
                        visibleItems={5}
                    />
                )}
            </div>

            <ClassificationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                classification={selectedClassification}
                onSave={handleSaveClassification}
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
                            Delete this Classification?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="w-full text-center text-sm font-normal leading-[1.5] text-typo-soft">
                            {pendingDelete
                                ? `Are you sure you want to delete "${pendingDelete.name}"?`
                                : "Are you sure you want to delete this classification?"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 w-full items-start gap-1">
                        <AlertDialogCancel
                            className="h-12 min-w-[9.375rem] flex-1 rounded-none border border-bd-main bg-transparent px-8 py-4 text-sm font-medium leading-none text-typo-primary outline-none hover:bg-transparent hover:text-typo-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typo-primary mb:min-w-0"
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-12 min-w-[9.375rem] flex-1 rounded-none border-0 !bg-bg-dark-main px-8 py-4 text-sm font-medium leading-none !text-typo-dark-primary outline-none hover:!bg-bg-dark-main focus-visible:!bg-bg-dark-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typo-primary mb:min-w-0"
                            disabled={deleteMutation.isPending}
                            onClick={async () => {
                                if (!pendingDelete) return;
                                try {
                                    await deleteMutation.mutateAsync(
                                        pendingDelete.id
                                    );
                                    setConfirmOpen(false);
                                    setPendingDelete(null);
                                } catch {
                                    // error toast handled in mutation onError
                                }
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

const ClassificationListingSkeleton = () => {
    const skeletonRows = Array.from({ length: 12 });

    return (
        <>
            {skeletonRows.map((_, index) => (
                <TableRow
                    key={index}
                    className={cn(
                        "grid w-full items-center gap-4 py-2 hover:bg-transparent mb:gap-3",
                        GRID_COLS
                    )}
                >
                    <TableCell className="min-w-0 overflow-hidden p-0">
                        <Skeleton className="aspect-square w-full max-w-12 rounded-sm mb:max-w-10" />
                    </TableCell>
                    <TableCell className="min-w-0 overflow-hidden p-0">
                        <Skeleton className="h-4 w-3/4 rounded-none" />
                    </TableCell>
                    <TableCell className="p-0 mb:hidden">
                        <Skeleton className="h-4 w-full rounded-none" />
                    </TableCell>
                    <TableCell className="p-0 mb:hidden">
                        <Skeleton className="h-4 w-28 rounded-none" />
                    </TableCell>
                    <TableCell className="justify-self-end p-0">
                        <Skeleton className="size-9 rounded-none mb:size-10" />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
};
