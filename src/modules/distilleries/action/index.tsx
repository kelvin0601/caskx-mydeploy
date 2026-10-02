import IconChevonLeftDouble from "@/components/shared/icons/icon-chevon-left-double";
import IconFilterLines from "@/components/shared/icons/icon-filter-lines";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { AUTH_KEYS } from "@/lib/constants/key";
import { cn } from "@/lib/utils";
import useResponsive from "@/hooks/useResponsive";
import { useDistilleriesContext } from "../provider";
import Search from "../search";
import { SortFilter } from "../sort";
import { useState } from "react";

export default function ActionHeader() {
    const { setOpenMobile } = useSidebar();
    const { isMobile, isTablet } = useResponsive();
    const isMobileOrTablet = isMobile || isTablet;
    const { isSidebarCollapsed, toggleSidebar } = useDistilleriesContext();
    const [isOwnedByYou, setIsOwnedByYou] = useState(false);
    const [isBuyNowAvailable, setIsBuyNowAvailable] = useState(false);

    const { status } = useGetStateQuery({
        key: [AUTH_KEYS.WHOAMI],
    });

    if (status === "pending") {
        return <ActionHeaderSkeleton />;
    }

    return (
        <div
            className={cn(
                "flex w-full items-center justify-between border-bd-main py-4 pr-[var(--padding-container)] tb:w-auto tb:px-0 mb:flex-col mb:items-start mb:gap-4",
                isSidebarCollapsed ? "pl-[var(--padding-container)]" : "pl-6"
            )}
        >
            <div className="flex flex-row items-center gap-1 tb:w-full mb:w-full">
                <Button
                    onClick={() => {
                        if (isMobileOrTablet) {
                            setOpenMobile(true);
                        } else {
                            toggleSidebar();
                        }
                    }}
                    variant="outline"
                    size="icon"
                    className="flex h-12 w-12 min-w-0 shrink-0 border-bd-main p-2 tb:h-10 tb:w-10 tb:p-0"
                >
                    <IconFilterLines
                        className={cn(
                            "h-5 w-5 text-typo-primary",
                            !isMobileOrTablet && !isSidebarCollapsed
                                ? "hidden"
                                : "block"
                        )}
                    />
                    {!isMobileOrTablet && !isSidebarCollapsed && (
                        <IconChevonLeftDouble className="h-5 w-5 text-typo-primary" />
                    )}
                    <span className="sr-only">Toggle filters</span>
                </Button>
                <div className="h-12 w-[21.75rem] shrink-0 tb:h-10 tb:w-[15rem] mb:flex-1">
                    <Search
                        className="h-12 w-[21.75rem] !min-w-[15rem] border-none tb:h-10 tb:w-[15rem] mb:w-full mb:!min-w-0 tb:[&_input]:h-10 tb:[&_input]:bg-bg-sf4 tb:[&_input]:placeholder:text-typo-sub"
                        placeholder="Search for a distillery"
                    />
                </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-8 pl-4 tb:gap-4 mb:hidden mb:w-full mb:justify-start mb:gap-4 mb:pl-0">
                <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap font-inter text-sm font-normal text-typo-soft">
                        Sort by
                    </span>
                    <div className="w-[15.3125rem] tb:min-w-[14rem] tb:max-w-80 mb:hidden">
                        <SortFilter />
                    </div>
                </div>
            </div>
        </div>
    );
}

const ActionHeaderSkeleton = () => {
    const { isSidebarCollapsed } = useDistilleriesContext();
    return (
        <div
            className={cn(
                "flex w-full items-center justify-between border-t border-bd-main py-4 pr-[var(--padding-container)] tb:px-4 mb:flex-col mb:items-start mb:gap-4",
                isSidebarCollapsed
                    ? "pl-[var(--padding-container)] tb:pl-4 mb:px-0"
                    : "pl-6 tb:pl-4 mb:px-0"
            )}
        >
            <div className="flex items-center gap-1 tb:w-full mb:w-full">
                <Skeleton className="h-12 w-12 shrink-0 rounded-full bg-bg-sf3 tb:h-10 tb:w-10" />
                <Skeleton className="h-12 w-[21.75rem] shrink-0 bg-bg-sf3 tb:h-10 tb:w-[15rem] mb:flex-1" />
            </div>
            <div className="flex flex-1 items-center justify-end gap-8 pl-4 tb:gap-4 mb:hidden mb:w-full mb:justify-start mb:gap-4 mb:pl-0">
                <Skeleton className="hidden h-6 w-32 tb:h-5 tb:w-24" />
                <Skeleton className="hidden h-6 w-32 tb:h-5 tb:w-32" />
                <Skeleton className="h-12 w-[14rem] tb:hidden" />
            </div>
        </div>
    );
};
