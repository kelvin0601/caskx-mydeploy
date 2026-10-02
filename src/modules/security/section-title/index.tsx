import { cn } from "@/lib/utils";
import React from "react";

type TSectionTitle = {
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
};

export default function SectionTitle({
    title,
    description,
    action,
    className,
}: TSectionTitle) {
    return (
        <div
            className={cn(
                "flex flex-row items-center justify-between gap-4 border-t border-bd-main pt-8 tb:pt-6",
                className
            )}
        >
            <div className="flex flex-col gap-2">
                <h2 className="font-reckless text-xl font-medium text-typo-primary tb:text-lg">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm text-typo-soft">{description}</p>
                )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
