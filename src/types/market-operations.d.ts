// Market Operations Module Type Definitions

import { EBidExecutionPolicy } from "@/enum/cask-bid";

declare namespace MarketOperations {
    // ==================== Market Data View Types ====================

    export type TAggregatedAskDto = {
        price: number;
        quantity: number;
        type: EBidExecutionPolicy;
        percentageFromLowest: number; // Rounded to 1 decimal place
        expiryDate?: string;
    };

    export type TAggregatedBidDto = {
        price: number;
        quantity: number;
        percentageFromHighest: number; // Rounded to 1 decimal place
        type: EBidExecutionPolicy;
        expiryDate?: string;
    };

    export type TMarketSaleDto = {
        salePrice: number;
        quantity: number;
        completedDate: string;
        transactionId: string;
        type: string;
    };

    export type TMarketDataView = {
        asks: TAggregatedAskDto[];
        bids: TAggregatedBidDto[];
        sales: TMarketSaleDto[];
    };

    export type TCaskMarketDataView = {
        caskId: string;
        caskName: string;
        marketData: TMarketDataView;
    };

    export type TBestInvestmentItem = {
        caskId: string;
        caskName: string;
        price: number;
        expectedReturn: number;
        riskLevel: "low" | "medium" | "high";
        salesVolume: number;
        marketTrend: "up" | "down" | "stable";
    };

    // ==================== Trading Types ====================

    export type TBuyNowRequest = {
        caskId: string;
    };

    export type TSellNowRequest = {
        caskId: string;
    };

    export type TPlaceBidRequest = {
        caskId: string;
        bidPrice: number;
        currency?: string; // Default: USD
        quantity?: number; // Default: 1
        expirationDays?: number; // 1, 3, 7, 30, or 60
        customExpirationDate?: Date;
    };

    export type TPlaceAskRequest = {
        caskId: string;
        askPrice: number;
        currency?: string; // Default: USD
        quantity?: number; // Default: 1
        expirationDays?: number;
        customExpirationDate?: Date;
    };

    export type TTradeExecutionResult = {
        success: boolean;
        transactionId: string;
        price: number;
        quantity: number;
        buyerId: string;
        sellerId: string;
        caskId: string;
        executedAt: Date;
        fees: {
            processingFee: number;
            shippingFee: number;
            totalFees: number;
        };
    };

    export type TTradingMarketData = {
        caskId: string;
        currentBuyPrice: number | null; // Lowest ask
        currentSellPrice: number | null; // Highest bid
        priceRange: {
            min: number;
            max: number;
        };
        orderCounts: {
            activeBids: number;
            activeAsks: number;
        };
        lastSalePrice: number | null;
        volume24h: number;
    };

    // ==================== Order Management Types ====================

    export type TBidOrder = {
        id: string;
        caskId: string;
        userId: string;
        bidPrice: number;
        quantity: number;
        currency: string;
        status: "active" | "cancelled" | "filled" | "expired";
        createdAt: Date;
        expiresAt: Date | null;
        filledQuantity: number;
        averageFillPrice: number | null;
    };

    export type TAskOrder = {
        id: string;
        caskId: string;
        userId: string;
        askPrice: number;
        quantity: number;
        currency: string;
        status: "active" | "cancelled" | "filled" | "expired";
        createdAt: Date;
        expiresAt: Date | null;
        filledQuantity: number;
        averageFillPrice: number | null;
    };

    export type TOrderListFilters = {
        caskId?: string;
        active?: boolean;
        status?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: "ASC" | "DESC";
    };

    // ==================== Ownership Types ====================

    export type TCaskOwnership = {
        id: string;
        caskId: string;
        userId: string;
        acquiredAt: Date;
        acquisitionPrice: number;
        currentValue: number;
        unrealizedGain: number;
        unrealizedGainPercentage: number;
    };

