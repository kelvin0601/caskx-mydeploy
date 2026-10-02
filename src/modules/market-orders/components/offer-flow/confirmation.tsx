"use client";

import AnimateExpandHeight from "@/components/shared/animation/animate-expand-height";
import CaskSummary from "@/components/shared/cask-summary";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { CASK_KEYS } from "@/lib/constants/key";
import { formatCurrency, pluralize } from "@/lib/utils";
import { caskBidService } from "@/services/cask-bid";
import type { cask } from "@/types";
import { useEffect } from "react";
import { MARKET_ORDER_KIND } from "../../constants";
import useBuyOrderMatching from "../../hooks/use-buy-order-matching";
import useOrderCalculation from "../../hooks/use-order-calculation";
import type { OrderDraft } from "../../types";
import { FulfillmentPreferenceSection } from "../fulfillment-preference";
import MatchingOrders from "../matching-orders";
import OrderFilledContent from "../order-filled-content";

type OfferConfirmationProps = {
    id: string;
    draft: OrderDraft;
    onDraftChange: (draft: Partial<OrderDraft>) => void;
    loadingFallback: React.ReactNode;
    onLoadingChange?: (isLoading: boolean) => void;
};

export default function OfferConfirmation({
    id,
    draft,
    onDraftChange,
    loadingFallback,
    onLoadingChange,
}: OfferConfirmationProps) {
    const { quantity, price, executionPolicy, expirationDays } = draft;
    const { data: caskDetail, status: caskStatus } =
        useGetStateQuery<cask.TCask>({
            key: [CASK_KEYS.CASK_DETAIL, id],
        });
    const isCaskLoading = caskStatus === "pending" && !caskDetail;
    const {
        isLoading: matchingLoading,
        fulfilledQuantity,
        requestedQuantity,
        matchFully,
        matchPartially,
        notMatch,
        matchingQuery,
        fulfillmentSummary,
    } = useBuyOrderMatching({
        caskId: id,
        maximumPrice: price,
        quantity,
    });
    const requestedCasks = requestedQuantity || quantity;
    const chargedQuantity = matchPartially ? fulfilledQuantity : requestedCasks;
    const { bidCalQuery } = useOrderCalculation({
        bidData: {
            price,
            quantity: chargedQuantity,
            sessionId: caskBidService.getOrCreateSessionId(),
        },
        enabled: !matchingLoading && (matchFully || matchPartially),
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
    const isLoading = isCaskLoading || matchingLoading || isPriceLoading;

    useEffect(() => {
        onLoadingChange?.(isLoading);
        return () => onLoadingChange?.(false);
    }, [isLoading, onLoadingChange]);

    if (isLoading) return loadingFallback;

    return (
        <div className="mb-6 flex h-full flex-col gap-5 tb:mb-5 mb:mb-4 mb:mt-1 mb:gap-4">
            <div className="grid grid-cols-10 items-center gap-5 border-b py-3 tb:grid-cols-12 mb:grid-cols-4 mb:!gap-y-0 mb:pb-4">
                <CaskSummary
                    imageUrl={caskDetail?.imageUrl}
                    name={caskDetail?.master?.name}
                    vintageYear={caskDetail?.vintageYear}
                    className="col-span-5 tb:col-span-6 mb:col-span-full"
                />

                <div className="col-span-5 flex flex-row items-center gap-4 tb:col-span-6 mb:col-span-full mb:mt-4 mb:flex-col mb:gap-1.5 [&>div]:flex-1 mb:[&>div]:mt-0 mb:[&>div]:w-full">
                    <OfferFact label="Cask offered" value={quantity} />
                    <OfferFact
                        label="Offer price"
                        value={formatCurrency(price)}
                    />
                    <OfferFact
                        label="Offer expiration"
                        value={`${parseInt(expirationDays, 10)} ${pluralize(parseInt(expirationDays, 10), "day")}`}
                    />
                </div>
            </div>

            {matchingQuery.data && matchPartially ? (
                <>
                    <MatchingOrders matchingData={matchingQuery.data} />
                    <FulfillmentPreferenceSection
                        kind={MARKET_ORDER_KIND.OFFER}
                        executionPolicy={executionPolicy}
                        onExecutionPolicyChange={(value) =>
                            onDraftChange({ executionPolicy: value })
                        }
                        expirationDays={expirationDays}
                        quantity={quantity}
                        fulfilledQuantity={fulfilledQuantity}
                    />
                    <AnimateExpandHeight
                        isOpen={
                            executionPolicy ===
                            EBidExecutionPolicy.PARTIAL_ALLOWED
                        }
                        className={
                            executionPolicy === EBidExecutionPolicy.FULL_AT_ONCE
                                ? "-mt-5"
                                : ""
                        }
                    >
                        <div className="flex flex-col gap-5 mb:gap-4">
                            <OrderFilledContent
                                processingFeeAmount={processingFeeAmount}
                                subtotal={subtotal}
                                totalAmount={totalAmount}
                                processingFeePercent={processingFeePercent}
                                discountAmount={discountAmount}
                                remainingQuantity={
                                    fulfillmentSummary?.remainingQuantity
                                }
                                offerExpiration={expirationDays}
                            />
                        </div>
                    </AnimateExpandHeight>
                </>
            ) : notMatch ? (
                <FulfillmentPreferenceSection
                    kind={MARKET_ORDER_KIND.OFFER}
                    executionPolicy={executionPolicy}
                    onExecutionPolicyChange={(value) =>
                        onDraftChange({ executionPolicy: value })
                    }
                    expirationDays={expirationDays}
                    quantity={quantity}
                    fulfilledQuantity={fulfilledQuantity}
                />
            ) : matchingQuery.data && matchFully ? (
                <>
                    <MatchingOrders matchingData={matchingQuery.data} />
                    <div className="flex flex-col gap-5 mb:gap-4">
                        <OrderFilledContent
                            processingFeeAmount={processingFeeAmount}
                            subtotal={subtotal}
                            totalAmount={totalAmount}
                            processingFeePercent={processingFeePercent}
                            discountAmount={discountAmount}
                        />
                    </div>
                </>
            ) : null}
        </div>
    );
}

function OfferFact({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-end gap-1.5 text-right mb:col-span-full mb:mt-2 mb:flex-row mb:items-center mb:justify-between mb:gap-1">
            <span className="text-xs leading-none text-typo-soft mb:text-sm">
                {label}
            </span>
            <span className="text-sm font-semibold text-typo-primary">
                {value}
            </span>
        </div>
    );
}
