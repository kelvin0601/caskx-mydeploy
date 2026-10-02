import CaskCardQuantity from "@/components/shared/cask-card-quantity";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
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
import { formatCurrency, getErrorMessage } from "@/lib/utils";
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
    const { quantity, priceCaskCurrent } = useCheckout();
    const { data: caskDetail } = useGetStateQuery<cask.TCask>({
        key: [CASK_KEYS.CASK_DETAIL, id],
    });
    // const dataCacheMarket = useGetStateQuery({
    //     key: [KEY_BID.BID_MARKET_DATA, id],
    //     fetchFn: () => caskBidService.getCaskBidMarketData(id),
    // });
    const {
        canFullyFulfill,
        isLoading: isMatchingBidsLoading,
        fulfillmentSummary: { desiredQuantity, fulfilledQuantity } = {},
    } = useMatchingBids({
        caskId: id,
        maxBidAmount: priceCaskCurrent,
        desiredQuantity: quantity,
    });

    const renderSubContent = useCallback(() => {
        if (isMatchingBidsLoading) {
            return (
                <Skeleton className="flex-center flex h-14 w-full">
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-2">
                        <Skeleton className="h-4 w-full bg-bg-sf2" />
                        <Skeleton className="h-4 w-full bg-bg-sf2" />
                    </div>
                </Skeleton>
            );
        }
        if (canFullyFulfill) {
            return (
                <div className="rounded-md bg-bg-sf1 p-2.5 text-sm text-typo-soft">
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
                <div className="rounded-md bg-bg-sf1 p-2.5 text-sm text-typo-soft">
                    Your order was partially filled. The remaining casks will be
                    placed as a bid. You can update it in Bid Management.
                </div>
            );
        } else {
            return (
                <div className="rounded-md bg-bg-sf1 p-2.5 text-sm text-typo-soft">
                    Your order cannot be filled now and will be placed as a bid.
                    You can update it in Bid Management.
                </div>
            );
        }
    }, [canFullyFulfill, isMatchingBidsLoading]);

    return (
        <div className="flex h-full flex-col pt-4">
            <div className="flex flex-col gap-4">
                <CaskCardQuantity
                    priceCask={priceCaskCurrent}
                    subContent="Bid Price: "
                    data={{
                        ...caskDetail!,
                        lowestAsk: priceCaskCurrent,
                    }}
                    countQuantity={`${fulfilledQuantity || 0}/${desiredQuantity || 0}`}
                    isShowQuantity={true}
                />
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
    const { setOpen } = useSidebar();

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

    const {
        totalAmount,
        subtotal,
        processingFeeAmount,
        processingFeePercent,
        discountAmount,
    } = bidCalQuery.data || {};

    const dataRender = {
        subTotal: {
            label: "Cask Price",
            value: () => formatCurrency(subtotal),
        },
        processingFee: {
            label: `Processing Fee (${processingFeePercent}%)`,
            value: () => `${formatCurrency(processingFeeAmount)}`,
        },
        ...(discountAmount &&
            discountAmount > 0 && {
                discounts: {
                    label: "Discounts",
                    value: () => (
                        <span className="text-success">
                            -{formatCurrency(discountAmount)}
                        </span>
                    ),
                },
            }),
    };

    const handleBuyNow = async () => {
        console.log("totalAmount", totalAmount);
        if (!totalAmount) {
            return;
        }
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
                // toast.error("Failed to buy now");
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
            setOpen(false);
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
        <div className="sticky bottom-0 w-full bg-bg-sf1 p-6">
            <Accordion type="single" collapsible>
                <AccordionItem value="subtotal" className="border-none">
                    <AccordionTrigger
                        classNameChevron="w-5 h-5"
                        className="!w-max items-center !justify-start gap-2 pb-1 pt-0 [&>svg]:-rotate-180 [&[data-state=open]>svg]:rotate-0"
                    >
                        <div className="flex flex-row items-center gap-2">
                            <span className="text-base font-medium text-typo-soft">
                                Subtotal
                            </span>
                            <span className="text-xl font-semibold text-typo-soft tb:text-lg">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-3">
                        <Table>
                            {Object.entries(dataRender).map(
                                ([key, content]) => (
                                    <TableBody
                                        key={key}
                                        className="w-full border-y border-solid border-bd-brown [&:not(:last-child)]:border-b-0"
                                    >
                                        <TableRow className="grid-cols-2">
                                            <TableCell className="text-sm font-medium text-typo-primary">
                                                {content.label}
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-typo-soft">
                                                {content.value?.()}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                )
                            )}
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="inline w-full items-center gap-1 text-sm text-typo-soft">
                The subtotal may vary depending on market conditions, and the
                final price will be calculated at checkout.
            </div>
            <div className="flex flex-row items-center gap-3">
                <Button
                    className="mt-4 w-full"
                    variant={"outline"}
                    onClick={() => setSidebarCurrent(SIDEBAR_TABS.BUY_NOW)}
                >
                    Cancel
                </Button>
                <Button
                    className="mt-4 w-full disabled:bg-bg-sf2"
                    variant={"secondary"}
                    onClick={handleBuyNow}
                    disabled={
                        isConfirmingDiscount ||
                        createCaskBidsMutation.isPending ||
                        currentPriceMutation.isPending
                    }
                >
                    {!createCaskBidsMutation.isPending
                        ? "Confirm order"
                        : "Confirming..."}
                </Button>
            </div>
        </div>
    );
};
