"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { DISTILLERY_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { cn, formatCurrency } from "@/lib/utils";
import distilleriesServices from "@/services/distilleries";
import { distillery } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import ImagePlaceholder from "../image-placeholder";
import LinkCustom from "../link-custom";
import RankBadge from "../rank-badge";
import TrendDelta from "../trend-delta";
import TrendingBadge from "../trending-badge";

type TProps = {
    className?: string;
    data: distillery.TTopDistillery;
    index: number;
};

export default function DistilleryCard(props: TProps) {
    const { data, className, index } = props;
    const queryClient = useQueryClient();

    const id = data.distilleryId;
    const name = data.distilleryName;
    const imageUrl = data.distilleryImageUrl;
    const caskCount = data.masterCaskCount;
    const rank = data.rank;
    const medianPrice = data.medianPrice;
    const estMedianPrice = data.estMedianPrice;
    const medianPriceDelta30D = data.medianPriceDelta30D;
    const lifetimeVolume = data.lifetimeVolume;
    const estMarketValue = data.estMarketValue;
    const volumeDelta30D = data.volumeDelta30D;

    const priceVal = medianPrice ?? estMedianPrice;
    const medPriceLabel = medianPrice != null ? "Med. Price" : "Est. Price";
    const medPriceValue = priceVal != null ? formatCurrency(priceVal) : "-";
    const showVolume =
        lifetimeVolume !== null &&
        lifetimeVolume !== undefined &&
        lifetimeVolume > 0;
    const volumeLabel = showVolume ? "Volume" : "Est. Volume";
    const volVal = showVolume ? lifetimeVolume : estMarketValue;
    const volumeValue = volVal != null ? formatCurrency(volVal) : "-";

    return (
        <LinkCustom
            onMouseEnter={() => {
                queryClient.prefetchQuery({
                    queryKey: [DISTILLERY_KEYS.DETAIL, id],
                    queryFn: () => distilleriesServices.getDetailDistillery(id),
                });
            }}
            href={`${ROUTE_PUBLIC.DISTILLERY}/${id}`}
            className={cn("group relative flex-shrink-0", className)}
        >
            <div className="flex h-full flex-col border border-bd-main bg-bg-main p-5 transition-all duration-300 ease-in-out group-hover:bg-bg-sf1 group-hover:shadow-[0_3px_8px_0_rgba(23,0,0,0.10),_0_4px_6px_0_rgba(15,0,0,0.10)] dark:border-bd-dark-main dark:bg-bg-dark-main dark:group-hover:border-bd-dark-inverse dark:group-hover:bg-bg-dark-sf1 tb:p-[1.125rem] tb:px-[1.125rem] mb:min-w-full mb:p-4">
                {/* Top Section: Image & Rank Badge */}
                <div className="mb-5 flex items-start justify-between gap-4 tb:mb-[1.125rem] mb:mb-4">
                    <div className="aspect-[1.5/1] h-[6.25rem] w-auto overflow-hidden shadow-sm tb:h-20 mb:h-[4.25rem]">
                        <ImagePlaceholder
                            src={data.distilleryImageUrl}
                            width={120}
                            height={60}
                            className="h-full w-full object-cover"
                            imgClassName="transition-transform duration-700"
                            typePlaceholder="distillery"
                        />
                    </div>
                    <RankBadge rank={rank} />
                </div>

                {/* Info Section */}
                <div className="mb-3 flex flex-col gap-1.5 tb:gap-1">
                    <div className="flex items-start gap-1.5">
                        <h3 className="text-lg font-semibold leading-tight text-typo-primary tb:text-base">
                            {name}
                        </h3>
                    </div>
                    <p className="text-xs font-medium text-typo-soft mb:text-xs">
                        {caskCount} {`${caskCount > 1 ? "casks" : "cask"}`}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 !gap-x-3">
                    <div className="flex flex-col gap-1 border-t border-bd-main pt-3">
                        <span className="text-xs text-typo-note">
                            {medPriceLabel}
                        </span>
                        <span className="text-sm font-semibold text-typo-primary">
                            {medPriceValue}
                        </span>
                        <TrendDelta
                            value={medianPriceDelta30D}
                            fractionDigits={2}
                        />
                    </div>
                    <div className="flex flex-col gap-1 border-t border-bd-main pt-3">
                        <span className="text-xs text-typo-note">
                            {volumeLabel}
                        </span>
                        <span className="text-sm font-semibold text-typo-primary">
                            {volumeValue}
                        </span>
                        <TrendDelta value={volumeDelta30D} fractionDigits={2} />
                    </div>
                </div>
            </div>
        </LinkCustom>
    );
}

///////////////////////////
export function DistilleryCardSkeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "group relative min-w-[18.875rem] flex-shrink-0",
                className
            )}
        >
            <div className="flex flex-col overflow-hidden border border-bd-main bg-bg-main p-5 dark:border-bd-dark-main dark:bg-bg-dark-main mb:min-w-full">
                {/* Top Section: Image & Rank Badge */}
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="aspect-[1.5/1] h-[6.25rem] w-auto overflow-hidden shadow-sm">
                        <Skeleton className="h-full w-full animate-pulse bg-bg-sf3" />
                    </div>
                    <Skeleton className="size-8 rounded-full" />
                </div>

                <div className="pt-10" />

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-x-6">
                    <div className="flex flex-col gap-1.5 pl-2">
                        <Skeleton className="h-5 w-20 animate-pulse bg-bg-sf2" />
                        <Skeleton className="h-3 w-16 animate-pulse bg-bg-sf2" />
                    </div>
                    <div className="flex flex-col gap-1.5 pl-2">
                        <Skeleton className="h-5 w-20 animate-pulse bg-bg-sf2" />
                        <Skeleton className="h-3 w-16 animate-pulse bg-bg-sf2" />
                    </div>
                </div>
            </div>
        </div>
    );
}
