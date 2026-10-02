import { Skeleton } from "@/components/ui/skeleton";

export default function RouteLoading() {
    return (
        <main
            className="container flex min-h-[60vh] flex-col gap-6 py-8"
            aria-busy="true"
            aria-label="Loading page"
        >
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
            <div className="grid flex-1 grid-cols-12 gap-4 tb:grid-cols-6 mb:grid-cols-4">
                <Skeleton className="col-span-4 min-h-72 tb:col-span-6 mb:col-span-4" />
                <Skeleton className="col-span-8 min-h-72 tb:col-span-6 mb:col-span-4" />
            </div>
        </main>
    );
}
