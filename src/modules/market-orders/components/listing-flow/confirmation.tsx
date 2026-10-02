"use client";

import AnimateExpandHeight from "@/components/shared/animation/animate-expand-height";
import CaskSummary from "@/components/shared/cask-summary";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { CASK_KEYS } from "@/lib/constants/key";
import { formatCurrency, pluralize } from "@/lib/utils";
import caskServices from "@/services/cask";
import caskAskService from "@/services/cask-ask";
import type { cask } from "@/types";
import { useEffect } from "react";
import { MARKET_ORDER_KIND } from "../../constants";
import useOrderCalculation from "../../hooks/use-order-calculation";
import useSellOrderMatching from "../../hooks/use-sell-order-matching";
import type { OrderDraft } from "../../types";
import { FulfillmentPreferenceSection } from "../fulfillment-preference";
import MatchingOrders from "../matching-orders";
import { PendingOrderSummary } from "../pending-order-section";

type ListingConfirmationProps = {
    id: string;
    draft: OrderDraft;
    onDraftChange: (draft: Partial<OrderDraft>) => void;
    loadingFallback: React.ReactNode;
    onLoadingChange?: (isLoading: boolean) => void;
};

export default function ListingConfirmation({
    id,
    draft,
    onDraftChange,
    loadingFallback,
    onLoadingChange,
}: ListingConfirmationProps) {
    const { price, quantity, executionPolicy, expirationDays } = draft;
    const { data: caskDetail, status: caskStatus } =
        useGetStateQuery<cask.TCask>({
            key: [CASK_KEYS.CASK_DETAIL, id],
            fetchFn: () => caskServices.getDetailCask(id),
        });
    const matching = useSellOrderMatching({
        caskId: id,
        minimumPrice: price,
        quantity,
    });
    const requestedQuantity = matching.requestedQuantity || quantity;
    const payoutQuantity = matching.matchPartially
        ? matching.fulfilledQuantity
        : requestedQuantity;
    const { askCalQuery } = useOrderCalculation({
        askData: {
            askPrice: price,
            quantity: payoutQuantity,
            sessionId: caskAskService.getOrCreateSessionId(),
        },
        enabled:
            !matching.isLoading &&
            (matching.matchFully || matching.matchPartially),
    });
    const isCaskLoading = caskStatus === "pending" && !caskDetail;
    const isPriceLoading =
        (matching.matchFully || matching.matchPartially) &&
        (!askCalQuery.data || askCalQuery.isFetching);
    const isLoading = isCaskLoading || matching.isLoading || isPriceLoading;

    useEffect(() => {
        onLoadingChange?.(isLoading);
        return () => onLoadingChange?.(false);
    }, [isLoading, onLoadingChange]);

    if (isLoading) return loadingFallback;

    const { totalAmount, subtotal, processingFeeAmount, processingFeePercent } =
        askCalQuery.data || {};
    const details = matching.matchingQuery.data;
    const matchingDetailsCount = Array.isArray(details?.fulfillmentDetails)
        ? details.fulfillmentDetails.length
        : Array.isArray(details?.matchingAsks)
          ? details.matchingAsks.length
          : 1;

    return (
        <div className="mb-6 flex flex-col gap-5 tb:mb-5 mb:mb-4 mb:gap-4">
            <ListingHeader
                caskDetail={caskDetail}
                price={price}
                quantity={requestedQuantity}
                expirationDays={expirationDays}
            />

            {matching.matchPartially ? (
                <>
                    {details ? (
                        <MatchingOrders
                            matchingData={details}
                            statusText={
                                <>
                                    <strong className="font-semibold text-typo-primary">
                                        {matching.fulfilledQuantity}
                                    </strong>{" "}
                                    {pluralize(
                                        matching.fulfilledQuantity,
                                        "cask"
                                    )}{" "}
                                    can be sold at your listing price.
                                </>
                            }
                            subtotalLabel="Subtotal"
                            expirationLabel="Offer expires in"
                        />
                    ) : null}
                    <div className="flex flex-col">
                        <FulfillmentPreferenceSection
                            kind={MARKET_ORDER_KIND.LISTING}
                            executionPolicy={executionPolicy}
                            onExecutionPolicyChange={(value) =>
                                onDraftChange({ executionPolicy: value })
                            }
                            expirationDays={expirationDays}
                            quantity={requestedQuantity}
                            fulfilledQuantity={matching.fulfilledQuantity}
                            footnote={null}
                        />
                        <AnimateExpandHeight
                            isOpen={
                                executionPolicy ===
                                EBidExecutionPolicy.PARTIAL_ALLOWED
                            }
                        >
                            <div className="flex flex-col gap-3 pt-5 mb:gap-4 mb:pt-4">
                                <PayoutBreakdown
                                    subtotal={subtotal}
                                    processingFeeAmount={processingFeeAmount}
                                    processingFeePercent={processingFeePercent}
                                    totalAmount={totalAmount}
                                />
                                <PendingOrderSummary
                                    kind={MARKET_ORDER_KIND.LISTING}
                                    quantity={
                                        requestedQuantity -
                                        matching.fulfilledQuantity
                                    }
                                    expirationDays={expirationDays}
                                    onExpirationDaysChange={(value) =>
                                        onDraftChange({ expirationDays: value })
                                    }
                                />
                            </div>
                        </AnimateExpandHeight>
                    </div>
                </>
            ) : matching.notMatch ? (
                <FulfillmentPreferenceSection
                    kind={MARKET_ORDER_KIND.LISTING}
                    executionPolicy={executionPolicy}
                    onExecutionPolicyChange={(value) =>
                        onDraftChange({ executionPolicy: value })
                    }
                    expirationDays={expirationDays}
                    quantity={requestedQuantity}
                />
            ) : matching.matchFully ? (
                <>
                    {details ? (
                        <MatchingOrders
                            matchingData={details}
                            statusText={
                                <>
                                    <strong className="font-semibold text-typo-primary">
                                        {matching.fulfilledQuantity}
                                    </strong>{" "}
                                    {pluralize(
                                        matching.fulfilledQuantity,
                                        "cask"
                                    )}{" "}
                                    match your listing price across{" "}
                                    {matchingDetailsCount}{" "}
                                    {pluralize(matchingDetailsCount, "offer")}.
                                </>
                            }
                            subtotalLabel="Subtotal"
                            expirationLabel="Listing expires in"
                        />
                    ) : null}
                    <PayoutBreakdown
                        subtotal={subtotal}
                        processingFeeAmount={processingFeeAmount}
                        processingFeePercent={processingFeePercent}
                        totalAmount={totalAmount}
                    />
                </>
            ) : null}
        </div>
    );
}

