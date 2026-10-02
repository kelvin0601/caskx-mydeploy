import { useQueryClient } from "@tanstack/react-query";
import {
    CASK_KEYS,
    KEY_ASK,
    KEY_BID,
    KEY_MARKET_DATA,
} from "@/lib/constants/key";

/**
 * Options for invalidating cache queries
 */
type TInvalidateOptions = {
    /** Optional cask ID to invalidate specific cask-related cache */
    caskId?: string;
    /** Optional filters to invalidate specific filtered queries */
    filters?: {
        status?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: string;
        search?: string;
    };
};

/**
 * @example
 * ```tsx
 * const { invalidateAllForAsk } = useInvalidateCaskCache();
 *
 * // After placing an ask
 * await placeAskMutation.mutateAsync(data);
 * invalidateAllForAsk(caskId);
 * ```
 *
 * @returns Object containing invalidation methods
 */
export function useInvalidateCaskCache() {
    const queryClient = useQueryClient();

    /**
     * Invalidates all manage asks cache queries.
     *
     * This includes:
     * - All ask list queries (with optional filters)
     * - Ask status count query
     *
     * @param options - Optional configuration for invalidation
     * @param options.filters - If provided, invalidates only queries matching these filters
     */
    const invalidateManageAsks = (options?: TInvalidateOptions) => {
        if (options?.filters) {
            queryClient.invalidateQueries({
                queryKey: [KEY_ASK.ASK_MY_ASKS, options.filters],
            });
        } else {
            queryClient.invalidateQueries({
                queryKey: [KEY_ASK.ASK_MY_ASKS],
            });
        }
        queryClient.invalidateQueries({
            queryKey: [KEY_ASK.ASK_MY_ASKS, KEY_ASK.ASK_STATUS_COUNT],
        });
    };

    /**
     * Invalidates all manage bids cache queries.
     *
     * This includes:
     * - All bid list queries (with optional filters)
     * - Bid status count query
     *
     * @param options - Optional configuration for invalidation
     * @param options.filters - If provided, invalidates only queries matching these filters
     */
    const invalidateManageBids = (options?: TInvalidateOptions) => {
        if (options?.filters) {
            queryClient.invalidateQueries({
                queryKey: [KEY_BID.BID_MY_BIDS, options.filters],
            });
        } else {
            queryClient.invalidateQueries({
                queryKey: [KEY_BID.BID_MY_BIDS],
            });
        }
        queryClient.invalidateQueries({
            queryKey: [KEY_BID.BID_MY_BIDS, KEY_BID.BID_LIST],
        });
    };

    /**
     * Invalidates cask detail cache queries for a specific cask.
     *
     * This includes:
     * - Cask listing/details query
     * - Market data query (bids/asks data for the cask)
     *
     * @param caskId - The ID of the cask to invalidate cache for
     */
    const invalidateCaskDetail = (caskId: string) => {
        if (!caskId) return;
        queryClient.invalidateQueries({
            queryKey: [CASK_KEYS.LISTING, caskId],
        });
        queryClient.invalidateQueries({
            queryKey: [KEY_BID.BID_MARKET_DATA, caskId],
        });
        queryClient.invalidateQueries({
            queryKey: [KEY_MARKET_DATA.MARKET_DATA, caskId],
        });
        queryClient.invalidateQueries({
            queryKey: [KEY_MARKET_DATA.CASK, caskId],
        });
    };

    /**
     * Invalidates all cache related to asks for a specific cask.
     *
     * This is a convenience method that invalidates:
     * - Manage asks cache (with optional filters)
     * - Cask detail cache (if caskId is provided)
     *
     * Use this when placing or updating an ask to ensure all related
     * cache is refreshed.
     *
     * @param caskId - Optional cask ID to also invalidate cask detail cache
     * @param filters - Optional filters to invalidate specific ask queries
     *
     * @example
     * ```tsx
     * // After placing an ask
     * invalidateAllForAsk(caskId);
     *
     * // After updating an ask with filters
     * invalidateAllForAsk(caskId, { status: 'active', page: 1 });
     * ```
     */
    const invalidateAllForAsk = (
        caskId?: string,
        filters?: TInvalidateOptions["filters"]
    ) => {
        invalidateManageAsks({ filters });
        if (caskId) {
            invalidateCaskDetail(caskId);
        }
    };

    /**
     * Invalidates all cache related to bids for a specific cask.
     *
     * This is a convenience method that invalidates:
     * - Manage bids cache (with optional filters)
     * - Cask detail cache (if caskId is provided)
     *
     * Use this when placing or updating a bid to ensure all related
     * cache is refreshed.
     *
     * @param caskId - Optional cask ID to also invalidate cask detail cache
     * @param filters - Optional filters to invalidate specific bid queries
     *
     * @example
     * ```tsx
     * // After placing a bid
     * invalidateAllForBid(caskId);
     *
     * // After updating a bid with filters
     * invalidateAllForBid(caskId, { status: 'pending', page: 1 });
     * ```
     */
    const invalidateAllForBid = (
        caskId?: string,
        filters?: TInvalidateOptions["filters"]
    ) => {
        invalidateManageBids({ filters });
        if (caskId) {
            invalidateCaskDetail(caskId);
        }
    };

    /**
     * Invalidates all cache (asks, bids, and cask detail).
     *
     * This is a comprehensive method that invalidates:
     * - All manage asks cache (with optional filters)
     * - All manage bids cache (with optional filters)
     * - Cask detail cache (if caskId is provided)
     *
     * Use this when you need to refresh everything, such as after
     * a major operation or when ensuring complete data synchronization.
     *
     * @param caskId - Optional cask ID to also invalidate cask detail cache
     * @param filters - Optional filters for asks and bids separately
     * @param filters.askFilters - Filters for ask queries
     * @param filters.bidFilters - Filters for bid queries
     *
     * @example
     * ```tsx
     * // Invalidate everything for a cask
     * invalidateAll(caskId);
     *
     * // Invalidate with specific filters
     * invalidateAll(caskId, {
     *   askFilters: { status: 'active' },
     *   bidFilters: { status: 'pending' }
     * });
     * ```
     */
    const invalidateAll = (
        caskId?: string,
        filters?: {
            askFilters?: TInvalidateOptions["filters"];
            bidFilters?: TInvalidateOptions["filters"];
        }
    ) => {
        invalidateManageAsks({ filters: filters?.askFilters });
        invalidateManageBids({ filters: filters?.bidFilters });
        if (caskId) {
            invalidateCaskDetail(caskId);
        }
    };

    return {
        /** Invalidate manage asks cache queries */
        invalidateManageAsks,
        /** Invalidate manage bids cache queries */
        invalidateManageBids,
        /** Invalidate cask detail cache for a specific cask */
        invalidateCaskDetail,
        /** Invalidate all ask-related cache (asks + cask detail) */
        invalidateAllForAsk,
        /** Invalidate all bid-related cache (bids + cask detail) */
        invalidateAllForBid,
        /** Invalidate all cache (asks + bids + cask detail) */
        invalidateAll,
    };
}
