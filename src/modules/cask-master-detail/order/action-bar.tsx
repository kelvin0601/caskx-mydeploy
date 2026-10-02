import { Button } from "@/components/ui/button";
import { KEY_BID, STRIPE_KEYS } from "@/lib/constants";
import { cn, formatCurrency, handleRenderFallbackText } from "@/lib/utils";
import stripeService from "@/services/stripe";
import { useBoundStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useCaskDetail } from "../provider";
import { caskMaster } from "@/types";
import { caskBid } from "@/types/cask-bid";

import { useStripePayouts } from "@/hooks/useStripePayouts";
import { useTradingVerification } from "../use-trading-verification";
import { useMarketOrderFlowActions } from "@/modules/market-orders/flow/provider";
import { MARKET_ORDER_INTENT } from "@/modules/market-orders/constants";

type TActionBarProps = {
    caskActive: caskMaster.TCaskChild;
    marketData?: caskBid.TCaskBidMarketData | null;
    className?: string;
};

export default function ActionBar({
    caskActive,
    marketData,
    className,
}: TActionBarProps) {
    const { user } = useBoundStore();
    const { startFlow } = useMarketOrderFlowActions();
    const { setIsOpenDialogVerify, setDialogType } = useCaskDetail();
    const queryClient = useQueryClient();
    const payoutsQuery = useStripePayouts(user?.stripeAccount?.id);
    const { isCheckingVerification, runIfVerified } = useTradingVerification();
    const [isCheckingPayout, setIsCheckingPayout] = useState(false);
    const sellCheckPromiseRef = useRef<Promise<void> | null>(null);

    const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");

    const totalActiveAsks = marketData?.totalActiveAsks || 0;
    const totalActiveBids = marketData?.totalActiveBids || 0;
    const floorPrice =
        marketData?.lowestAsk ??
        caskActive?.lowestAsk ??
        caskActive?.referencePriceMin;
    const highBid =
        marketData?.highestBid ??
        caskActive?.highestBid ??
        caskActive?.referencePriceMax;
    const delta30D: number | null = null;

    const handleActionMarketBuy = useCallback(
        async (action: () => void) => {
            await runIfVerified(action);
        },
        [runIfVerified]
    );

    const handleActionMarketSell = useCallback(
        async (action: () => void) => {
            if (sellCheckPromiseRef.current) {
                await sellCheckPromiseRef.current;
                return;
            }

            const sellCheckPromise = runIfVerified(async (verifiedUser) => {
                const accountId = verifiedUser.stripeAccount?.id;

                if (!accountId) {
                    setDialogType("addBank");
                    setIsOpenDialogVerify(true);
                    return;
                }

                setIsCheckingPayout(true);

                try {
                    const payoutData = await queryClient.fetchQuery({
                        queryKey: [STRIPE_KEYS.PAYOUTS, accountId || ""],
                        queryFn: () => stripeService.getPayouts(accountId),
                        staleTime: 1000 * 60 * 5,
                    });

                    if (!payoutData.payouts?.externalAccounts?.length) {
                        setDialogType("addBank");
                        setIsOpenDialogVerify(true);
                        return;
                    }

                    action();
                } catch (error) {
                    console.error("Failed to check payout method", error);
                    toast.error("Unable to check your payout method", {
                        description: "Please try again in a moment.",
                    });
                } finally {
                    setIsCheckingPayout(false);
                }
            });

            sellCheckPromiseRef.current = sellCheckPromise.then(() => {});

            try {
                await sellCheckPromiseRef.current;
            } finally {
                sellCheckPromiseRef.current = null;
            }
        },
        [runIfVerified, queryClient, setDialogType, setIsOpenDialogVerify]
    );

    const isCheckingTradingAccess =
        isCheckingVerification || isCheckingPayout || payoutsQuery.isLoading;

    return (
        <div className={cn("z-30 border-t bg-bg-main p-2", className)}>
            <div className="bg-bg-dark-grey">
                <div className="flex flex-col gap-5 p-6 tb:p-5 mb:gap-4 mb:p-4">
                    <div className="flex w-max flex-row gap-1 bg-bg-dark-sf3 p-1">
                        <Button
                            variant="tab"
                            mode="dark"
                            size="tab"
                            className={cn(
                                activeTab === "buy"
                                    ? "bg-bg-dark-sf3 font-semibold text-[#FFFCF6]"
                                    : "bg-transparent font-semibold text-[#FFFCF6]/50",
                                "h-[1.875rem] px-3 py-1.5 text-sm"
                            )}
                            onClick={() => {
                                setActiveTab("buy");
                                queryClient.invalidateQueries({
                                    queryKey: [KEY_BID.BID_MARKET_DATA],
                                });
                            }}
                        >
                            Buy
                        </Button>
                        <Button
                            variant="tab"
                            mode="dark"
                            size="tab"
                            className={cn(
                                activeTab === "sell"
                                    ? "bg-bg-dark-sf3 font-semibold text-[#FFFCF6]"
                                    : "bg-transparent font-semibold text-[#FFFCF6]/50",
                                "h-[1.875rem] px-3 py-1.5 text-sm"
                            )}
                            onClick={() => {
                                setActiveTab("sell");
                                queryClient.invalidateQueries({
                                    queryKey: [KEY_BID.BID_MARKET_DATA],
                                });
                            }}
                        >
                            Sell
                        </Button>
                    </div>

                    <div className="flex flex-row gap-1 [&>div]:flex-1">
                        {/* Left: floor price */}
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-[#FFFCF6]/40">
                                {activeTab === "buy"
                                    ? "Floor Price"
                                    : "Top Offer"}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-typo-dark-primary">
                                    {activeTab === "buy"
                                        ? floorPrice
                                            ? handleRenderFallbackText(
                                                  formatCurrency(floorPrice)
                                              )
                                            : "-"
                                        : highBid
                                          ? handleRenderFallbackText(
                                                formatCurrency(highBid)
                                            )
                                          : "-"}
                                </span>
                            </div>
                        </div>

                        {/* Right: availability */}
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-xs text-[#FFFCF6]/40">
                                {activeTab === "buy"
                                    ? "Availability"
                                    : "Demand"}
                            </span>
                            <span className="text-sm font-semibold text-typo-dark-primary">
                                {activeTab === "buy"
                                    ? totalActiveAsks
                                    : totalActiveBids}
                            </span>
                        </div>
                    </div>

                    {activeTab === "buy" ? (
                        <div className="flex gap-1">
                            {/* Buy Now */}
                            {totalActiveAsks > 0 && caskActive?.readyToSell && (
                                <Button
                                    variant="primary"
                                    mode="dark"
                                    className="flex-1 capitalize"
                                    disabled={
                                        !caskActive?.readyToSell ||
                                        isCheckingVerification
                                    }
                                    onClick={() => {
                                        handleActionMarketBuy(() => {
                                            startFlow(
                                                MARKET_ORDER_INTENT.BUY_NOW
                                            );
                                        });
                                    }}
                                >
                                    Buy Now
                                </Button>
                            )}
                            {/* Make Offer / Place Bid */}
                            <Button
                                variant="outline-text"
                                mode="dark"
                                className="flex-1 capitalize"
                                disabled={
                                    !caskActive?.readyToSell ||
                                    isCheckingVerification
                                }
                                onClick={() => {
                                    handleActionMarketBuy(() => {
                                        startFlow(
                                            MARKET_ORDER_INTENT.PLACE_BID
                                        );
                                    });
                                }}
                            >
                                Make Offer
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-1">
                            {/* Sell Now */}
                            {totalActiveBids > 0 && caskActive?.readyToSell && (
                                <Button
                                    variant="primary"
                                    mode="dark"
                                    className="flex-1 capitalize"
                                    disabled={
                                        !caskActive?.readyToSell ||
                                        isCheckingTradingAccess
                                    }
                                    onClick={() => {
                                        handleActionMarketSell(() => {
                                            startFlow(
                                                MARKET_ORDER_INTENT.SELL_NOW
                                            );
                                        });
                                    }}
                                >
                                    Sell Now
                                </Button>
                            )}
                            {/* Place Ask */}
                            <Button
                                variant="outline-text"
                                mode="dark"
                                className="flex-1 capitalize"
                                disabled={
                                    !caskActive?.readyToSell ||
                                    isCheckingTradingAccess
                                }
                                onClick={() => {
                                    handleActionMarketSell(() => {
                                        startFlow(
                                            MARKET_ORDER_INTENT.PLACE_ASK
                                        );
                                    });
                                }}
                            >
                                List For Sale
                            </Button>
                        </div>
                    )}

                    {/* Not ready to sell notice */}
                    {!caskActive?.readyToSell && (
                        <p className="text-sm text-typo-dark-note">
                            Trading opens very soon, check back shortly!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
