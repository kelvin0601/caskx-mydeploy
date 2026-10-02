import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmOrderHeaderSkeleton } from "./ConfirmOrderHeaderSkeleton";

export const ConfirmBuyNowContentSkeleton = () => (
    <div className="flex flex-col gap-5 mb:gap-4">
        <div className="flex flex-col gap-2 border-b border-bd-main pb-5">
            <div className="flex h-5 items-center justify-between">
                <Skeleton className="h-4 w-36" />
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

        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-[1.125rem] w-24" />
            </div>
            <Skeleton className="h-3 w-40" />
        </div>
    </div>
);

export const ConfirmBuyNowSkeleton = () => (
    <div className="mb-6 flex flex-col gap-5 tb:mb-5 mb:mb-4 mb:gap-4">
        <ConfirmOrderHeaderSkeleton />
        <ConfirmBuyNowContentSkeleton />
    </div>
);
