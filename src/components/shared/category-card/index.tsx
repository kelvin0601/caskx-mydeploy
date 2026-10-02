import React from "react";
import ImagePlaceholder from "../image-placeholder";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import TrendDelta from "../trend-delta";
import TrendingBadge from "../trending-badge";

export type TCategory = {
    id: string;
    name: string;
    imageUrl?: string;
    isTrending?: boolean;
    medPrice: number;
    trend: string;
};

export default function CategoryCard({
    data,
    className,
}: {
    data: TCategory;
    className?: string;
}) {
    return (
        <div className={cn("px-2", className)}>
            <div className="flex cursor-pointer gap-3 rounded-md border border-bd-main bg-bg-sf2 p-3 transition-all hover:bg-bg-main hover:shadow-[0_3px_8px_0_rgba(23,0,0,0.10),_0_4px_6px_0_rgba(15,0,0,0.10)] tb:p-[1.125rem] mb:p-4">
                <div className="size-[4.25rem] flex-shrink-0 overflow-hidden rounded-md tb:size-[4.125rem]">
                    <ImagePlaceholder
                        src={data.imageUrl}
                        width={160}
                        height={160}
                        alt={data.name}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                    <div>
                        <div className="flex flex-nowrap items-start gap-1.5 tb:gap-1">
                            <h3 className="line-clamp-1 text-lg font-semibold !leading-[1.2em] text-typo-primary tb:text-base">
                                {data.name}
                            </h3>
                            {data.isTrending && <TrendingBadge />}
                        </div>
                        <p className="mt-3 text-xs leading-[1em] text-typo-soft">
                            Med. Price
                        </p>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-sm font-bold leading-[1em] text-typo-primary">
                            £{data.medPrice.toLocaleString()}
                        </span>
                        <TrendDelta
                            value={data.trend}
                            className="font-medium"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CategoryCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("px-2", className)}>
            <div className="flex gap-3 rounded-md border border-bd-main bg-bg-sf2 p-5">
                <Skeleton className="size-[4.25rem] flex-shrink-0 animate-pulse rounded-md bg-bg-sf1" />
                <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div>
                        <div className="flex items-center gap-1">
                            <Skeleton className="h-5 w-3/4 animate-pulse bg-bg-sf1" />
                        </div>
                        <p className="mt-3.5 text-xs text-typo-note">
                            Med. Price
                        </p>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <Skeleton className="h-5 w-20 animate-pulse bg-bg-sf1" />
                        <Skeleton className="h-4 w-10 animate-pulse bg-bg-sf1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
