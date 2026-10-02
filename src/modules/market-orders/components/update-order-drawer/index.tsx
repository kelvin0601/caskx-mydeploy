"use client";

import { Button } from "@/components/ui/button";
import { KEY_ASK, KEY_BID } from "@/lib/constants";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { getErrorMessage } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, m } from "motion/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MARKET_ORDER_KIND, MARKET_ORDER_STEP } from "../../constants";
import { useMarketOrderManagement } from "../../management/context";
import { useMarketOrderDrawerFlow } from "../../management/drawer-flow/context";
import { hasUpdateDraftChanges } from "../../management/drawer-flow/model";
import { MARKET_ORDER_KEYS } from "../../query-keys";
import type { marketOrder } from "@/types/market-order";
import type { UpdateOrderInput } from "../../types";
import { hasOfferMatch, resolveCheckoutSessionId } from "../../utils";
import OrderEditor from "../order-editor";
import UpdateListingConfirmation from "../update-listing-confirmation";
import UpdateOfferConfirmation from "../update-offer-confirmation";

const STEP_TRANSITION = {
    duration: 0.2,
    ease: [0.32, 0.72, 0, 1],
} as const;

export function UpdateOrderBody() {
    const { adapter, selectedOrder, isUpdateOpen } = useMarketOrderManagement();
    const {
        draft,
        previousOffer,
        step,
        setDraft,
        setValidation,
        updateMatching: { matchingQuery },
    } = useMarketOrderDrawerFlow();
    const cask = selectedOrder?.cask;
    const caskId =
        selectedOrder?.caskId ??
        selectedOrder?.cask?.id ??
        selectedOrder?.master?.id;
    const caskRecord = cask as Record<string, unknown> | undefined;
    const orderRecord = selectedOrder as Record<string, unknown> | undefined;
    const masterRecord = (selectedOrder?.master ??
        selectedOrder?.cask?.master) as Record<string, unknown> | undefined;

    const referencePrice =
        caskRecord?.referencePrice ??
        cask?.referencePriceMin ??
        caskRecord?.minReferencePrice ??
        (Array.isArray(cask?.priceReference)
            ? cask.priceReference[0]
            : cask?.priceReference) ??
        orderRecord?.referencePrice ??
        selectedOrder?.cask?.referencePriceMin ??
        masterRecord?.minReferencePrice ??
        masterRecord?.referencePrice ??
        (Array.isArray(selectedOrder?.cask?.priceReference)
            ? selectedOrder.cask.priceReference[0]
            : selectedOrder?.cask?.priceReference);

    const isOffer = adapter.editor.definition.kind === MARKET_ORDER_KIND.OFFER;
    const orderCask = caskId
        ? {
              id: caskId,
              name:
                  selectedOrder?.master?.name ||
                  selectedOrder?.caskName ||
                  cask?.name,
              imageUrl:
                  selectedOrder?.master?.imageUrl ??
                  cask?.imageUrl ??
                  cask?.master?.imageUrl,
              vintageYear:
                  selectedOrder?.master?.vintageYear ??
                  selectedOrder?.vintageYear ??
                  cask?.vintageYear,
              priceReference: referencePrice,
              referencePrice,
          }
        : undefined;

    const isConfirmStep =
        step === MARKET_ORDER_STEP.CONFIRM && Boolean(matchingQuery.data);

    return (
        <AnimatePresence initial={false} mode="wait">
            {isConfirmStep && orderCask && matchingQuery.data ? (
                <m.div
                    key={MARKET_ORDER_STEP.CONFIRM}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={STEP_TRANSITION}
                >
                    {isOffer ? (
                        <UpdateOfferConfirmation
                            cask={orderCask}
                            draft={draft}
                            previousOffer={previousOffer}
                            matchingData={matchingQuery.data}
                        />
                    ) : (
                        <UpdateListingConfirmation
                            cask={orderCask}
                            draft={draft}
                            previousOffer={previousOffer}
                            matchingData={matchingQuery.data}
                        />
                    )}
                </m.div>
            ) : selectedOrder && orderCask ? (
                <m.div
                    key={MARKET_ORDER_STEP.EDIT}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={STEP_TRANSITION}
                >
                    <OrderEditor
                        adapter={adapter.editor}
                        cask={orderCask}
                        order={selectedOrder}
                        value={draft}
                        onChange={setDraft}
                        maxQuantity={Math.max(
                            1,
                            Number(selectedOrder.remainingQuantity ?? 1)
                        )}
                        enabled={isUpdateOpen}
                        onValidationChange={setValidation}
                    />
                </m.div>
            ) : null}
        </AnimatePresence>
    );
}

