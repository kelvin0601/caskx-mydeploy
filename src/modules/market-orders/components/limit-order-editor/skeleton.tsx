import { Skeleton } from "@/components/ui/skeleton";

export default function LimitOrderEditorSkeleton() {
    return (
        <div className="flex flex-col mb:pb-0 mb:pt-4">
            <div className="grid grid-cols-10 items-center gap-5 py-3 tb:grid-cols-12 tb:gap-x-3 mb:grid-cols-4 mb:gap-y-0 mb:pb-4 mb:pt-0">
                <div className="col-span-6 flex items-center gap-4 tb:col-span-7 mb:col-span-full mb:gap-2.5">
                    <Skeleton className="size-[3.75rem] shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3.5 w-20" />
                    </div>
                </div>
                <Skeleton className="col-span-2 h-10 tb:col-span-2 mb:col-span-full" />
                <Skeleton className="col-span-2 h-10 tb:col-span-3 mb:col-span-full" />
            </div>
            <div className="flex flex-col gap-3 border-t border-bd-main pt-5 mb:pt-4">
                <Skeleton className="h-5 w-36" />
                <div className="grid grid-cols-3 gap-2 mb:flex">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="h-20 w-full mb:min-w-40"
                        />
                    ))}
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[1.875rem] w-24 self-end" />
            </div>
        </div>
    );
}
