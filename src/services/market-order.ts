import axiosInstance from "@/config/axios";
import { handleRequest } from "@/lib/utils";
import { marketOrder } from "@/types/market-order";
import { KEY_TRADING } from "@/lib/constants/key";
import { PATH_MARKET_ORDER } from "@/lib/constants/path";

class MarketOrderService {
    async buyNow(
        data: marketOrder.TBuyNowRequest
    ): Promise<marketOrder.TMarketOrderResult> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_MARKET_ORDER}/${KEY_TRADING.BUY_NOW}`,
                data
            )
        );
    }
    async sellNow(
        data: marketOrder.TSellNowRequest
    ): Promise<marketOrder.TMarketOrderResult> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_MARKET_ORDER}/${KEY_TRADING.SELL_NOW}`,
                data
            )
        );
    }
    async getCurrentPrice({
        caskId,
    }: {
        caskId: string;
    }): Promise<marketOrder.TGetCurrentPriceResponse> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_MARKET_ORDER}/${KEY_TRADING.CURRENT_PRICE}/${caskId}`
            )
        );
    }

    async confirmPrice(
        data: marketOrder.TConfirmPriceRequest
    ): Promise<marketOrder.TMarketOrderResult> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_MARKET_ORDER}/${KEY_TRADING.CONFIRM_PRICE}`,
                data
            )
        );
    }
}

export const marketOrderService = new MarketOrderService();
