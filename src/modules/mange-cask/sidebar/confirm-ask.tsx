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
import useSellOrderMatching from "@/modules/market-orders/hooks/use-sell-order-matching";
import { ROUTE_PUBLIC, SIDEBAR_TABS } from "@/lib/constants";
import { CASK_KEYS, KEY_ASK } from "@/lib/constants/key";
import { formatCurrency } from "@/lib/utils";
import { FulfillmentPreferenceItem } from "@/modules/market-orders/components/fulfillment-preference";
import caskAskService from "@/services/cask-ask";
import { useCheckout } from "@/store/checkout";
import { cask } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { useManageCask } from "../provider";

export default function ConfirmAskManage({ id }: { id: string }) {
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
        isLoading: matchingLoading,
        fulfilledQuantity,
        scenarioPartialSomeNow,
        scenarioPartialOverTime,
        scenarioFullNow,
        requestedQuantity,
    } = useSellOrderMatching({
        caskId: id,
        minimumPrice: priceCaskCurrent,
        quantity,
    });

    const renderFulfillmentPreference = useCallback(() => {
        if (matchingLoading)
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
        if (!scenarioFullNow && fulfilledQuantity > 0) {
            return (
                <>
                    <FulfillmentPreferenceItem
                        key={`${EBidExecutionPolicy.PARTIAL_ALLOWED}-step1`}
                        title="Sell Partial Now, Wait For The Rest"
                        description={`Sell ${fulfilledQuantity} casks immediately. Remaining casks will be fulfilled over time as they become available.`}
                        variant="success"
                        label="Recommended"
                        value={EBidExecutionPolicy.PARTIAL_ALLOWED}
                    />
                    <FulfillmentPreferenceItem
                        key={`${EBidExecutionPolicy.FULL_AT_ONCE}-step1`}
                        title="Wait For The Full Quantity"
                        description={`Fulfill ${requestedQuantity} cask(s) together in a single match.`}
                        variant="warning"
                        label="Possible delay"
                        value={EBidExecutionPolicy.FULL_AT_ONCE}
                    />
                </>
            );
        } else if (!scenarioFullNow && fulfilledQuantity === 0) {
            return (
                <>
                    <FulfillmentPreferenceItem
                        key={`${EBidExecutionPolicy.PARTIAL_ALLOWED}-step2`}
                        title="Wait For The Full Quantity"
                        description={`Fulfill ${requestedQuantity} cask(s) together in a single match.`}
                        variant="warning"
                        label="Possible delay"
                        value={EBidExecutionPolicy.PARTIAL_ALLOWED}
                    />
                    <FulfillmentPreferenceItem
                        key={`${EBidExecutionPolicy.FULL_AT_ONCE}-step2`}
                        title="Sell Partial Now, Wait For The Rest"
                        description={`${fulfilledQuantity} casks will be fulfilled over time as they become available.`}
                        variant="success"
                        label="Recommended"
                        value={EBidExecutionPolicy.FULL_AT_ONCE}
                    />
                </>
            );
        } else if (scenarioFullNow) {
            return (
                <FulfillmentPreferenceItem
                    key={`step3`}
                    title="Sell Now"
                    description={`You can sell ${requestedQuantity} casks immediately at this price.`}
                />
            );
        }
        return null;
    }, [
        matchingLoading,
        scenarioFullNow,
        requestedQuantity,
        fulfilledQuantity,
    ]);

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
                        Ask Details
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

export const ConfirmAskManageFooter = ({ askId }: { askId: string }) => {
    const { priceCaskCurrent, quantity, expirationDays } = useCheckout();
    const { setSidebarCurrent, status, page, limit, sortBy, order, search } =
        useManageCask();
    const { setOpen } = useSidebar();
    const router = useRouter();

    const { invalidateAllForAsk, invalidateManageAsks } =
        useInvalidateCaskCache();
    const { askCalQuery } = useOrderCalculation({
        askData: {
            askPrice: priceCaskCurrent,
            quantity: quantity,
            sessionId: caskAskService.getOrCreateSessionId(),
        },
    });
    const { totalAmount, subtotal, processingFeeAmount, processingFeePercent } =
        askCalQuery.data || {};

    const dataRender = {
        subTotal: {
            label: "Ask Price",
            value: () => formatCurrency(subtotal || 0),
        },
        ...(processingFeePercent && {
            processingFee: {
                label: `Processing Fee (${processingFeePercent || 0}%)`,
                value: () => `-${formatCurrency(processingFeeAmount || 0)}`,
            },
        }),
    } as const;

    const updateAskMutation = useMutation({
        mutationKey: [KEY_ASK.ASK_UPDATE, askId],
        mutationFn: async () => {
            const response = await caskAskService.updateAsk(askId, {
                askPrice: priceCaskCurrent,
                quantity,
                expirationDays,
            });
            return response;
        },
        onSuccess: (data) => {
            toast.success("Ask updated successfully");
            setOpen(false);
            const { matchSummary: { totalMatchedQuantity } = {} } = data;
            if (Number(totalMatchedQuantity) > 0) {
                router.push(`${ROUTE_PUBLIC.PAYOUT}/${askId}`);
                return;
            }
            const responseCaskId = data?.cask?.id;
            invalidateManageAsks();
            invalidateAllForAsk(responseCaskId, {
                status,
                page,
                limit,
                sortBy,
                order,
                search,
            });
        },
        onError: (e) => {
            toast.error(e?.message ?? "Failed to update ask");
        },
    });

    const isPassNextStep = priceCaskCurrent > 0;

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
                    onClick={() => setSidebarCurrent(SIDEBAR_TABS.UPDATE_ASK)}
                >
                    Back
                </Button>
                <Button
                    disabled={!isPassNextStep || updateAskMutation.isPending}
                    className="w-full disabled:bg-bg-sf3"
                    variant={"secondary"}
                    onClick={() => updateAskMutation.mutate()}
                >
                    Update Ask
                </Button>
            </div>
        </div>
    );
};
