"use client";

import ListingConfirmation from "@/modules/market-orders/components/listing-flow/confirmation";
import ConfirmListingFooter from "@/modules/market-orders/components/listing-flow/footer";
import OfferConfirmationSkeleton from "@/modules/market-orders/components/offer-flow/skeleton";
import {
    useMarketOrderFlowActions,
    useMarketOrderFlowState,
} from "@/modules/market-orders/flow/provider";
import { useCallback } from "react";
import { useCaskDetail } from "../provider";

export default function ConfirmAsk({ id }: { id: string }) {
    const { draft } = useMarketOrderFlowState();
    const { updateDraft } = useMarketOrderFlowActions();
    const { setLoadingState } = useCaskDetail();
    const handleLoadingChange = useCallback(
        (isLoading: boolean) => setLoadingState("confirmAsk", isLoading),
        [setLoadingState]
    );

    return (
        <ListingConfirmation
            id={id}
            draft={draft}
            onDraftChange={updateDraft}
            loadingFallback={<OfferConfirmationSkeleton />}
            onLoadingChange={handleLoadingChange}
        />
    );
}

export function ConfirmAskFooter({ id }: { id: string }) {
    const { draft } = useMarketOrderFlowState();
    const { backToEdit, closeFlow } = useMarketOrderFlowActions();

    return (
        <ConfirmListingFooter
            id={id}
            draft={draft}
            onBack={backToEdit}
            onComplete={closeFlow}
        />
    );
}
