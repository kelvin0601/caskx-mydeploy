"use client";

import CaskCardQuantity from "@/components/shared/cask-card-quantity";
import IconHourglass from "@/components/shared/icons/icon-hourglass";
import ActionOptionItem from "@/components/shared/item-action-w-ic";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import useOrderCalculation from "@/modules/market-orders/hooks/use-order-calculation";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { useInvalidateCaskCache } from "@/hooks/useInvalidateCaskCache";
import useBuyOrderMatching from "@/modules/market-orders/hooks/use-buy-order-matching";
import { ROUTE_PUBLIC, SIDEBAR_TABS } from "@/lib/constants";
import { CASK_KEYS, KEY_BID } from "@/lib/constants/key";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { FulfillmentPreferenceItem } from "@/modules/market-orders/components/fulfillment-preference";
import { caskBidService } from "@/services/cask-bid";
import { useCheckout } from "@/store/checkout";
import { cask } from "@/types";
import { caskAsk } from "@/types/cask-ask";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useManageCask } from "../provider";

export default function ConfirmBidManage({ id }: { id: string }) {
    const {
        priceCaskCurrent,
        quantity,
        expirationDays,
        setExpirationDays,
        executionPolicy,
        setExecutionPolicy,
    } = useCheckout();
    const { data: caskDetail } = useGetStateQuery<cask.TCask>({
        key: [CASK_KEYS.CASK_DETAIL, id],
    });
    const {
        isLoading: matchingBidsLoading,
        fulfilledQuantity,
        scenarioPartialSomeNow,
        scenarioPartialOverTime,
        scenarioFullNow,
        requestedQuantity,
    } = useBuyOrderMatching({
        caskId: id,
        maximumPrice: priceCaskCurrent,
        quantity,
    });

    const renderFulfillmentPreference = () => {
        if (matchingBidsLoading)
            return (
                <div className="flex flex-col gap-2">
                    <Skeleton className="flex h-20 w-full flex-col justify-between gap-2 border border-bd-main p-4">
                        <Skeleton className="h-3 w-full bg-bg-sf2"></Skeleton>
                        <Skeleton className="h-3 w-full bg-bg-sf2"></Skeleton>
                        <Skeleton className="h-3 w-full bg-bg-sf2"></Skeleton>
                    </Skeleton>
                    <Skeleton className="flex h-20 w-full flex-col justify-between gap-2 border border-bd-main p-4">
                        <Skeleton className="h-3 w-full bg-bg-sf2"></Skeleton>
                        <Skeleton className="h-3 w-full bg-bg-sf2"></Skeleton>
                        <Skeleton className="h-3 w-full bg-bg-sf2"></Skeleton>
                    </Skeleton>
                </div>
            );

        if (scenarioPartialSomeNow) {
            return (
                <>
                    <FulfillmentPreferenceItem
                        key={`${EBidExecutionPolicy.PARTIAL_ALLOWED}-step1`}
                        title="Take Partial Now, Wait For The Rest"
                        description={`Take ${fulfilledQuantity} casks immediately. Remaining casks will be fulfilled over time as they become available.`}
                        variant="success"
                        label="Recommended"
                        value={EBidExecutionPolicy.PARTIAL_ALLOWED}
                    />
                    <FulfillmentPreferenceItem
                        key={`${EBidExecutionPolicy.FULL_AT_ONCE}-step1`}
                        title="Wait For The Full Quantity"
                        description={`Wait until ${requestedQuantity} casks are available, and match the entire quantity at once.`}
                        variant="warning"
                        label="Possible delay"
                        value={EBidExecutionPolicy.FULL_AT_ONCE}
                    />
                </>
            );
        } else if (scenarioPartialOverTime) {
            return (
                <>
                    <FulfillmentPreferenceItem
                        key={`${EBidExecutionPolicy.PARTIAL_ALLOWED}-step2`}
                        title="Receive Casks When Available"
                        description={`${requestedQuantity} casks will be fulfilled over time as they become available.`}
                        variant="success"
                        label="Recommended"
                        value={EBidExecutionPolicy.PARTIAL_ALLOWED}
                    />
                    <FulfillmentPreferenceItem
                        key={`${EBidExecutionPolicy.FULL_AT_ONCE}-step2`}
                        title="Wait For The Full Quantity"
                        description={`Wait until ${requestedQuantity} casks are available, and match the entire quantity at once.`}
                        variant="warning"
                        label="Possible delay"
                        value={EBidExecutionPolicy.FULL_AT_ONCE}
                    />
                </>
            );
        } else if (scenarioFullNow) {
            return (
                <FulfillmentPreferenceItem
                    key={`step4`}
                    title="Take All Now"
                    description={`You can take ${requestedQuantity} casks immediately at this price.`}
                />
            );
        }
        return null;
    };

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
                    isShowQuantity={true}
                    countQuantity={`${fulfilledQuantity || 0}/${quantity || 0}`}
                />
                <div className="flex flex-col gap-1.5">
                    <div className="text-base font-medium text-typo-primary">
                        Fulfillment Preference
                    </div>
                    <RadioGroup
                        value={executionPolicy}
                        onValueChange={(v) =>
                            setExecutionPolicy(v as EBidExecutionPolicy)
                        }
                    >
                        {renderFulfillmentPreference()}
                    </RadioGroup>
                </div>

                <div className="flex flex-col gap-1.5">
                    <div className="text-base font-medium text-typo-primary">
                        Bid Details
                    </div>

                    <ActionOptionItem
                        title="Ask Expiration In"
                        icon={<IconHourglass />}
                    >
                        <Select
                            value={String(expirationDays)}
                            onValueChange={(v) => setExpirationDays(Number(v))}
                        >
                            <SelectTrigger className="w-auto bg-bg-sf1">
                                <SelectValue placeholder="Select Date" />
                            </SelectTrigger>
                            <SelectContent
                                className="[&_.icon-up]:left-auto [&_.icon-up]:right-0 [&_.icon-up]:-translate-x-0"
                                side="bottom"
                                align="end"
                            >
                                <SelectItem value="1">1 day</SelectItem>
                                <SelectItem value="3">3 days</SelectItem>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="14">14 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="60">60 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </ActionOptionItem>
                </div>
            </div>
        </div>
    );
}

