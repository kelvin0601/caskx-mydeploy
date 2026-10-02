import React from "react";
import IconLike from "../icons/icon-like";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function InsightItem({
    className,
    content,
}: {
    className?: string;
    content: string;
}) {
    return (
        <div className={cn("w-full py-4 mb:py-3", className)}>
            <div className="flex flex-row items-center gap-4 mb:items-start mb:gap-2">
                <div className="flex-center flex h-[3.75rem] w-[3.75rem] flex-shrink-0 rounded-full bg-bg-sf1 mb:h-10 mb:w-10">
                    <div className="h-6 w-6 mb:h-4 mb:w-4">
                        <IconLike />
                    </div>
                </div>
                <div className="tex-base text-typo-soft mb:text-sm">
                    {content}
                </div>
            </div>
        </div>
    );
}

export const InsightItemSkeleton = () => {
    return (
        <div className={"w-full py-4"}>
            <div className="flex flex-row items-center gap-4">
                <Skeleton className="flex-center flex h-[3.75rem] w-[3.75rem] flex-shrink-0 rounded-full bg-bg-sf1 mb:h-10 mb:w-10" />
                <div className="flex flex-1 flex-col gap-2 mb:gap-1">
                    <Skeleton className="h-2 w-1/2" />
                    <Skeleton className="h-2 w-2/6" />
                </div>
            </div>
        </div>
    );
};
