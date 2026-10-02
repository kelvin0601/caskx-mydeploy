import axiosInstance from "@/config/axios";
import {
    KEY_BID,
    KEY_MARKET_DATA,
    PATH_BID,
    PATH_MARKET_DATA,
} from "@/lib/constants";
import { handleRequest } from "@/lib/utils";
import { caskBid } from "@/types/cask-bid";
import { MarketOperations } from "@/types/market-operations";

/**
 * Legacy Market Data Service
 * @deprecated Use marketDataViewService for new implementations
 * This service is kept for backward compatibility with existing bid-related functionality
 */
class MarketDataService {
    /**
     * Get basic market data for a cask (legacy)
     * @param id - Cask ID
     * @deprecated Use marketDataViewService.getCaskMarketDataView() instead
     */
    async getMarketData(
        id: number | string
    ): Promise<caskBid.TCaskBidMarketData> {
        return handleRequest<caskBid.TCaskBidMarketData>(
            axiosInstance.get(`${PATH_BID}/${KEY_BID.BID_MARKET_DATA}/${id}`)
        );
    }

    /**
     * Get real-time market ticker data
     * @param caskIds - Optional array of cask IDs to filter
     */
    async getMarketTicker(caskIds?: string[]): Promise<
        Array<{
            caskId: string;
            lastPrice: number;
            change24h: number;
            changePercent24h: number;
            volume24h: number;
            high24h: number;
            low24h: number;
            timestamp: Date;
        }>
    > {
        const params = caskIds ? { caskIds: caskIds.join(",") } : {};
        return handleRequest(
            axiosInstance.get(`${PATH_BID}/ticker`, { params })
        );
    }

    /**
     * Get market summary statistics
     */
    async getMarketSummary(): Promise<{
        totalMarketCap: number;
        totalVolume24h: number;
        totalActiveCasks: number;
        totalActiveUsers: number;
        averagePrice: number;
        topGainers: Array<{
            caskId: string;
            changePercent: number;
        }>;
        topLosers: Array<{
            caskId: string;
            changePercent: number;
        }>;
    }> {
        return handleRequest(axiosInstance.get(`${PATH_BID}/market-summary`));
    }

    async getMarketDataBid({ caskId }: { caskId: string }) {
        return handleRequest<Pick<MarketOperations.TMarketDataView, "bids">>(
            axiosInstance.get(
                `${PATH_MARKET_DATA}/${KEY_MARKET_DATA.CASK}/${caskId}/${KEY_MARKET_DATA.BIDS}`
            )
        );
    }

    async getMarketDataAsk({ caskId }: { caskId: string }) {
        return handleRequest<Pick<MarketOperations.TMarketDataView, "asks">>(
            axiosInstance.get(
                `${PATH_MARKET_DATA}/${KEY_MARKET_DATA.CASK}/${caskId}/${KEY_MARKET_DATA.ASKS}`
            )
        );
    }
    async getMarketDataAll({ caskId }: { caskId: string }) {
        return handleRequest<MarketOperations.TCaskMarketDataView>(
            axiosInstance.get(
                `${PATH_MARKET_DATA}/view/${KEY_MARKET_DATA.CASK}/${caskId}`
            )
        );
    }
    async getMarketDataSales({ caskId }: { caskId: string }) {
        return handleRequest<Pick<MarketOperations.TMarketDataView, "sales">>(
            axiosInstance.get(
                `${PATH_MARKET_DATA}/${KEY_MARKET_DATA.SALES}?caskId=${caskId}`
            )
        );
    }
}

export const marketDataService = new MarketDataService();
