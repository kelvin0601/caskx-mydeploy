import { cn } from "@/lib/utils";
import React from "react";

type TrendDeltaProps = {
    value?: number | string | null;
    className?: string;
    suffix?: string;
    fractionDigits?: number;
};

export default function TrendDelta({
    value,
    className,
    suffix = "% (30D)",
    fractionDigits = 1,
}: TrendDeltaProps) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    let isPositive = false;
    let isZero = false;
    let formatted = "";

    if (typeof value === "number") {
        isPositive = value > 0;
        isZero = value === 0;
        const sign = isPositive ? "+" : isZero ? "" : "-";
        formatted = `${sign}${Math.abs(value).toFixed(fractionDigits)}${suffix}`;
    } else {
        isPositive = value.startsWith("+");
        isZero = !isPositive && !value.startsWith("-");
        formatted = value;
    }

    const colorClass = isPositive
        ? "text-success"
        : isZero
          ? "text-typo-note"
          : "text-error";

    return (
        <span className={cn("text-xs font-semibold", colorClass, className)}>
            {formatted}
        </span>
    );
}
