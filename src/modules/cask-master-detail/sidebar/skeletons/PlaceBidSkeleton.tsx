import { Skeleton } from "@/components/ui/skeleton";

export const PlaceBidSkeleton = () => (
    <div className="flex flex-col mb:pb-0 mb:pt-4">
        <div className="grid grid-cols-10 items-center gap-5 py-3 tb:grid-cols-12 tb:gap-x-3 mb:grid-cols-4 mb:!gap-y-0 mb:pb-4 mb:pt-0">
            <div className="col-span-6 flex items-center gap-4 tb:col-span-7 mb:col-span-full mb:gap-2.5">
                <Skeleton className="size-[3.75rem] shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex items-center gap-1">
                        <Skeleton className="h-3.5 w-14" />
                        <Skeleton className="h-3.5 w-10" />
                    </div>
                </div>
            </div>

            <div className="col-span-2 ml-auto flex w-max flex-col gap-1.5 tb:col-span-2 tb:ml-0 tb:w-full mb:col-span-full mb:mt-4 mb:flex-row mb:items-center mb:justify-between mb:gap-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-24" />
            </div>

            <div className="col-span-2 flex justify-end tb:col-span-3 mb:col-span-full mb:mt-2 mb:w-full">
                <Skeleton className="h-10 w-[8.1875rem] mb:w-full" />
            </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-bd-main pt-5 mb:pt-4">
            <Skeleton className="h-5 w-36" />

            <div className="grid grid-cols-3 gap-2 mb:flex mb:overflow-hidden">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-20 w-full mb:min-w-40" />
                ))}
            </div>

            <div className="flex flex-col gap-1.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-bd-main pb-6 pt-5 mb:mt-4 mb:pb-4 mb:pt-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-[1.875rem] w-24" />
        </div>
    </div>
);
