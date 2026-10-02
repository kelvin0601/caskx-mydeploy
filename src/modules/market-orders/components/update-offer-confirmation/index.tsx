"use client";

import CaskSummary from "@/components/shared/cask-summary";
import { cn, formatCurrency, pluralize } from "@/lib/utils";
import { caskBidService } from "@/services/cask-bid";
import { caskAsk } from "@/types/cask-ask";
import { caskBid } from "@/types/cask-bid";
import useOrderCalculation from "../../hooks/use-order-calculation";
import { OrderCaskSummary, OrderDraft } from "../../types";
import ChangeValue from "../change-value";
import MatchingOrders from "../matching-orders";
import OrderFilledContent, {
    PaymentBreakdownError,
    PaymentBreakdownSkeleton,
} from "../order-filled-content";
import {
    getUpdateOfferMatchScenario,
    UPDATE_OFFER_MATCH_SCENARIO,
} from "./scenario";

type UpdateOfferConfirmationProps = {
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

export default function UpdateOfferConfirmation({
    cask,
    draft,
    matchingData,
    previousOffer,
}: UpdateOfferConfirmationProps) {
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
    const executionQuantity = canFullyFulfill
        ? fulfillmentSummary.desiredQuantity
        : fulfilledQuantity;
    const expirationDays = Number(draft.expirationDays);
    const previouslyMatchedQuantity =
        previousOffer.filledQuantity !== undefined
            ? previousOffer.filledQuantity
            : Math.max(
                  0,
                  previousOffer.totalQuantity - previousOffer.remainingQuantity
              );
    const updatedTotalQuantity = previouslyMatchedQuantity + draft.quantity;
    const cancelledQuantity = Math.max(
        0,
        previousOffer.remainingQuantity - draft.quantity
    );
    const remainingOpenQuantity =
        matchScenario === UPDATE_OFFER_MATCH_SCENARIO.FULL
            ? 0
            : matchScenario === UPDATE_OFFER_MATCH_SCENARIO.NONE
              ? draft.quantity
              : fulfillmentSummary.remainingQuantity;
    const acquiredQuantity = hasMatchingOrders ? executionQuantity : 0;
    const confirmationEffects = [
        acquiredQuantity > 0
            ? `${acquiredQuantity} additional ${pluralize(acquiredQuantity, "cask")} will be acquired immediately`
            : null,
        remainingOpenQuantity > 0
            ? `${remainingOpenQuantity} ${pluralize(remainingOpenQuantity, "cask")} will stay open until matched or your offer expires`
            : null,
        previouslyMatchedQuantity > 0
            ? `${previouslyMatchedQuantity} ${pluralize(previouslyMatchedQuantity, "cask")} matched earlier ${previouslyMatchedQuantity === 1 ? "is" : "are"} already in checkout and won't be affected by this change`
            : null,
        cancelledQuantity > 0
            ? `${cancelledQuantity} unmatched ${pluralize(cancelledQuantity, "cask")} will be cancelled`
            : null,
    ].filter((effect): effect is string => Boolean(effect));

    const { bidCalQuery } = useOrderCalculation({
        bidData: {
            price: draft.price,
            quantity: executionQuantity,
            sessionId: hasMatchingOrders
                ? caskBidService.getOrCreateSessionId()
                : undefined,
        },
        enabled: hasMatchingOrders,
    });
    const {
        subtotal,
        processingFeeAmount,
        processingFeePercent,
        discountAmount,
        totalAmount,
    } = bidCalQuery.data ?? {};
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
                        label="Offer price"
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
                    hasMatchingOrders && "border-b border-bd-main pb-5"
                )}
            >
                <h3 className="text-sm font-semibold text-typo-primary">
                    What happens if you confirm
                </h3>
                <p className="text-sm text-typo-soft">
                    {matchScenario === UPDATE_OFFER_MATCH_SCENARIO.NONE
                        ? "No casks are currently available at your new offer price. If confirmed:"
                        : "If confirmed:"}
                </p>
                <ul className="flex list-disc flex-col gap-1.5 pl-7 text-sm text-typo-soft marker:text-typo-primary mb:gap-2 mb:pl-8">
                    {confirmationEffects.map((effect) => (
                        <li key={effect} className="pl-0.5">
                            <strong className="font-semibold text-typo-primary">
                                {effect.split(" ")[0]}
                            </strong>{" "}
                            {effect.slice(effect.indexOf(" ") + 1)}
                        </li>
                    ))}
                </ul>
            </section>

            {hasMatchingOrders ? (
                <MatchingOrders
                    matchingData={matchingData}
                    statusText={
                        <>
                            <span className="font-semibold text-typo-primary">
                                {fulfilledQuantity}
                            </span>{" "}
                            {pluralize(fulfilledQuantity, "cask")} match your
                            new offer across{" "}
                            {matchingData.fulfillmentDetails.length}{" "}
                            {pluralize(
                                matchingData.fulfillmentDetails.length,
                                "listing"
                            )}
                            .
                        </>
                    }
                />
            ) : null}

            {hasMatchingOrders ? (
                bidCalQuery.isLoading ? (
                    <PaymentBreakdownSkeleton />
                ) : bidCalQuery.isError ? (
                    <PaymentBreakdownError />
                ) : (
                    <div className="flex flex-col gap-5 mb:gap-4">
                        <OrderFilledContent
                            subtotal={subtotal}
                            processingFeeAmount={processingFeeAmount}
                            processingFeePercent={processingFeePercent}
                            discountAmount={discountAmount}
                            totalAmount={totalAmount}
                            offerExpiration={draft.expirationDays}
                        />
                    </div>
                )
            ) : null}
        </div>
    );
}
