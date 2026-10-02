import caskAskService from "@/services/cask-ask";
import { caskBidService } from "@/services/cask-bid";
import { caskAsk } from "@/types/cask-ask";
import { caskBid } from "@/types/cask-bid";
import {
    keepPreviousData,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { MARKET_ORDER_KEYS } from "../query-keys";

type OrderCalculationParams = {
    bidData?: caskBid.TCalculateBidPriceRequest;
    askData?: caskAsk.TCalculateAskPriceRequest;
    enabled?: boolean;
};

export default function useOrderCalculation({
    bidData,
    askData,
    enabled = true,
}: OrderCalculationParams) {
    const queryClient = useQueryClient();
    const bidCalQuery = useQuery({
        queryKey: MARKET_ORDER_KEYS.buyCalculation({ ...bidData }),
        queryFn: () => caskBidService.calculateBidPrice(bidData!),
        enabled:
            enabled &&
            (bidData?.discountCode
                ? Boolean(
                      bidData.sessionId &&
                      bidData.quantity &&
                      bidData.price &&
                      bidData.discountCode
                  )
                : Boolean(bidData?.quantity && bidData.price)),
        retry: false,
        placeholderData: keepPreviousData,
    });

    const askCalQuery = useQuery({
        queryKey: MARKET_ORDER_KEYS.sellCalculation({ ...askData }),
        queryFn: () => caskAskService.calculateAskPrice(askData!),
        enabled: Boolean(
            enabled &&
            askData?.sessionId &&
            askData.askPrice &&
            askData.quantity
        ),
        placeholderData: keepPreviousData,
        retry: false,
    });

    return {
        bidCalQuery,
        askCalQuery,
        refetchBid: (data: caskBid.TCalculateBidPriceRequest) =>
            queryClient.fetchQuery({
                queryKey: MARKET_ORDER_KEYS.buyCalculation({ ...data }),
                queryFn: () => caskBidService.calculateBidPrice(data),
                staleTime: 5_000,
            }),
        refetchAsk: (data: caskAsk.TCalculateAskPriceRequest) =>
            queryClient.fetchQuery({
                queryKey: MARKET_ORDER_KEYS.sellCalculation({ ...data }),
                queryFn: () => caskAskService.calculateAskPrice(data),
            }),
    };
}
