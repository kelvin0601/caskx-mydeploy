import { Button } from "@/components/ui/button";
import useOrderCalculation from "@/modules/market-orders/hooks/use-order-calculation";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { useInvalidateCaskCache } from "@/hooks/useInvalidateCaskCache";
import useBuyOrderMatching from "@/modules/market-orders/hooks/use-buy-order-matching";
import { CASK_KEYS, ROUTE_PUBLIC } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import caskServices from "@/services/cask";
import { caskBidService } from "@/services/cask-bid";
import {
    useMarketOrderFlowActions,
    useMarketOrderFlowState,
} from "@/modules/market-orders/flow/provider";
import { cask } from "@/types";
import useSubmitBuyNow from "@/modules/market-orders/flows/buy-now/use-submit-buy-now";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useCaskDetail } from "../provider";
import ConfirmOrderHeader from "./components/confirm-order-header";

import OrderFilledContent from "@/modules/market-orders/components/order-filled-content";
import PartialFilledContent from "./components/partial-filled-content";
import PendingOrderSection from "@/modules/market-orders/components/pending-order-section";
import { ConfirmBuyNowContentSkeleton } from "./skeletons/ConfirmBuyNowSkeleton";
import {
    MARKET_ORDER_KIND,
    MARKET_ORDER_OUTCOME,
} from "@/modules/market-orders/constants";

export default function ConfirmBuyNow({ id }: { id: string }) {
    const { draft, placeRemainingOrder } = useMarketOrderFlowState();
    const { updateDraft, setPlaceRemainingOrder } = useMarketOrderFlowActions();
    const {
        quantity,
        price: priceCaskCurrent,
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
        isLoading: isMatchingBidsLoading,
        fulfilledQuantity = 0,
        requestedQuantity,
        matchFully,
        matchPartially,
        notMatch,
    } = useBuyOrderMatching({
        caskId: id,
        maximumPrice: priceCaskCurrent,
        quantity,
    });
    const casksRequested = requestedQuantity || quantity || 0;
    const remainingQuantity = casksRequested - fulfilledQuantity;
    const payoutQuantity = matchPartially ? fulfilledQuantity : casksRequested;

    const { bidCalQuery } = useOrderCalculation({
        bidData: {
            price: priceCaskCurrent,
            quantity: payoutQuantity,
            // discountCode: discountSelected?.discountCode?.code,
            sessionId: caskBidService.getOrCreateSessionId(),
        },
        enabled: !isMatchingBidsLoading && (matchFully || matchPartially),
    });

    const {
        totalAmount,
        subtotal,
        processingFeeAmount,
        processingFeePercent,
        discountAmount,
    } = bidCalQuery.data || {};

    const isPriceLoading =
        (matchFully || matchPartially) &&
        (!bidCalQuery.data || bidCalQuery.isFetching);
    const isLoading = isCaskLoading || isMatchingBidsLoading || isPriceLoading;

    useEffect(() => {
        setLoadingState("confirmBuyNow", isLoading);

        return () => setLoadingState("confirmBuyNow", false);
    }, [isLoading, setLoadingState]);

    if (isLoading) {
        return <ConfirmBuyNowContentSkeleton />;
    }
    return (
        <div className="mb-6 flex flex-col gap-5 tb:mb-5 mb:mb-4 mb:gap-4">
            {/* Header row */}
            <ConfirmOrderHeader
                caskDetail={caskDetail}
                casksRequested={casksRequested}
                availableToAcquire={fulfilledQuantity}
                pricePerCask={priceCaskCurrent}
                isLoading={isMatchingBidsLoading}
            />

            {/* Content by case */}
            {notMatch ? (
                <PendingOrderSection
                    kind={MARKET_ORDER_KIND.OFFER}
                    quantity={casksRequested}
                    executionPolicy={fulfillmentPreference}
                    onExecutionPolicyChange={(value) =>
                        updateDraft({ executionPolicy: value })
                    }
                    expirationDays={offerExpiration}
                    onExpirationDaysChange={(value) =>
                        updateDraft({ expirationDays: value })
                    }
                />
            ) : matchPartially ? (
                <PartialFilledContent
                    subtotal={subtotal}
                    processingFeeAmount={processingFeeAmount}
                    processingFeePercent={processingFeePercent}
                    discountAmount={discountAmount}
                    totalAmount={totalAmount}
                    remainingQuantity={remainingQuantity}
                    pricePerCask={priceCaskCurrent}
                    placeOfferOnRemaining={placeRemainingOrder}
                    setPlaceOfferOnRemaining={setPlaceRemainingOrder}
                    fulfillmentPreference={fulfillmentPreference}
                    setFulfillmentPreference={(value) =>
                        updateDraft({ executionPolicy: value })
                    }
                    offerExpiration={offerExpiration}
                    setOfferExpiration={(value) =>
                        updateDraft({ expirationDays: value })
                    }
                />
            ) : (
                <OrderFilledContent
                    subtotal={subtotal}
                    processingFeeAmount={processingFeeAmount}
                    processingFeePercent={processingFeePercent}
                    discountAmount={discountAmount}
                    totalAmount={totalAmount}
                />
            )}
        </div>
    );
}

