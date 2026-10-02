import axiosInstance from "@/config/axios";
import { KEY_ASK, PATH_ASK } from "@/lib/constants";
import { handleRequest } from "@/lib/utils";
import { TTableRow } from "@/types";
import { caskAsk } from "@/types/cask-ask";
import { marketOrder } from "@/types/market-order";

class CaskAskService {
    async getAsks(
        filters?: caskAsk.TOrderListFilters
    ): Promise<caskAsk.TPaginatedResponse<caskAsk.TCaskOrder>> {
        return handleRequest<caskAsk.TPaginatedResponse<caskAsk.TCaskOrder>>(
            axiosInstance.get(`${PATH_ASK}/${KEY_ASK.ASK_LIST}`, {
                params: filters,
            })
        );
    }
    async getMyAsksTotal(): Promise<caskAsk.TCaskOrder[]> {
        return handleRequest<caskAsk.TCaskOrder[]>(
            axiosInstance.get(`${PATH_ASK}/${KEY_ASK.ASK_MY_ASKS}`)
        );
    }
    async getMyAsks(
        filters?: Partial<caskAsk.TOrderListFilters> | string
    ): Promise<caskAsk.TPaginatedWithoutPaginationResponse<TTableRow>> {
        return handleRequest<
            caskAsk.TPaginatedWithoutPaginationResponse<TTableRow>
        >(
            axiosInstance.get(`${PATH_ASK}/${KEY_ASK.ASK_MY_ASKS}/filtered`, {
                params: filters,
            })
        );
    }
    async getStatusCountAsks() {
        return handleRequest<caskAsk.TStatusCountAsksResponse>(
            axiosInstance.get(
                `${PATH_ASK}/${KEY_ASK.ASK_MY_ASKS}/${KEY_ASK.ASK_STATUS_COUNT}`
            )
        );
    }

    async getLowestAsk(caskId: string): Promise<caskAsk.TCaskOrder | null> {
        return handleRequest<caskAsk.TCaskOrder | null>(
            axiosInstance.get(`${PATH_ASK}/${KEY_ASK.ASK_LOWEST}/${caskId}`)
        );
    }
    async getHighestAsk(caskId: string): Promise<caskAsk.TCaskOrder | null> {
        return handleRequest<caskAsk.TCaskOrder | null>(
            axiosInstance.get(`${PATH_ASK}/${KEY_ASK.ASK_HIGHEST}/${caskId}`)
        );
    }

    async createAsk(
        askData: caskAsk.TPlaceAskRequest
    ): Promise<marketOrder.TMarketOrderResult> {
        return handleRequest<marketOrder.TMarketOrderResult>(
            axiosInstance.post(`${PATH_ASK}`, askData)
        );
    }

    async updateAsk(
        askId: string,
        updateData: caskAsk.TUpdateAskRequest
    ): Promise<marketOrder.TMarketOrderResult> {
        return handleRequest<marketOrder.TMarketOrderResult>(
            axiosInstance.put(`${PATH_ASK}/${askId}`, updateData)
        );
    }

    async cancelAsk(
        askId: string
    ): Promise<{ message: string; askId: string }> {
        return handleRequest<{ message: string; askId: string }>(
            axiosInstance.delete(`${PATH_ASK}/${askId}/${KEY_ASK.ASK_CANCEL}`)
        );
    }

    async getAskById(askId: string): Promise<caskAsk.TCaskOrder> {
        return handleRequest<caskAsk.TCaskOrder>(
            axiosInstance.get(`${PATH_ASK}/${askId}`)
        );
    }

    async getAskHistory(
        userId?: string,
        filters?: caskAsk.TAskHistoryFilters
    ): Promise<caskAsk.TPaginatedResponse<caskAsk.TAskHistoryItem>> {
        const params: Record<string, unknown> = { ...filters };
        if (userId) params.userId = userId;

        return handleRequest(
            axiosInstance.get(`${PATH_ASK}/history`, { params })
        );
    }

    async getAskAnalytics({
        caskId,
        askPrice,
        quantity,
    }: {
        caskId: string;
        askPrice: number;
        quantity: number;
    }): Promise<caskAsk.TAskAnalytics> {
        return handleRequest(
            axiosInstance.get(`${PATH_ASK}/${KEY_ASK.ASK_ANALYST}`, {
                params: { caskId, askPrice, quantity },
            })
        );
    }

    async validateAskPrice(
        caskId: string,
        askPrice: number
    ): Promise<caskAsk.TAskValidatePriceResponse> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_ASK}/${KEY_ASK.ASK_VALIDATE_PRICE}/${caskId}?askPrice=${askPrice}`
            )
        );
    }

    async getAskSuggestions(
        caskId: string
    ): Promise<caskAsk.TAskSuggestionsResponse> {
        return handleRequest(
            axiosInstance.get(`${PATH_ASK}/${KEY_ASK.ASK_SUGGEST}/${caskId}`)
        );
    }

    async bulkCancelAsks(
        askIds: string[]
    ): Promise<caskAsk.TBulkCancelAsksResponse> {
        return handleRequest(
            axiosInstance.post(`${PATH_ASK}/bulk-cancel`, { askIds })
        );
    }

    async getCompetitiveAnalysis(
        caskId: string
    ): Promise<caskAsk.TCompetitiveAnalysisResponse> {
        return handleRequest(
            axiosInstance.get(`${PATH_ASK}/${KEY_ASK.ASK_ANALYST}/${caskId}`)
        );
    }
    async calculateAskPrice(
        data: caskAsk.TCalculateAskPriceRequest
    ): Promise<caskAsk.TCalculateAskPriceResponse> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_ASK}/${KEY_ASK.ASK_CALCULATE_PRICE}`,
                data
            )
        );
    }
    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem("checkoutSessionId");

        if (!sessionId) {
            sessionId = `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem("checkoutSessionId", sessionId);
        }

        return sessionId;
    }
    getAskInventory({
        caskId,
        askPrice,
    }: {
        caskId: string;
        askPrice: number;
    }): Promise<caskAsk.TAskInventoryResponse> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_ASK}/${KEY_ASK.ASK_INVENTORY}/${caskId}?askPrice=${askPrice}`
            )
        );
    }
    getMatchingBids({
        maxBidAmount,
        caskId,
        desiredQuantity,
    }: {
        maxBidAmount: number;
        caskId: string;
        desiredQuantity: number;
    }): Promise<caskAsk.TMatchingBidsResponse> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_ASK}/${KEY_ASK.ASK_MATCHING_BIDS}?maxBidAmount=${maxBidAmount}&caskId=${caskId}&desiredQuantity=${desiredQuantity}`
            )
        );
    }
}

export const caskAskService = new CaskAskService();
export default caskAskService;
