import { OrderCard } from "@/components/shared/order-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CHECKOUT_TYPE } from "@/enum/checkout";
import { useStripePayouts } from "@/hooks/useStripePayouts";
import { KEY_BID, SIDEBAR_TABS } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { useBoundStore } from "@/store";
import { useCheckout } from "@/store/checkout";
import { caskBid } from "@/types/cask-bid";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useCaskDetail } from "../provider";
import ImagePlaceholder from "@/components/shared/image-placeholder";

export default function Order({
    className,
    marketData,
}: {
    className: string;
    marketData?: caskBid.TCaskBidMarketData;
}) {
    const { caskDetails, user } = useBoundStore();
    const { setTypeCheckout, setQuantity } = useCheckout();
    const { setSidebarCurrent, setIsOpenDialogVerify, setDialogType } =
        useCaskDetail();
    const queryClient = useQueryClient();
    const payoutsQuery = useStripePayouts(user?.stripeAccount?.id);

    const totalActiveAsks = marketData?.totalActiveAsks || 0;
    const totalActiveBids = marketData?.totalActiveBids || 0;

    const handleActionMarketBuy = useCallback(
        async (action: () => void) => {
            if (!user?.isVerified) {
                setDialogType("verify");
                setIsOpenDialogVerify(true);
            } else {
                action?.();
            }
        },
        [user?.isVerified]
    );
    const handleActionMarketSell = useCallback(
        async (action: () => void) => {
            if (!user?.isVerified) {
                setDialogType("verify");
                setIsOpenDialogVerify(true);
            } else if (!payoutsQuery?.data?.payouts?.externalAccounts?.length) {
                setIsOpenDialogVerify(true);
                setDialogType("addBank");
            } else {
                action?.();
            }
        },
        [
            user?.isVerified,
            payoutsQuery?.data?.payouts?.externalAccounts?.length,
        ]
    );
    return (
        <div className={cn("", className)}>
            <div className="sticky top-24 flex !max-h-[min(calc(100vh-4rem),36rem)] w-full flex-col overflow-hidden transition-all duration-300 header-hidden:top-8 tb:!max-h-none height-sm:top-10">
                <div className="flex flex-row justify-between">
                    <h1 className="mb-8 text-4xl font-medium capitalize tracking-tighter text-typo-primary [word-break:auto-phrase] tb:text-3xl mb:mb-4 mb:text-2xl height-sm:h-[10vh]">
                        {caskDetails?.name}
                    </h1>
                    {/* <Button
                        variant={"empty"}
                        className="h-max !min-w-max p-2.5 text-typo-note [&:hover]:text-brand [&:hover_path]:fill-brand [&_path]:fill-transparent [&_path]:transition-all [&_path]:duration-500"
                    >
                        <div className="flex h-5 w-5">
                            <IconStar />
                        </div>
                    </Button> */}
                </div>
                <div className="mb-[3.75rem] hidden aspect-[782/600] w-full overflow-hidden rounded-lg tb:mb-8 tb:block mb:mb-4">
                    <ImagePlaceholder
                        src={caskDetails?.imageUrl || ""}
                        width={1500}
                        alt="Cask Image"
                        height={1200}
                        className="h-full w-full [&_img]:h-full [&_img]:w-full"
                    />
                </div>

                <Tabs
                    defaultValue="buy"
                    className="flex flex-1 flex-col overflow-hidden mb:p-4 mb:pt-4"
                >
                    <TabsList className="grid w-full grid-cols-2 gap-x-3 border-b border-bd-main">
                        <TabsTrigger
                            className="-mb-[1px] text-base text-typo-soft"
                            value="buy"
                            onClick={() => {
                                setTypeCheckout(CHECKOUT_TYPE.BID);
                                setQuantity(1);
                                queryClient.invalidateQueries({
                                    queryKey: [KEY_BID.BID_MARKET_DATA],
                                });
                            }}
                        >
                            Buy cask
                        </TabsTrigger>
                        <TabsTrigger
                            className="-mb-[1px] text-base text-typo-soft"
                            value="sell"
                            onClick={async () => {
                                setTypeCheckout(CHECKOUT_TYPE.ASK);
                                setQuantity(1);
                                queryClient.invalidateQueries({
                                    queryKey: [KEY_BID.BID_MARKET_DATA],
                                });
                            }}
                        >
                            Sell cask
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value="buy"
                        className="-mr-4 flex-1 overflow-y-auto pr-4"
                    >
                        <OrderCard
                            className=" "
                            disabledQuantity={!caskDetails?.readyToSell}
                            labelMarket="Last sale:"
                            label={
                                marketData?.lowestAsk && totalActiveAsks > 0
                                    ? "Buy now for"
                                    : "Expected Value"
                            }
                            priceLabel={
                                marketData?.lowestAsk?.toString() ||
                                caskDetails?.priceReference
                            }
                            priceMarket={marketData?.lowestAsk}
                            subLabel={() =>
                                totalActiveAsks ? (
                                    <span>
                                        Only <b>{totalActiveAsks}</b>{" "}
                                        {totalActiveAsks > 1 ? "asks" : "ask"}{" "}
                                        left
                                    </span>
                                ) : (
                                    <></>
                                )
                            }
                        >
                            <div className="flex flex-row items-center gap-3 mb:gap-2">
                                <Button
                                    size={"lg"}
                                    className="flex-1 disabled:bg-bg-sf2"
                                    variant={"primary"}
                                    disabled={!caskDetails?.readyToSell}
                                    onClick={() => {
                                        handleActionMarketBuy(() => {
                                            setSidebarCurrent(
                                                SIDEBAR_TABS.PLACE_BID
                                            );
                                        });
                                    }}
                                >
                                    Place Bid
                                </Button>

                                {totalActiveAsks > 0 &&
                                    caskDetails?.readyToSell && (
                                        <Button
                                            disabled={!caskDetails?.readyToSell}
                                            size={"lg"}
                                            className="flex-1"
                                            variant={"secondary"}
                                            onClick={() => {
                                                handleActionMarketBuy(() => {
                                                    setSidebarCurrent(
                                                        SIDEBAR_TABS.BUY_NOW
                                                    );
                                                });
                                            }}
                                        >
                                            Buy Now
                                        </Button>
                                    )}
                            </div>
                        </OrderCard>
                        {!caskDetails?.readyToSell && (
                            <div className="mt-4 text-typo-soft mb:text-sm">
                                This cask is just settling in! Trading opens
                                very soon, check back shortly.
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent
                        value="sell"
                        className="-mr-4 flex-1 overflow-y-auto pr-4"
                    >
                        <OrderCard
                            disabledQuantity={!caskDetails?.readyToSell}
                            className=""
                            label={
                                marketData?.highestBid && totalActiveBids > 0
                                    ? "Sell now for"
                                    : "Expected Value"
                            }
                            labelMarket="Last sale:"
                            priceMarket={marketData?.highestBid || 0}
                            priceLabel={
                                marketData?.highestBid?.toString() ||
                                caskDetails?.priceReference
                            }
                        >
                            <div className="flex flex-row items-center gap-3 mb:gap-2">
                                <Button
                                    className="flex-1 disabled:bg-bg-sf2"
                                    size={"lg"}
                                    disabled={!caskDetails?.readyToSell}
                                    variant={"primary"}
                                    onClick={() => {
                                        handleActionMarketSell(() => {
                                            setSidebarCurrent(
                                                SIDEBAR_TABS.PLACE_ASK
                                            );
                                        });
                                    }}
                                >
                                    Place Ask
                                </Button>
                                {totalActiveBids > 0 &&
                                    caskDetails?.readyToSell && (
                                        <Button
                                            className="flex-1"
                                            size={"lg"}
                                            disabled={!caskDetails?.readyToSell}
                                            variant={"secondary"}
                                            onClick={() => {
                                                handleActionMarketSell(() => {
                                                    setSidebarCurrent(
                                                        SIDEBAR_TABS.SELL_NOW
                                                    );
                                                });
                                            }}
                                        >
                                            Sell Now
                                        </Button>
                                    )}
                            </div>
                        </OrderCard>
                        {!caskDetails?.readyToSell && (
                            <div className="mt-4 text-typo-soft mb:text-sm">
                                This cask is just settling in! Trading opens
                                very soon, check back shortly.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export const OrderSkeleton = ({ className }: { className: string }) => {
    return (
        <div className={cn("", className)}>
            <div className="sticky top-[9.25rem] flex w-full flex-col">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="mb-2 h-2 w-40" />
                        <Skeleton className="mb-10 h-2 w-28" />
                    </div>
                    <Skeleton className="h-10 w-10" />
                </div>

                <Skeleton className="flex flex-col">
                    <Skeleton className="h-12 bg-bg-sf2" />
                    <div className="flex flex-col p-6">
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col">
                                <Skeleton className="mb-2 h-2 w-40 bg-bg-sf2" />
                                <Skeleton className="mb-4 h-2 w-28 bg-bg-sf2" />
                                <Skeleton className="mb-4 h-2 w-28 bg-bg-sf2" />
                            </div>
                            <Skeleton className="h-2 w-28 flex-shrink-0 bg-bg-sf2" />
                        </div>
                        <Skeleton className="mb-4 h-12 w-full bg-bg-sf2" />
                        <div className="mb-6 flex flex-row gap-3">
                            <Skeleton className="h-12 flex-1 bg-bg-sf2" />
                            <Skeleton className="h-12 flex-1 bg-bg-sf2" />
                        </div>
                        <div className="flex flex-row items-center justify-between">
                            <div className="flex flex-col">
                                <Skeleton className="mb-2 h-2 w-40 bg-bg-sf2" />
                                <Skeleton className="mb-2 h-2 w-28 bg-bg-sf2" />
                            </div>
                            <Skeleton className="mb-2 h-2 w-28 bg-bg-sf2" />
                        </div>
                    </div>
                </Skeleton>
            </div>
        </div>
    );
};
