"use client";

import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import {
    listingEditorAdapter,
    listingOrderAdapter,
} from "../../adapters/listing-order-adapter";
import {
    offerEditorAdapter,
    offerOrderAdapter,
} from "../../adapters/offer-order-adapter";
import { MARKET_ORDER_STEP } from "../../constants";
import { useMarketOrderManagement } from "../../management/context";
import { useMarketOrderDrawerFlow } from "../../management/drawer-flow/context";
import LimitOrderEditor from "../limit-order-editor";
import LimitOrderEditorSkeleton from "../limit-order-editor/skeleton";
import ListingConfirmation from "../listing-flow/confirmation";
import ConfirmListingFooter from "../listing-flow/footer";
import OfferConfirmation from "../offer-flow/confirmation";
import ConfirmOfferFooter from "../offer-flow/footer";
import OfferConfirmationSkeleton from "../offer-flow/skeleton";

export function DuplicateOfferBody() {
    const { selectedOrder, isDuplicateOpen } = useMarketOrderManagement();
    const { draft, setDraft, setValidation } = useMarketOrderDrawerFlow();
    const id = selectedOrder?.caskId ?? selectedOrder?.cask?.id;

    if (!id) return null;
    return (
        <LimitOrderEditor
            id={id}
            adapter={offerEditorAdapter}
            draft={draft}
            onDraftChange={setDraft}
            loadingFallback={<LimitOrderEditorSkeleton />}
            onValidationChange={setValidation}
            enabled={isDuplicateOpen}
        />
    );
}

export function DuplicateOfferFooter() {
    const { closeDuplicate } = useMarketOrderManagement();
    const { draft, validation, setStep } = useMarketOrderDrawerFlow();
    const canContinue =
        draft.price > 0 &&
        draft.quantity > 0 &&
        Number(draft.expirationDays) > 0 &&
        validation.warningType !== "error";

    return (
        <div className="flex justify-end gap-1 mb:[&>button]:flex-1">
            <Button
                variant="outline"
                className="h-12 tb:h-10"
                onClick={closeDuplicate}
            >
                Cancel
            </Button>
            <Button
                className="h-12 tb:h-10"
                disabled={!canContinue}
                onClick={() => setStep(MARKET_ORDER_STEP.CONFIRM)}
            >
                Continue
            </Button>
        </div>
    );
}

export function ConfirmDuplicateOfferBody() {
    const { selectedOrder } = useMarketOrderManagement();
    const { draft, setDraft } = useMarketOrderDrawerFlow();
    const id = selectedOrder?.caskId ?? selectedOrder?.cask?.id;
    const handleDraftChange = useCallback(
        (nextDraft: Partial<typeof draft>) =>
            setDraft((currentDraft) => ({ ...currentDraft, ...nextDraft })),
        [setDraft]
    );

    if (!id) return null;
    return (
        <OfferConfirmation
            id={id}
            draft={draft}
            onDraftChange={handleDraftChange}
            loadingFallback={<OfferConfirmationSkeleton />}
        />
    );
}

export function ConfirmDuplicateOfferFooter() {
    const { selectedOrder, closeDuplicate } = useMarketOrderManagement();
    const { draft, setStep } = useMarketOrderDrawerFlow();
    const id = selectedOrder?.caskId ?? selectedOrder?.cask?.id;

    if (!id) return null;
    return (
        <ConfirmOfferFooter
            id={id}
            draft={draft}
            onBack={() => setStep(MARKET_ORDER_STEP.EDIT)}
            onComplete={closeDuplicate}
            submit={offerOrderAdapter.duplicate}
            successToastMessage="Offer duplicated"
        />
    );
}

export function DuplicateListingBody() {
    const { selectedOrder, isDuplicateOpen } = useMarketOrderManagement();
    const { draft, setDraft, setValidation } = useMarketOrderDrawerFlow();
    const id = selectedOrder?.caskId ?? selectedOrder?.cask?.id;

    if (!id) return null;
    return (
        <LimitOrderEditor
            id={id}
            adapter={listingEditorAdapter}
            draft={draft}
            onDraftChange={setDraft}
            loadingFallback={<LimitOrderEditorSkeleton />}
            onValidationChange={setValidation}
            enabled={isDuplicateOpen}
        />
    );
}

export function DuplicateListingFooter() {
    const { closeDuplicate } = useMarketOrderManagement();
    const { draft, validation, setStep } = useMarketOrderDrawerFlow();
    const canContinue =
        draft.price > 0 &&
        draft.quantity > 0 &&
        Number(draft.expirationDays) > 0 &&
        validation.warningType !== "error";

    return (
        <div className="flex justify-end gap-1 mb:[&>button]:flex-1">
            <Button
                variant="outline"
                className="h-12 tb:h-10"
                onClick={closeDuplicate}
            >
                Cancel
            </Button>
            <Button
                className="h-12 tb:h-10"
                disabled={!canContinue}
                onClick={() => setStep(MARKET_ORDER_STEP.CONFIRM)}
            >
                Continue
            </Button>
        </div>
    );
}

export function ConfirmDuplicateListingBody() {
    const { selectedOrder } = useMarketOrderManagement();
    const { draft, setDraft } = useMarketOrderDrawerFlow();
    const id = selectedOrder?.caskId ?? selectedOrder?.cask?.id;
    const handleDraftChange = useCallback(
        (nextDraft: Partial<typeof draft>) =>
            setDraft((currentDraft) => ({ ...currentDraft, ...nextDraft })),
        [setDraft]
    );

    if (!id) return null;
    return (
        <ListingConfirmation
            id={id}
            draft={draft}
            onDraftChange={handleDraftChange}
            loadingFallback={<OfferConfirmationSkeleton />}
        />
    );
}

export function ConfirmDuplicateListingFooter() {
    const { selectedOrder, closeDuplicate } = useMarketOrderManagement();
    const { draft, setStep } = useMarketOrderDrawerFlow();
    const id = selectedOrder?.caskId ?? selectedOrder?.cask?.id;

    if (!id) return null;
    return (
        <ConfirmListingFooter
            id={id}
            draft={draft}
            onBack={() => setStep(MARKET_ORDER_STEP.EDIT)}
            onComplete={closeDuplicate}
            submit={listingOrderAdapter.duplicate}
        />
    );
}
