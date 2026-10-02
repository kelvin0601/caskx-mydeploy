import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { cask } from "./cask";
import { transaction } from "./transaction";

declare namespace caskAsk {
    type TStatusCountAsksResponse = {
        pending: number;
        active: number;
        completed: number;
        cancelled: number;
        expired: number;
        total: number;
    };
    type TCaskAskMarketDataResponse = {
        asks: {
            quantity: number;
            price: number;
            type: string;
            caskId: string;
            caskName: string;
            distillery: string;
            createdAt: string;
        }[];
    };

    export type TAskAnalytics = {
        totalAsks: number;
        activeAsks: number;
        completedAsks: number;
        cancelledAsks: number;
        averageAskPrice: number;
        totalValueListed: number;
        successRate: number;
        averageTimeToSell: number; // in hours
        bestPerformingCask: {
            caskId: string;
            askPrice: number;
            soldPrice: number;
            profit: number;
        };
        monthlyPerformance: Array<{
            month: string;
            asksCreated: number;
            asksSold: number;
            totalValue: number;
        }>;
    };

    // Common utility types for Ask domain
    export type Currency = "USD" | "EUR" | "GBP";
    export type OrderStatus =
        | ETransactionStatus
        | ETransactionOnGoingStatus
        | ETransactionHistoryStatus;

    // Ask order shape
    export type TCaskOrder = {
        cask: cask.TCask;
        id: string;
        distilleryName: string;
        subtotal: number;
        executionPolicy: EBidExecutionPolicy;
        askType: ETransactionType;
        caskId: string;
        vintageYear?: number | string | null;
        userId: string;
        askPrice: number;
        quantity: number;
        remainingQuantity: number;
        currency: Currency;
        status: OrderStatus;
        expirationDate: Date | string;
        filledQuantity: number;
        averageFillPrice: number | null;
        createdAt?: string;
        updatedAt?: string;
    };

    // Request payload to place/update an ask
    export type TPlaceAskRequest = {
        caskId: string;
        askPrice: number;
        currency?: Currency; // Default: USD
        quantity?: number; // Default: 1
        expirationDays?: number;
        executionPolicy?: BidExecutionPolicy;
        customExpirationDate?: Date;
        sellNow?: boolean;
    };

    export type TUpdateAskRequest = {
        caskId?: string;
        askPrice: number;
        quantity: number;
        expirationDays: number;
    };

    // Filters for listing asks
    export type TOrderListFilters = {
        status?: string;
        executionPolicy?: EBidExecutionPolicy;
        page?: number;
        size?: number;
        limit?: number;
        step?: string;
        pageSize?: number;
        sortBy?:
            | "quantity"
            | "unitPrice"
            | "subtotal"
            | "type"
            | "expirationDate"
            | "status";
        search?: string;
        order?: "asc" | "desc" | "none";
    };

    // Generic paginated response
    export type TPaginatedResponse<T> = {
        data: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };

    // Generic paginated response
    export type TPaginatedWithoutPaginationResponse<T> = {
        data: T[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };

    export type TAskHistoryFilters = {
        status?: string;
        fromDate?: Date;
        toDate?: Date;
        page?: number;
        limit?: number;
    };

    export type TAskHistoryItem = TAskOrder & {
        caskName: string;
        finalPrice?: number;
        executedAt?: Date;
    };

    export type TAskValidatePriceResponse = {
        isValid: boolean;
        recommendation: "above_market" | "at_market" | "below_market";
        marketPrice: number;
        competitivePrice: number;
        message: string;
        warningType: "none" | "warning" | "error";
        estimatedTimeToSell: string;
    };

    export type TAskSuggestionsReasoning = {
        quickSale: string;
        marketPrice: string;
        premiumPrice: string;
    };

    export type TAskSuggestionsMarketData = {
        currentHighestBid: number;
        averageSalePrice30d: number;
        priceVolatility: "low" | "medium" | "high";
        liquidityLevel: "low" | "medium" | "high";
    };

    export type TAskSuggestionsResponse = {
        conservativeAsk: number;
        moderateAsk: number;
        s;
        aggressiveAsk: number;
        marketValue: number;
        scenarioUsed: string;
        calculatedAt: string;
    };

    export type TBulkCancelAsksResponse = {
        cancelled: string[];
        failed: Array<{ askId: string; reason: string }>;
        summary: {
            totalRequested: number;
            successfullyCancelled: number;
            failed: number;
        };
    };

    export type TCompetitiveAnalysisCurrentAsk = {
        price: number;
        quantity: number;
        daysListed: number;
    };

    export type TCompetitiveAnalysisPriceDistribution = {
        min: number;
        max: number;
        median: number;
        average: number;
    };

    export type TCompetitiveAnalysisRecommendations = {
        toSellQuickly: number;
        competitive: number;
        premium: number;
    };

    export type TCompetitiveAnalysisMarketInsights = {
        demandLevel: "low" | "medium" | "high";
        supplyLevel: "low" | "medium" | "high";
        priceStability: "volatile" | "stable" | "trending_up" | "trending_down";
    };

    export type TCompetitiveAnalysisResponse = {
        currentAsks: TCompetitiveAnalysisCurrentAsk[];
        priceDistribution: TCompetitiveAnalysisPriceDistribution;
        recommendations: TCompetitiveAnalysisRecommendations;
        marketInsights: TCompetitiveAnalysisMarketInsights;
    };
    export type TCalculateAskPriceRequest = {
        askPrice: number;
        quantity?: number;
        sessionId?: string;
    };
    export type TCalculateAskPriceResponse = {
        subtotal: number;
        transactionFeeAmount: number;
        transactionFeePercent: number;
        processingFeeAmount: number;
        processingFeePercent: number;
        totalFees: number;
        discountAmount: number;
        discountCode: string;
        totalAmount: number;
        breakdown: {
            subtotal: number;
            fees: number;
            discount: number;
            total: number;
        };
    };
    export type TAskInventoryResponse = {
        askPrice: number;
        exactQuantity: number;
        availableAtPriceOrLower: number;
        numberOfAsksAtPrice: number;
        numberOfAsksAtPriceOrLower: number;
    };
    export type TMatchingBidsResponse = {
        matchingAsks: [
            {
                id: string;
                caskId: string;
                sellerId: string;
                askPrice: number;
                currency: string;
                quantity: number;
                remainingQuantity: number;
                executionPolicy: BidExecutionPolicy;
                status: string;
                expirationDate: string;
                createdAt: string;
                updatedAt: string;
            },
        ];
        fulfillmentSummary: {
            canFullyFulfill: boolean;
            desiredQuantity: number;
            fulfilledQuantity: number;
            remainingQuantity: number;
            totalAvailableQuantity: number;
            totalFulfillmentCost: number;
            averagePrice: number;
            numberOfAsks: number;
        };
        fulfillmentDetails: [
            {
                ask: {
                    id: string;
                    caskId: string;
                    sellerId: string;
                    askPrice: number;
                    currency: string;
                    quantity: number;
                    remainingQuantity: number;
                    executionPolicy: BidExecutionPolicy;
                    status: string;
                    expirationDate: string;
                    createdAt: string;
                    updatedAt: string;
                };
                quantityNeeded: number;
                totalCost: number;
            },
        ];
    };

    export type TAskTransactionsResponse = {
        success: boolean;
        data: {
            askId: string;
            transactions: transaction.TTransaction[];
        };
    };
}
export { caskAsk };
