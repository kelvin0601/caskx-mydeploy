import { cn } from "@/lib/utils";
import React from "react";

type THeadingSettings = {
    title: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
    titleClassName?: string;
    size?: "lg" | "xl" | "2xl" | "3xl";
    fontFamily?: "reckless" | "workSans" | "inter" | "coda";
    showBorder?: boolean;
};
export default function HeadingSettings(props: THeadingSettings) {
    const {
        title,
        description,
        className,
        children,
        titleClassName,
        size = "lg",
        fontFamily,
        showBorder = true,
    } = props;
    return (
        <div
            className={cn(
                "isolate flex flex-row items-start justify-between gap-4 mb:hidden mb:flex-col mb:items-start mb:gap-4 mb:pt-4",
                showBorder && "border-b border-bd-main pb-8",
                className
            )}
        >
            <div className="flex flex-col gap-2">
                <h3
                    className={cn(
                        "font-semibold text-typo-primary",
                        size === "lg" && "text-lg",
                        size === "xl" && "text-xl",
                        size === "2xl" && "text-2xl",
                        size === "3xl" && "text-3xl",
                        fontFamily === "reckless" &&
                            "font-reckless font-medium",
                        titleClassName
                    )}
                >
                    {title}
                </h3>
                {description && (
                    <p className="text-left text-sm text-typo-soft">
                        {description}
                    </p>
                )}
            </div>
            {children && children}
        </div>
    );
}
