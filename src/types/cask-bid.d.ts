import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { checkout } from "./checkout";

declare namespace caskBid {
    type TCaskBidMarketData = {
        caskId: string;
        highestBid: number;
        lowestAsk: number;
        lowestBid: number;
        totalActiveAsks: number;
        totalActiveBids: number;
        totalTransactions: number;
    };
    type TCostBreakdown = {
        requestedQuantity: number;
        bidPrice: number;
        totalBidAmount: number;
        actualTotalCost: number;
        savedAmount: number;
        averagePrice: number;
        fulfillableQuantity: number;
        pendingQuantity: number;
        checkoutSessionId?: string;
        checkoutSession?: {
            id: string;
            [key: string]: unknown;
        };
        matchingBreakdown: Array<{
            askPrice: number;
            quantity: number;
            totalCost: number;
            checkoutSessionId?: string;
            checkoutSession?: {
                id: string;
                [key: string]: unknown;
            };
        }>;
    };
    type TCaskBidMarketDataResponse = {
        bids: {
            quantity: number;
            price: number;
            type: string;
            caskId: string;
            caskName: string;
            distillery: string;
            createdAt: string;
        }[];
    };
    type TCaskBidMarketDataSalesResponse = {
        sales: {
            price: number;
            quantity: number;
            completedDate: string;
            transactionId: string;
            type: string;
        }[];
    };

    export type TCaskBidSuggestion = {
        goodBid: number;
        betterBid: number;
        buyFaster: number;
        upperLimit: number;
        marketValue: number;
        scenarioUsed: string;
        calculatedAt: string;
    };
    export type TCaskBidValidate = {
        isValid: boolean;
        upperLimit: number;
        marketValue: number;
        message: string;
        suggestedBids: TCaskBidSuggestion;
        warningType: "none" | "warning" | "error";
    };
    export type TCaskBidCreateReq = {
        caskId: string; // Required: Cask to bid on
        bidPrice: number; // Required: Bid amount
        currency?: string; // Optional: Default "USD"
        quantity?: number; // Optional: Default 1
        expirationDays?: number; // Optional: 1, 3, 7, 30, or 60
        customExpirationDate?: Date; // Optional: Custom expiration
        executionPolicy?: BidExecutionPolicy; // Optional: Default PARTIAL_ALLOWED
    };
    export type TCaskBidUpdateReq = {
        bidPrice: number;
        remainingQuantity: number;
        expirationDays: number;
    };
    export type TCaskBidCreateRes = {
        id: string;
        caskId: string;
        bidderId: string;
        bidPrice: number;
        currency: string;
        quantity: number;
        remainingQuantity: number;
        executionPolicy: BidExecutionPolicy;
        status: string;
        expirationDate: string;
        priorityTimestamp: string;
        feeRateSnapshot: number;
        initialQuantity: number;
        createdAt: string;
        updatedAt: string;
        lastUpdateAt: string | null;
        costBreakdown: TCostBreakdown;
        checkoutSession: checkout.TCheckoutSession;
    };

    export type TCalculateBidPriceRequest = {
        price: number;
        quantity?: number;
        discountCode?: string;
        sessionId?: string;
        orderType?: "bid" | "ask";
    };

    export type TCalculateBidPriceResponse = {
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
    export type TBidInventory = {
        exactQuantity: number;
        availableQuantity: number;
        totalQuantity: number;
        totalValue: number;
        totalValueWithDiscount: number;
        totalValueWithDiscountAndFee: number;
        totalValueWithDiscountAndFeeAndTax: number;
        totalValueWithDiscountAndFeeAndTaxAndShipping: number;
    };
    export type TMatchingBidsResponse = {
        fulfillmentSummary: {
            desiredQuantity: number;
            fulfilledQuantity: number;
            remainingQuantity: number;
        };
        fulfillmentDetails: Array<{
            bid?: {
                id: string;
                caskId: string;
                bidPrice: number;
                expirationDate?: string;
            };
            ask?: {
                id: string;
                caskId: string;
                askPrice: number;
                expirationDate?: string;
            };
            quantityNeeded?: number;
            quantity?: number;
            totalCost?: number;
        }>;
        matchingAsks?: Array<{
            id: string;
            caskId: string;
            askPrice: number;
            quantity: number;
            expirationDate?: string;
        }>;
    };

    export type TBidTransaction = {
        caskTransactionId: string;
        caskId: string;
        caskName: string;
        checkoutSessionId: string;
        transactionPrice: number;
        quantity: number;
        totalPrice: string;
        currency: string;
        status: string;
        transactionId: string;
        dueBy: string;
        payoutStatus: string;
        payoutLifecycle: string;
        sellerAgreementStatus: string;
        agreementType?: "direct" | "indirect";
        netPayoutAmount?: number | null;
        sellerAgreementSignatureDueAt?: string | null;
        sellerAgreementDocuSignEnvelopeId?: string | null;
        buyerAgreementStatus?: string | null;
        buyerDocuSignEnvelopeId?: string | null;
        buyerDocuSignStatus?: string | null;
        createdAt: string;
        updatedAt: string;
    };

    export type TBidTransactionsResponse = {
        success: boolean;
        data: {
            bidId: string;
            bid: {
                id: string;
                bidPrice: number;
                currency: string;
                quantity: number;
                remainingQuantity: number;
                initialQuantity: number;
                executionPolicy: BidExecutionPolicy;
                status: string;
                expirationDate: string;
                createdAt: string;
                updatedAt: string;
                cask: {
                    id: string;
                    image: string;
                    name: string;
                    distilleryName: string;
                };
            };
            transactions: Array<TBidTransaction>;
        };
    };
}
