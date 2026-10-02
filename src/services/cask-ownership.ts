import axiosInstance from "@/config/axios";
import { KEY_OWNERSHIP, PATH_OWNERSHIP } from "@/lib/constants";
import { handleRequest } from "@/lib/utils";
import { MarketOperations } from "@/types/market-operations";

/**
 * Cask Ownership Service
 * Handles ownership tracking and portfolio management
 */
class CaskOwnershipService {
    /**
     * Get all ownerships for current user
     * @param filters - Optional filtering parameters
     */
    async getUserOwnerships(filters?: {
        page?: number;
        limit?: number;
        sortBy?: "acquisitionDate" | "currentValue" | "unrealizedGain";
        sortOrder?: "ASC" | "DESC";
    }): Promise<
        MarketOperations.TPaginatedResponse<MarketOperations.TCaskOwnership>
    > {
        return handleRequest<
            MarketOperations.TPaginatedResponse<MarketOperations.TCaskOwnership>
        >(
            axiosInstance.get(`${PATH_OWNERSHIP}/${KEY_OWNERSHIP.USER}`, {
                params: filters,
            })
        );
    }

    /**
     * Get ownership summary/statistics for current user
     */
    async getUserOwnershipSummary(): Promise<MarketOperations.TOwnershipSummary> {
        return handleRequest<MarketOperations.TOwnershipSummary>(
            axiosInstance.get(`${PATH_OWNERSHIP}/${KEY_OWNERSHIP.USER_SUMMARY}`)
        );
    }

    /**
     * Get ownership history for a specific cask
     * @param caskId - The ID of the cask
     */
    async getCaskOwnershipHistory(caskId: string): Promise<
        Array<{
            id: string;
            caskId: string;
            userId: string;
            userName: string;
            acquiredAt: Date;
            soldAt?: Date;
            acquisitionPrice: number;
            salePrice?: number;
            ownershipDuration?: number; // in days
            returnOnInvestment?: number;
        }>
    > {
        return handleRequest(
            axiosInstance.get(
                `${PATH_OWNERSHIP}/${KEY_OWNERSHIP.CASK}/${caskId}`
            )
        );
    }

    /**
     * Create ownership record (admin function)
     * @param ownershipData - Ownership creation data
     */
    async createOwnership(ownershipData: {
        caskId: string;
        userId: string;
        acquisitionPrice: number;
        acquisitionDate?: Date;
    }): Promise<MarketOperations.TCaskOwnership> {
        return handleRequest<MarketOperations.TCaskOwnership>(
            axiosInstance.post(
                `${PATH_OWNERSHIP}/${KEY_OWNERSHIP.CREATE}`,
                ownershipData
            )
        );
    }