    export type TOwnershipSummary = {
        totalCasks: number;
        totalValue: number;
        totalInvested: number;
        unrealizedGains: number;
        realizedGains: number;
        averageReturn: number;
        bestPerformer: {
            caskId: string;
            returnPercentage: number;
        };
        worstPerformer: {
            caskId: string;
            returnPercentage: number;
        };
    };

    export type TOwnershipTransferRequest = {
        fromUserId: string;
        toUserId: string;
        caskId: string;
        transferPrice?: number;
        reason: "sale" | "gift" | "admin" | "other";
    };

    // ==================== Transaction Types ====================

    export type TCaskTransaction = {
        id: string;
        caskId: string;
        buyerId: string;
        sellerId: string;
        price: number;
        quantity: number;
        currency: string;
        type: "market_buy" | "market_sell" | "order_match" | "direct_sale";
        status: "pending" | "completed" | "failed" | "cancelled";
        executedAt: Date;
        fees: {
            buyerFee: number;
            sellerFee: number;
            processingFee: number;
            shippingFee: number;
        };
        metadata: {
            bidOrderId?: string;
            askOrderId?: string;
            orderMatchedAt?: Date;
        };
    };

    export type TTransactionFilters = {
        type?: string;
        status?: string;
        caskId?: string;
        fromDate?: Date;
        toDate?: Date;
        page?: number;
        limit?: number;
    };

    export type TDirectSaleRequest = {
        caskId: string;
        buyerId: string;
        price: number;
        currency?: string;
    };

    // ==================== API Response Types ====================

    export type TApiResponse<T> = {
        success: boolean;
        data?: T;
        message?: string;
        errorCode?: string;
        timestamp: Date;
    };

    export type TPaginatedResponse<T> = {
        data: T[];
        pagination: {
            page: number;
            limit: number;
            totalRecords: number;
            totalPages: number;
        };
    };

    // ==================== Error Types ====================

    export type TMarketOperationError = {
        code: string;
        message: string;
        details?: unknown;
    };

    export const ErrorCodes = {
        INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
        NO_ACTIVE_BIDS: "NO_ACTIVE_BIDS",
        NO_ACTIVE_ASKS: "NO_ACTIVE_ASKS",
        OWNERSHIP_REQUIRED: "OWNERSHIP_REQUIRED",
        INVALID_PRICE: "INVALID_PRICE",
        CASK_NOT_FOUND: "CASK_NOT_FOUND",
        ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
        UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
        MARKET_CLOSED: "MARKET_CLOSED",
        ORDER_EXPIRED: "ORDER_EXPIRED",
        INSUFFICIENT_QUANTITY: "INSUFFICIENT_QUANTITY",
    } as const;

    // ==================== Utility Types ====================

    export type Currency = "USD" | "EUR" | "GBP";
    export type OrderStatus =
        | "active"
        | "cancelled"
        | "filled"
        | "expired"
        | "partial";
    export type TransactionType =
        | "market_buy"
        | "market_sell"
        | "order_match"
        | "direct_sale";
    export type TransactionStatus =
        | "pending"
        | "completed"
        | "failed"
        | "cancelled";
    export namespace MarketOperationsComprehensive {
        // Common types
        export type TOrderStatus =
            | "active"
            | "completed"
            | "cancelled"
            | "expired";
        export type TSortBy = "price" | "quantity" | "created_at";
        export type TSortOrder = "asc" | "desc";
        export type TCompetitionLevel = "low" | "medium" | "high";
        export type TMarketCondition = "favorable" | "neutral" | "unfavorable";
        export type TWarningType =
            | "price_too_low"
            | "price_too_high"
            | "high_competition"
            | "market_volatility"
            | "low_liquidity"
            | "low_demand";
        export type TSeverity = "low" | "medium" | "high";

        // Filter types
        export type TOrderFilters = {
            caskId?: string;
            status?: TOrderStatus;
            userId?: string;
            priceMin?: number;
            priceMax?: number;
            page?: number;
            limit?: number;
            sortBy?: TSortBy;
            sortOrder?: TSortOrder;
        };

