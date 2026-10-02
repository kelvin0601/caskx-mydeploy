"use client";

import CaskSummary from "@/components/shared/cask-summary";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { cn, formatCurrency, pluralize } from "@/lib/utils";
import caskAskService from "@/services/cask-ask";
import { caskAsk } from "@/types/cask-ask";
import { caskBid } from "@/types/cask-bid";
import useOrderCalculation from "../../hooks/use-order-calculation";
import { OrderCaskSummary, OrderDraft } from "../../types";
import ChangeValue from "../change-value";
import FulfillmentBehavior from "../fulfillment-behavior";
import MatchingOrders from "../matching-orders";
import OrderFilledContent, {
    PaymentBreakdownError,
    PaymentBreakdownSkeleton,
} from "../order-filled-content";
import {
    getUpdateOfferMatchScenario,
    UPDATE_OFFER_MATCH_SCENARIO,
} from "../update-offer-confirmation/scenario";

type UpdateListingConfirmationProps = {
    cask: OrderCaskSummary;
    draft: OrderDraft;
    matchingData: caskBid.TMatchingBidsResponse | caskAsk.TMatchingBidsResponse;
    previousOffer: {
        price: number;
        totalQuantity: number;
        remainingQuantity: number;
        expirationDays: number;
        filledQuantity?: number;
    };
};

