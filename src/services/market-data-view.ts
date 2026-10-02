import axiosInstance from "@/config/axios";
import { KEY_MARKET_DATA, PATH_MARKET_DATA } from "@/lib/constants";
import { handleRequest } from "@/lib/utils";
import { MarketOperations } from "@/types/market-operations";

/**
 * Market Data View Service
 * Handles aggregated market data for the "View Market Data" feature
 * Provides data for Asks, Bids, and Sales tabs
 */
class MarketDataViewService {
    /**
     * Get aggregated market data for all casks
     * Returns data grouped by price points with percentage calculations
     */
    async getMarketDataView(): Promise<MarketOperations.TMarketDataView> {
        return handleRequest<MarketOperations.TMarketDataView>(
            axiosInstance.get(`${PATH_MARKET_DATA}/${KEY_MARKET_DATA.VIEW}`)
        );
    }

    /**
     * Get aggregated market data for a specific cask
     * @param caskId - The ID of the cask
     */
    async getCaskMarketDataView(
        caskId: string
    ): Promise<MarketOperations.TCaskMarketDataView> {
        return handleRequest<MarketOperations.TCaskMarketDataView>(
            axiosInstance.get(
                `${PATH_MARKET_DATA}/${KEY_MARKET_DATA.VIEW}/${KEY_MARKET_DATA.CASK}/${caskId}`
            )
        );
    }

    /**
     * Get best investment opportunities
     * @param params - Query parameters for filtering and sorting
     */
    async getBestInvestments(params?: {
        limit?: number;
        sortBy?: string;
    }): Promise<MarketOperations.TBestInvestmentItem[]> {
        return handleRequest<MarketOperations.TBestInvestmentItem[]>(
            axiosInstance.get(
                `${PATH_MARKET_DATA}/${KEY_MARKET_DATA.BEST_INVESTMENTS}`,
                { params }
            )
        );
    }
}

export const marketDataViewService = new MarketDataViewService();
export default marketDataViewService;
