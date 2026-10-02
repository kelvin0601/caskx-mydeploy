import axiosInstance from "@/config/axios";
import { KEY_ASK, KEY_BID, PATH_BID, PATH_SINGLE_BID } from "@/lib/constants";
import { handleRequest } from "@/lib/utils";
import { TTableRow } from "@/types";
import { caskAsk } from "@/types/cask-ask";
import { caskBid } from "@/types/cask-bid";

class CaskBidService {
    async getBidDetail(
        bidId: string
    ): Promise<caskBid.TBidTransactionsResponse> {
        return handleRequest<caskBid.TBidTransactionsResponse>(
            axiosInstance.get(
                `${PATH_SINGLE_BID}/${bidId}/${KEY_BID.BID_TRANSACTIONS}`
            )
        );
    }

    async getCaskBidMarketData(
        id: number | string
    ): Promise<caskBid.TCaskBidMarketData> {
        return handleRequest<caskBid.TCaskBidMarketData>(
            axiosInstance.get(`${PATH_BID}/${KEY_BID.BID_MARKET_DATA}/${id}`)
        );
    }

    async getMyBids(
        filters?: Partial<caskAsk.TOrderListFilters>
    ): Promise<caskAsk.TPaginatedWithoutPaginationResponse<TTableRow>> {
        return handleRequest(
            axiosInstance.get(`${PATH_BID}/${KEY_BID.BID_MY_BIDS}/filtered`, {
                params: filters,
            })
        );
    }

    async getMyBidsTotal(): Promise<TTableRow[]> {
        return handleRequest<TTableRow[]>(
            axiosInstance.get(`${PATH_BID}/${KEY_BID.BID_MY_BIDS}`)
        );
    }

    async getStatusCountBids() {
        return handleRequest<caskAsk.TStatusCountAsksResponse>(
            axiosInstance.get(
                `${PATH_BID}/${KEY_BID.BID_MY_BIDS}/${KEY_ASK.ASK_STATUS_COUNT}`
            )
        );
    }
    async getCaskBidSuggestion(
        id: number | string
    ): Promise<caskBid.TCaskBidSuggestion> {
        return handleRequest<caskBid.TCaskBidSuggestion>(
            axiosInstance.get(`${PATH_BID}/${KEY_BID.BID_SUGGESTION}/${id}`)
        );
    }
    // POST /api/cask-bids
    async createCaskBids(
        data: caskBid.TCaskBidCreateReq
    ): Promise<caskBid.TCaskBidCreateRes> {
        return handleRequest<caskBid.TCaskBidCreateRes>(
            axiosInstance.post(`${PATH_BID}`, data)
        );
    }
    async updateBid(
        bidId: string,
        updateData: caskBid.TCaskBidUpdateReq
    ): Promise<caskBid.TCaskBidCreateRes> {
        return handleRequest(
            axiosInstance.put(`${PATH_BID}/${bidId}`, updateData)
        );
    }
    async validatePriceBid(data: {
        caskId: number | string;
        bidAmount: number;
    }): Promise<caskBid.TCaskBidValidate> {
        return handleRequest<caskBid.TCaskBidValidate>(
            axiosInstance.post(`${PATH_BID}/${KEY_BID.BID_VALIDATE}`, data)
        );
    }

    async cancelBid(
        bidId: string
    ): Promise<{ message: string; bidId: string }> {
        return handleRequest<{ message: string; bidId: string }>(
            axiosInstance.delete(`${PATH_BID}/${bidId}/${KEY_BID.BID_CANCEL}`)
        );
    }

    async getBidAnalytics(): Promise<{
        totalBids: number;
        activeBids: number;
        wonBids: number;
        cancelledBids: number;
        averageBidPrice: number;
        totalValueBid: number;
        successRate: number;
        averageTimeToWin: number; // in hours
        bestDeal: {
            caskId: string;
            bidPrice: number;
            marketPrice: number;
            savings: number;
        };
        monthlyPerformance: Array<{
            month: string;
            bidsPlaced: number;
            bidsWon: number;
            totalValue: number;
        }>;
    }> {
        return handleRequest(axiosInstance.get(`${PATH_BID}/analytics`));
    }

    async bulkCancelBids(bidIds: string[]): Promise<{
        cancelled: string[];
        failed: Array<{ bidId: string; reason: string }>;
        summary: {
            totalRequested: number;
            successfullyCancelled: number;
            failed: number;
        };
    }> {
        return handleRequest(
            axiosInstance.post(`${PATH_BID}/bulk-cancel`, { bidIds })
        );
    }

    async getHighBid(caskId: string) {
        return handleRequest<{
            bidPrice: number;
            bidderId: string;
            caskId: string;
            createdAt: string;
            id: string;
            quantity: number;
            remainingQuantity: number;
            status: string;
        }>(axiosInstance.get(`${PATH_BID}/${KEY_BID.BID_HIGHEST}/${caskId}`));
    }

    async getCompetitiveBidding(caskId: string): Promise<{
        currentBids: Array<{
            price: number;
            quantity: number;
            daysActive: number;
        }>;
        biddingStats: {
            totalBidders: number;
            averageBid: number;
            highestBid: number;
            medianBid: number;
        };
        recommendations: {
            competitive: number;
            aggressive: number;
            conservative: number;
        };
        winningChances: {
            competitive: number; // percentage
            aggressive: number;
            conservative: number;
        };
    }> {
        return handleRequest(
            axiosInstance.get(`${PATH_BID}/competitive-analysis/${caskId}`)
        );
    }

    async calculateBidPrice(
        data: caskBid.TCalculateBidPriceRequest
    ): Promise<caskBid.TCalculateBidPriceResponse> {
        return handleRequest(
            axiosInstance.post(`${PATH_BID}/${KEY_BID.BID_CALCULATE_PRICE}`, {
                ...data,
                price: Number(data.price),
                orderType: data.orderType,
            })
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

    async getBidInventory(data: {
        caskId: string;
        askPrice: number;
    }): Promise<caskBid.TBidInventory> {
        return handleRequest(
            axiosInstance.get(`${PATH_BID}/${KEY_BID.BID_INVENTORY}`, {
                params: data,
            })
        );
    }
    async getMatchingBids(data: {
        caskId: string;
        minAskAmount: number;
        desiredQuantity: number;
    }): Promise<caskBid.TMatchingBidsResponse> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_BID}/${KEY_BID.BID_MATCHING_ASKS}?minAskAmount=${data.minAskAmount}&caskId=${data.caskId}&desiredQuantity=${data.desiredQuantity}`
            )
        );
    }
    async getTransactionsFormBidId(data: {
        bidId: string;
    }): Promise<caskBid.TBidTransactionsResponse> {
        return handleRequest<caskBid.TBidTransactionsResponse>(
            axiosInstance.get(
                `${PATH_SINGLE_BID}/${data.bidId}/${KEY_BID.BID_TRANSACTIONS}`
            )
        );
    }
}

export const caskBidService = new CaskBidService();