        // Enhanced bid types
        export type TBidOrder = {
            id: string;
            caskId: string;
            caskName?: string;
            bidPrice: number;
            quantity: number;
            remainingQuantity?: number;
            status: string;
            userId: string;
            createdAt: string;
            updatedAt?: string;
            expiresAt?: string;
            fills?: Array<{
                price: number;
                quantity: number;
                timestamp: string;
            }>;
        };

        // Enhanced ask types
        export type TAskOrder = {
            id: string;
            caskId: string;
            caskName?: string;
            askPrice: number;
            quantity: number;
            remainingQuantity?: number;
            status: string;
            userId: string;
            createdAt: string;
            updatedAt?: string;
            expiresAt?: string;
            fills?: Array<{
                price: number;
                quantity: number;
                timestamp: string;
            }>;
        };

        // Market data types
        export type TMarketData = {
            caskId: string;
            lowestAsk?: number;
            highestBid?: number;
            askCount: number;
            bidCount: number;
            spread: {
                absolute: number;
                percentage: number;
            };
            volume24h: number;
            priceHistory: Array<{
                price: number;
                timestamp: string;
                volume: number;
            }>;
            liquidityDepth: {
                bids: Array<{ price: number; quantity: number }>;
                asks: Array<{ price: number; quantity: number }>;
            };
        };

        // Analytics types
        export type TAnalytics = {
            activeBids?: number;
            activeAsks?: number;
            averageBidPrice?: number;
            averageAskPrice?: number;
            highestBid?: number;
            lowestAsk?: number;
            totalBidVolume?: number;
            totalAskVolume?: number;
            priceDistribution: Array<{
                priceRange: string;
                count: number;
                percentage: number;
            }>;
            competitionLevel: TCompetitionLevel;
            probability: {
                atCurrentPrice: number;
                at5PercentChange: number;
                at10PercentChange: number;
            };
        };

        // Warning types
        export type TWarning = {
            type: TWarningType;
            severity: TSeverity;
            message: string;
            recommendation?: string;
        };

        // Validation types
        export type TValidationResult = {
            valid: boolean;
            errors: Array<{
                field: string;
                message: string;
                code: string;
            }>;
            warnings: Array<{
                message: string;
                severity: TSeverity;
            }>;
            estimatedFees: {
                platformFee: number;
                paymentFee: number;
                total: number;
            };
            canProceed: boolean;
        };

        // Pricing suggestion types
        export type TPricingSuggestion = {
            conservative: number;
            competitive: number;
            aggressive: number;
            marketPrice: number;
            priceRange: {
                min: number;
                max: number;
            };
            recommendations: {
                winningChance?: {
                    conservative: number;
                    competitive: number;
                    aggressive: number;
                };
                sellingChance?: {
                    conservative: number;
                    competitive: number;
                    aggressive: number;
                };
                timeToComplete: {
                    conservative: string;
                    competitive: string;
                    aggressive: string;
                };
            };
        };

        // Market depth types
        export type TMarketDepth = {
            bids: Array<{
                price: number;
                quantity: number;
                cumulative: number;
                percentage: number;
            }>;
            asks: Array<{
                price: number;
                quantity: number;
                cumulative: number;
                percentage: number;
            }>;
            spread: {
                absolute: number;
                percentage: number;
            };
            depth: {
                bidDepth: number;
                askDepth: number;
            };
            liquidityScore: number;
        };

        // Checkout calculation types
        export type TCheckoutCalculation = {
            orderSummary: {
                caskId: string;
                caskName: string;
                price: number;
                quantity: number;
                subtotal: number;
            };
            fees: {
                platformFee: number;
                paymentFee: number;
                total: number;
            };
            discount: {
                amount: number;
                code?: string;
                description?: string;
            };
            total: number;
            currency: string;
            paymentMethods: Array<{
                id: string;
                name: string;
                fee: number;
                available: boolean;
            }>;
            estimatedProcessingTime: string;
        };
    }
}

export { MarketOperations };
