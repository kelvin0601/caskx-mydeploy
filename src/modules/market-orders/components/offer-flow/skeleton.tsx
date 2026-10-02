import { Skeleton } from "@/components/ui/skeleton";

export default function OfferConfirmationSkeleton() {
    return (
        <div className="mb-6 flex h-full flex-col gap-5 tb:mb-5 mb:mb-4 mb:mt-1 mb:gap-4">
            <div className="grid grid-cols-10 items-center gap-5 border-b py-3 tb:grid-cols-12 mb:grid-cols-4 mb:pb-4">
                <Skeleton className="col-span-5 h-[3.75rem] tb:col-span-6 mb:col-span-full" />
                <div className="col-span-5 grid grid-cols-3 gap-4 tb:col-span-6 mb:col-span-full">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-10 w-full" />
                    ))}
                </div>
            </div>
            <Skeleton className="h-5 w-36" />
            <div className="grid grid-cols-2 gap-2 mb:grid-cols-1">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    );
}