export function UpdateOrderFooter() {
    const { adapter, selectedOrder, closeUpdate } = useMarketOrderManagement();
    const {
        draft,
        initialDraft,
        step,
        validation,
        setStep,
        updateMatching: { matchingQuery },
    } = useMarketOrderDrawerFlow();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { definition } = adapter.editor;
    const isOffer = definition.kind === MARKET_ORDER_KIND.OFFER;
    const caskId =
        selectedOrder?.caskId ??
        selectedOrder?.cask?.id ??
        selectedOrder?.master?.id;
    const isConfirmStep = step === MARKET_ORDER_STEP.CONFIRM;
    const hasDraftChanges = hasUpdateDraftChanges(draft, initialDraft);
    const canSubmit =
        Boolean(selectedOrder?.id && caskId) &&
        hasDraftChanges &&
        draft.price > 0 &&
        draft.quantity > 0 &&
        Number(draft.expirationDays) > 0 &&
        validation.warningType !== "error";
    const updateMutation = useMutation<unknown, Error, UpdateOrderInput>({
        mutationKey: MARKET_ORDER_KEYS.update(
            definition.kind,
            selectedOrder?.id
        ),
        mutationFn: adapter.update,
        onSuccess: async (result, input) => {
            toast.success(
                `${definition.labels.successName} updated successfully`
            );
            closeUpdate();
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: adapter.listQueryKey,
                }),
                queryClient.invalidateQueries({
                    queryKey: isOffer
                        ? [KEY_BID.BID_DETAIL]
                        : [KEY_ASK.ASK_LIST],
                }),
                queryClient.invalidateQueries({
                    queryKey: MARKET_ORDER_KEYS.marketData(input.caskId),
                }),
            ]);

            if (isOffer) {
                if (hasOfferMatch(result)) {
                    const checkoutSessionId = await resolveCheckoutSessionId(
                        result,
                        input.orderId
                    );
                    if (checkoutSessionId) {
                        router.push(
                            `${ROUTE_PUBLIC.CHECKOUT}/${checkoutSessionId}/${ROUTE_PUBLIC.CHECKOUT_PAY_DEPOSIT}`
                        );
                    }
                }
            } else {
                const orderResult = result as
                    | marketOrder.TMarketOrderResult
                    | undefined;
                const totalMatched =
                    orderResult?.matchSummary?.totalMatchedQuantity ??
                    orderResult?.matchingSummary?.totalMatchedQuantity ??
                    (orderResult?.immediateMatches &&
                    orderResult.immediateMatches.length > 0
                        ? orderResult.immediateMatches.length
                        : 0);
                const targetAskId =
                    input.orderId ||
                    orderResult?.id ||
                    orderResult?.remainderOrder?.orderId;

                if (totalMatched > 0 && targetAskId) {
                    router.push(`${ROUTE_PUBLIC.PAYOUT}/${targetAskId}`);
                }
            }
        },
        onError: (error) => {
            toast.error(
                getErrorMessage(error, `Failed to update ${definition.kind}`)
            );
        },
    });

    const handleSubmit = () => {
        if (!selectedOrder?.id || !caskId || !canSubmit) return;
        updateMutation.mutate({
            orderId: selectedOrder.id,
            caskId,
            draft,
        });
    };

    const handleContinue = async () => {
        const result = await matchingQuery.refetch();
        if (result.error) {
            toast.error(
                getErrorMessage(
                    result.error,
                    isOffer
                        ? "Unable to check matching listings. Please try again."
                        : "Unable to check matching offers. Please try again."
                )
            );
            return;
        }
        if (!result.data) {
            toast.error(
                isOffer
                    ? "Unable to check matching listings. Please try again."
                    : "Unable to check matching offers. Please try again."
            );
            return;
        }
        setStep(MARKET_ORDER_STEP.CONFIRM);
    };

    const handleSecondaryAction = () => {
        if (isConfirmStep) {
            setStep(MARKET_ORDER_STEP.EDIT);
            return;
        }
        closeUpdate();
    };

    return (
        <div className="flex justify-end gap-1 mb:[&>button]:flex-1">
            <Button
                variant="outline"
                className="h-12 min-w-0 tb:h-10"
                onClick={handleSecondaryAction}
            >
                Cancel
            </Button>
            <Button
                className="h-12 min-w-0 tb:h-10"
                disabled={
                    !canSubmit ||
                    updateMutation.isPending ||
                    matchingQuery.isFetching
                }
                onClick={isConfirmStep ? handleSubmit : handleContinue}
            >
                {updateMutation.isPending
                    ? "Updating..."
                    : matchingQuery.isFetching
                      ? "Checking..."
                      : isConfirmStep
                        ? isOffer
                            ? "Confirm Offer"
                            : "Confirm Update"
                        : "Continue"}
            </Button>
        </div>
    );
}
