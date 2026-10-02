import { Skeleton } from "@/components/ui/skeleton";

export const ConfirmBidSkeleton = () => (
    <div className="mb-6 flex h-full flex-col gap-5 tb:mb-5 mb:mb-4 mb:mt-1 mb:gap-4">
        <div className="grid grid-cols-10 items-center gap-5 border-b py-3 tb:grid-cols-12 mb:grid-cols-4 mb:!gap-y-0 mb:pb-4">
            <div className="col-span-5 flex items-center gap-4 tb:col-span-6 mb:col-span-full mb:gap-2.5">
                <Skeleton className="size-[3.75rem] shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex items-center gap-1">
                        <Skeleton className="h-3.5 w-14" />
                        <Skeleton className="h-3.5 w-10" />
                    </div>
                </div>
            </div>

            <div className="col-span-5 grid grid-cols-3 gap-4 tb:col-span-6 mb:col-span-full mb:mt-4 mb:grid-cols-1 mb:gap-1.5">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-end gap-1.5 mb:flex-row mb:items-center mb:justify-between"
                    >
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                ))}
            </div>
        </div>

        <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-2 mb:grid-cols-1">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-3 w-72 max-w-full" />
        </div>
    </div>
);