    /**
     * Transfer ownership between users
     * @param transferData - Transfer request data
     */
    async transferOwnership(
        transferData: MarketOperations.TOwnershipTransferRequest
    ): Promise<{
        success: boolean;
        transactionId: string;
        newOwnership: MarketOperations.TCaskOwnership;
        message: string;
    }> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_OWNERSHIP}/${KEY_OWNERSHIP.TRANSFER}`,
                transferData
            )
        );
    }

    /**
     * Get portfolio performance analytics
     * @param period - Time period for analysis
     */
    async getPortfolioPerformance(
        period: "1M" | "3M" | "6M" | "1Y" | "ALL" = "1Y"
    ): Promise<{
        totalReturn: number;
        totalReturnPercentage: number;
        annualizedReturn: number;
        volatility: number;
        sharpeRatio: number;
        maxDrawdown: number;
        periodicReturns: Array<{
            date: string;
            portfolioValue: number;
            dailyReturn: number;
            cumulativeReturn: number;
        }>;
        sectorAllocation: Array<{
            distillery: string;
            value: number;
            percentage: number;
            count: number;
        }>;
        topPerformers: Array<{
            caskId: string;
            caskName: string;
            returnPercentage: number;
            currentValue: number;
        }>;
        bottomPerformers: Array<{
            caskId: string;
            caskName: string;
            returnPercentage: number;
            currentValue: number;
        }>;
    }> {
        return handleRequest(
            axiosInstance.get(`${PATH_OWNERSHIP}/performance`, {
                params: { period },
            })
        );
    }

    /**
     * Get portfolio diversification analysis
     */
    async getPortfolioDiversification(): Promise<{
        diversificationScore: number; // 0-100
        concentrationRisk: "low" | "medium" | "high";
        recommendations: string[];
        breakdown: {
            byDistillery: Array<{
                distillery: string;
                count: number;
                value: number;
                percentage: number;
            }>;
            byRegion: Array<{
                region: string;
                count: number;
                value: number;
                percentage: number;
            }>;
            byAgeRange: Array<{
                ageRange: string;
                count: number;
                value: number;
                percentage: number;
            }>;
            byPriceRange: Array<{
                priceRange: string;
                count: number;
                value: number;
                percentage: number;
            }>;
        };
        riskMetrics: {
            portfolioBeta: number;
            correlationMatrix: Array<{
                caskId1: string;
                caskId2: string;
                correlation: number;
            }>;
        };
    }> {
        return handleRequest(
            axiosInstance.get(`${PATH_OWNERSHIP}/diversification`)
        );
    }

    /**
     * Get tax reporting data
     * @param taxYear - Tax year (e.g., 2023)
     */
    async getTaxReportingData(taxYear: number): Promise<{
        totalGains: number;
        totalLosses: number;
        netGain: number;
        shortTermGains: number;
        longTermGains: number;
        transactions: Array<{
            caskId: string;
            caskName: string;
            acquisitionDate: Date;
            saleDate: Date;
            acquisitionPrice: number;
            salePrice: number;
            gainLoss: number;
            holdingPeriod: number; // in days
            termType: "short" | "long";
        }>;
        summary: {
            totalTransactions: number;
            totalVolume: number;
            averageHoldingPeriod: number;
        };
    }> {
        return handleRequest(
            axiosInstance.get(`${PATH_OWNERSHIP}/tax-report`, {
                params: { taxYear },
            })
        );
    }

    /**
     * Get ownership verification status
     * @param caskId - The cask ID to verify
     */
    async verifyOwnership(caskId: string): Promise<{
        isOwner: boolean;
        ownershipId?: string;
        acquisitionDate?: Date;
        canSell: boolean;
        restrictions: Array<{
            type: string;
            description: string;
            expiresAt?: Date;
        }>;
    }> {
        return handleRequest(
            axiosInstance.get(`${PATH_OWNERSHIP}/verify/${caskId}`)
        );
    }

    /**
     * Get ownership alerts and notifications
     */
    async getOwnershipAlerts(): Promise<
        Array<{
            id: string;
            type:
                | "price_alert"
                | "market_news"
                | "ownership_change"
                | "maturity_alert";
            message: string;
            caskId?: string;
            severity: "info" | "warning" | "critical";
            createdAt: Date;
            isRead: boolean;
        }>
    > {
        return handleRequest(axiosInstance.get(`${PATH_OWNERSHIP}/alerts`));
    }

    /**
     * Mark ownership alert as read
     * @param alertId - ID of the alert
     */
    async markAlertAsRead(alertId: string): Promise<{ success: boolean }> {
        return handleRequest(
            axiosInstance.patch(`${PATH_OWNERSHIP}/alerts/${alertId}/read`)
        );
    }

    /**
     * Get portfolio insurance options
     */
    async getInsuranceOptions(): Promise<{
        availableOptions: Array<{
            provider: string;
            coverageType: string;
            premium: number;
            coverage: number;
            description: string;
        }>;
        currentCoverage: Array<{
            caskId: string;
            provider: string;
            coverageAmount: number;
            premium: number;
            expiresAt: Date;
        }>;
        recommendations: {
            totalRecommendedCoverage: number;
            estimatedPremium: number;
            riskFactors: string[];
        };
    }> {
        return handleRequest(axiosInstance.get(`${PATH_OWNERSHIP}/insurance`));
    }

    /**
     * Export portfolio data
     * @param format - Export format
     */
    async exportPortfolio(format: "csv" | "excel" | "pdf"): Promise<{
        downloadUrl: string;
        expiresAt: Date;
        fileSize: number;
    }> {
        return handleRequest(
            axiosInstance.post(`${PATH_OWNERSHIP}/export`, { format })
        );
    }
}

export const caskOwnershipService = new CaskOwnershipService();
export default caskOwnershipService;
