"use client";

import MarketActivities from "@/components/shared/market-activities";
import ReleaseCalendar from "@/components/shared/release-calendar";
import Watchlist from "@/components/shared/watchlist";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const HomeSidebar = () => {
    return (
        <div className="relative col-start-13 -col-end-1 tb:hidden">
            <div className="sticky top-[calc(var(--height-header))] -mr-[var(--padding-container)] min-h-screen overflow-x-hidden border-l border-bd-main bg-bg-main pr-[var(--padding-container)] transition-all ease-in-out header-hidden:top-0">
                <ScrollArea className="max-h-[calc(100vh-var(--height-header))] header-hidden:max-h-[calc(100vh)]">
                    <div className="flex flex-col gap-10 py-10">
                        <Watchlist />
                        <MarketActivities />
                        <ReleaseCalendar />
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default HomeSidebar;

export function HomeSidebarSkeleton() {
    return (
        <div className="relative col-start-13 -col-end-1 tb:hidden">
            <div className="sticky top-[var(--height-header)] flex h-[calc(100vh-var(--height-header))] flex-col gap-10 border-l border-bd-brown bg-bg-main px-2.5 py-10">
                <div className="flex flex-col gap-4 px-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-40 w-full" />
                </div>
                <div className="flex flex-col gap-4 px-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-60 w-full" />
                </div>
                <div className="flex flex-col gap-4 px-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        </div>
    );
}
