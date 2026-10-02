import IconChevonDown from "@/components/shared/icons/icon-chevon-down";
import { StatItem } from "@/components/shared/stat-item";
import TrendDelta from "@/components/shared/trend-delta";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeaderStatsMobile({
    isExpanded,
    toggleExpand,
}: {
    isExpanded: boolean;
    toggleExpand: () => void;
}) {
    return (
        <div className="hidden w-full flex-col mb:flex">
            {/* Header Row: Balance & Accordion Toggle */}
            <div
                onClick={toggleExpand}
                className="flex w-full cursor-pointer select-none items-center justify-between py-3"
            >
                <div className="flex flex-col items-start justify-center gap-1.5">
                    <span className="text-xs text-typo-note">Your Balance</span>
                    <div className="flex items-center gap-1">
                        <span className="text-base font-semibold text-typo-primary mb:text-sm">
                            £50,000,000
                        </span>
                        <TrendDelta value={3.2} className="font-medium" />
                    </div>
                </div>
                <Button
                    variant="empty"
                    className={cn(
                        "p-0 transition-all",
                        isExpanded && "rotate-180"
                    )}
                >
                    <span className="h-4 w-4 text-typo-soft">
                        <IconChevonDown />
                    </span>
                </Button>
            </div>

            {/* Collapsible Panel */}
            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
            >
                <div className="overflow-hidden">
                    <div className="grid grid-cols-2 !gap-x-0 border-t border-bd-main">
                        <StatItem title="Casks Owned" value="12" />
                        <StatItem title="Open Offers" value="3" />
                        <StatItem
                            title="Open Listing"
                            value="-"
                            className="border-none"
                        />
                        <StatItem
                            title="Ongoing Payments"
                            className="border-none"
                            value="3"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
