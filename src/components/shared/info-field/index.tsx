"use client";

import { cn, handleRenderFallbackText } from "@/lib/utils";
import React from "react";

type InfoFieldProps = {
    label: string;
    value: string | React.ReactNode;
    valueClassName?: string;
};

export default function InfoField({
    label,
    value,
    valueClassName,
}: InfoFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <div className="text-sm text-typo-note">{label}</div>
            <div
                className={cn(
                    "text-sm font-medium text-typo-primary",
                    valueClassName
                )}
            >
                {typeof value === "string"
                    ? handleRenderFallbackText(value)
                    : value}
            </div>
        </div>
    );
}
