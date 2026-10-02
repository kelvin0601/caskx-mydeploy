import { Button } from "@/components/ui/button";
import { offerEditorAdapter } from "@/modules/market-orders/adapters/offer-order-adapter";
import LimitOrderEditor from "@/modules/market-orders/components/limit-order-editor";
import LimitOrderEditorSkeleton from "@/modules/market-orders/components/limit-order-editor/skeleton";
import { MARKET_ORDER_INTENT } from "@/modules/market-orders/constants";
import {
    useMarketOrderFlowActions,
    useMarketOrderFlowState,
} from "@/modules/market-orders/flow/provider";
import { useCallback } from "react";
import { useCaskDetail } from "../provider";

export default function PlaceBid({ id }: { id: string }) {
    const { setLoadingState } = useCaskDetail();
    const { draft } = useMarketOrderFlowState();
    const { setDraft } = useMarketOrderFlowActions();
    const handleLoadingChange = useCallback(
        (isLoading: boolean) => setLoadingState("placeBid", isLoading),
        [setLoadingState]
    );

    return (
        <LimitOrderEditor
            id={id}
            adapter={offerEditorAdapter}
            draft={draft}
            onDraftChange={setDraft}
            loadingFallback={<LimitOrderEditorSkeleton />}
            onLoadingChange={handleLoadingChange}
        />
    );
}

export const PlaceBidFooter = ({ id: _id }: { id: string }) => {
    const { draft } = useMarketOrderFlowState();
    const { switchFlow, goToConfirm } = useMarketOrderFlowActions();
    const canContinue = draft.price > 0;

    return (
        <div className="sticky bottom-0 flex w-full items-center justify-between bg-bg-main mb:flex-col-reverse mb:gap-2">
            <div className="flex items-center gap-1">
                <span className="text-sm text-typo-soft">
                    Want it instantly?
                </span>
                <Button
                    variant="link"
                    className="h-auto p-0 font-medium"
                    onClick={() => switchFlow(MARKET_ORDER_INTENT.BUY_NOW)}
                >
                    Buy now
                </Button>
            </div>
            <Button
                disabled={!canContinue}
                variant="primary"
                className="mb:w-full"
                onClick={() => {
                    if (canContinue) {
                        goToConfirm();
                    }
                }}
            >
                Continue
            </Button>
        </div>
    );
};
