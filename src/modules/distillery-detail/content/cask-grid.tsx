"use client";

import CaskCardItem, { CaskCardSkeleton } from "@/components/shared/cask-card";
import { cn } from "@/lib/utils";
import { caskMaster } from "@/types";
import PaginationBar from "@/components/shared/pagination-bar";
import { CASK_KEYS } from "@/lib/constants/key";

type TDistilleryCaskGridProps = {
    casks: caskMaster.TCaskMaster[];
    isLoading?: boolean;
    className?: string;
    // Pagination props
    page?: number;
    setPage?: (page: number) => void;
    totalPages?: number;
    totalRecords?: number;
    size?: number;
};

export default function DistilleryCaskGrid({
    casks,
    isLoading = false,
    className,
    page = 1,
    setPage,
    totalPages = 1,
    totalRecords = 0,
    size = 12,
}: TDistilleryCaskGridProps) {
    if (isLoading) {
        return (
            <div
                className={cn(
                    "grid grid-cols-3 gap-4 tb:grid-cols-2 tb:gap-3 mb:grid-cols-1 mb:gap-2",
                    className
                )}
            >
                {Array.from({ length: 6 }).map((_, i) => (
                    <CaskCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!casks || casks.length === 0) {
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center py-20",
                    className
                )}
            >
                <p className="text-typo-body text-sm">
                    No casks available for this distillery.
                </p>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-6 tb:gap-5 mb:gap-4", className)}>
            <div className="grid grid-cols-3 gap-4 tb:grid-cols-2 tb:gap-3 mb:grid-cols-1 mb:gap-2">
                {casks.map((cask, index) => (
                    <CaskCardItem
                        key={cask.id}
                        data={cask}
                        className="w-full"
                        isRevert={false}
                        index={index}
                    />
                ))}
            </div>

            {setPage && totalPages > 1 && (
                <PaginationBar
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                    pageParams={page}
                    sizeParams={size}
                    totalRecords={totalRecords}
                    currentCount={casks.length}
                    size={size}
                    keyRefetch={CASK_KEYS.GET_CASK}
                    changeParams=""
                />
            )}
        </div>
    );
}
