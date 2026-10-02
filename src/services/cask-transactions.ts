import axiosInstance from "@/config/axios";
import {
    KEY_TRANSACTIONS,
    PATH_SINGLE_TRANSACTION,
    PATH_TRANSACTIONS,
} from "@/lib/constants";
import { handleRequest } from "@/lib/utils";
import { TTableRow } from "@/types";
import type { payout } from "@/types/payout";
import type { transaction } from "@/types/transaction";
import { MarketOperations } from "@/types/market-operations";

class CaskTransactionsService {
    async getAllTransactions(
        filters?: MarketOperations.TTransactionFilters
    ): Promise<
        MarketOperations.TPaginatedResponse<MarketOperations.TCaskTransaction>
    > {
        return handleRequest<
            MarketOperations.TPaginatedResponse<MarketOperations.TCaskTransaction>
        >(
            axiosInstance.get(`${PATH_TRANSACTIONS}/${KEY_TRANSACTIONS.LIST}`, {
                params: filters,
            })
        );
    }

    /**
     * Get current user's transaction history
     * @param filters - Filtering options
     */
    async getMyTransactions(
        filters?: MarketOperations.TTransactionFilters
    ): Promise<MarketOperations.TPaginatedResponse<TTableRow>> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_TRANSACTIONS}/${KEY_TRANSACTIONS.MY_TRANSACTIONS}`,
                {
                    params: filters,
                }
            )
        );
    }
    async getHistoryTransactions(
        filters?: MarketOperations.TTransactionFilters
    ): Promise<MarketOperations.TPaginatedResponse<TTableRow>> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_SINGLE_TRANSACTION}/${KEY_TRANSACTIONS.HISTORY_TRANSACTIONS}`,
                {
                    params: {
                        ...filters,
                        pageSize: filters?.limit,
                    },
                }
            )
        );
    }
    /**
     * Accept a specific bid (direct trade)
     * @param bidId - ID of the bid to accept
     */
    async acceptBid(
        bidId: string
    ): Promise<MarketOperations.TTradeExecutionResult> {
        return handleRequest<MarketOperations.TTradeExecutionResult>(
            axiosInstance.post(
                `${PATH_TRANSACTIONS}/${KEY_TRANSACTIONS.ACCEPT_BID}/${bidId}`
            )
        );
    }

    /**
     * Accept a specific ask (direct trade)
     * @param askId - ID of the ask to accept
     */
    async acceptAsk(
        askId: string
    ): Promise<MarketOperations.TTradeExecutionResult> {
        return handleRequest<MarketOperations.TTradeExecutionResult>(
            axiosInstance.post(
                `${PATH_TRANSACTIONS}/${KEY_TRANSACTIONS.ACCEPT_ASK}/${askId}`
            )
        );
    }

    /**
     * Create direct sale between users
     * @param saleData - Direct sale request data
     */
    async createDirectSale(
        saleData: MarketOperations.TDirectSaleRequest
    ): Promise<MarketOperations.TTradeExecutionResult> {
        return handleRequest<MarketOperations.TTradeExecutionResult>(
            axiosInstance.post(
                `${PATH_TRANSACTIONS}/${KEY_TRANSACTIONS.DIRECT_SALE}`,
                saleData
            )
        );
    }

    /**
     * Get transaction details by ID
     * @param transactionId - ID of the transaction
     */
    async getTransactionById(transactionId: string): Promise<
        MarketOperations.TCaskTransaction & {
            caskDetails: {
                name: string;
                distillery: string;
                vintage: number;
                imageUrl: string;
            };
            buyerDetails: {
                name: string;
                email: string;
            };
            sellerDetails: {
                name: string;
                email: string;
            };
        }
    > {
        return handleRequest(
            axiosInstance.get(`${PATH_TRANSACTIONS}/${transactionId}`)
        );
    }

    /**
     * Get transaction analytics for user
     * @param period - Time period for analysis
     */
    async getTransactionAnalytics(
        period: "1M" | "3M" | "6M" | "1Y" | "ALL" = "1Y"
    ): Promise<{
        summary: {
            totalTransactions: number;
            totalBuys: number;
            totalSells: number;
            totalVolume: number;
            averageTransactionSize: number;
            successRate: number;
        };
        performance: {
            totalGainLoss: number;
            realizedGains: number;
            realizedLosses: number;
            winRate: number;
            averageHoldingPeriod: number; // in days
            bestTrade: {
                transactionId: string;
                caskName: string;
                gainLoss: number;
                returnPercentage: number;
            };
            worstTrade: {
                transactionId: string;
                caskName: string;
                gainLoss: number;
                returnPercentage: number;
            };
        };
        trends: {
            monthlyVolume: Array<{
                month: string;
                volume: number;
                transactionCount: number;
                averagePrice: number;
            }>;
            preferredDistilleries: Array<{
                distillery: string;
                transactionCount: number;
                totalVolume: number;
            }>;
            tradingPatterns: {
                averageTimeBetweenTrades: number; // in days
                mostActiveDay: string;
                mostActiveHour: number;
                seasonalTrends: Array<{
                    quarter: string;
                    activity: number;
                }>;
            };
        };
    }> {
        return handleRequest(
            axiosInstance.get(`${PATH_TRANSACTIONS}/analytics`, {
                params: { period },
            })
        );
    }

    /**
     * Get market transaction statistics
     */
    async getMarketTransactionStats(): Promise<{
        global: {
            totalTransactions24h: number;
            totalVolume24h: number;
            averageTransactionSize: number;
            mostTradedCask: {
                caskId: string;
                name: string;
                transactionCount: number;
            };
        };
        trends: {
            priceMovement: "up" | "down" | "stable";
            volumeTrend: "increasing" | "decreasing" | "stable";
            liquidityLevel: "high" | "medium" | "low";
        };
        topTransactions: Array<{
            transactionId: string;
            caskName: string;
            price: number;
            timestamp: Date;
            type: "sale" | "auction";
        }>;
        distilleryRankings: Array<{
            distillery: string;
            transactionCount: number;
            totalVolume: number;
            averagePrice: number;
            priceChange24h: number;
        }>;
    }> {
        return handleRequest(
            axiosInstance.get(`${PATH_TRANSACTIONS}/market-stats`)
        );
    }

    /**
     * Generate transaction receipt
     * @param transactionId - ID of the transaction
     */
    async generateReceipt(transactionId: string): Promise<{
        receiptUrl: string;
        expiresAt: Date;
    }> {
        return handleRequest(
            axiosInstance.post(`${PATH_TRANSACTIONS}/${transactionId}/receipt`)
        );
    }

    /**
     * Request transaction dispute
     * @param transactionId - ID of the transaction
     * @param reason - Reason for dispute
     * @param description - Detailed description
     */
    async requestDispute(
        transactionId: string,
        reason: string,
        description: string
    ): Promise<{
        disputeId: string;
        status: "pending" | "investigating" | "resolved";
        estimatedResolutionTime: string;
    }> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_TRANSACTIONS}/${transactionId}/dispute`,
                {
                    reason,
                    description,
                }
            )
        );
    }

    /**
     * Get transaction fees breakdown
     * @param transactionType - Type of transaction
     * @param amount - Transaction amount
     */
    async getFeesBreakdown(
        transactionType: "buy" | "sell" | "direct",
        amount: number
    ): Promise<{
        subtotal: number;
        platformFee: number;
        processingFee: number;
        paymentFee: number;
        insuranceFee: number;
        shippingFee: number;
        taxes: number;
        total: number;
        breakdown: Array<{
            type: string;
            description: string;
            amount: number;
            percentage?: number;
        }>;
    }> {
        return handleRequest(
            axiosInstance.post(`${PATH_TRANSACTIONS}/fees-breakdown`, {
                transactionType,
                amount,
            })
        );
    }

    /**
     * Get pending transactions
     */
    async getOnGoingTransactions(
        filters?: MarketOperations.TTransactionFilters
    ): Promise<
        MarketOperations.TPaginatedResponse<
            TTableRow & {
                caskName: string;
                estimatedCompletionTime: Date;
                nextAction: string;
                canCancel: boolean;
            }
        >
    > {
        return handleRequest(
            axiosInstance.get(`${PATH_SINGLE_TRANSACTION}/ongoing`, {
                params: {
                    ...filters,
                    pageSize: filters?.limit,
                },
            })
        );
    }

    /**
     * Cancel a pending transaction
     * @param transactionId - ID of the transaction to cancel
     * @param reason - Reason for cancellation
     */
    async cancelTransaction(
        transactionId: string,
        reason: string
    ): Promise<{
        success: boolean;
        refundAmount: number;
        refundMethod: string;
        estimatedRefundTime: string;
    }> {
        return handleRequest(
            axiosInstance.post(`${PATH_TRANSACTIONS}/${transactionId}/cancel`, {
                reason,
            })
        );
    }

    /**
     * Export transaction history
     * @param format - Export format
     * @param filters - Optional filters for export
     */
    async exportTransactionHistory(
        format: "csv" | "excel" | "pdf",
        filters?: MarketOperations.TTransactionFilters
    ): Promise<{
        downloadUrl: string;
        expiresAt: Date;
        fileSize: number;
        recordCount: number;
    }> {
        return handleRequest(
            axiosInstance.post(`${PATH_TRANSACTIONS}/export`, {
                format,
                filters,
            })
        );
    }

    /**
     * Get transaction compliance report
     * @param startDate - Start date for report
     * @param endDate - End date for report
     */
    async getComplianceReport(
        startDate: Date,
        endDate: Date
    ): Promise<{
        reportId: string;
        period: {
            startDate: Date;
            endDate: Date;
        };
        summary: {
            totalTransactions: number;
            totalVolume: number;
            flaggedTransactions: number;
            complianceScore: number;
        };
        flaggedTransactions: Array<{
            transactionId: string;
            flagReason: string;
            riskLevel: "low" | "medium" | "high";
            requiresReview: boolean;
        }>;
        regulatoryRequirements: Array<{
            requirement: string;
            status: "compliant" | "non_compliant" | "pending";
            details: string;
        }>;
    }> {
        return handleRequest(
            axiosInstance.post(`${PATH_TRANSACTIONS}/compliance-report`, {
                startDate,
                endDate,
            })
        );
    }
    async getTransactionHistoryStatus(): Promise<{
        data: {
            status: string;
            count: number;
        }[];
    }> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_SINGLE_TRANSACTION}/${KEY_TRANSACTIONS.HISTORY_TRANSACTIONS}/status-counts`
            )
        );
    }
    async getTransactionOnGoingStatusCounts(): Promise<{
        data: {
            status: string;
            count: number;
        }[];
    }> {
        return handleRequest<{
            data: {
                status: string;
                count: number;
            }[];
        }>(
            axiosInstance.get(
                `${PATH_SINGLE_TRANSACTION}/${KEY_TRANSACTIONS.ONGOING_TRANSACTIONS}/status-counts`
            )
        );
    }
    async getTransactionPayout({
        askId,
    }: {
        askId: string;
    }): Promise<payout.TAskTransactionPayoutResponse> {
        return handleRequest<payout.TAskTransactionPayoutResponse>(
            axiosInstance.get(
                `${PATH_SINGLE_TRANSACTION}/${KEY_TRANSACTIONS.ASKS}/${askId}`
            )
        );
    }

    async getTransactionDetailClient(
        transactionId: string
    ): Promise<transaction.TTransactionDetailResponse> {
        return handleRequest<transaction.TTransactionDetailResponse>(
            axiosInstance.get(
                `${PATH_SINGLE_TRANSACTION}/${KEY_TRANSACTIONS.ASKS}/${transactionId}`
            )
        );
    }

    /**
     * GET /api/transactions/checkout-sessions/{checkoutSessionId}/documents
     */
    async getCheckoutSessionDocuments(
        checkoutSessionId: string
    ): Promise<transaction.TCheckoutSessionDocumentsResponse> {
        return handleRequest<transaction.TCheckoutSessionDocumentsResponse>(
            axiosInstance.get(
                `${PATH_SINGLE_TRANSACTION}/${KEY_TRANSACTIONS.CHECKOUT_SESSIONS}/${checkoutSessionId}/${KEY_TRANSACTIONS.DOCUMENTS}`
            )
        );
    }
}

export const caskTransactionsService = new CaskTransactionsService();
export default caskTransactionsService;
