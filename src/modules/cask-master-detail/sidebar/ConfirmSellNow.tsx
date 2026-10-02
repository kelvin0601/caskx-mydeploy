import { Button } from "@/components/ui/button";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { useInvalidateCaskCache } from "@/hooks/useInvalidateCaskCache";
import { CASK_KEYS, ROUTE_PUBLIC } from "@/lib/constants";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import PendingOrderSection from "@/modules/market-orders/components/pending-order-section";
import {
    MARKET_ORDER_KIND,
    MARKET_ORDER_OUTCOME,
} from "@/modules/market-orders/constants";
import {
    useMarketOrderFlowActions,
    useMarketOrderFlowState,
} from "@/modules/market-orders/flow/provider";
import useSubmitSellNow from "@/modules/market-orders/flows/sell-now/use-submit-sell-now";
import useOrderCalculation from "@/modules/market-orders/hooks/use-order-calculation";
import useSellOrderMatching from "@/modules/market-orders/hooks/use-sell-order-matching";
import caskServices from "@/services/cask";
import { caskBidService } from "@/services/cask-bid";
import { cask } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useCaskDetail } from "../provider";
import ConfirmOrderHeader from "./components/confirm-order-header";
import PayoutBreakdownContent from "./components/payout-breakdown-content";
import RemainingCasksListing from "./components/remaining-casks-listing";
import {
    ConfirmSellNowBreakdownSkeleton,
    ConfirmSellNowCaseSkeleton,
} from "./skeletons/ConfirmSellNowSkeleton";

export default function ConfirmSellNow({ id }: { id: string }) {
    const { draft, placeRemainingOrder } = useMarketOrderFlowState();
    const { updateDraft, setPlaceRemainingOrder } = useMarketOrderFlowActions();
    const {
        price: priceCaskCurrent,
        quantity,
        executionPolicy: fulfillmentPreference,
        expirationDays: offerExpiration,
    } = draft;
    const { setLoadingState } = useCaskDetail();

    const { data: caskDetail, status: caskStatus } =
        useGetStateQuery<cask.TCask>({
            key: [CASK_KEYS.CASK_DETAIL, id],
            fetchFn: () => caskServices.getDetailCask(id),
        });
    const isCaskLoading = caskStatus === "pending" && !caskDetail;

    const {
        isLoading: isMatchingAskLoading,
        fulfilledQuantity,
        remainingQuantity,
        requestedQuantity,
        matchFully,
        matchPartially,
        notMatch,
    } = useSellOrderMatching({
        caskId: id,
        minimumPrice: priceCaskCurrent,
        quantity,
    });

    const casksToSell = requestedQuantity || quantity;
    const casksToBeSold = fulfilledQuantity || 0;
    const casksRemaining =
        remainingQuantity || Math.max(casksToSell - casksToBeSold, 0);
    const payoutQuantity = matchPartially ? casksToBeSold : casksToSell;

    const { askCalQuery } = useOrderCalculation({
        askData: {
            askPrice: priceCaskCurrent,
            quantity: payoutQuantity,
            sessionId: caskBidService.getOrCreateSessionId(),
        },
        enabled: !isMatchingAskLoading && (matchFully || matchPartially),
    });

    const { totalAmount, subtotal, processingFeeAmount, processingFeePercent } =
        askCalQuery.data || {};

    const remainingListPrice =
        Number(caskDetail?.priceReference) || priceCaskCurrent;
    const isPriceLoading =
        (matchFully || matchPartially) &&
        (!askCalQuery.data || askCalQuery.isFetching);
    const isConfirmSaleLoading =
        isCaskLoading || isMatchingAskLoading || isPriceLoading;

    useEffect(() => {
        setLoadingState("confirmSellNow", isConfirmSaleLoading);

        return () => setLoadingState("confirmSellNow", false);
    }, [isConfirmSaleLoading, setLoadingState]);

    return (
        <div className="mb-6 flex flex-col gap-5 tb:mb-5 mb:mb-4 mb:gap-4">
            <ConfirmOrderHeader
                caskDetail={caskDetail}
                casksRequested={casksToSell}
                availableToAcquire={casksToBeSold}
                pricePerCask={priceCaskCurrent}
                isLoading={isMatchingAskLoading}
                requestedLabel="Casks to sell"
                availableLabel="Casks to be sold"
            />

            {isMatchingAskLoading ? (
                <ConfirmSellNowCaseSkeleton />
            ) : notMatch ? (
                <PendingOrderSection
                    kind={MARKET_ORDER_KIND.LISTING}
                    quantity={casksToSell}
                    executionPolicy={fulfillmentPreference}
                    onExecutionPolicyChange={(value) =>
                        updateDraft({ executionPolicy: value })
                    }
                    expirationDays={offerExpiration}
                    onExpirationDaysChange={(value) =>
                        updateDraft({ expirationDays: value })
                    }
                    footnote="Payout is issued once the buyer's payment is complete. A 5% processing fee is included upon match."
                />
            ) : (matchFully || matchPartially) && askCalQuery.isFetching ? (
                <ConfirmSellNowBreakdownSkeleton
                    showRemainingOption={matchPartially}
                    showPendingListing={matchPartially && placeRemainingOrder}
                />
            ) : matchFully || matchPartially ? (
                <>
                    <PayoutBreakdownContent
                        subtotal={subtotal}
                        processingFeeAmount={processingFeeAmount}
                        processingFeePercent={processingFeePercent}
                        totalAmount={totalAmount}
                        divideAfterTotal={matchPartially}
                    />

                    {matchPartially && (
                        <RemainingCasksListing
                            remainingQuantity={casksRemaining}
                            listingPrice={remainingListPrice}
                            isListingRemaining={placeRemainingOrder}
                            setIsListingRemaining={setPlaceRemainingOrder}
                            fulfillmentPreference={fulfillmentPreference}
                            setFulfillmentPreference={(value) =>
                                updateDraft({ executionPolicy: value })
                            }
                            listingExpiration={offerExpiration}
                            setListingExpiration={(value) =>
                                updateDraft({ expirationDays: value })
                            }
                        />
                    )}
                </>
            ) : null}
        </div>
    );
}

