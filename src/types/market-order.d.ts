import { cask } from "./cask";
import { caskBid } from "./cask-bid";

// Minimal types aligned with backend MarketOrderResult shape
export namespace marketOrder {
    export type TImmediateMatch = {
        askId: string;
        askPrice: number;
        availableQuantity: number;
        sellerId: string;
        matchableQuantity: number;
        totalCost: number;
    };

    export type TMatchingSummary = {
        totalMatchedQuantity: number;
        totalMatchableCost: number;
        averageMatchPrice: number;
        remainingQuantity: number;
    };

    export type TImmediateExecution = {
        quantity: number;
        price: number;
        totalCost: number;
        processingFee: number;
        depositAmount?: number;
    };

    export type TRemainderOrder = {
        orderId: string;
        quantity: number;
        price: number;
        expiryDays: number;
    };
    export type TSellNowRequest = {
        caskId: string;
        quantity: number;
        displayedPrice: number;
    };
    export type TGetCurrentPriceResponse = {
        lowestAsk: number;
        highestBid: number;
        spread: number;
        lastUpdated: string;
    };
    export type TPriceConfirmation = {
        confirmationId: string;
        displayedPrice: number;
        currentPrice: number;
        priceChangePercent: number;
        expiresAt?: string;
    };

    export type TMarketOrderResult = {
        bidId: string;
        id: string;
        bidPrice: number;
        quantity: number;
        cask: cask.TCask;
        status: string;
        expirationDate: string;
        immediateMatches: TImmediateMatch[];
        matchSummary: TMatchingSummary;
        matchingSummary: TMatchingSummary;
        immediateExecution?: TImmediateExecution[];
        remainderOrder?: TRemainderOrder;
        priceConfirmation?: TPriceConfirmation;
        costBreakdown?: caskBid.TCostBreakdown;
    };

    export type TBuyNowRequest = {
        caskId: string;
        quantity: number;
        maxPrice?: number;
        displayedPrice?: number;
        paymentMethodId?: string;
        executionPolicy?: string;
        expirationDays?: number;
    };

    export type TConfirmPriceRequest = {
        confirmationId: string;
        accept: boolean;
        paymentMethodId?: string;
    };
}
