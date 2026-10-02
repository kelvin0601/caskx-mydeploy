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
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { useInvalidateCaskCache } from "@/hooks/useInvalidateCaskCache";
import useMatchingAsk from "@/hooks/useMatchingAsk";
import {
    CASK_KEYS,
    KEY_ASK,
    KEY_TRADING,
    ROUTE_PUBLIC,
    SIDEBAR_TABS,
} from "@/lib/constants";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { caskBidService } from "@/services/cask-bid";
import { marketOrderService } from "@/services/market-order";
import { useCheckout } from "@/store/checkout";
import { cask } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { useCaskDetail } from "../provider";

export default function ConfirmSellNow({ id }: { id: string }) {
    const { priceCaskCurrent, quantity } = useCheckout();
    const { data: caskDetail } = useGetStateQuery<cask.TCask>({
        key: [CASK_KEYS.CASK_DETAIL, id],
    });
    const {
        canFullyFulfill,
        isLoading: isMatchingAskLoading,
        fulfillmentSummary: { desiredQuantity, fulfilledQuantity } = {},
    } = useMatchingAsk({
        caskId: id,
        minAskAmount: priceCaskCurrent,
        desiredQuantity: quantity,
    });
    const renderSubContent = useCallback(() => {
        if (isMatchingAskLoading) {
            return (
                <Skeleton className="h-14 w-full">
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
                    Your order was fully filled. Confirm to start selling your
                    casks.
                </div>
            );
        } else if (fulfilledQuantity && fulfilledQuantity > 0) {
            return (
                <div className="rounded-md bg-bg-sf1 p-2.5 text-sm text-typo-soft">
                    Your order was partially filled. The remaining casks will be
                    placed as an ask. You can update it in Ask Management.
                </div>
            );
        } else {
            return (
                <div className="rounded-md bg-bg-sf1 p-2.5 text-sm text-typo-soft">
                    Your order cannot be filled now and will be placed as an
                    ask. You can update it in Ask Management.
                </div>
            );
        }
    }, [canFullyFulfill, isMatchingAskLoading]);

    return (
        <div className="flex h-full flex-col pt-4">
            <div className="flex flex-col gap-4">
                <CaskCardQuantity
                    priceCask={priceCaskCurrent}
                    subContent="Ask Price: "
                    data={{
                        ...caskDetail!,
                        highestBid: priceCaskCurrent,
                    }}
                    isShowQuantity={true}
                    countQuantity={`${fulfilledQuantity || 0}/${desiredQuantity || 0}`}
                />
                {renderSubContent()}
            </div>
        </div>
    );
}

export const ConfirmSellNowFooter = ({ id }: { id: string }) => {
    const { priceCaskCurrent, quantity, setQuantity } = useCheckout();
    const { setSidebarCurrent } = useCaskDetail();
    const { setOpen } = useSidebar();
    const { invalidateAllForAsk, invalidateCaskDetail } =
        useInvalidateCaskCache();
    const { askCalQuery } = useCalculatePriceCask({
        askData: {
            askPrice: priceCaskCurrent,
            quantity: quantity,
            sessionId: caskBidService.getOrCreateSessionId(),
        },
    });
    const router = useRouter();
    const { totalAmount, subtotal, processingFeeAmount, processingFeePercent } =
        askCalQuery.data || {};

    const sellNowMutation = useMutation({
        mutationFn: marketOrderService.sellNow,
        mutationKey: [KEY_ASK.ASK_CREATE],
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to place sell order"));
        },
        onSuccess: () => {
            toast.success("Sell order placed successfully");
            setOpen(false);
            setQuantity(1);
            invalidateAllForAsk(id);
        },
    });

    const dataRender = {
        subTotal: {
            label: "Cask Price",
            value: () => formatCurrency(subtotal || 0),
        },
        processingFee: {
            label: `Processing Fee (${processingFeePercent || 0}%)`,
            value: () => `-${formatCurrency(processingFeeAmount || 0)}`,
        },
    };
    const currentPriceMutation = useMutation({
        mutationFn: marketOrderService.getCurrentPrice,
        mutationKey: [KEY_TRADING.CURRENT_PRICE],
    });

    const handleSellNow = async () => {
        if (!totalAmount) {
            return;
        }
        let price: number;
        price = priceCaskCurrent;
        const { highestBid } = await currentPriceMutation.mutateAsync({
            caskId: id,
        });

        if (Number(highestBid) !== Number(priceCaskCurrent)) {
            toast.error("Price has changed, please try again");
            invalidateCaskDetail(id);
            price = highestBid;
        }

        const response = sellNowMutation.mutateAsync({
            caskId: id,
            displayedPrice: Number(price),
            quantity: quantity,
        });

        const {
            remainderOrder,
            matchSummary: { totalMatchedQuantity },
        } = await response;
        if (remainderOrder?.orderId && totalMatchedQuantity > 0) {
            router.push(`${ROUTE_PUBLIC.PAYOUT}/${remainderOrder.orderId}`);
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
                    onClick={() => setSidebarCurrent(SIDEBAR_TABS.SELL_NOW)}
                >
                    Cancel
                </Button>
                <Button
                    className="mt-4 w-full disabled:bg-bg-sf2"
                    variant={"secondary"}
                    onClick={handleSellNow}
                    disabled={
                        sellNowMutation.isPending ||
                        currentPriceMutation.isPending
                    }
                >
                    {!sellNowMutation.isPending
                        ? "Confirm order"
                        : "Confirming..."}
                </Button>
            </div>
        </div>
    );
};