export const ConfirmSellNowFooter = ({ id }: { id: string }) => {
    const { draft, placeRemainingOrder } = useMarketOrderFlowState();
    const { backToEdit, closeFlow, updateDraft } = useMarketOrderFlowActions();
    const { price: priceCaskCurrent, quantity } = draft;
    const router = useRouter();

    const { invalidateAllForAsk, invalidateCaskDetail } =
        useInvalidateCaskCache();
    const {
        fulfilledQuantity,
        isLoading: isMatchingAskLoading,
        isFullyFulfilled,
        isPartiallyFulfilled,
        isUnfulfilled,
    } = useSellOrderMatching({
        caskId: id,
        minimumPrice: priceCaskCurrent,
        quantity,
    });

    const { submit, isPending } = useSubmitSellNow();

    const handleSellNow = async () => {
        try {
            if (isMatchingAskLoading || !priceCaskCurrent || !quantity) return;

            const outcome = await submit({
                caskId: id,
                draft,
                fulfilledQuantity,
                isFullyFulfilled,
                isPartiallyFulfilled,
                isUnfulfilled,
                placeRemainingOrder,
            });

            if (outcome.type === MARKET_ORDER_OUTCOME.OPEN_ORDER) {
                toast.success("Listing placed");
                closeFlow();
                return;
            }

            if (outcome.type === MARKET_ORDER_OUTCOME.PRICE_CHANGED) {
                updateDraft({ price: outcome.price });
                toast.warning("The top offer has changed", {
                    description: `Your order has been updated to ${formatCurrency(outcome.price)}`,
                });
                invalidateCaskDetail(id);
                return;
            }

            if (outcome.type === MARKET_ORDER_OUTCOME.PAYOUT) {
                toast.success(
                    outcome.hasRemainingOrder
                        ? "Sale confirmed. Listing placed for remaining casks. Redirecting to payout..."
                        : "Sale confirmed. Redirecting to payout..."
                );
                setTimeout(() => {
                    router.push(`${ROUTE_PUBLIC.PAYOUT}/${outcome.payoutId}`);
                }, 1000);
            } else if (outcome.type === MARKET_ORDER_OUTCOME.COMPLETED) {
                toast.success("Sale confirmed");
            }
            closeFlow();
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Something went wrong. Please try again."
                )
            );
        } finally {
            invalidateCaskDetail(id);
            invalidateAllForAsk(id);
        }
    };

    return (
        <div className="flex items-center justify-end gap-1 mb:[&>button]:flex-1">
            <Button
                className="h-auto min-w-0 rounded-none text-sm font-medium capitalize"
                variant="outline"
                onClick={backToEdit}
            >
                Back
            </Button>
            <Button
                variant="primary"
                onClick={handleSellNow}
                disabled={
                    isPending ||
                    isMatchingAskLoading ||
                    (!isFullyFulfilled &&
                        !isPartiallyFulfilled &&
                        !isUnfulfilled) ||
                    !priceCaskCurrent ||
                    !quantity
                }
            >
                {isPending ? "Confirming..." : "Confirm Sale"}
            </Button>
        </div>
    );
};
