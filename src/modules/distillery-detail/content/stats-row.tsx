"use client";

import { cn, formatCurrency } from "@/lib/utils";

type TDistilleryStatsRowProps = {
    totalCasks: number;
    totalValue: number;
    avgPrice: number;
    highestPrice: number;
    className?: string;
};

export default function DistilleryStatsRow({
    totalCasks,
    totalValue,
    avgPrice,
    highestPrice,
    className,
}: TDistilleryStatsRowProps) {
    const stats = [
        { label: "Total Casks", value: totalCasks.toString() },
        { label: "Total Value", value: formatCurrency(totalValue) },
        { label: "Avg Price", value: formatCurrency(avgPrice) },
        { label: "Highest Price", value: formatCurrency(highestPrice) },
    ];

    return (
        <div
            className={cn(
                "grid grid-cols-4 !gap-2 tb:grid-cols-4 mb:grid-cols-2 mb:gap-1",
                className
            )}
        >
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="flex flex-col gap-1 border border-bd-main bg-bg-sf1 p-3 tb:gap-1 mb:gap-1"
                >
                    <span className="text-xs font-normal leading-none text-typo-note">
                        {stat.label}
                    </span>
                    <span className="text-sm font-semibold text-typo-primary">
                        {stat.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
