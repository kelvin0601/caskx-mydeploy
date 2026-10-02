"use client";

import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    TabsTriggerCustom,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

type DistilleryTab = "portfolio" | "market-activity";

type TDistilleryTabsProps = {
    activeTab: DistilleryTab;
    onTabChange: (tab: DistilleryTab) => void;
    className?: string;
    children: React.ReactNode;
    hideIndicator?: boolean;
};

export default function DistilleryTabs({
    activeTab,
    onTabChange,
    className,
    children,
    hideIndicator = false,
}: TDistilleryTabsProps) {
    // const [mounted, setMounted] = useState(false);
    // useEffect(() => {
    //     setTimeout(() => {
    //         setMounted(true);
    //     }, 100);
    // }, []);

    // const sentinelRef = useRef<HTMLDivElement>(null);
    // const inView = useInView(sentinelRef);
    // const isSticky = mounted ? !inView : false;

    return (
        <Tabs
            value={activeTab}
            onValueChange={(val) => onTabChange(val as DistilleryTab)}
            className={cn("relative w-full bg-transparent p-0", className)}
        >
            <div
                // ref={sentinelRef}
                className="pointer-events-none absolute left-0 right-0 h-px"
                style={{ top: "calc(-1 * var(--height-header))" }}
            />
            <TabsList
                hideIndicator={hideIndicator}
                className={cn(
                    "sticky top-[var(--height-header)] z-20 h-auto w-full items-end justify-start rounded-none border-b border-bd-main bg-bg-main p-0 transition-colors duration-150 ease-in-out mb:px-0"
                    // isSticky && "bg-bg-dark-main border-bd-dark-main"
                )}
            >
                <TabsTriggerCustom
                    value="portfolio"
                    className={cn(
                        "h-10 border-l-bd-main px-6 text-typo-soft transition-colors duration-200 mb:flex-1 mb:px-0"
                        // isSticky &&
                        // "data-[state=inactive]:text-typo-dark-soft border-r-bd-dark-main"
                    )}
                >
                    Portfolio
                </TabsTriggerCustom>
                <TabsTriggerCustom
                    className={cn(
                        "h-10 border-r-bd-main px-6 text-typo-soft transition-colors duration-200 mb:flex-1 mb:px-0"
                        // isSticky &&
                        // "data-[state=inactive]:text-typo-dark-soft border-bd-dark-main"
                    )}
                    value="market-activity"
                >
                    Market Activity
                </TabsTriggerCustom>
            </TabsList>
            {children}
        </Tabs>
    );
}
