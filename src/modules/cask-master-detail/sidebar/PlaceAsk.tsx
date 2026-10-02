import { Button } from "@/components/ui/button";
import { listingEditorAdapter } from "@/modules/market-orders/adapters/listing-order-adapter";
import LimitOrderEditor from "@/modules/market-orders/components/limit-order-editor";
import LimitOrderEditorSkeleton from "@/modules/market-orders/components/limit-order-editor/skeleton";
import { MARKET_ORDER_INTENT } from "@/modules/market-orders/constants";
import {
    useMarketOrderFlowActions,
    useMarketOrderFlowState,
} from "@/modules/market-orders/flow/provider";
import { useCallback } from "react";
import { useCaskDetail } from "../provider";

export default function PlaceAsk({ id }: { id: string }) {
    const { setLoadingState } = useCaskDetail();
    const { draft } = useMarketOrderFlowState();
    const { setDraft } = useMarketOrderFlowActions();
    const handleLoadingChange = useCallback(
        (isLoading: boolean) => setLoadingState("placeAsk", isLoading),
        [setLoadingState]
    );

    return (
        <LimitOrderEditor
            id={id}
            adapter={listingEditorAdapter}
            draft={draft}
            onDraftChange={setDraft}
            loadingFallback={<LimitOrderEditorSkeleton />}
            onLoadingChange={handleLoadingChange}
        />
    );
}

export const PlaceAskFooter = ({ id: _id }: { id: string }) => {
    const { draft } = useMarketOrderFlowState();
    const { switchFlow, goToConfirm } = useMarketOrderFlowActions();
    const canContinue = draft.price > 0;

    const handleSwitchToSellNow = () => {
        switchFlow(MARKET_ORDER_INTENT.SELL_NOW);
    };

    const handleContinue = () => {
        if (!canContinue) return;
        goToConfirm();
    };

    return (
        <div className="sticky bottom-0 flex w-full items-center justify-between bg-bg-main mb:flex-col-reverse mb:gap-2">
            <div className="flex items-center gap-1">
                <span className="text-sm text-typo-soft">
                    Prefer to sell instantly?
                </span>
                <Button
                    variant="link"
                    className="h-auto p-0 font-medium"
                    onClick={handleSwitchToSellNow}
                >
                    Sell Now
                </Button>
            </div>
            <Button
                disabled={!canContinue}
                variant="primary"
                className="mb:w-full"
                onClick={handleContinue}
            >
                Continue
            </Button>
        </div>
    );
};