export const ConfirmBuyNowFooter = ({ id }: { id: string }) => {
    const { draft, placeRemainingOrder } = useMarketOrderFlowState();
    const { updateDraft, backToEdit, closeFlow } = useMarketOrderFlowActions();
    const { quantity, price: priceCaskCurrent } = draft;
    const { data: session } = useSession();

    const router = useRouter();
    // const { confirmDiscount, isConfirming: isConfirmingDiscount } =
    //     useDiscount();
    const { invalidateAllForBid } = useInvalidateCaskCache();

    const {
        canFullyFulfill,
        fulfilledQuantity = 0,
        isLoading: isMatchingBidsLoading,
    } = useBuyOrderMatching({
        caskId: id,
        maximumPrice: Number(priceCaskCurrent),
        quantity,
    });

    const isPartialFilled = fulfilledQuantity > 0 && canFullyFulfill === false;

    const { submit, isPending } = useSubmitBuyNow();

    const { bidCalQuery, refetchBid } = useOrderCalculation({
        bidData: {
            price: priceCaskCurrent,
            quantity: isPartialFilled ? fulfilledQuantity : quantity,
            // discountCode: discountSelected?.discountCode?.code,
            sessionId: caskBidService.getOrCreateSessionId(),
        },
        enabled: !isMatchingBidsLoading,
    });
    const { totalAmount } = bidCalQuery.data || {};

    const handleBuyNow = async () => {
        if (!totalAmount) return;
        try {
            if (!session?.user?.id) {
                toast.error("User not found");
                return;
            }

            const outcome = await submit({
                caskId: id,
                draft,
                fulfilledQuantity,
                canFullyFulfill,
                placeRemainingOrder,
            });

            if (outcome.type === MARKET_ORDER_OUTCOME.OPEN_ORDER) {
                toast.success("Offer placed successfully");
                closeFlow();
                return;
            }

            if (outcome.type === MARKET_ORDER_OUTCOME.PRICE_CHANGED) {
                updateDraft({ price: outcome.price });
                toast.warning("The floor price has changed", {
                    description: `Your order has been updated to ${outcome.price}`,
                });
                await refetchBid({
                    price: outcome.price,
                    quantity,
                    sessionId: caskBidService.getOrCreateSessionId(),
                });
                return;
            }

            if (outcome.type !== MARKET_ORDER_OUTCOME.CHECKOUT) return;
            closeFlow();
            toast.success("Order confirmed. Redirecting to payment...");

            setTimeout(() => {
                router.push(
                    `${ROUTE_PUBLIC.CHECKOUT}/${outcome.sessionId}/${ROUTE_PUBLIC.CHECKOUT_SELLER_CONFIRM}`
                );
            }, 1000);
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Something went wrong. Please try again."
                )
            );
        } finally {
            invalidateAllForBid(id);
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
                onClick={handleBuyNow}
                disabled={isPending}
            >
                {isPending ? "Confirming..." : "Confirm Order"}
            </Button>
        </div>
    );
};
