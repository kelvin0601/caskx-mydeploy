import { IMG_CASK } from "@/components/shared/cask-card";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import InsightItem, {
    InsightItemSkeleton,
} from "@/components/shared/insight-item";
import ReadMore from "@/components/shared/read-more";
import TooltipWrap from "@/components/shared/tooltip-wrap";
import { Skeleton } from "@/components/ui/skeleton";
import { KEY_ASK, KEY_MARKET_DATA } from "@/lib/constants/key";
import { cn } from "@/lib/utils";
import { caskAskService } from "@/services/cask-ask";
import { caskBidService } from "@/services/cask-bid";
import { marketDataViewService } from "@/services/market-data-view";
import { useBoundStore } from "@/store";
import { useQuery } from "@tanstack/react-query";

export default function ContentDetail({ className }: { className?: string }) {
    const { caskDetails } = useBoundStore();
    const caskId = caskDetails?.id;

    // Query for market data
    const marketDataQuery = useQuery({
        queryKey: [KEY_MARKET_DATA.MARKET_DATA, caskId],
        queryFn: () => {
            if (!caskId) return Promise.reject(new Error("No cask ID"));
            return marketDataViewService.getCaskMarketDataView(caskId);
        },
        enabled: !!caskId,
        staleTime: 30000, // Cache for 30 seconds
    });

    // Query for highest bid
    const highestBidQuery = useQuery({
        queryKey: [KEY_MARKET_DATA.ASK_HIGHEST, caskId],
        queryFn: () => {
            if (!caskId) return Promise.reject(new Error("No cask ID"));
            return caskBidService.getHighBid(caskId);
        },
        enabled: !!caskId,
        staleTime: 30000,
    });

    // Query for lowest ask
    const lowestAskQuery = useQuery({
        queryKey: [KEY_ASK.ASK_LOWEST, caskId],
        queryFn: () => {
            if (!caskId) return Promise.reject(new Error("No cask ID"));
            return caskAskService.getLowestAsk(caskId);
        },
        enabled: !!caskId,
        staleTime: 30000,
    });

    // Extract market data
    const marketData = marketDataQuery.data?.marketData;
    const highestBid = highestBidQuery.data;
    const lowestAsk = lowestAskQuery.data;
    const isMarketDataLoading =
        marketDataQuery.isLoading ||
        highestBidQuery.isLoading ||
        lowestAskQuery.isLoading;

    const TABS_DATA: Record<
        string,
        {
            label: string;
            subField?: string;
            formatData?: (value: string) => string;
            unit?: string;
        }
    > = {
        distillery: {
            label: "Distillery",
            subField: "name",
        },
        region: {
            label: "Region",
            subField: "country",
        },
        caskType: {
            label: "Cask Type",
            subField: "name",
        },
        classification: {
            label: "Classification",
            subField: "name",
        },
        distillationDate: {
            label: "Distillation Date",
            formatData(value) {
                const date = new Date(value);
                const formattedDate = date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });
                return `${formattedDate} ${this.unit ? `(${this.unit})` : ""}`;
            },
        },
        vintageYear: {
            label: "Current Age",
            formatData(value) {
                const date = new Date(value);
                const currentYear = new Date().getFullYear();
                const age = currentYear - date.getFullYear();
                return `${age} ${this.unit}`;
            },
            unit: "Years",
        },
        abv: {
            label: "ABV",
            unit: "%",
            formatData(value) {
                return `${value}${this.unit}`;
            },
        },
        rla: {
            label: "RLA",
            unit: "Litres",
            formatData(value) {
                return `${value} ${this.unit}`;
            },
        },
        estimatedBottleCount: {
            label: "Bottles",
            unit: "bottles",
            formatData(value) {
                return `${value} ${this.unit}`;
            },
        },
    };
    if (!caskDetails) {
        return <ContentDetailSkeleton className="col-start-2 col-end-8" />;
    }

    return (
        <div className={cn("flex flex-col", className)}>
            <div className="mb-[3.75rem] aspect-[782/600] w-full overflow-hidden rounded-lg tb:hidden">
                <ImagePlaceholder
                    src={caskDetails?.imageUrl}
                    width={1500}
                    alt="Cask Image"
                    priority
                    fetchPriority="high"
                    height={1200}
                    className="h-full w-full [&_img]:h-full [&_img]:w-full"
                />
            </div>
            <div className="flex flex-col">
                <h2 className="mb-6 text-2xl font-medium capitalize text-typo-primary tb:mb-4 tb:mt-8 tb:text-lg mb:mt-6">
                    General Information
                </h2>
                <ReadMore
                    amountOfWords={50}
                    id="general-information"
                    text={caskDetails?.description}
                />
                <div className="mb-6 mt-[1.375rem] grid grid-cols-3 !gap-2.5 mb:mb-0 mb:mt-0 mb:grid-cols-1 mb:!gap-0">
                    {Object.entries(TABS_DATA).map(([key, value]) => {
                        const displayValue = value?.subField
                            ? //eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (caskDetails as Record<string, any>)?.[key]?.[
                                  value?.subField
                              ]
                            : value.formatData &&
                              value.formatData(
                                  caskDetails?.[
                                      key as keyof typeof caskDetails
                                  ] as string
                              );

                        return (
                            <TooltipWrap title={displayValue} key={key}>
                                <div className="w-full rounded-[0.3125rem] bg-bg-sf1 px-4 py-3 mb:rounded-none mb:border-b mb:border-bd-main mb:bg-transparent mb:px-0 mb:py-4">
                                    <div className="flex flex-col gap-1 mb:flex-row mb:items-start mb:justify-between mb:gap-4">
                                        <div className="text-base text-typo-soft mb:shrink-0 mb:text-sm">
                                            {value.label}
                                        </div>
                                        <div className="js-text-ellipsis line-clamp-1 break-all text-base font-medium text-typo-primary mb:line-clamp-2 mb:text-right mb:text-sm">
                                            {displayValue || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </TooltipWrap>
                        );
                    })}
                </div>
                <div className="flex flex-col">
                    {!isMarketDataLoading &&
                        caskDetails?.tastingNotes &&
                        caskDetails?.tastingNotes
                            .split("\n")
                            .map((note: string) => (
                                <InsightItem
                                    key={note}
                                    className="border-b border-bd-brown last:border-b-0"
                                    content={note}
                                />
                            ))}

                    {isMarketDataLoading && (
                        <>
                            <InsightItemSkeleton />
                            <InsightItemSkeleton />
                        </>
                    )}
                </div>
                {/* <div className="flex flex-col">
                    <h2 className="mb-6 text-2xl font-medium capitalize text-typo-primary">
                        Price History
                    </h2>
                    <div className="mb-5">
                        <ChartHistory />
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold text-typo-soft">
                            Historical Data
                        </h3>
                        <div className="grid grid-cols-3 !gap-2.5">
                            <div className="flex flex-col gap-2 rounded-[0.3125rem] bg-bg-sf1 px-4 py-3">
                                <div className="text-base text-typo-soft">
                                    Current Highest Bid
                                </div>
                                <div className="text-base font-semibold text-success">
                                    {isMarketDataLoading ? (
                                        <Skeleton className="h-4 w-16" />
                                    ) : highestBid ? (
                                        `${formatCurrency(highestBid.bidPrice)}`
                                    ) : (
                                        "No bids"
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 rounded-[0.3125rem] bg-bg-sf1 px-4 py-3">
                                <div className="text-base text-typo-soft">
                                    Current Lowest Ask
                                </div>
                                <div className="text-base font-semibold text-error">
                                    {isMarketDataLoading ? (
                                        <Skeleton className="h-4 w-16" />
                                    ) : lowestAsk ? (
                                        `${formatCurrency(lowestAsk.askPrice)}`
                                    ) : (
                                        "No asks"
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 rounded-[0.3125rem] bg-bg-sf1 px-4 py-3">
                                <div className="text-base text-typo-soft">
                                    Bid-Ask Spread
                                </div>
                                <div className="text-base font-semibold text-typo-primary">
                                    {isMarketDataLoading ? (
                                        <Skeleton className="h-4 w-16" />
                                    ) : highestBid && lowestAsk ? (
                                        `${formatCurrency(lowestAsk.askPrice - highestBid.bidPrice)}`
                                    ) : (
                                        "N/A"
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 rounded-[0.3125rem] bg-bg-sf1 px-4 py-3">
                                <div className="text-base text-typo-soft">
                                    Total Active Bids
                                </div>
                                <div className="text-base font-semibold text-typo-primary">
                                    {isMarketDataLoading ? (
                                        <Skeleton className="h-4 w-8" />
                                    ) : (
                                        marketData?.bids?.reduce(
                                            (total, bid) =>
                                                total + bid.quantity,
                                            0
                                        ) || 0
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 rounded-[0.3125rem] bg-bg-sf1 px-4 py-3">
                                <div className="text-base text-typo-soft">
                                    Total Active Asks
                                </div>
                                <div className="text-base font-semibold text-typo-primary">
                                    {isMarketDataLoading ? (
                                        <Skeleton className="h-4 w-8" />
                                    ) : (
                                        marketData?.asks?.reduce(
                                            (total, ask) =>
                                                total + ask.quantity,
                                            0
                                        ) || 0
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 rounded-[0.3125rem] bg-bg-sf1 px-4 py-3">
                                <div className="text-base text-typo-soft">
                                    Recent Sales
                                </div>
                                <div className="text-base font-semibold text-typo-primary">
                                    {isMarketDataLoading ? (
                                        <Skeleton className="h-4 w-8" />
                                    ) : (
                                        marketData?.sales?.length || 0
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export const ContentDetailSkeleton = ({
    className,
}: {
    className?: string;
}) => {
    return (
        <div className={className}>
            <div className="flex flex-col">
                <Skeleton className="mb-16 aspect-[782/600] w-full tb:aspect-[782/400]" />
                <Skeleton className="mb-2 h-2 w-40" />
                <Skeleton className="mb-6 h-2 w-28" />
                <Skeleton className="mb-2 h-2 w-full" />
                <Skeleton className="mb-2 h-2 w-5/6" />
                <Skeleton className="mb-2 h-2 w-4/6" />
                <Skeleton className="mb-6 h-2 w-3/6" />
                <div className="mb-6 grid grid-cols-3 !gap-2.5">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton className="py-6 pl-4" key={index}>
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-2 w-40 bg-bg-sf2 tb:w-20" />
                                <Skeleton className="w-30 h-2 bg-bg-sf2 tb:w-10" />
                            </div>
                        </Skeleton>
                    ))}
                </div>
                <div className="flex flex-col">
                    <InsightItemSkeleton />
                    <InsightItemSkeleton />
                </div>
                <div className="flex flex-col">
                    <Skeleton className="mb-2 w-40" />
                    <Skeleton className="mb-6 w-28" />
                    <Skeleton className="mb-5 aspect-[782/250] w-full tb:aspect-[782/150]" />
                    <Skeleton className="mb-6 w-40" />
                    <Skeleton className="mb-6 w-28" />
                    <div className="mb-6 grid grid-cols-3 !gap-2.5">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton className="py-6 pl-4" key={index}>
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-2 w-40 bg-bg-sf2 tb:w-20" />
                                    <Skeleton className="w-30 h-2 bg-bg-sf2 tb:w-10" />
                                </div>
                            </Skeleton>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
