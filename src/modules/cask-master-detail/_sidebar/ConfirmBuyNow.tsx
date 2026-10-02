import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import useCalculatePriceCask from "@/hooks/useCalculatePriceCask";
import useDiscount from "@/hooks/useDiscount";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { useInvalidateCaskCache } from "@/hooks/useInvalidateCaskCache";
import useMatchingBids from "@/hooks/useMatchingBids";
import {
    CASK_KEYS,
    KEY_BID,
    KEY_TRADING,
    ROUTE_PUBLIC,
    SIDEBAR_TABS,
} from "@/lib/constants";
import {
    formatCurrency,
    getErrorMessage,
    handleRenderFallbackText,
} from "@/lib/utils";
import { caskBidService } from "@/services/cask-bid";
import { marketOrderService } from "@/services/market-order";
import { useCheckout } from "@/store/checkout";
import { cask } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { useCaskDetail } from "../provider";

export default function ConfirmBuyNow({ id }: { id: string }) {
    const { quantity, priceCaskCurrent, discountSelected } = useCheckout();
    const { data: caskDetail } = useGetStateQuery<cask.TCask>({
        key: [CASK_KEYS.CASK_DETAIL, id],
    });

    const {
        canFullyFulfill,
        isLoading: isMatchingBidsLoading,
        fulfillmentSummary: { desiredQuantity, fulfilledQuantity } = {},
    } = useMatchingBids({
        caskId: id,
        maxBidAmount: priceCaskCurrent,
        desiredQuantity: quantity,
    });

    const { bidCalQuery } = useCalculatePriceCask({
        bidData: {
            price: priceCaskCurrent,
            quantity: quantity,
            discountCode: discountSelected?.discountCode?.code,
            sessionId: caskBidService.getOrCreateSessionId(),
        },
    });

    const {
        totalAmount,
        subtotal,
        processingFeeAmount,
        processingFeePercent,
        discountAmount,
    } = bidCalQuery.data || {};

    const renderSubContent = useCallback(() => {
        if (isMatchingBidsLoading) {
            return <Skeleton className="h-10 w-full" />;
        }
        if (canFullyFulfill) {
            return (
                <div className="mt-4 rounded-md bg-bg-sf1 p-2.5 text-sm text-typo-soft">
                    Your order was fully filled. Confirm to proceed with
                    payment.
                </div>
            );
        } else if (
            fulfilledQuantity &&
            fulfilledQuantity > 0 &&
            !canFullyFulfill
        ) {
            return (
                <div className="mt-4 rounded-md bg-bg-sf1 p-2.5 text-sm text-typo-soft">
                    Your order was partially filled. The remaining casks will be
                    placed as a bid. You can update it in Bid Management.
                </div>
            );
        } else {
            return (
                <div className="mt-4 rounded-md bg-bg-sf1 p-2.5 text-sm text-typo-soft">
                    Your order cannot be filled now and will be placed as a bid.
                    You can update it in Bid Management.
                </div>
            );
        }
    }, [
        canFullyFulfill,
        isMatchingBidsLoading,
        fulfilledQuantity,
        desiredQuantity,
    ]);

    return (
        <div className="flex h-full flex-col px-6 pb-6 pt-4 tb:px-5">
            <div className="flex flex-col gap-5">
                {/* 1. Header (Cask Image & Name) */}
                <div className="flex flex-row items-center gap-4 border-b border-bd-main pb-5">
                    <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-full border border-bd-main bg-bg-sf2">
                        <ImagePlaceholder
                            src={caskDetail?.imageUrl}
                            width={120}
                            height={120}
                            alt={caskDetail?.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h4 className="text-base font-semibold text-typo-primary">
                            {caskDetail?.name || "Cask Name"}
                        </h4>
                        <div className="mt-0.5 flex flex-row items-center gap-1.5 text-sm">
                            <span className="text-typo-soft">Vintage</span>
                            <span className="font-semibold text-typo-primary">
                                {handleRenderFallbackText(
                                    caskDetail?.vintageYear
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Cask quantities & price summary */}
                <div className="grid grid-cols-3 gap-4 border-b border-bd-main pb-5">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-typo-soft">
                            Casks requested
                        </span>
                        <span className="text-sm font-semibold text-typo-primary">
                            {desiredQuantity || quantity || 0}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-typo-soft">
                            Available to acquire
                        </span>
                        <span className="text-sm font-semibold text-typo-primary">
                            {fulfilledQuantity || 0}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-typo-soft">
                            Price per cask
                        </span>
                        <span className="text-sm font-semibold text-typo-primary">
                            {formatCurrency(Number(priceCaskCurrent))}
                        </span>
                    </div>
                </div>

                <Accordion
                    type="single"
                    collapsible
                    defaultValue="payment"
                    className="w-full"
                >
                    <AccordionItem
                        value="payment"
                        className="border-b border-bd-main pb-5"
                    >
                        <AccordionTrigger
                            classNameChevron="w-4 h-4 !text-typo-sub"
                            className="flex w-full items-center justify-between py-2 text-sm font-semibold text-typo-primary"
                        >
                            Payment breakdown
                        </AccordionTrigger>
                        <AccordionContent className="pt-3">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-typo-soft">
                                        Cask subtotal
                                    </span>
                                    <span className="font-semibold text-typo-primary">
                                        {formatCurrency(subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-typo-soft">
                                        Processing fee (
                                        {processingFeePercent || 5}%)
                                    </span>
                                    <span className="font-semibold text-typo-primary">
                                        {formatCurrency(processingFeeAmount)}
                                    </span>
                                </div>
                                {discountAmount && discountAmount > 0 ? (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-typo-soft">
                                            Discounts
                                        </span>
                                        <span className="font-semibold text-success">
                                            -{formatCurrency(discountAmount)}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* 4. Total and footnote */}
                <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-baseline justify-between">
                        <span className="text-sm font-semibold text-typo-primary">
                            Total
                        </span>
                        <span className="font-reckless text-xl font-semibold text-typo-primary">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>
                    <span className="text-xs text-typo-soft">
                        Discounts applied at checkout.
                    </span>
                </div>

                {/* 5. Sub-content notice if any */}
                {renderSubContent()}
            </div>
        </div>
    );
}

export const ConfirmBuyNowFooter = ({ id }: { id: string }) => {
    const {
        discountSelected,
        setPriceCaskCurrent,
        quantity,
        priceCaskCurrent,
        setQuantity,
    } = useCheckout();
    const { data: session } = useSession();

    const router = useRouter();
    const { setSidebarCurrent } = useCaskDetail();
    const { confirmDiscount, isConfirming: isConfirmingDiscount } =
        useDiscount();
    const queryClient = useQueryClient();
    const { invalidateAllForBid } = useInvalidateCaskCache();

    const createCaskBidsMutation = useMutation({
        mutationFn: marketOrderService.buyNow,
        mutationKey: [KEY_TRADING.BUY_NOW],
    });

    const { bidCalQuery, refetchBid } = useCalculatePriceCask({
        bidData: {
            price: priceCaskCurrent,
            quantity: quantity,
            discountCode: discountSelected?.discountCode?.code,
            sessionId: caskBidService.getOrCreateSessionId(),
        },
    });
    const currentPriceMutation = useMutation({
        mutationFn: marketOrderService.getCurrentPrice,
        mutationKey: [KEY_TRADING.CURRENT_PRICE],
    });

    const fetchCheckoutTransaction = useCallback(
        async (bidId: string) => {
            return queryClient.fetchQuery({
                queryKey: [KEY_BID.BID_TRANSACTIONS, bidId],
                queryFn: () =>
                    caskBidService.getTransactionsFormBidId({ bidId }),
                staleTime: 1000 * 60 * 5,
            });
        },
        [queryClient]
    );

    const { totalAmount } = bidCalQuery.data || {};

    const handleBuyNow = async () => {
        if (!totalAmount) return;
        try {
            const { lowestAsk } = await currentPriceMutation.mutateAsync({
                caskId: id,
            });
            if (Number(lowestAsk) !== Number(priceCaskCurrent)) {
                queryClient.invalidateQueries({
                    queryKey: [KEY_BID.BID_MARKET_DATA, id],
                });
                queryClient.invalidateQueries({
                    queryKey: [KEY_TRADING.CURRENT_PRICE, id],
                });

                setPriceCaskCurrent(Number(lowestAsk));
                toast.warning("The floor price has changed", {
                    description: `Your order has been updated to ${lowestAsk}`,
                });
                await refetchBid({
                    price: lowestAsk,
                    quantity: quantity,
                    discountCode: discountSelected?.discountCode?.code,
                    sessionId: caskBidService.getOrCreateSessionId(),
                });
                return;
            }

            const { matchingSummary: { totalMatchableCost } = {}, bidId } =
                (await createCaskBidsMutation.mutateAsync({
                    caskId: id,
                    quantity: quantity,
                    maxPrice: Number(priceCaskCurrent),
                    displayedPrice: Number(priceCaskCurrent),
                })) || {};
            // if (discountSelected?.reservationId) {
            //     try {
            //         const response = await confirmDiscount(
            //             discountSelected?.reservationId
            //         );
            //         if ((response as Error)?.message) {
            //             toast.error(
            //                 getErrorMessage(
            //                     response,
            //                     "Failed to confirm discount"
            //                 )
            //             );
            //             return;
            //         }
            //     } catch (error: unknown) {
            //         toast.error(
            //             getErrorMessage(error, "Failed to confirm discount")
            //         );
            //         return;
            //     }
            // }
            if (!totalMatchableCost) {
                setSidebarCurrent(null);
                return;
            }
            if (!session?.user?.id) {
                toast.error("User not found");
                return;
            }

            const {
                data: { transactions: [{ checkoutSessionId }] = [] } = {},
            } = await fetchCheckoutTransaction(bidId);
            if (!checkoutSessionId) {
                toast.error("Checkout session not found");
                return;
            }
            setQuantity(1);
            toast.success("Order confirmed. Redirecting to payment...");

            invalidateAllForBid(id);

            setTimeout(() => {
                router.push(
                    `${ROUTE_PUBLIC.CHECKOUT}/${checkoutSessionId}/${ROUTE_PUBLIC.CHECKOUT_PAY_DEPOSIT}`
                );
            }, 1000);
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to buy now"));
        }
    };

    return (
        <div className="flex w-full flex-row items-center gap-3 border-t border-bd-main bg-bg-main p-6">
            <Button
                className="h-12 w-full rounded-none font-semibold"
                variant="outline"
                onClick={() => setSidebarCurrent(SIDEBAR_TABS.BUY_NOW)}
            >
                Back
            </Button>
            <Button
                className="h-12 w-full rounded-none bg-brand font-semibold text-typo-primary transition-colors duration-200 hover:bg-brand/90"
                variant="default"
                onClick={handleBuyNow}
                disabled={
                    isConfirmingDiscount ||
                    createCaskBidsMutation.isPending ||
                    currentPriceMutation.isPending
                }
            >
                {createCaskBidsMutation.isPending
                    ? "Confirming..."
                    : "Confirm order"}
            </Button>
        </div>
    );
};
