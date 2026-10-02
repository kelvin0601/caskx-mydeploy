"use client";

import useGetStateQuery from "@/hooks/useGetStateQuery";
import { CASK_KEYS } from "@/lib/constants/key";
import caskServices from "@/services/cask";
import type { cask } from "@/types";
import { useEffect } from "react";
import type {
    MarketOrderEditorAdapter,
    OrderDraft,
    PriceValidationResult,
} from "../../types";
import OrderEditor from "../order-editor";

type LimitOrderEditorProps = {
    id: string;
    adapter: MarketOrderEditorAdapter;
    draft: OrderDraft;
    onDraftChange: (draft: OrderDraft) => void;
    loadingFallback: React.ReactNode;
    onLoadingChange?: (isLoading: boolean) => void;
    onValidationChange?: (result: PriceValidationResult) => void;
    maxQuantity?: number;
    enabled?: boolean;
};

export default function LimitOrderEditor({
    id,
    adapter,
    draft,
    onDraftChange,
    loadingFallback,
    onLoadingChange,
    onValidationChange,
    maxQuantity,
    enabled = true,
}: LimitOrderEditorProps) {
    const { data: caskDetail, status } = useGetStateQuery<cask.TCask>({
        key: [CASK_KEYS.CASK_DETAIL, id],
        fetchFn: () => caskServices.getDetailCask(id),
    });
    const isLoading = status === "pending" && !caskDetail;

    useEffect(() => {
        onLoadingChange?.(isLoading);
        return () => onLoadingChange?.(false);
    }, [isLoading, onLoadingChange]);

    if (isLoading || !caskDetail) return loadingFallback;

    return (
        <OrderEditor
            adapter={adapter}
            cask={{
                id,
                name: caskDetail.master?.name || caskDetail.name,
                imageUrl: caskDetail?.master?.imageUrl || "",
                vintageYear: caskDetail?.vintageYear || 0,
                priceReference: caskDetail?.priceReference || 0,
            }}
            value={draft}
            onChange={onDraftChange}
            onValidationChange={onValidationChange}
            maxQuantity={maxQuantity}
            enabled={enabled}
        />
    );
}
