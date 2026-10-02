import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { KEY_MARKET_DATA } from "@/lib/constants/key";
import { cn } from "@/lib/utils";
import { marketDataViewService } from "@/services/market-data-view";
import { useBoundStore } from "@/store";
import { caskMaster } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useMemo, useCallback } from "react";
import GeneralInfo from "./general-info";
import MarketDataSidebar from "./market-data-sidebar";
import VintageSelector from "./vintage-selector";
import useResponsive from "@/hooks/useResponsive";
import { Button } from "@/components/ui/button";

const noop = () => undefined;

export default function ContentDetail({
    className,
    id,
    activeId: propActiveId,
    onActiveIdChange,
    caskMasterDetails,
    caskActive,
    isCaskLoading,
}: {
    className?: string;
    id: string;
    activeId?: string;
    onActiveIdChange?: (id: string) => void;
    caskMasterDetails?: caskMaster.TCaskMasterWithChildren;
    caskActive?: caskMaster.TCaskChild;
    isCaskLoading?: boolean;
}) {
    const { updateCaskActive } = useBoundStore();
    const { toggleSidebar, open: isOpenSidebar } = useSidebar();

    const router = useRouter();
    const pathname = usePathname();

    const activeId = propActiveId || caskMasterDetails?.children?.[0]?.id;

    const caskId = activeId || caskActive?.id;

    // Market data (kept alive for existing logic consumers)
    const marketDataQuery = useQuery({
        queryKey: [KEY_MARKET_DATA.MARKET_DATA, caskId],
        queryFn: () => {
            if (!caskId) return Promise.reject(new Error("No cask ID"));
            return marketDataViewService.getCaskMarketDataView(caskId);
        },
        enabled: !!caskId,
        staleTime: 30000,
    });

    const marketData = marketDataQuery.data?.marketData;
    // Specs
    const rla = caskActive?.rla
        ? String(caskActive.rla).toLowerCase().includes("litre")
            ? String(caskActive.rla)
            : `${caskActive.rla} Litres`
        : null;

    const abv = caskActive?.abv
        ? String(caskActive.abv).includes("%")
            ? String(caskActive.abv)
            : `${caskActive.abv}%`
        : null;

    const ola = caskActive?.ola
        ? String(caskActive.ola).toLowerCase().includes("litre")
            ? String(caskActive.ola)
            : `${caskActive.ola} Litres`
        : null;

    const bottles = caskActive?.estimatedBottleCount
        ? String(caskActive.estimatedBottleCount)
        : null;

    const bottleVolume =
        caskActive?.bottleVolume && Number(caskActive.bottleVolume) > 0
            ? String(caskActive.bottleVolume).toLowerCase().includes("ml")
                ? String(caskActive.bottleVolume)
                : `${caskActive.bottleVolume}ml`
            : null;

    const vintages = useMemo(
        () =>
            (
                (
                    caskMasterDetails as
                        caskMaster.TCaskMasterWithChildren | undefined
                )?.children ?? []
            )
                .filter((child) => child.vintageYear != null)
                .map((child) => ({
                    id: String(child.id),
                    year: child.vintageYear as number | string,
                    isActive: String(child.id) === String(activeId),
                })),
        [caskMasterDetails, activeId]
    );

    const handleVintageClick = useCallback(
        (vintageId: string) => {
            const selected = (caskMasterDetails?.children ?? []).find(
                (c) => String(c.id) === String(vintageId)
            );
            if (selected) {
                updateCaskActive(selected as caskMaster.TCaskChild);
            }
            if (onActiveIdChange) {
                onActiveIdChange(vintageId);
            }
            router.push(`${pathname}?active=${vintageId}`, { scroll: false });
        },
        [
            caskMasterDetails,
            updateCaskActive,
            onActiveIdChange,
            router,
            pathname,
        ]
    );

    const { isTablet, isMobile, isDesktop } = useResponsive();
    const [activeTab, setActiveTab] = useState<"info" | "market">("info");

    const isMarketLoading = marketDataQuery.isFetching;

    return (
        <div className={cn("relative flex w-full flex-col", className)}>
            <VintageSelector
                vintages={vintages}
                onVintageClick={handleVintageClick}
            />

            <div
                className={cn(
                    "relative flex w-full flex-1 flex-col transition-all duration-300",
                    "w-auto tb:-mx-[var(--padding-container)] tb:gap-4 tb:bg-[#1B0D03]/[0.04] tb:p-4 tb:px-4 tb:py-4 tb:mb:px-4",
                    "dk:-mx-[var(--padding-container)] dk:flex-row dk:gap-0 dk:bg-bg-sf4 dk:pl-6 dk:contain-paint",
                    "mb:gap-4",
                    isOpenSidebar
                        ? ""
                        : "dk:-ml-[var(--padding-container)] dk:w-auto dk:pr-[var(--padding-container)]"
                )}
            >
                <div className="flex w-max flex-row gap-1 rounded-none bg-transparent p-0 dk:hidden">
                    <Button
                        variant="tab"
                        className={cn(
                            "h-[30px] rounded-none px-3 py-1.5 text-sm font-semibold transition-all",
                            activeTab === "info"
                                ? "bg-bg-dark-main text-[#FFFCF6]"
                                : "bg-[#1B0D03]/[0.08] text-typo-soft hover:bg-[#1B0D03]/[0.12] hover:text-typo-primary"
                        )}
                        onClick={() => setActiveTab("info")}
                    >
                        General Information
                    </Button>
                    <Button
                        variant="tab"
                        size="tab"
                        className={cn(
                            "h-[30px] rounded-none px-3 py-1.5 text-sm font-semibold transition-all",
                            activeTab === "market"
                                ? "bg-bg-dark-main text-[#FFFCF6]"
                                : "bg-[#1B0D03]/[0.08] text-typo-soft hover:bg-[#1B0D03]/[0.12] hover:text-typo-primary"
                        )}
                        onClick={() => setActiveTab("market")}
                    >
                        Market Data
                    </Button>
                </div>

                {/* General Info block */}
                <div
                    className={cn(
                        "w-full dk:block dk:flex-1",
                        activeTab !== "info" && "tb:hidden"
                    )}
                >
                    <GeneralInfo
                        isOpenSidebar={isDesktop ? isOpenSidebar : false}
                        toggleSidebar={
                            isDesktop
                                ? toggleSidebar
                                : () => setActiveTab("market")
                        }
                        isCaskLoading={Boolean(isCaskLoading)}
                        rla={rla}
                        abv={abv}
                        ola={ola}
                        bottles={bottles}
                        bottleVolume={bottleVolume}
                        summary={caskActive?.description}
                        tastingNotes={caskActive?.tastingNotes}
                    />
                </div>

                {/* Market Data block */}
                <div
                    className={cn(
                        "w-full dk:block dk:transition-[width,opacity] dk:duration-300 dk:ease-out",
                        isOpenSidebar
                            ? "dk:w-1/2 dk:opacity-100"
                            : "dk:pointer-events-none dk:w-0 dk:opacity-0",
                        activeTab !== "market" && "tb:hidden"
                    )}
                >
                    <MarketDataSidebar
                        isOpen={isOpenSidebar}
                        isLoading={isMarketLoading || Boolean(isCaskLoading)}
                        marketData={marketData}
                    />
                </div>
            </div>
        </div>
    );
}

