import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CASK_MASTER_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { cn, formatCurrency, handleRenderFallbackText } from "@/lib/utils";
import caskMasterServices from "@/services/cask-master";
import { caskMaster } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import IconStar from "../icons/icon-start";
import ImagePlaceholder from "../image-placeholder";
import LinkCustom from "../link-custom";
import TrendDelta from "../trend-delta";
import TrendingBadge from "../trending-badge";

export type TCaskCardData =
    | caskMaster.TCaskMaster
    | caskMaster.TSimilarCaskMaster;

function getReferencePriceRange(data: TCaskCardData) {
    return {
        min: data.minReferencePrice,
        max:
            "maxReferencePrice" in data
                ? data.maxReferencePrice
                : data.minReferencePrice,
    };
}

type TCaskProps = {
    className?: string;
    data: TCaskCardData;
    isRevert: boolean;
    index: number;
    isChildCask?: boolean;
};
export const IMG_CASK = [
    "/images/cask/cask_1.jpg",
    "/images/cask/cask_2.jpg",
    "/images/cask/cask_3.jpg",
    "/images/cask/cask_4.jpg",
    "/images/cask/cask_5.jpg",
    "/images/cask/cask_6.jpg",
    "/images/cask/cask_7.jpg",
    "/images/cask/cask_8.jpg",
    "/images/cask/cask_9.jpg",
    "/images/cask/cask_10.jpg",
    "/images/cask/cask_11.jpg",
    "/images/cask/cask_12.jpg",
    "/images/cask/cask_13.jpg",
    "/images/cask/cask_14.jpg",
];

export function StatItem({
    label,
    value,
    className,
    children,
}: {
    label: string;
    value?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className={cn("flex flex-col gap-1 border-t pt-3", className)}>
            <span className="text-xs text-typo-note">{label}</span>
            {children ? (
                children
            ) : (
                <div className="line-clamp-1 break-all text-sm font-semibold text-typo-primary">
                    {value}
                </div>
            )}
        </div>
    );
}

