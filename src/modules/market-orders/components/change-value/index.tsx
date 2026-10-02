import { ArrowRight } from "lucide-react";
import React from "react";

export type ChangeValueProps = {
    label: string;
    previousValue: React.ReactNode;
    nextValue: React.ReactNode;
};

export default function ChangeValue({
    label,
    previousValue,
    nextValue,
}: ChangeValueProps) {
    return (
        <div className="flex min-w-0 flex-col items-end gap-1.5 mb:w-full mb:flex-row mb:items-center mb:justify-between mb:gap-4">
            <span className="text-xs leading-none text-typo-soft mb:text-sm mb:leading-normal">
                {label}
            </span>
            <div className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-typo-primary">
                <span className="truncate">{previousValue}</span>
                <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-typo-primary"
                />
                <span className="truncate">{nextValue}</span>
            </div>
        </div>
    );
}
