"use client";

import OfferConfirmation from "@/modules/market-orders/components/offer-flow/confirmation";
import ConfirmOfferFooter from "@/modules/market-orders/components/offer-flow/footer";
import OfferConfirmationSkeleton from "@/modules/market-orders/components/offer-flow/skeleton";
import {
    useMarketOrderFlowActions,
    useMarketOrderFlowState,
} from "@/modules/market-orders/flow/provider";
import { useCallback } from "react";
import { useCaskDetail } from "../provider";

export default function ConfirmBid({ id }: { id: string }) {
    const { draft } = useMarketOrderFlowState();
    const { updateDraft } = useMarketOrderFlowActions();
    const { setLoadingState } = useCaskDetail();
    const handleLoadingChange = useCallback(
        (isLoading: boolean) => setLoadingState("confirmBid", isLoading),
        [setLoadingState]
    );

    return (
        <OfferConfirmation
            id={id}
            draft={draft}
            onDraftChange={updateDraft}
            loadingFallback={<OfferConfirmationSkeleton />}
            onLoadingChange={handleLoadingChange}
        />
    );
}

export function ConfirmBidFooter({ id }: { id: string }) {
    const { draft } = useMarketOrderFlowState();
    const { backToEdit, closeFlow } = useMarketOrderFlowActions();

    return (
        <ConfirmOfferFooter
            id={id}
            draft={draft}
            onBack={backToEdit}
            onComplete={closeFlow}
        />
    );
}