export default function UpdateListingConfirmation({
    cask,
    draft,
    matchingData,
    previousOffer,
}: UpdateListingConfirmationProps) {
    const { fulfillmentSummary } = matchingData;
    const fulfilledQuantity = fulfillmentSummary.fulfilledQuantity ?? 0;
    const desiredQuantity = fulfillmentSummary.desiredQuantity ?? 0;
    const canFullyFulfill =
        "canFullyFulfill" in fulfillmentSummary
            ? Boolean(fulfillmentSummary.canFullyFulfill)
            : fulfilledQuantity === desiredQuantity && desiredQuantity > 0;
    const matchScenario = getUpdateOfferMatchScenario(
        canFullyFulfill,
        fulfilledQuantity
    );
    const hasMatchingOrders =
        matchScenario !== UPDATE_OFFER_MATCH_SCENARIO.NONE;
    const isPartialAllowed =
        draft.executionPolicy === EBidExecutionPolicy.PARTIAL_ALLOWED;
    const executionQuantity = canFullyFulfill
        ? desiredQuantity
        : isPartialAllowed
          ? fulfilledQuantity
          : 0;
    const expirationDays = Number(draft.expirationDays);
    const previouslyMatchedQuantity =
        previousOffer.filledQuantity !== undefined
            ? previousOffer.filledQuantity
            : Math.max(
                  0,
                  previousOffer.totalQuantity - previousOffer.remainingQuantity
              );
    const updatedTotalQuantity = previouslyMatchedQuantity + draft.quantity;
    const remainingOpenQuantity =
        matchScenario === UPDATE_OFFER_MATCH_SCENARIO.FULL
            ? 0
            : matchScenario === UPDATE_OFFER_MATCH_SCENARIO.NONE
              ? draft.quantity
              : isPartialAllowed
                ? fulfillmentSummary.remainingQuantity
                : draft.quantity;
    const shouldShowBreakdown =
        canFullyFulfill || (isPartialAllowed && fulfilledQuantity > 0);

    const { askCalQuery } = useOrderCalculation({
        askData: {
            askPrice: draft.price,
            quantity: executionQuantity,
            sessionId: shouldShowBreakdown
                ? caskAskService.getOrCreateSessionId()
                : undefined,
        },
        enabled: shouldShowBreakdown,
    });
    const {
        subtotal,
        processingFeeAmount,
        processingFeePercent = 5,
        totalAmount,
    } = askCalQuery.data ?? {};

    return (
        <div className="mb-6 flex h-full flex-col gap-5 tb:mb-5 mb:m-0 mb:h-auto mb:gap-4 mb:py-4">
            <div className="grid grid-cols-10 items-center gap-4 border-b border-bd-main py-3 tb:grid-cols-12 j-tb:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] j-tb:gap-5 mb:flex mb:flex-col mb:items-stretch mb:gap-4 mb:py-0 mb:pb-4">
                <CaskSummary
                    imageUrl={cask?.imageUrl}
                    name={cask.name}
                    vintageYear={cask.vintageYear}
                    className="col-span-5 min-w-0 tb:col-span-6 j-tb:col-span-1 mb:col-span-full mb:[&>div:last-child]:min-w-0 mb:[&_h4]:truncate mb:[&_h4]:leading-6"
                />

                <div className="col-span-5 grid min-w-0 grid-cols-3 items-center gap-4 tb:col-span-6 j-tb:col-span-1 mb:col-span-full mb:flex mb:flex-col mb:gap-1">
                    <ChangeValue
                        label="Sell price"
                        previousValue={formatCurrency(previousOffer.price)}
                        nextValue={formatCurrency(draft.price)}
                    />
                    <ChangeValue
                        label="Quantity"
                        previousValue={previousOffer.totalQuantity}
                        nextValue={updatedTotalQuantity}
                    />
                    <ChangeValue
                        label="Expiry date"
                        previousValue={`${previousOffer.expirationDays} ${pluralize(previousOffer.expirationDays, "day")}`}
                        nextValue={`${expirationDays} ${pluralize(expirationDays, "day")}`}
                    />
                </div>
            </div>

            <section
                className={cn(
                    "flex flex-col gap-2",
                    !hasMatchingOrders && "border-b border-bd-main pb-5"
                )}
            >
                <h3 className="text-sm font-semibold text-typo-primary">
                    Matching status
                </h3>
                <div className="flex flex-col gap-1 text-sm text-typo-soft">
                    {previouslyMatchedQuantity > 0 ? (
                        <p>
                            <span className="font-semibold text-typo-primary">
                                {previouslyMatchedQuantity}
                            </span>{" "}
                            {pluralize(previouslyMatchedQuantity, "cask")}{" "}
                            matched earlier
                            {previousOffer.price
                                ? ` at ${formatCurrency(previousOffer.price)}`
                                : ""}
                            . These payout sessions are already in progress and
                            will not change.
                        </p>
                    ) : null}
                    <p>
                        {matchScenario === UPDATE_OFFER_MATCH_SCENARIO.NONE ? (
                            "No active offers match your new listing price at the moment."
                        ) : (
                            <>
                                Currently,{" "}
                                <span className="font-semibold text-typo-primary">
                                    {fulfilledQuantity}
                                </span>{" "}
                                {pluralize(fulfilledQuantity, "cask")} can be
                                sold at your new listing price.
                            </>
                        )}
                    </p>
                </div>

                {hasMatchingOrders ? (
                    <MatchingOrders
                        matchingData={matchingData}
                        showHeader={false}
                        priceLabel="Price"
                        subtotalLabel="Subtotal"
                        expirationLabel="Expiry In"
                    />
                ) : null}
            </section>

            {!canFullyFulfill ? (
                <FulfillmentBehavior
                    isPartialAllowed={isPartialAllowed}
                    fulfilledQuantity={fulfilledQuantity}
                    remainingOpenQuantity={remainingOpenQuantity}
                    matchScenario={matchScenario}
                />
            ) : null}

            {shouldShowBreakdown ? (
                askCalQuery.isLoading ? (
                    <PaymentBreakdownSkeleton />
                ) : askCalQuery.isError ? (
                    <PaymentBreakdownError />
                ) : (
                    <div className="flex flex-col gap-5">
                        <OrderFilledContent
                            accordionTitle="Already matched"
                            subtotal={subtotal}
                            processingFeeAmount={processingFeeAmount}
                            processingFeePercent={processingFeePercent}
                            totalAmount={totalAmount}
                            note={null}
                        />
                    </div>
                )
            ) : null}
        </div>
    );
}
