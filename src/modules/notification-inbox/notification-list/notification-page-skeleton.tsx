import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationPageSkeleton() {
    return (
        <div className="-mt-2 flex flex-col divide-y divide-bd-main border-t border-bd-main">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="flex gap-4 px-4 py-6 tb:px-0 tb:py-5 mb:px-0 mb:py-4"
                >
                    <Skeleton className="h-10 w-10 shrink-0 rounded bg-bg-sf4" />
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                            <Skeleton className="h-5 w-1/3 bg-bg-sf4" />
                            <Skeleton className="h-3 w-16 bg-bg-sf4" />
                        </div>
                        <Skeleton className="h-4 w-3/4 bg-bg-sf4" />
                        <Skeleton className="h-4 w-1/2 bg-bg-sf4" />
                    </div>
                </div>
            ))}
        </div>
    );
}
