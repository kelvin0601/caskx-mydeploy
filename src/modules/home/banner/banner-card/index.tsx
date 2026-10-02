import IconStar from "@/components/shared/icons/icon-start";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import LinkCustom from "@/components/shared/link-custom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { cn, formatCurrency, handleRenderFallbackText } from "@/lib/utils";
import { caskMaster } from "@/types";
import TrendDelta from "@/components/shared/trend-delta";
import TrendingBadge from "@/components/shared/trending-badge";

export type TBannerCardData = caskMaster.TCaskMaster;

export const BannerCard: React.FC<{
    data: TBannerCardData;
    className?: string;
    style?: React.CSSProperties;
    isActive?: boolean;
}> = ({ data, className, style, isActive = true }) => {
    const floorPrice =
        data?.lowestAsk || data?.minReferencePrice || data?.price;
    const delta = data.lowestAskDelta30D ?? data.medianPriceDelta30D;
    const caskType = data.caskType?.name || "-";
    const region = data.region?.name || "-";

    const vintages = (() => {
        const children = data.children;
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

        const minV = data.minVintageYear;
        const maxV = data.maxVintageYear;
        if (minV && maxV) {
            return minV === maxV ? String(minV) : `${minV} → ${maxV}`;
        }
        if (minV || maxV) return String(minV || maxV);
        return "-";
    })();

    const availability = (() => {
        if (data.purchaseAvailability != null) {
            return data.purchaseAvailability.toString();
        }
        if (data.childCount != null) {
            return data.childCount.toString();
        }
        return "1";
    })();

    return (
        <div
            style={style}
            className={cn(
                "banner-card-scale-layer flex h-full w-full cursor-pointer flex-col justify-between bg-bg-main p-8 text-icon-main tb:p-6 mb:h-auto mb:p-4",
                !isActive && "pointer-events-none select-none",
                className
            )}
        >
            <button
                type="button"
                aria-label="View cask details"
                className="absolute right-0 top-0 z-10 flex size-[5.25rem] touch-manipulation items-center justify-center transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand tb:size-12"
            >
                <div className="size-5 text-icon-main mb:size-4">
                    <IconStar />
                </div>
            </button>

            <div className="flex justify-start">
                <div className="relative size-[8.75rem] overflow-hidden rounded-full p-2 tb:mb-6 mb:mb-4 mb:size-[6.25rem]">
                    <div className="absolute inset-0 rounded-full border-[3.5px] border-bd-main" />
                    <div className="absolute inset-1.5 rounded-full border border-bd-main" />
                    <ImagePlaceholder
                        src="/images/berrel_cask.png"
                        alt="Cask head"
                        height={200}
                        width={200}
                        className="object-cover"
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="mb-5 flex flex-wrap items-center gap-2 tb:mb-4">
                    <h2 className="text-lg font-semibold text-typo-primary tb:text-base">
                        {handleRenderFallbackText(data.name)}
                    </h2>
                </div>

                <CardStatItem
                    className="border-t py-3"
                    labelClassName="capitalize tracking-wider text-dark-400"
                    label="Floor Price"
                >
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-typo-primary">
                            {floorPrice ? formatCurrency(floorPrice) : "-"}
                        </span>
                        <TrendDelta value={delta} className="leading-[1em]" />
                    </div>
                </CardStatItem>

                <div className="grid grid-cols-2 gap-y-3">
                    <CardStatItem
                        className="border-y py-3"
                        label="Cask Type"
                        value={caskType}
                    />
                    <CardStatItem
                        className="border-y py-3"
                        label="Region"
                        value={region}
                    />
                    <CardStatItem label="Vintages" value={vintages} />
                    <CardStatItem label="Availability" value={availability} />
                </div>

                <div className="mt-6 flex w-full gap-1 tb:mt-5 mb:mt-4 [&_*]:flex-1">
                    <Button variant={"primary"} asChild>
                        <LinkCustom
                            href={`${ROUTE_PUBLIC.CASK_DETAILS}/${data?.id}`}
                        >
                            Buy Now
                        </LinkCustom>
                    </Button>
                    <Button
                        className="flex-1 tb:border-bg-dark-main tb:bg-bg-dark-main tb:text-typo-dark-primary"
                        variant="outline-text"
                    >
                        <LinkCustom
                            href={`${ROUTE_PUBLIC.CASK_DETAILS}/${data?.id}`}
                        >
                            Make Offer
                        </LinkCustom>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const BannerCardSkeleton: React.FC = () => (
    <Skeleton className="relative row-span-2 flex aspect-[1330/400] w-full flex-shrink-0 items-center overflow-hidden rounded-[0.625rem]" />
);

const CardStatItem: React.FC<{
    label: string;
    value?: React.ReactNode;
    className?: string;
    labelClassName?: string;
    children?: React.ReactNode;
}> = ({ label, value, className, labelClassName, children }) => (
    <div className={cn("flex flex-col gap-1.5 tb:gap-1.5", className)}>
        <span
            className={cn(
                "text-xs leading-[1em] text-typo-note",
                labelClassName
            )}
        >
            {label}
        </span>
        {children ? (
            children
        ) : (
            <span className="line-clamp-1 text-sm font-medium text-typo-primary">
                {value}
            </span>
        )}
    </div>
);
