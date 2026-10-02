import { Skeleton } from "@/components/ui/skeleton";

export const SellNowSkeleton = () => (
    <div className="grid grid-cols-10 items-center gap-5 py-3 tb:grid-cols-12 mb:grid-cols-4 mb:!gap-y-0 mb:py-4">
        <div className="col-span-5 flex items-center gap-4 tb:col-span-6 mb:col-span-full mb:gap-2.5">
            <Skeleton className="size-[3.75rem] shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-48 max-w-full" />
                <div className="flex items-center gap-1">
                    <Skeleton className="h-3.5 w-14" />
                    <Skeleton className="h-3.5 w-10" />
                </div>
            </div>
        </div>

        <div className="col-span-2 flex flex-col gap-1.5 mb:col-span-full mb:mt-4 mb:flex-row mb:items-center mb:justify-between mb:gap-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-24" />
        </div>

        <div className="col-span-3 flex items-center gap-4 tb:col-span-4 mb:col-span-full mb:mt-1 mb:w-full mb:flex-col mb:gap-2">
            <div className="flex flex-1 flex-col gap-1.5 mb:w-full mb:flex-row mb:items-center mb:justify-between">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-5 w-6" />
            </div>
            <Skeleton className="h-10 w-[8.1875rem] shrink-0 mb:w-full" />
        </div>
    </div>
);
