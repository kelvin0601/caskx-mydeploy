import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmOrderHeaderSkeleton } from "./ConfirmOrderHeaderSkeleton";

export const ConfirmSellNowCaseSkeleton = () => (
    <div className="flex min-h-32 flex-col gap-3">
        <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="size-5" />
        </div>
        <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-20" />
        </div>
        <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3.5 w-16" />
        </div>
    </div>
);

export const ConfirmSellNowPendingListingSkeleton = ({
    className = "",
}: {
    className?: string;
}) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        <Skeleton className="h-4 w-28" />

        <div className="flex flex-col gap-1.5">
            <div className="flex h-[1.3125rem] items-center justify-between">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-6" />
            </div>
            <div className="flex h-[1.875rem] items-center justify-between">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-[1.875rem] w-24" />
            </div>
        </div>

        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-2 gap-2 mb:grid-cols-1">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-3 w-[32rem] max-w-full" />
    </div>
);

export const ConfirmSellNowBreakdownSkeleton = ({
    showRemainingOption = false,
    showPendingListing = false,
}: {
    showRemainingOption?: boolean;
    showPendingListing?: boolean;
}) => (
    <>
        <div className="flex flex-col gap-2 border-b border-bd-main pb-5">
            <div className="flex h-5 items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="size-5" />
            </div>
            <div className="flex h-[1.3125rem] items-center justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-20" />
            </div>
            <div className="flex h-[1.3125rem] items-center justify-between">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3.5 w-16" />
            </div>
        </div>

        <div
            className={
                showRemainingOption
                    ? "flex min-h-[2.625rem] items-start justify-between border-b border-bd-main pb-5"
                    : "flex h-[1.375rem] items-center justify-between"
            }
        >
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-[1.125rem] w-24" />
        </div>

        {showRemainingOption && (
            <div className="flex flex-col">
                <div className="flex h-5 items-center gap-2">
                    <Skeleton className="size-3.5 shrink-0 rounded-none" />
                    <Skeleton className="h-3.5 w-72 max-w-[calc(100%-1.375rem)]" />
                </div>

                {showPendingListing && (
                    <ConfirmSellNowPendingListingSkeleton className="pt-2" />
                )}
            </div>
        )}
    </>
);

export const ConfirmSellNowSkeleton = () => (
    <div className="mb-6 flex flex-col gap-5 tb:mb-5 mb:mb-4 mb:gap-4">
        <ConfirmOrderHeaderSkeleton />
        <ConfirmSellNowCaseSkeleton />
    </div>
);
