import axiosInstance from "@/config/axios";
import { PATH_SELLER_PAYOUT, SELLER_KEYS } from "@/lib/constants";
import { handleRequest } from "@/lib/utils";
import { SellerPayout } from "@/types/seller-payout";
import { PayoutServerAction } from "./server-action/payout";

/**
 * Seller Payout Service
 * Handles seller payout operations following the manual testing flow
 * Provides methods for acknowledge, summary, and trigger operations
 */
class SellerPayoutService extends PayoutServerAction {
    constructor() {
        super();
    }
    /**
     * Step 1: Acknowledge Release
     * Seller acknowledges the release form during onboarding
     */
    async acknowledgeRelease(
        askId: string,
        data: SellerPayout.TAcknowledgeReleaseRequest
    ): Promise<SellerPayout.TAcknowledgeReleaseResponse> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_SELLER_PAYOUT}/${askId}/${SELLER_KEYS.ACKNOWLEDGE}`,
                data
            )
        );
    }

    /**
     * Step 2: Get Payout Summary
     * Get detailed summary of the ask's payout status and calculations
     */
    async getPayoutSummary(
        askId: string
    ): Promise<SellerPayout.TPayoutSummary> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_SELLER_PAYOUT}/${askId}/${SELLER_KEYS.SUMMARY}`
            )
        );
    }

    /**
     * Step 3: Trigger Payout
     * Trigger the payout process for a fully sold ask
     */
    async triggerPayout(
        askId: string
    ): Promise<SellerPayout.TTriggerPayoutResponse> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_SELLER_PAYOUT}/${askId}/${SELLER_KEYS.TRIGGER}`
            )
        );
    }

    /**
     * Get Ask Details
     * Optional check to verify ask status and release acknowledgment flags
     */
    async getAskDetails(askId: string): Promise<SellerPayout.TAskDetails> {
        return handleRequest(
            axiosInstance.get(`/market-operations/asks/${askId}`)
        );
    }

    /**
     * Get All Seller Payouts
     * Get a list of all payouts for the authenticated seller
     */
    async getAllPayouts(
        params?: SellerPayout.TGetAllPayoutsParams
    ): Promise<SellerPayout.TGetAllPayoutsResponse> {
        return handleRequest(axiosInstance.get(PATH_SELLER_PAYOUT, { params }));
    }

    /**
     * Get Payout History
     * Get detailed history of a specific payout
     */
    async getPayoutHistory(
        payoutId: string
    ): Promise<SellerPayout.TPayoutHistory> {
        return handleRequest(
            axiosInstance.get(`${PATH_SELLER_PAYOUT}/${payoutId}/history`)
        );
    }

    /**
     * Validate Payout Eligibility
     * Check if an ask is eligible for payout triggering
     */
    async validatePayoutEligibility(
        askId: string
    ): Promise<SellerPayout.TPayoutEligibilityValidation> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_SELLER_PAYOUT}/${askId}/validate-eligibility`
            )
        );
    }

    /**
     * Get Payout Statistics
     * Get overall payout statistics for the authenticated seller
     */
    async getPayoutStatistics(): Promise<SellerPayout.TPayoutStatistics> {
        return handleRequest(
            axiosInstance.get(`${PATH_SELLER_PAYOUT}/statistics`)
        );
    }
}

export const sellerPayoutService = new SellerPayoutService();
export default sellerPayoutService;
