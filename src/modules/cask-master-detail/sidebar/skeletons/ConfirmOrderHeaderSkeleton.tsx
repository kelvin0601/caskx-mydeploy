import { Skeleton } from "@/components/ui/skeleton";

export const ConfirmOrderHeaderSkeleton = () => (
    <div className="grid grid-cols-10 border-b border-bd-main py-3 tb:grid-cols-12 mb:grid-cols-4 mb:py-4">
        <div className="col-span-5 flex items-center gap-4 tb:col-span-6 mb:col-span-full mb:mb-4 mb:gap-2.5">
            <Skeleton className="size-[3.75rem] shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-48 max-w-full" />
                <div className="flex items-center gap-1">
                    <Skeleton className="h-3.5 w-14" />
                    <Skeleton className="h-3.5 w-10" />
                </div>
            </div>
        </div>

        <div className="col-span-5 grid grid-cols-3 gap-x-4 tb:col-span-6 mb:col-span-full mb:gap-y-1.5">
            {Array.from({ length: 3 }).map((_, index) => (
                <div
                    key={index}
                    className="col-span-1 flex flex-col items-end justify-center gap-1.5 mb:col-span-full mb:flex-row mb:items-center mb:justify-between"
                >
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-12" />
                </div>
            ))}
        </div>
    </div>
);
