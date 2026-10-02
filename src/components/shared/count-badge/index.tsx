import { cn } from "@/lib/utils";
import React from "react";

type TCountBadgeProps = {
    count: number | string;
    className?: string;
};

export default function CountBadge({ count, className }: TCountBadgeProps) {
    if (count === 0 || count === "0") return null;

    return (
        <div
            className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bg-sf3 px-1.5 py-0.5 shadow-none transition-all",
                className
            )}
        >
            <span className="font-inter text-sm font-semibold leading-[1.2] text-typo-primary mb:text-xs">
                {count}
            </span>
        </div>
    );
}
