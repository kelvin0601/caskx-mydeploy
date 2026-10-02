"use client";

import IconCalendar from "@/components/shared/icons/icon-calendar";
import IconList from "@/components/shared/icons/icon-list";
import IconTrending from "@/components/shared/icons/icon-trending";
import MarketActivities from "@/components/shared/market-activities";
import ReleaseCalendar from "@/components/shared/release-calendar";
import Watchlist from "@/components/shared/watchlist";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";

type TTab = "watchlist" | "market-activities" | "release-calendar";

const TABS: { id: TTab; label: string; icon: React.ComponentType }[] = [
    { id: "watchlist", label: "Watchlist", icon: IconList },
    { id: "market-activities", label: "Market Activities", icon: IconTrending },
    { id: "release-calendar", label: "Release Calendar", icon: IconCalendar },
];

export default function HomeSidebarTablet() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TTab>("watchlist");
    const [direction, setDirection] = useState(0);

    const handleTabClick = (tab: TTab, e?: React.MouseEvent) => {
        // if (isOpen && activeTab === tab) {
        //     setIsOpen(false);
        //     return;
        // }

        const currentIndex = TABS.findIndex((t) => t.id === activeTab);
        const nextIndex = TABS.findIndex((t) => t.id === tab);

        if (isOpen && currentIndex !== -1 && nextIndex !== -1) {
            setDirection(nextIndex > currentIndex ? 1 : -1);
        } else {
            setDirection(0);
        }

        setActiveTab(tab);
        setIsOpen(true);
    };

    const activeTabData = TABS.find((t) => t.id === activeTab);

    const handleRenderButton = () => {
        return TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = isOpen && activeTab === tab.id;
            return (
                <Button
                    key={tab.id}
                    variant="empty"
                    asChild
                    size={"sm"}
                    onClick={(e) => handleTabClick(tab.id, e)}
                    className={cn(
                        "h-12 flex-1 !justify-start rounded-none border-r border-bd-main text-typo-primary !transition-all first:border-l tb:px-4 tb:py-4 mb:h-11 mb:!justify-center mb:px-0 mb:py-2.5",
                        isActive
                            ? activeTab === tab.id
                                ? "bg-bg-sf2 text-typo-primary"
                                : "text-typo-note hover:bg-bg-sf1 hover:text-typo-primary"
                            : "text-typo-primary"
                    )}
                >
                    <div className="flex items-center justify-center gap-x-2 mb:gap-x-0">
                        <span className="h-4 w-4 shrink-0 mb:hidden">
                            <Icon />
                        </span>
                        <span className="whitespace-nowrap text-base font-semibold text-current transition-all tb:text-base tb:leading-[1.5em] mb:text-xs">
                            {tab.label}
                        </span>
                    </div>
                </Button>
            );
        });
    };
    return (
        <>
            <div className="container fixed inset-x-0 bottom-0 z-[30] h-12 w-full items-stretch border-t border-bd-main bg-bg-main mb:h-auto">
                <div className="flex">{handleRenderButton()}</div>
            </div>
            <Drawer open={isOpen} direction="bottom" onOpenChange={setIsOpen}>
                <DrawerContent className="inset-x-0 bottom-0 h-full rounded-none border-none bg-bg-main p-0 tb:max-h-[27.125rem] mb:max-h-[100dvh] [&_[data-drawer-close]]:right-0 [&_[data-drawer-close]]:top-0 [&_[data-drawer-close]]:flex [&_[data-drawer-close]]:size-10 [&_[data-drawer-close]]:items-center [&_[data-drawer-close]]:justify-center [&_[data-drawer-close]]:p-0">
                    <DrawerTitle className="sr-only">
                        {activeTabData?.label}
                    </DrawerTitle>

                    <div className="relative grid h-full min-h-0 w-full flex-1 overflow-hidden pb-[2.5rem] pt-11 mb:pt-[2.5rem]">
                        <AnimatePresence custom={direction} initial={false}>
                            {activeTab && (
                                <m.div
                                    key={activeTab}
                                    custom={direction}
                                    variants={{
                                        initial: (d) => ({
                                            opacity: 0,
                                            x:
                                                d === 0
                                                    ? 0
                                                    : d > 0
                                                      ? "100%"
                                                      : "-100%",
                                        }),
                                        animate: { opacity: 1, x: 0, dur: 0.4 },
                                        exit: (d) => ({
                                            opacity: 0,
                                            x:
                                                d === 0
                                                    ? 0
                                                    : d > 0
                                                      ? "-100%"
                                                      : "100%",
                                            dur: 0.2,
                                        }),
                                    }}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                    className="col-start-1 row-start-1 flex h-full min-h-0 w-full flex-col"
                                >
                                    <div className="flex h-full min-h-0 flex-1 flex-col">
                                        {activeTab === "watchlist" && (
                                            <Watchlist className="h-full flex-1" />
                                        )}
                                        {activeTab === "market-activities" && (
                                            <MarketActivities className="h-full flex-1" />
                                        )}
                                        {activeTab === "release-calendar" && (
                                            <ReleaseCalendar className="h-full flex-1" />
                                        )}
                                    </div>
                                </m.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex h-12 mb:hidden">
                        {handleRenderButton()}
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
