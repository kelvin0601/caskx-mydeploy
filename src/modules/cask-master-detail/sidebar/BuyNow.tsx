import CaskSummary from "@/components/shared/cask-summary";
import { Button } from "@/components/ui/button";
import QuantitySelector from "@/modules/market-orders/components/quantity-selector";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { CASK_KEYS, KEY_BID } from "@/lib/constants/key";
import { cn, formatCurrency } from "@/lib/utils";
import caskServices from "@/services/cask";
import { caskBidService } from "@/services/cask-bid";
import {
    useMarketOrderFlowActions,
    useMarketOrderFlowState,
} from "@/modules/market-orders/flow/provider";
import { cask } from "@/types";
import { useCallback, useEffect, useMemo } from "react";
import { useCaskDetail } from "../provider";
import { BuyNowSkeleton } from "./skeletons";
import { MARKET_ORDER_INTENT } from "@/modules/market-orders/constants";

export default function BuyNow({ id }: { id: string }) {
    const { draft } = useMarketOrderFlowState();
    const { updateDraft } = useMarketOrderFlowActions();
    const { setLoadingState } = useCaskDetail();

    const { data: caskDetail, status: caskStatus } =
        useGetStateQuery<cask.TCask>({
            key: [CASK_KEYS.CASK_DETAIL, id],
            fetchFn: () => caskServices.getDetailCask(id),
        });

    const { data: dataCacheMarket, status: marketStatus } = useGetStateQuery({
        key: [KEY_BID.BID_MARKET_DATA, id],
        fetchFn: () => caskBidService.getCaskBidMarketData(id),
    });

    const isCaskLoading = caskStatus === "pending" && !caskDetail;
    const isMarketLoading = marketStatus === "pending" && !dataCacheMarket;

    useEffect(() => {
        setLoadingState("buyNow", isCaskLoading || isMarketLoading);

        return () => setLoadingState("buyNow", false);
    }, [isCaskLoading, isMarketLoading, setLoadingState]);

    const lowestAsk = useMemo(() => {
        return dataCacheMarket?.lowestAsk || caskDetail?.priceReference || 0;
    }, [dataCacheMarket?.lowestAsk, caskDetail?.priceReference]);

    useEffect(() => {
        updateDraft({ price: Number(lowestAsk) });
    }, [lowestAsk, updateDraft]);

    if (isCaskLoading || isMarketLoading) {
        return <BuyNowSkeleton />;
    }

    return (
        <div className="grid grid-cols-10 items-center gap-5 py-3 tb:grid-cols-12 mb:grid-cols-4 mb:!gap-y-0 mb:py-4">
            {/* Cask Image & Name */}
            <CaskSummary
                imageUrl={caskDetail?.imageUrl}
                name={caskDetail?.master?.name}
                vintageYear={caskDetail?.vintageYear}
                className="col-span-5 tb:col-span-6 mb:col-span-full"
            />

            <div className="col-span-2 flex flex-1 flex-col gap-1.5 mb:col-span-full mb:mt-4 mb:flex-row mb:items-center mb:justify-between mb:gap-1">
                <span className="text-xs leading-none text-typo-soft mb:text-sm">
                    Floor price
                </span>
                <div className="items-end">
                    <span className="text-sm font-semibold text-typo-primary tb:text-sm">
                        {formatCurrency(Number(lowestAsk))}
                    </span>
                    <span className="text-sm font-normal text-typo-soft">
                        /cask
                    </span>
                </div>
            </div>

            <div className="col-span-3 flex flex-row items-center gap-4 tb:col-span-4 mb:col-span-full mb:mt-1 mb:w-full mb:flex-col mb:gap-2">
                <div className="flex flex-1 flex-col gap-1.5 mb:w-full mb:flex-row mb:items-center mb:justify-between">
                    <span className="text-xs leading-none text-typo-soft mb:text-sm">
                        Availability
                    </span>
                    <span className="text-sm font-semibold text-typo-primary">
                        {dataCacheMarket?.totalActiveAsks || 0}
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

export const BuyNowFooter = ({ id: _id }: { id: string }) => {
    const { switchFlow, goToConfirm } = useMarketOrderFlowActions();

    const handleReviewOrder = useCallback(() => {
        goToConfirm();
    }, [goToConfirm]);

    const handleMakeOffer = useCallback(() => {
        switchFlow(MARKET_ORDER_INTENT.PLACE_BID);
    }, [switchFlow]);

    return (
        <div className="flex items-center justify-between mb:flex-col-reverse mb:gap-2">
            <div className="flex items-center gap-1">
                <span className="text-sm text-typo-soft">
                    Prefer to set your own price?
                </span>
                <Button variant={"link"} onClick={handleMakeOffer}>
                    Make Offer
                </Button>
            </div>

            <Button
                variant="primary"
                className="mb:w-full"
                onClick={handleReviewOrder}
            >
                Review Order
            </Button>
        </div>
    );
};
