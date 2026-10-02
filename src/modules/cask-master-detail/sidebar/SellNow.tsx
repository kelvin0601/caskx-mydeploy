import CaskSummary from "@/components/shared/cask-summary";
import { Button } from "@/components/ui/button";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { MARKET_ORDER_INTENT } from "@/modules/market-orders/constants";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { CASK_KEYS, KEY_ASK, KEY_BID } from "@/lib/constants/key";
import { formatCurrency } from "@/lib/utils";
import caskServices from "@/services/cask";
import caskAskService from "@/services/cask-ask";
import { caskBidService } from "@/services/cask-bid";
import {
    useMarketOrderFlowActions,
    useMarketOrderFlowState,
} from "@/modules/market-orders/flow/provider";
import { cask } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCaskDetail } from "../provider";
import QuantitySelector from "@/modules/market-orders/components/quantity-selector";
import { SellNowSkeleton } from "./skeletons";

const preloadConfirmSellNow = () => import("./ConfirmSellNow");

export default function SellNow({ id }: { id: string }) {
    const { draft } = useMarketOrderFlowState();
    const { updateDraft } = useMarketOrderFlowActions();
    const { setLoadingState } = useCaskDetail();

    const { data: caskDetail, status: caskStatus } =
        useGetStateQuery<cask.TCask>({
            key: [CASK_KEYS.CASK_DETAIL, id],
            fetchFn: () => caskServices.getDetailCask(id),
        });

    const { data: marketData, status: marketStatus } = useGetStateQuery({
        key: [KEY_BID.BID_MARKET_DATA, id],
        fetchFn: () => caskBidService.getCaskBidMarketData(id),
    });

    const isCaskLoading = caskStatus === "pending" && !caskDetail;
    const isMarketLoading = marketStatus === "pending" && !marketData;
    const highestBid = marketData?.highestBid ?? 0;
    const demand = marketData?.totalActiveBids ?? 0;

    useEffect(() => {
        setLoadingState("sellNow", isCaskLoading || isMarketLoading);

        return () => setLoadingState("sellNow", false);
    }, [isCaskLoading, isMarketLoading, setLoadingState]);

    useEffect(() => {
        updateDraft({ price: Number(highestBid) });
    }, [highestBid, updateDraft]);

    if (isCaskLoading || isMarketLoading) {
        return <SellNowSkeleton />;
    }

    return (
        <div className="grid grid-cols-10 items-center gap-5 py-3 tb:grid-cols-12 mb:grid-cols-4 mb:!gap-y-0 mb:py-4">
            <CaskSummary
                imageUrl={caskDetail?.imageUrl}
                name={caskDetail?.master?.name}
                vintageYear={caskDetail?.vintageYear}
                className="col-span-5 tb:col-span-6 mb:col-span-full"
            />

            <div className="col-span-2 flex flex-1 flex-col gap-1.5 mb:col-span-full mb:mt-4 mb:flex-row mb:items-center mb:justify-between mb:gap-1">
                <span className="text-xs leading-none text-typo-soft mb:text-sm">
                    Top Offer
                </span>
                <div className="flex items-end">
                    <span className="text-sm font-semibold text-typo-primary tb:text-sm">
                        {formatCurrency(highestBid)}
                    </span>
                    <span className="text-sm font-normal text-typo-soft">
                        /cask
                    </span>
                </div>
            </div>

            <div className="col-span-3 flex flex-row items-center gap-4 tb:col-span-4 mb:col-span-full mb:mt-1 mb:w-full mb:flex-col mb:gap-2">
                <div className="flex flex-1 flex-col gap-1.5 mb:w-full mb:flex-row mb:items-center mb:justify-between">
                    <span className="text-xs leading-none text-typo-soft mb:text-sm">
                        Demand
                    </span>
                    <span className="text-sm font-semibold text-typo-primary">
                        {demand}
                    </span>
                </div>

                <QuantitySelector
                    quantity={draft.quantity}
                    setQuantity={(quantity) => updateDraft({ quantity })}
                />
            </div>
        </div>
    );
}

export const SellNowFooter = ({ id }: { id: string }) => {
    const { draft } = useMarketOrderFlowState();
    const { switchFlow, goToConfirm, updateDraft } =
        useMarketOrderFlowActions();
    const { price: priceCaskCurrent, quantity } = draft;
    const queryClient = useQueryClient();
    const [isPreparingConfirm, setIsPreparingConfirm] = useState(false);

    const prepareConfirmSale = async () => {
        const sessionId = caskBidService.getOrCreateSessionId();
        const [, matchingResult] = await Promise.all([
            preloadConfirmSellNow(),
            queryClient.fetchQuery({
                queryKey: [
                    KEY_BID.BID_MATCHING_ASKS,
                    priceCaskCurrent,
                    quantity,
                    id,
                ],
                queryFn: () =>
                    caskBidService.getMatchingBids({
                        minAskAmount: priceCaskCurrent,
                        caskId: id,
                        desiredQuantity: quantity,
                    }),
                staleTime: 5_000,
            }),
        ]);

        const matchedQuantity =
            matchingResult.fulfillmentSummary?.fulfilledQuantity ?? 0;

        if (!matchedQuantity) return matchedQuantity;

        const askData = {
            askPrice: priceCaskCurrent,
            quantity,
            sessionId,
        };

        await queryClient.prefetchQuery({
            queryKey: [KEY_ASK.ASK_CALCULATE_PRICE, { ...askData }],
            queryFn: () => caskAskService.calculateAskPrice(askData),
            staleTime: 5_000,
        });

        return matchedQuantity;
    };

    const handleReviewSale = async () => {
        setIsPreparingConfirm(true);

        try {
            const matchedQuantity = await prepareConfirmSale();
            console.log("matchedQuantity_________", matchedQuantity);
            if (!matchedQuantity) {
                updateDraft({
                    executionPolicy: EBidExecutionPolicy.FULL_AT_ONCE,
                });
            }

            goToConfirm();
        } catch {
            toast.error("Unable to load the confirmation screen");
        } finally {
            setIsPreparingConfirm(false);
        }
    };

    return (
        <div className="flex items-center justify-between mb:flex-col-reverse mb:gap-2">
            <div className="flex items-center gap-1">
                <span className="text-sm text-typo-soft">
                    Prefer to set your own price?
                </span>
                <Button
                    variant="link"
                    onClick={() => switchFlow(MARKET_ORDER_INTENT.PLACE_ASK)}
                >
                    List For Sale Instead
                </Button>
            </div>

            <Button
                variant="primary"
                className="mb:w-full"
                disabled={!priceCaskCurrent || isPreparingConfirm}
                onMouseEnter={() =>
                    void prepareConfirmSale().catch(() => undefined)
                }
                onFocus={() => void prepareConfirmSale().catch(() => undefined)}
                onClick={handleReviewSale}
            >
                {isPreparingConfirm ? "Loading..." : "Review Sale"}
            </Button>
        </div>
    );
};