function ListingHeader({
    caskDetail,
    price,
    quantity,
    expirationDays,
}: {
    caskDetail?: cask.TCask;
    price: number;
    quantity: number;
    expirationDays: string;
}) {
    return (
        <div className="grid grid-cols-10 border-b border-bd-main py-3 tb:grid-cols-12 mb:grid-cols-4 mb:gap-y-2 mb:py-4">
            <CaskSummary
                imageUrl={caskDetail?.imageUrl}
                name={caskDetail?.master?.name}
                vintageYear={caskDetail?.vintageYear}
                className="col-span-5 tb:col-span-6 mb:col-span-full mb:mb-2"
            />
            <div className="col-span-5 grid grid-cols-3 gap-x-4 tb:col-span-6 mb:col-span-full mb:flex mb:flex-col mb:gap-y-1.5">
                <ListingFact
                    label="Listing price"
                    value={formatCurrency(price)}
                />
                <ListingFact label="Quantity" value={quantity} />
                <ListingFact
                    label="Listing expiration"
                    value={`${expirationDays} days`}
                />
            </div>
        </div>
    );
}

function ListingFact({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex flex-1 flex-col justify-center gap-1.5 text-right mb:flex-row mb:items-center mb:justify-between mb:text-left">
            <span className="text-xs leading-none text-typo-soft mb:text-sm">
                {label}
            </span>
            <span className="text-sm font-semibold text-typo-primary">
                {value}
            </span>
        </div>
    );
}

function PayoutBreakdown({
    subtotal,
    processingFeeAmount,
    processingFeePercent = 5,
    totalAmount,
}: {
    subtotal?: number;
    processingFeeAmount?: number;
    processingFeePercent?: number;
    totalAmount?: number;
}) {
    return (
        <div className="flex flex-col gap-5 mb:gap-4">
            <Accordion type="single" collapsible defaultValue="payout">
                <AccordionItem value="payout" className="pb-5 mb:pb-4">
                    <AccordionTrigger className="py-0 text-sm font-semibold text-typo-primary">
                        Payout breakdown
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pt-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-typo-soft">
                                Cask subtotal
                            </span>
                            <strong className="font-semibold text-typo-primary">
                                {formatCurrency(subtotal || 0)}
                            </strong>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-typo-soft">
                                Processing fee ({processingFeePercent}%)
                            </span>
                            <strong className="font-semibold text-typo-primary">
                                {formatCurrency(processingFeeAmount || 0)}
                            </strong>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="flex items-center justify-between">
                <strong className="text-sm font-semibold text-typo-primary">
                    Total
                </strong>
                <strong className="text-lg font-semibold text-typo-primary">
                    {formatCurrency(totalAmount || 0)}
                </strong>
            </div>
        </div>
    );
}
