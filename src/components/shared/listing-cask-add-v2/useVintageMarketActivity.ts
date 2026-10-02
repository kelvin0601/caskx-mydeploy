import { KEY_MARKET_DATA } from "@/lib/constants/key";
import { marketDataService } from "@/services/market-data";
import {
    DUPLICATE_VARIANT_ID,
    NEW_VARIANT_ID,
} from "@/lib/constants/cask-variant";
import { CaskVariantItem } from "@/store/dashboard/CaskProvider";
import { useQuery } from "@tanstack/react-query";

export const VINTAGE_HAS_MARKET_ACTIVITY_TOOLTIP =
    "This vintage has marketplace activity and can’t be deleted. Turn off the Active status instead.";

export function checkVintageHasMarketActivity(
    variant?: CaskVariantItem | null,
    marketData?: {
        marketData?: {
            asks?: unknown[];
            bids?: unknown[];
            sales?: unknown[];
        };
    } | null
): boolean {
    if (!variant) return false;
    const id = String(variant.id ?? "");
    if (
        !id ||
        id.includes(NEW_VARIANT_ID) ||
        id.includes(DUPLICATE_VARIANT_ID)
    ) {
        return false;
    }

    const v = variant as unknown as Record<string, unknown>;
    if (Boolean(v.hasMarketActivity || v.hasActivity || v.hasOrders)) {
        return true;
    }

    if (
        variant.totalActiveBids !== undefined &&
        variant.totalActiveBids !== null &&
        Number(variant.totalActiveBids) > 0
    ) {
        return true;
    }

    if (
        variant.highestBid !== undefined &&
        variant.highestBid !== null &&
        Number(variant.highestBid) > 0
    ) {
        return true;
    }

    if (
        variant.lowestAsk !== undefined &&
        variant.lowestAsk !== null &&
        Number(variant.lowestAsk) > 0
    ) {
        return true;
    }

    if (marketData?.marketData) {
        const { asks, bids, sales } = marketData.marketData;
        if (
            (Array.isArray(asks) && asks.length > 0) ||
            (Array.isArray(bids) && bids.length > 0) ||
            (Array.isArray(sales) && sales.length > 0)
        ) {
            return true;
        }
    }

    return false;
}

export function useVintageMarketActivity(variant?: CaskVariantItem | null) {
    const id = String(variant?.id ?? "");
    const isPending =
        !id || id.includes(NEW_VARIANT_ID) || id.includes(DUPLICATE_VARIANT_ID);

    const quickHasActivity = checkVintageHasMarketActivity(variant);

    const { data: marketData } = useQuery({
        queryKey: [KEY_MARKET_DATA.CASK, id],
        queryFn: () => marketDataService.getMarketDataAll({ caskId: id }),
        enabled: !isPending && !quickHasActivity,
        staleTime: 60 * 1000,
        retry: false,
    });

    const hasMarketActivity =
        quickHasActivity || checkVintageHasMarketActivity(variant, marketData);

    return {
        hasMarketActivity,
        tooltip: hasMarketActivity
            ? VINTAGE_HAS_MARKET_ACTIVITY_TOOLTIP
            : undefined,
    };
}