export const ContentDetailSkeleton = ({
    className,
}: {
    className?: string;
}) => {
    return (
        <div
            className={cn("relative flex w-full flex-col", className)}
            aria-hidden="true"
            inert
        >
            <div className="-ml-[var(--padding-container)] -mr-[var(--padding-container)] flex h-10 border-b border-bd-main bg-bg-main">
                <div className="flex h-10 w-36 shrink-0 items-center border-r border-bd-main px-6 tb:px-5 mb:px-4">
                    <Skeleton className="h-3 w-24 bg-bd-main/70" />
                </div>
                <div className="flex h-10 flex-1">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex h-10 w-20 items-center justify-center border-r border-bd-main"
                        >
                            <Skeleton className="h-3 w-10 bg-bd-main/70" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative flex w-full flex-col dk:-mx-[var(--padding-container)] dk:flex-row dk:bg-bg-sf4 dk:pl-6 tb:-mx-[var(--padding-container)] tb:gap-4 tb:bg-bg-sf4 tb:p-4">
                <div className="flex w-max gap-1 dk:hidden">
                    <Skeleton className="h-[1.875rem] w-36 bg-bd-main/70" />
                    <Skeleton className="h-[1.875rem] w-28 bg-bd-main/70" />
                </div>

                <div className="w-full dk:flex-1">
                    <GeneralInfo
                        isOpenSidebar={false}
                        toggleSidebar={noop}
                        isCaskLoading
                        rla={null}
                        abv={null}
                        ola={null}
                        bottles={null}
                        bottleVolume={null}
                        tastingNotes={null}
                    />
                </div>
            </div>
        </div>
    );
};