export const ConfirmBidManageFooter = ({
    bidId,
    caskId,
}: {
    bidId?: string;
    caskId?: string;
}) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { priceCaskCurrent, quantity, expirationDays } = useCheckout();
    const { setOpen } = useSidebar();
    const { setSidebarCurrent, status, page, limit, sortBy, order, search } =
        useManageCask();
    const { invalidateAllForBid, invalidateManageBids } =
        useInvalidateCaskCache();
    const { bidCalQuery } = useOrderCalculation({
        bidData: {
            price: priceCaskCurrent,
            quantity: quantity,
            sessionId: caskBidService.getOrCreateSessionId(),
        },
    });

    const { queryKey: matchingBidsKey } = useBuyOrderMatching({
        caskId: caskId as string,
        maximumPrice: priceCaskCurrent,
        quantity,
    });
    // const { data: matchingBidsDataQueryCached } =
    //     useGetStateQuery<caskAsk.TMatchingBidsResponse>({
    //         key: matchingBidsKey as unknown[],
    //     });

    const { totalAmount, subtotal, processingFeeAmount, processingFeePercent } =
        bidCalQuery.data || {};

    const dataRender = {
        subTotal: {
            label: "Bid Price",
            value: () => formatCurrency(subtotal || 0),
        },
        processingFee: {
            label: `Processing Fee (${processingFeePercent || 0}%)`,
            value: () => `${formatCurrency(processingFeeAmount || 0)}`,
        },
    } as const;

    const updateBidMutation = useMutation({
        mutationKey: [KEY_BID.BID_UPDATE, bidId],
        mutationFn: () =>
            caskBidService.updateBid(bidId as string, {
                bidPrice: priceCaskCurrent,
                remainingQuantity: quantity,
                expirationDays,
            }),
    });

    const isPassNextStep = priceCaskCurrent > 0;

    const handleUpdateBid = async () => {
        try {
            const response = await updateBidMutation.mutateAsync();

            toast.success("Bid placed successfully");

            const { checkoutSession: { id: checkoutSessionId } = {} } =
                response;

            setOpen(false);
            void queryClient.invalidateQueries({
                queryKey: [KEY_BID.BID_DETAIL, bidId],
            });
            invalidateManageBids();
            invalidateAllForBid(caskId as string, {
                status,
                page,
                limit,
                sortBy,
                order,
                search,
            });
            if (checkoutSessionId) {
                setTimeout(() => {
                    router.push(
                        `${ROUTE_PUBLIC.CHECKOUT}/${checkoutSessionId}/${ROUTE_PUBLIC.CHECKOUT_PAY_DEPOSIT}`
                    );
                }, 1000);
            }
        } catch (error) {
            toast.error(
                getErrorMessage(error, "Order failed. Please try again")
            );
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
                                {formatCurrency(totalAmount || 0)}
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-3">
                        <Table>
                            {Object.entries(dataRender).map(
                                ([key, content]) => (
                                    <TableBody
                                        key={key}
                                        className="w-full border-y border-solid border-bd-main [&:not(:last-child)]:border-b-0"
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
            <div className="mt-4 flex flex-row items-center justify-between gap-2">
                <Button
                    className="w-full"
                    variant={"outline"}
                    onClick={() => setSidebarCurrent(SIDEBAR_TABS.UPDATE_BID)}
                >
                    Back
                </Button>
                <Button
                    disabled={!isPassNextStep || updateBidMutation.isPending}
                    className="w-full disabled:bg-bg-sf3"
                    variant={"secondary"}
                    onClick={handleUpdateBid}
                >
                    Update Bid
                </Button>
            </div>
        </div>
    );
};
