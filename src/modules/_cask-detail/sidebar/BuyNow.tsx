import CaskCardQuantity from "@/components/shared/cask-card-quantity";
import IconCoinB from "@/components/shared/icons/icon-coin-b";
import IconEdit from "@/components/shared/icons/icon-edit";
import IconFeatured from "@/components/shared/icons/icon-featured";
import ActionOptionItem from "@/components/shared/item-action-w-ic";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import useCalculatePriceCask from "@/hooks/useCalculatePriceCask";
import useDiscount from "@/hooks/useDiscount";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { SIDEBAR_TABS } from "@/lib/constants";
import { CASK_KEYS, KEY_BID, SECURITY_KEYS } from "@/lib/constants/key";
import { cleanString, formatCurrency, isEmpty } from "@/lib/utils";
import { caskBidService } from "@/services/cask-bid";
import securityService from "@/services/security";
import { useCheckout } from "@/store/checkout";
import { cask } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCaskDetail } from "../provider";
import { BidControls } from "@/components/shared/cask-card-quantity-controls";

export default function BuyNow({ id }: { id: string }) {
    const {
        setDiscountSelected,
        discountSelected,
        quantity,
        setPriceCaskCurrent,
    } = useCheckout();
    const { setSidebarCurrent } = useCaskDetail();
    const { activeDiscountQuery, applyDiscount, removeDiscount, isApplying } =
        useDiscount();

    const { data: caskDetail } = useGetStateQuery<cask.TCask>({
        key: [CASK_KEYS.CASK_DETAIL, id],
    });
    const dataCacheMarket = useGetStateQuery({
        key: [KEY_BID.BID_MARKET_DATA, id],
        fetchFn: () => caskBidService.getCaskBidMarketData(id),
    });

    const lowestAsk = useMemo(() => {
        return (
            dataCacheMarket?.data?.lowestAsk || caskDetail?.priceReference || 0
        );
    }, [dataCacheMarket?.data?.lowestAsk, caskDetail?.priceReference]);

    const sessionDevices = useQuery({
        queryKey: [SECURITY_KEYS.GET_SECURITY_SESSION],
        queryFn: securityService.getSecuritySession,
    });

    // activeDiscountQuery and removeDiscount provided by useDiscount

    const schemaDiscount = z.object({
        discountCode: z.string().optional(),
    });
    const form = useForm({
        defaultValues: {
            discountCode: "",
        },
        resolver: zodResolver(schemaDiscount),
    });

    const _isDiscountCodeValid = useCallback(
        (id: string | undefined) => {
            return (
                activeDiscountQuery.data?.isValid &&
                activeDiscountQuery.data?.discountCode?.code === id
            );
        },
        [
            JSON.stringify(activeDiscountQuery.data),
            form.getValues("discountCode"),
        ]
    );

    // applyDiscount provided by useDiscount

    const handleBuyItNow = () => {
        setSidebarCurrent(SIDEBAR_TABS.PLACE_BID);
    };

    useEffect(() => {
        setPriceCaskCurrent(Number(lowestAsk));
    }, []);

    const handleSubmit = async (data: z.infer<typeof schemaDiscount>) => {
        try {
            const { discountCode } = data;
            const sessionId = sessionDevices.data?.currentSession?.id;

            if (!sessionId) {
                form.setError("discountCode", {
                    message: "Session is not ready. Please try again.",
                });
                return;
            }
            if (!discountCode) {
                return;
            }

            // Handle discount code application
            await handleDiscountCodeApplication(discountCode, sessionId);
        } catch (error) {
            console.error("Error applying discount code:", error);
            const errorMessage =
                (error as { message: string })?.message ||
                "Invalid discount code";
            form.setError("discountCode", { message: errorMessage });
        }
    };

    const handleDiscountCodeApplication = async (
        discountCode: string,
        sessionId: string
    ) => {
        const currentDiscount = activeDiscountQuery?.data;
        const currentDiscountCode = currentDiscount?.discountCode?.code;
        // Case 1: Same discount code already applied
        if (discountCode.toUpperCase() === currentDiscountCode?.toUpperCase()) {
            console.log(
                "Same discount code already applied:",
                currentDiscountCode
            );
            setDiscountSelected(currentDiscount || null);
            return;
        }

        // Case 2: Different discount code - remove old one first
        if (
            currentDiscount?.reservationId &&
            cleanString(discountCode) !==
                cleanString(currentDiscount?.discountCode?.code)
        ) {
            await removeExistingDiscount(currentDiscount.reservationId);
        }

        // Case 3: Apply new discount code
        await applyNewDiscount(discountCode, sessionId);
    };

    const removeExistingDiscount = async (reservationId: string) => {
        try {
            await removeDiscount(reservationId);
        } catch (error) {
            console.error("Error removing existing discount:", error);
        }
    };

    const applyNewDiscount = async (
        discountCode: string,
        sessionId: string
    ) => {
        const orderSubtotal = Number(lowestAsk) * quantity;

        const result = await applyDiscount({
            code: discountCode.toUpperCase(),
            orderSubtotal,
            sessionId,
        });

        if (!result.isValid) {
            console.log("Invalid discount code result:", result);
            throw new Error(result.message || "Invalid discount code");
        }

        setDiscountSelected(result);
    };

    const handleClearDiscount = () => {
        setDiscountSelected(null);
        if (!discountSelected?.reservationId) return;
        removeExistingDiscount(discountSelected.reservationId);
    };

    const renderActionDiscount = useCallback(() => {
        return (
            <div className="flex flex-1 flex-row items-center justify-between gap-3">
                <FormField
                    control={form.control}
                    name="discountCode"
                    render={({ field }) => (
                        <FormItem className="flex-1 space-y-1 pl-3">
                            <FormControl>
                                <Input
                                    isChangeColorError
                                    maxLength={30}
                                    disabled={
                                        !!discountSelected?.discountAmount
                                    }
                                    {...field}
                                    value={
                                        discountSelected?.discountCode?.code
                                            ? discountSelected?.discountCode
                                                  ?.code
                                            : field.value
                                    }
                                    className="!h-6 !border-none bg-transparent p-0 text-base font-medium uppercase !shadow-none !outline-none !ring-0 duration-200 placeholder:normal-case disabled:bg-transparent"
                                    placeholder="Discount Code"
                                />
                            </FormControl>
                            {!!discountSelected?.discountAmount && (
                                <div className="text-sm text-success">
                                    -
                                    {formatCurrency(
                                        discountSelected?.discountAmount
                                    )}
                                </div>
                            )}
                            <FormMessage className="absolute left-0 top-[calc(100%+0.25rem)]" />
                        </FormItem>
                    )}
                />
                {!discountSelected?.discountAmount ? (
                    <Button
                        type="submit"
                        variant="outline"
                        disabled={
                            !form.formState.isValid ||
                            form.formState.isSubmitting ||
                            isApplying ||
                            sessionDevices.isLoading ||
                            !form.watch("discountCode")?.trim()
                        }
                        className="min-w-0"
                    >
                        {form.formState.isSubmitting || isApplying
                            ? "Applying..."
                            : "Apply"}
                    </Button>
                ) : (
                    <button
                        type="button"
                        aria-label="Edit discount code"
                        className="h-5 w-5"
                        onClick={handleClearDiscount}
                    >
                        <IconEdit />
                    </button>
                )}
            </div>
        );
    }, [
        discountSelected?.discountAmount,
        form,
        isApplying,
        sessionDevices.isLoading,
    ]);

    return (
        <div className="flex h-full flex-col pt-4">
            <div className="flex flex-col gap-4">
                <BidControls
                    // data={{
                    //     ...caskDetail!,
                    //     lowestAsk: Number(lowestAsk),
                    // }}
                    // priceCask={Number(lowestAsk)}
                    // limit={dataCacheMarket?.data?.totalActiveAsks || 0}
                    // subContent="Buy now at"
                    data={caskDetail ?? null}
                    priceBid={Number(lowestAsk)}
                    priceLabel="Buy now at"
                    showSuggestion={false}
                    showQuantity={false}
                    setSidebarCurrent={setSidebarCurrent}
                />

                <ActionOptionItem
                    title="Make An Offer"
                    description="Get it for less"
                    onClick={handleBuyItNow}
                    icon={<IconCoinB />}
                    isHighLight={true}
                />

                {/* Hide discount code */}
                {/* <Form {...form}>
                    <form
                        className="relative flex-1 pb-28"
                        onSubmit={form.handleSubmit(handleSubmit)}
                    >
                        <ActionOptionItem
                            icon={<IconFeatured />}
                            className="relative"
                        >
                            {renderActionDiscount()}
                        </ActionOptionItem>
                    </form>
                </Form> */}
            </div>
        </div>
    );
}

export const BuyNowFooter = ({ id }: { id: string }) => {
    const { discountSelected, quantity, priceCaskCurrent } = useCheckout();
    const { setSidebarCurrent } = useCaskDetail();

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
        if (!totalAmount) {
            return;
        }
        setSidebarCurrent(SIDEBAR_TABS.CONFIRM_BUY_NOW);
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
                            <span className="text-xl font-semibold text-typo-soft">
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
                Your order may be partially filled. Any unfilled units will be
                placed as an ask.
            </div>
            <Button
                className="mt-4 w-full disabled:!bg-bg-sf2"
                variant={"secondary"}
                onClick={handleBuyNow}
                disabled={!totalAmount || bidCalQuery.isFetching}
            >
                Buy Now
            </Button>
        </div>
    );
};
