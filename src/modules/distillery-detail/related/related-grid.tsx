"use client";

import ImagePlaceholder from "@/components/shared/image-placeholder";
import { Badge, TBadgeVariant } from "@/components/ui/badge";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { cn, formatCurrency } from "@/lib/utils";
import { distillery } from "@/types";
import Link from "next/link";
import { useMemo } from "react";

const renderStatusBadge = (status: string | null) => {
    if (!status) return null;

    const lower = status.toLowerCase();
    let variant: TBadgeVariant = "default";

    if (lower.includes("stable")) {
        variant = "success";
    } else if (lower.includes("limited")) {
        variant = "warning";
    } else if (
        lower.includes("finite") ||
        lower.includes("rare") ||
        lower.includes("destructive")
    ) {
        variant = "destructive";
    } else if (lower.includes("complete") || lower.includes("verified")) {
        variant = "success";
    }

    return (
        <Badge variant={variant} size="xs" isHaveDot={true}>
            {status}
        </Badge>
    );
};

type TRelatedDistilleriesGridProps = {
    distilleries: distillery.TDistillery[];
    isLoading?: boolean;
    className?: string;
};

export default function RelatedDistilleriesGrid({
    distilleries,
    isLoading,
    className,
}: TRelatedDistilleriesGridProps) {
    if (isLoading) {
        return (
            <div
                className={cn(
                    "-mx-[var(--padding-container)] flex flex-col gap-8 border-t border-bd-main px-[var(--padding-container)] py-10 tb:gap-4 tb:py-5 mb:py-6",
                    className
                )}
            >
                <div className="h-7 w-48 animate-pulse rounded bg-bg-sf3" />
                <div className="flex gap-4 overflow-x-auto pb-2 tb:grid tb:grid-cols-2 tb:gap-3 tb:overflow-visible tb:pb-0 mb:flex mb:gap-2 mb:overflow-x-auto mb:pb-2">
                    {[1, 2, 3, 4].map((i) => (
                        <RelatedDistilleryCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (!distilleries || distilleries.length === 0) return null;

    return (
        <div
            className={cn(
                "-mx-[var(--padding-container)] flex flex-col gap-8 border-t border-bd-main px-[var(--padding-container)] py-10 tb:gap-4 tb:py-5 mb:py-6",
                className
            )}
        >
            <h2 className="font-reckless text-2xl font-medium leading-none text-typo-primary mb:text-xl">
                Related Distilleries
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 tb:grid tb:grid-cols-2 tb:gap-3 tb:overflow-visible tb:pb-0 mb:flex mb:gap-2 mb:overflow-x-auto mb:pb-2">
                {distilleries.map((distillery) => (
                    <RelatedDistilleryCard
                        key={distillery.id}
                        distillery={distillery}
                    />
                ))}
            </div>
        </div>
    );
}

function RelatedDistilleryCard({
    distillery,
}: {
    distillery: distillery.TDistillery;
}) {
    const {
        id,
        name,
        imageUrl,
        summary,
        region,
        caskCount,
        isVerified,
        caskMasters,
        status,
    } = distillery;

    // Calculate stats from cask masters
    const stats = useMemo(() => {
        if (!caskMasters || caskMasters.length === 0) {
            return { totalValue: 0, medPrice: 0 };
        }

        const prices = caskMasters
            .flatMap((cm) => cm.children || [])
            .map((c) => parseFloat(c.priceReference || "0"))
            .filter((p) => p > 0);

        const totalValue = prices.reduce((sum, p) => sum + p, 0);
        const medPrice =
            prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0;

        return { totalValue, medPrice };
    }, [caskMasters]);

    return (
        <Link
            href={`${ROUTE_PUBLIC.DISTILLERY}/${id}`}
            className="flex w-[25.25rem] shrink-0 flex-col gap-6 border border-bd-main bg-bg-sf1 p-6 transition-shadow hover:shadow-md tb:w-full tb:gap-5 tb:p-5 mb:w-[18.75rem] mb:gap-4 mb:p-4"
        >
            {/* Image */}
            <div className="aspect-[150/100] w-full overflow-hidden">
                <ImagePlaceholder
                    src={imageUrl || ""}
                    alt={name}
                    width={328}
                    height={219}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Name + Badge */}
            <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold leading-[1.2] text-typo-primary">
                        {name}
                    </h3>

                    {/* {renderStatusBadge(status || (isVerified ? "Verified" : null))} */}
                </div>
                <p className="text-typo-body line-clamp-2 text-sm leading-relaxed">
                    {summary || "No description available"}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="flex flex-col gap-3">
                {/* Row 1: No. cask + Region */}
                <div className="flex gap-4">
                    <div className="flex flex-1 flex-col gap-1 border-t border-bd-main pt-3">
                        <span className="text-xs font-normal leading-none text-typo-note">
                            No. cask
                        </span>
                        <span className="text-sm font-semibold leading-[1.5] text-typo-primary">
                            {caskCount || 0}
                        </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 border-t border-bd-main pt-3">
                        <span className="text-xs font-normal leading-none text-typo-note">
                            Region
                        </span>
                        <span className="text-sm font-semibold leading-[1.5] text-typo-primary">
                            {region || "N/A"}
                        </span>
                    </div>
                </div>

                {/* Row 2: Med. Price + Volume */}
                <div className="flex gap-4">
                    <div className="flex flex-1 flex-col gap-1 border-t border-bd-main pt-3">
                        <span className="text-xs font-normal leading-none text-typo-note">
                            Med. Price
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold leading-[1.5] text-typo-primary">
                                {formatCurrency(stats.medPrice)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 border-t border-bd-main pt-3">
                        <span className="text-xs font-normal leading-none text-typo-note">
                            Volume
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold leading-[1.5] text-typo-primary">
                                {formatCurrency(stats.totalValue)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function RelatedDistilleryCardSkeleton() {
    return (
        <div className="flex w-[25.25rem] shrink-0 flex-col gap-6 border border-bd-main bg-bg-sf1 p-6 tb:w-full tb:gap-5 tb:p-5 mb:gap-4 mb:p-4">
            <div className="aspect-[150/100] w-full animate-pulse rounded bg-bg-sf3" />
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-32 animate-pulse rounded bg-bg-sf3" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-bg-sf3" />
                </div>
                <div className="h-4 w-full animate-pulse rounded bg-bg-sf3" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-bg-sf3" />
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex gap-4">
                    <div className="flex flex-1 flex-col gap-1 border-t border-bd-main pt-3">
                        <div className="h-3 w-12 animate-pulse rounded bg-bg-sf3" />
                        <div className="h-4 w-8 animate-pulse rounded bg-bg-sf3" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 border-t border-bd-main pt-3">
                        <div className="h-3 w-12 animate-pulse rounded bg-bg-sf3" />
                        <div className="h-4 w-16 animate-pulse rounded bg-bg-sf3" />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-1 flex-col gap-1 border-t border-bd-main pt-3">
                        <div className="h-3 w-16 animate-pulse rounded bg-bg-sf3" />
                        <div className="h-4 w-20 animate-pulse rounded bg-bg-sf3" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 border-t border-bd-main pt-3">
                        <div className="h-3 w-12 animate-pulse rounded bg-bg-sf3" />
                        <div className="h-4 w-20 animate-pulse rounded bg-bg-sf3" />
                    </div>
                </div>
            </div>
        </div>
    );
}
