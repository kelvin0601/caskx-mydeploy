import { cn } from "@/lib/utils";
import React from "react";
type TLabelCard = {
    title: string;
    color: TColor;
    className?: string;
    isHaveDot?: boolean;
};
export type TColor = "success" | "error" | "warning" | "info";

export default function LabelCard({
    title = "Recommended",
    color = "success",
    className,
    isHaveDot = true,
}: TLabelCard) {
    const colorMap = {
        success: {
            bg: "bg-success-50",
            text: "text-success",
            border: "border-success-lighter",
            dot: "bg-success",
            dotBorder: "border-success",
        },
        // error: {
        //     bg: "bg-error-50",
        //     text: "text-error",
        //     border: "border-error-lighter",
        //     dot: "bg-error",
        // },
        warning: {
            bg: "bg-warning-50",
            text: "text-warning",
            border: "border-warning-lighter",
            dot: "bg-warning",
            dotBorder: "border-success",
        },
    };
    return (
        <div
            className={cn(
                "overflow-hidden rounded-2xl border py-0.5 pl-1.5 pr-2",
                colorMap[color as keyof typeof colorMap].bg,
                colorMap[color as keyof typeof colorMap].border,
                className
            )}
        >
            <div className="flex flex-row items-center gap-1">
                {isHaveDot && (
                    <div
                        className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            colorMap[color as keyof typeof colorMap].dot
                        )}
                    />
                )}
                <div
                    className={cn(
                        "text-sm font-medium",
                        colorMap[color as keyof typeof colorMap].text
                    )}
                >
                    {title}
                </div>
            </div>
        </div>
    );
}
