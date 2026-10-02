"use client";

import CountBadge from "@/components/shared/count-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SearchTab = "cask" | "distillery";

type TSearchResultsHeaderProps = {
    activeTab: SearchTab;
    onTabChange: (tab: SearchTab) => void;
    caskCount: number;
    distilleryCount: number;
    className?: string;
};

export default function SearchResultsHeader({
    activeTab,
    onTabChange,
    caskCount,
    distilleryCount,
    className,
}: TSearchResultsHeaderProps) {
    const totalCount = caskCount + distilleryCount;

    return (
        <div
            className={cn(
                "relative -mx-[var(--padding-container)] flex flex-row items-center justify-between border-b border-bd-main px-[var(--padding-container)] py-8 mb:py-6",
                className
            )}
        >
            {/* Left: Title with count */}
            <div className="flex items-center gap-1">
                <h1 className="font-reckless text-xl font-medium leading-none text-typo-primary dark:text-typo-dark-primary mb:text-lg">
                    Total results
                </h1>
                <CountBadge count={totalCount} />
            </div>

            {/* Center/Right: Tabs */}
            <div className="flex items-center gap-4 dk:absolute dk:left-1/2 dk:-translate-x-1/2 mb:gap-2">
                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-1 font-reckless text-xl font-medium transition-colors duration-200 mb:gap-1 mb:text-lg",
                        activeTab === "cask"
                            ? "text-typo-primary dark:text-typo-dark-primary"
                            : "text-typo-note dark:text-typo-dark-note"
                    )}
                    onClick={() => onTabChange("cask")}
                >
                    Cask
                    <CountBadge count={caskCount} />
                </button>

                <span className="h-4 w-px bg-bd-main" />

                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-1 font-reckless text-xl font-medium transition-colors duration-200 mb:gap-1 mb:text-lg",
                        activeTab === "distillery"
                            ? "text-typo-primary dark:text-typo-dark-primary"
                            : "text-typo-note dark:text-typo-dark-note"
                    )}
                    onClick={() => onTabChange("distillery")}
                >
                    Distillery
                    <CountBadge count={distilleryCount} />
                </button>
            </div>
        </div>
    );
}
