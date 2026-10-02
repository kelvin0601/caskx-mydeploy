// Seller Payout Types
export declare namespace SellerPayout {
    // ==================== Core Payout Types ====================

    export type TPayoutStatus =
        | "ready"
        | "pending"
        | "processing"
        | "completed"
        | "failed";
    export type TCaseType = "none_sold" | "partially_sold" | "fully_sold";
    export type TExecutionPolicy = "partial_allowed" | "fill_or_kill";

    // ==================== Acknowledge Release Types ====================

    export type TAcknowledgeReleaseRequest = {
        acknowledged: boolean;
        note?: string;
        metadata?: Record<string, unknown>;
    };

    export type TAcknowledgeReleaseResponse = {
        success: boolean;
        updatedStatus: string;
        message?: string;
    };

    export type TAgreementStatus =
        | "failed"
        | EDocuSignStatus.SELLER_SIGNED
        | "paid"
        | "awaiting_signature"
        | "processing";
    export type TSettlementType = "direct";
    export type TPayoutMethodType = "stripe_transfer";
    export type TSummaryPayoutStatus = "awaiting_signature" | "paid";

    export type TPayoutAgreement = {
        id: string;
        buyerId: string;
        quantity: number;
        grossAmount: number;
        feeAmount: number;
        netAmount: number;
        status: TAgreementStatus;
        settlementType: TSettlementType;
        paidAt?: string;
        signatureDueAt?: string;
        releaseFormUrl?: string;
    };

    export type TPayoutSummary = {
        caseType: TCaseType;
        message: string;
        caskName: string;
        fulfilledQuantity: number;
        totalQuantity: number;
        expirationDate: string;
        askPrice: number;
        totalListingValue: number;
        currentListingValue: number;
        totalUnpaid: number;
        totalPaid: number;
        payoutMethod: TPayoutMethodType;
        payoutStatus: TSummaryPayoutStatus;
        signatureDueAt?: string;
        settlementType: TSettlementType;
        agreements: TPayoutAgreement[];
    };

    // ==================== Trigger Payout Types ====================

    export type TTriggerPayoutResponse = {
        id: string;
        askId: string;
        status: TPayoutStatus;
        totalExpectedAmount: number;
        totalPaidAmount: number;
        totalUnpaidAmount: number;
        currency: string;
        readyAt: string;
        completedAt?: string;
        failedAt?: string;
        failureReason?: string;
        metadata?: Record<string, unknown>;
    };

    // ==================== Ask Details Types ====================

    export type TAskStatus =
        | "pending"
        | "active"
        | "partially_filled"
        | "filled"
        | "cancelled";

    export type TAskDetails = {
        id: string;
        caskId: string;
        askPrice: number;
        quantity: number;
        remainingQuantity: number;
        status: TAskStatus;
        releaseAcknowledged: boolean;
        releaseAcknowledgedAt?: string;
        payoutCompletedAt?: string;
        createdAt: string;
        updatedAt: string;
        executionPolicy: TExecutionPolicy;
        sellNow: boolean;
    };

    // ==================== Payout List Types ====================

    export type TPayoutListItem = {
        id: string;
        askId: string;
        status: string;
        totalExpectedAmount: number;
        totalPaidAmount: number;
        totalUnpaidAmount: number;
        currency: string;
        readyAt: string;
        completedAt?: string;
        createdAt: string;
    };

    export type TGetAllPayoutsParams = {
        status?: TPayoutStatus;
        limit?: number;
        offset?: number;
        sortBy?: "createdAt" | "readyAt" | "completedAt";
        sortOrder?: "asc" | "desc";
    };

    export type TGetAllPayoutsResponse = {
        payouts: TPayoutListItem[];
        total: number;
        limit: number;
        offset: number;
    };

    // ==================== Payout History Types ====================

    export type TPayoutEvent = {
        timestamp: string;
        event: string;
        details: Record<string, unknown>;
    };

    export type TPayoutTransaction = {
        id: string;
        amount: number;
        type: "sale" | "fee" | "payout";
        timestamp: string;
        status: string;
    };

    export type TPayoutHistory = {
        id: string;
        askId: string;
        status: string;
        totalExpectedAmount: number;
        totalPaidAmount: number;
        totalUnpaidAmount: number;
        currency: string;
        readyAt: string;
        completedAt?: string;
        createdAt: string;
        updatedAt: string;
        events: TPayoutEvent[];
        transactions: TPayoutTransaction[];
    };

    // ==================== Validation Types ====================

    export type TPayoutEligibilityValidation = {
        eligible: boolean;
        reasons: string[];
        warnings: string[];
        recommendations: string[];
    };

    // ==================== Statistics Types ====================

    export type TMonthlyPayoutStats = {
        month: string;
        payoutCount: number;
        totalAmount: number;
    };

    export type TPayoutStatistics = {
        totalPayouts: number;
        totalAmount: number;
        averagePayoutAmount: number;
        pendingPayouts: number;
        completedPayouts: number;
        failedPayouts: number;
        averageProcessingTime: number; // in hours
        monthlyStats: TMonthlyPayoutStats[];
    };

    // ==================== Error Types ====================

    export type TPayoutError = {
        code: string;
        message: string;
        details?: Record<string, unknown>;
        timestamp: string;
    };

    // ==================== Edge Case Types ====================

    export type TPayoutEdgeCase = {
        caseType:
            | "ask_not_fully_sold"
            | "already_acknowledged"
            | "payout_already_triggered"
            | "insufficient_funds";
        message: string;
        suggestedAction: string;
    };
}
