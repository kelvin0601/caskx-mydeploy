import { DISTILLERY_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { cn, formatCurrency } from "@/lib/utils";
import distilleriesServices from "@/services/distilleries";
import { distillery } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ImagePlaceholder from "../image-placeholder";
import LinkCustom from "../link-custom";
import { Badge, TBadgeVariant } from "@/components/ui/badge";
import TrendDelta from "../trend-delta";
import TrendingBadge from "../trending-badge";

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

export default function DistilleryCardDetail({
    data,
    className,
}: {
    data: distillery.TDistillery;
    className?: string;
}) {
    const queryClient = useQueryClient();

    // Cast data to allow checking for optional TTopDistillery fields (medianPrice, volume, changes, etc.)
    const extendedData = data as unknown as Partial<distillery.TTopDistillery> &
        distillery.TDistillery;

    // Extracting stats
    const medianPrice = extendedData.medianPrice ?? extendedData.estMedianPrice;
    const volume = extendedData.lifetimeVolume ?? extendedData.estMarketValue;
    const medianPriceDelta30D = extendedData.medianPriceDelta30D;
    const volumeDelta30D = extendedData.volumeDelta30D;

    // Badge status from Figma design
    const statusText = data.status || (data.isVerified ? "Verified" : null);

    // Med. Price Label & Value
    const medPriceLabel =
        extendedData.medianPrice != null ? "Med. Price" : "Est. Price";
    const medPriceValue =
        medianPrice != null ? formatCurrency(medianPrice) : "-";

    // Volume Label & Value
    const showVolume =
        extendedData.lifetimeVolume !== null &&
        extendedData.lifetimeVolume !== undefined &&
        extendedData.lifetimeVolume > 0;
    const volumeLabel = showVolume ? "Volume" : "Est. Volume";
    const volumeValue = volume != null ? formatCurrency(volume) : "-";

    return (
        <LinkCustom
            href={`${ROUTE_PUBLIC.DISTILLERY}/${data.id}`}
            className={cn(
                "group relative h-full flex-none [&_*]:select-none",
                className
            )}
            onMouseEnter={() => {
                queryClient.prefetchQuery({
                    queryKey: [DISTILLERY_KEYS.DETAIL, data.id],
                    queryFn: () =>
                        distilleriesServices.getDetailDistillery(data.id),
                });
            }}
        >
            <div className="flex h-full w-full cursor-pointer flex-col gap-6 border border-bd-main bg-bg-sf1 p-6 transition-all duration-300 ease-in-out group-hover:bg-bg-sf2 group-hover:shadow-[0_0.1875rem_0.5rem_0_rgba(23,0,0,0.10),_0_0.25rem_0.375rem_0_rgba(15,0,0,0.10)] dark:border-bd-dark-main dark:bg-bg-dark-main dark:group-hover:border-bd-dark-inverse dark:group-hover:bg-bg-dark-sf1 tb:gap-5 tb:p-5 mb:gap-4 mb:p-4">
                {/* Image Section - aspect ratio aspect-[3/2] */}
                <div className="aspect-[3/2] w-full overflow-hidden shadow-sm">
                    <ImagePlaceholder
                        src={data.imageUrl || undefined}
                        width={356}
                        height={237}
                        alt={`cask_${data.name}`}
                        className="h-full w-full object-cover"
                        imgClassName="transition-transform duration-700"
                        typePlaceholder="distillery"
                    />
                </div>

                {/* Name & Description Container */}
                <div className="flex flex-col gap-1.5">
                    {/* Name & Badge Section */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold capitalize leading-tight text-typo-primary tb:text-base">
                                {data.name}
                            </h3>

                            {/* {renderStatusBadge(statusText)} */}
                        </div>
                        {/* Location or established year as fallback */}
                        {/* <div className="text-xs text-typo-soft">
                            {[data.region, data.country].filter(Boolean).join(", ")}
                        </div> */}
                    </div>

                    {/* Description Section */}
                    {(data.summary || data.description) && (
                        <div className="line-clamp-2 text-ellipsis text-sm text-typo-soft">
                            {data.summary || data.description}
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="mt-auto flex flex-col gap-3">
                    {/* Row 1: Cask Count & Region */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col border-t border-bd-main pt-3">
                            <span className="text-xs font-normal text-typo-note">
                                Casks Count
                            </span>
                            <span className="mt-1 text-sm font-semibold text-typo-primary">
                                {data.caskCount || 0}
                            </span>
                        </div>
                        <div className="flex flex-col border-t border-bd-main pt-3">
                            <span className="text-xs font-normal text-typo-note">
                                Region
                            </span>
                            <span className="mt-1 truncate text-sm font-semibold text-typo-primary">
                                {data.region || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Row 2: Med Price & Volume */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col border-t border-bd-main pt-3">
                            <span className="text-xs font-normal text-typo-note">
                                {medPriceLabel}
                            </span>
                            <span className="mt-1 text-sm font-semibold text-typo-primary">
                                {medPriceValue}
                            </span>
                            {medianPriceDelta30D != null && (
                                <div className="mt-1 flex items-center gap-0.5">
                                    <TrendDelta value={medianPriceDelta30D} />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col border-t border-bd-main pt-3">
                            <span className="text-xs font-normal text-typo-note">
                                {volumeLabel}
                            </span>
                            <span className="mt-1 text-sm font-semibold text-typo-primary">
                                {volumeValue}
                            </span>
                            {volumeDelta30D != null && (
                                <div className="mt-1 flex items-center gap-0.5">
                                    <TrendDelta value={volumeDelta30D} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </LinkCustom>
    );
}

export function DistilleryCardDetailSkeleton({
    className,
}: {
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex w-full flex-col gap-6 border border-bd-main bg-bg-main p-6 dark:border-bd-dark-main dark:bg-bg-dark-main mb:gap-4 mb:p-4",
                className
            )}
        >
            {/* Image Skeleton */}
            <div className="aspect-[3/2] w-full overflow-hidden shadow-sm">
                <Skeleton className="h-full w-full bg-bg-sf3" />
            </div>

            {/* Name & Description Container Skeleton */}
            <div className="flex flex-col gap-1.5">
                {/* Name & Badge Section */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-6 w-32 bg-bg-sf3" />
                        <Skeleton className="h-5 w-16 rounded-full bg-bg-sf3" />
                    </div>
                    <Skeleton className="h-4 w-40 bg-bg-sf3" />
                </div>

                {/* Description Section */}
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-full bg-bg-sf3" />
                    <Skeleton className="h-4 w-3/4 bg-bg-sf3" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-auto flex flex-col gap-3">
                {/* Row 1: Cask Count & Region */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 border-t border-bd-main pt-3">
                        <Skeleton className="h-3 w-16 bg-bg-sf3" />
                        <Skeleton className="h-4 w-8 bg-bg-sf3" />
                    </div>
                    <div className="flex flex-col gap-1 border-t border-bd-main pt-3">
                        <Skeleton className="h-3 w-12 bg-bg-sf3" />
                        <Skeleton className="h-4 w-20 bg-bg-sf3" />
                    </div>
                </div>

                {/* Row 2: Med Price & Volume */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 border-t border-bd-main pt-3">
                        <Skeleton className="h-3 w-16 bg-bg-sf3" />
                        <Skeleton className="h-4 w-16 bg-bg-sf3" />
                    </div>
                    <div className="flex flex-col gap-1 border-t border-bd-main pt-3">
                        <Skeleton className="h-3 w-12 bg-bg-sf3" />
                        <Skeleton className="h-4 w-24 bg-bg-sf3" />
                    </div>
                </div>
            </div>
        </div>
    );
}
