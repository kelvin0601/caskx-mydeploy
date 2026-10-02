import { cn } from "@/lib/utils";
import React from "react";

type DataChipProps = {
    label: string;
    value: string | null | undefined;
    className?: string;
    fallback?: string;
};

export default function DataChip({
    label,
    value,
    className,
    fallback = "N/A",
}: DataChipProps) {
    return (
        <div className={cn("flex flex-col gap-1 bg-bg-sf4 p-3", className)}>
            <span className="text-xs font-normal text-typo-note">{label}</span>
            <span className="text-sm font-semibold text-typo-primary">
                {value ?? fallback}
            </span>
        </div>
    );
}