export default function CaskCard({
    className,
    data,
    index,
    isRevert,
    isChildCask = false,
}: TCaskProps) {
    const img_cask = isRevert
        ? IMG_CASK[index % IMG_CASK.length]
        : IMG_CASK[(IMG_CASK.length - index) % IMG_CASK.length];
    const queryClient = useQueryClient();
    const id = data?.id;
    const masterId = id;
    const subActive = id !== masterId ? `?active=${id}` : "";
    const imageUrlStr = data.imageUrl ?? "";
    const { min: refPriceMin, max: refPriceMax } = getReferencePriceRange(data);

    // Derived data from props
    const floorPrice =
        data.lowestAsk ||
        ("floorPrice" in data ? data.floorPrice : undefined) ||
        refPriceMin ||
        ("price" in data ? data.price : undefined);
    const delta =
        "lowestAskDelta30D" in data
            ? data.lowestAskDelta30D
            : "medianPriceDelta30D" in data
              ? data.medianPriceDelta30D
              : undefined;
    const caskType =
        ("caskType" in data ? data.caskType?.name : data.caskTypeName) || "-";
    const region =
        ("region" in data ? data.region?.name : data.regionName) || "-";

    const getVintageDisplay = () => {
        if ("vintageYear" in data && data.vintageYear) {
            return String(data.vintageYear);
        }

        // If it's a master, try to calculate from children or summary fields
        const children = "children" in data ? data.children : undefined;
        if (children && children.length > 0) {
            const years = children
                .map((c) => Number(c.vintageYear))
                .filter((y: number) => !isNaN(y));
            if (years.length > 0) {
                const min = Math.min(...years);
                const max = Math.max(...years);
                return min === max ? String(min) : `${min} → ${max}`;
            }
        }

        const minV = "minVintageYear" in data ? data.minVintageYear : undefined;
        const maxV = "maxVintageYear" in data ? data.maxVintageYear : undefined;
        if (minV && maxV)
            return minV === maxV ? String(minV) : `${minV} → ${maxV}`;
        if (minV || maxV) return String(minV || maxV);
    };
    const vintages = handleRenderFallbackText(getVintageDisplay());
    const availability = handleRenderFallbackText(
        (() => {
            if (data.purchaseAvailability != null) {
                return data.purchaseAvailability.toString();
            }
            if ("childCount" in data && data.childCount != null) {
                return data.childCount.toString();
            }
            return "1";
        })()
    );

    return (
        <LinkCustom
            href={`${ROUTE_PUBLIC.CASK_DETAILS}/${masterId}${subActive}`}
            className={cn("group block w-full flex-none", className)}
            onMouseEnter={() => {
                if (masterId?.startsWith("cask_master_")) {
                    queryClient.prefetchQuery({
                        queryKey: [
                            CASK_MASTER_KEYS.CASK_MASTER_DETAIL,
                            masterId,
                        ],
                        queryFn: () =>
                            caskMasterServices.getDetailCaskMaster(masterId),
                    });
                }
            }}
        >
            <div className="relative flex flex-col overflow-hidden border border-bd-main bg-bg-main transition-shadow duration-150 group-hover:shadow-[0_2px_6px_0_rgba(23,0,0,0.06),0_4px_6px_0_rgba(15,0,0,0.06)]">
                {/* Top Section: Beige/Cream */}
                <div className="bg-bg-sf2 p-6 tb:p-5 mb:flex mb:flex-row mb:items-center mb:gap-3 mb:p-4 mb:pr-10">
                    <div className="mb-5 flex items-start justify-between tb:mb-4 mb:mb-0">
                        {/* Concentric Circle Cask Image */}
                        <div className="relative flex size-[7.5rem] items-center justify-center tb:size-[6.25rem] mb:size-20">
                            <div className="absolute inset-0 rounded-full border-[0.1875rem] border-bd-main" />
                            <div className="absolute inset-1 rounded-full border border-bd-main" />
                            <div className="bg-white z-10 size-[76.66%] overflow-hidden rounded-full border border-bd-main shadow-sm mb:size-14">
                                <ImagePlaceholder
                                    src={
                                        imageUrlStr &&
                                        imageUrlStr?.startsWith(
                                            "https://example"
                                        )
                                            ? img_cask
                                            : imageUrlStr
                                    }
                                    typePlaceholder="cask"
                                    width={120}
                                    height={120}
                                    alt={`cask_${data.name}`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="group/icon absolute right-0 top-0 p-6 tb:p-5 mb:p-4">
                            <div className="text-icon-dark-main-main size-5 transition-colors duration-150 group-hover/icon:text-icon-main mb:size-4">
                                <IconStar />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="mb-1.5 flex flex-nowrap items-start gap-1.5">
                            <h3 className="line-clamp-1 text-lg font-semibold text-typo-primary mb:line-clamp-2 mb:text-base">
                                {data.name}
                            </h3>
                        </div>
                        {"peatLevels" in data && data.peatLevels && (
                            <p className="text-xs font-medium text-typo-soft">
                                {handleRenderFallbackText(
                                    data?.peatLevels
                                )}{" "}
                            </p>
                        )}
                    </div>
                </div>

                {/* Bottom Section: White Stats */}
                <div className="bg-white flex flex-col border-t border-bd-main">
                    <div className="grid grid-cols-2 gap-x-2.5 gap-y-3 p-6 tb:p-5 tb:pt-6 mb:gap-x-2.5 mb:p-4 mb:pt-5">
                        {/* Floor Price row */}
                        <StatItem
                            className="col-span-2 border-none p-0"
                            label="Floor Price"
                        >
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold text-typo-primary">
                                    {formatCurrency(floorPrice)}
                                </span>
                                <TrendDelta value={delta} />
                            </div>
                        </StatItem>

                        {/* Middle Stats Row */}
                        <StatItem label="Cask Type" value={caskType} />
                        <StatItem label="Region" value={region} />

                        {/* Bottom Stats Row */}
                        <StatItem label="Vintages" value={vintages} />
                        <StatItem label="Availability" value={availability} />
                    </div>

                    {/* Buy Now / Make Offer Button */}
                    <div className="px-6 pb-6 tb:px-5 tb:pb-5 mb:px-4 mb:pb-4">
                        {data.lowestAsk ? (
                            <Button
                                className="w-full tb:bg-brand"
                                variant="action"
                                groupHover
                            >
                                Buy Now
                            </Button>
                        ) : (
                            <Button
                                className="w-full tb:border-none tb:bg-bg-dark-main tb:text-typo-dark-primary"
                                variant="outline-text"
                                groupHover
                            >
                                Make Offer
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </LinkCustom>
    );
}

export function CaskCardSkeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "flex w-full flex-col overflow-hidden border border-bd-main bg-bg-main",
                className
            )}
        >
            {/* Top Section: Beige/Cream */}
            <div className="bg-bg-sf2 p-6 tb:p-5 mb:flex mb:flex-row mb:items-center mb:gap-3 mb:p-4 mb:pr-10">
                <div className="mb-5 flex items-start justify-between tb:mb-4 mb:mb-0">
                    {/* Concentric Circle Cask Image */}
                    <div className="relative flex size-[7.5rem] items-center justify-center tb:size-[6.25rem] mb:size-20">
                        <div className="absolute inset-0 rounded-full border-[0.1875rem] border-bd-main" />
                        <div className="absolute inset-1 rounded-full border border-bd-main" />
                        <Skeleton className="z-10 size-[76.66%] rounded-full bg-bg-sf3 mb:size-14" />
                    </div>
                    <div className="absolute right-0 top-0 p-6 tb:p-5 mb:p-4">
                        <Skeleton className="size-5 rounded-full bg-bg-sf3 mb:size-4" />
                    </div>
                </div>

                <div className="min-w-0">
                    <Skeleton className="mb:h-4.5 mb-1.5 h-5 w-3/4 bg-bg-sf3" />
                    <Skeleton className="h-3.5 w-1/2 bg-bg-sf3 opacity-60" />
                </div>
            </div>

            {/* Bottom Section: White Stats */}
            <div className="bg-white flex flex-col border-t border-bd-main">
                <div className="grid grid-cols-2 gap-x-2.5 gap-y-3 p-6 tb:p-5 tb:pt-6 mb:gap-x-2.5 mb:p-4 mb:pt-5">
                    {/* Floor Price row */}
                    <div className="col-span-2 flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-16 bg-bg-sf3 opacity-60" />
                        <div className="flex items-center gap-1">
                            <Skeleton className="h-4 w-24 bg-bg-sf3" />
                            <Skeleton className="h-3.5 w-10 bg-bg-sf3 opacity-60" />
                        </div>
                    </div>

                    {/* Middle Stats Row */}
                    <div className="flex flex-col gap-1.5 border-t border-bd-main pt-3">
                        <Skeleton className="h-3 w-14 bg-bg-sf3 opacity-60" />
                        <Skeleton className="h-4 w-20 bg-bg-sf3" />
                    </div>
                    <div className="flex flex-col gap-1.5 border-t border-bd-main pt-3">
                        <Skeleton className="h-3 w-12 bg-bg-sf3 opacity-60" />
                        <Skeleton className="h-4 w-16 bg-bg-sf3" />
                    </div>

                    {/* Bottom Stats Row */}
                    <div className="flex flex-col gap-1.5 border-t border-bd-main pt-3">
                        <Skeleton className="h-3 w-14 bg-bg-sf3 opacity-60" />
                        <Skeleton className="h-4 w-24 bg-bg-sf3" />
                    </div>
                    <div className="flex flex-col gap-1.5 border-t border-bd-main pt-3">
                        <Skeleton className="h-3 w-16 bg-bg-sf3 opacity-60" />
                        <Skeleton className="h-4 w-12 bg-bg-sf3" />
                    </div>
                </div>

                {/* Buy Now / Make Offer Button */}
                <div className="px-6 pb-6 tb:px-5 tb:pb-5 mb:px-4 mb:pb-4">
                    <Skeleton className="h-10 w-full bg-bg-sf3" />
                </div>
            </div>
        </div>
    );
}
