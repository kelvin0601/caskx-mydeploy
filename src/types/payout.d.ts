import { AdminPayoutStatus } from "@/enum/payout";
import type { cask } from "./cask";
import type { caskAsk } from "./cask-ask";
import type { transaction } from "./transaction";
import { auth } from "./auth";

declare namespace payout {
    type TPayoutTransaction = transaction.TTransaction & {
        cask: cask.TCask;
        bid: transaction.TBidSummary;
        ask: caskAsk.TCaskOrder;
        quantity: number;
        netPayoutAmount?: number;
    };

    export type TAskTransactionPayoutResponse = {
        success?: boolean;
        message?: string;
        totalUnpaid: number;
        totalPaid: number;
        processingFeeRate: number;
        estimatedSellerPayout: number;
        totalPaidSeller: number;
        currentSellerPayout: number;
        unpaidSellerPayout: number;
        ask: caskAsk.TCaskOrder & {
            remainingQuantity?: number;
            cask: cask.TCask;
        };
        transactions: TPayoutTransaction[];
        sellerPaymentInformation?: TSellerPaymentInformation | null;
    };

    // Admin Settlements Types
    export type TAdminPayoutStatus = AdminPayoutStatus | string;

    export type TAdminSettlementSeller = {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        fullName: string;
        phoneNumber: string;
    };

    export type TAdminSettlementReferences = {
        checkoutSessionId: string;
        bidId: string;
        askId: string;
    };

    export type TAdminSettlement = {
        id: string;
        caskId: string;
        sellerId: string;
        seller: TAdminSettlementSeller;
        references: TAdminSettlementReferences;
        quantity: number;
        unitPrice: number;
        totalAmount: number;
        currency: string;
        payoutStatus: TAdminPayoutStatus;
        payoutReadyAt: string | null;
        payoutProcessedAt: string | null;
        payoutReference: string | null;
        payoutMetadata: Record<string, unknown> | null;
        createdAt: string;
        updatedAt: string;
    };

    // Seller payment metadata from Stripe
    export type TSellerPaymentRequirements = {
        currentlyDue: string[];
        eventuallyDue: string[];
        pastDue: string[];
        pendingVerification: string[];
    };

    export type TSellerBankAccount = {
        id: string;
        bankName: string;
        last4: string;
        currency: string;
        status: string;
        defaultForCurrency: boolean;
    };

    export type TSellerPaymentInformation = {
        stripeAccountId: string;
        hasStripeAccount: boolean;
        onboardingComplete: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        requirements: TSellerPaymentRequirements;
        bankAccounts: TSellerBankAccount[];
    };

    // Detailed settlement response (admin settlement detail)
    export type TAdminSettlementDetail = TAdminSettlement & {
        buyerId: string;
        buyer: TAdminSettlementSeller;
        transactions: Array<transaction.TTransaction>;
        totalAmount: number;
        depositAmount: number;
        remainingAmount: number;
        discountAmount: number;
        matchedBids: unknown | null;
        sellers: Array<
            Omit<
                auth.TUserInfo,
                "id" | "accessToken" | "refreshToken" | "tempToken"
            >
        >;
        status: string;
        currentStep: string;
        paymentMethod: string | null;
        agreementType: string | null;
        sellerAgreementStatus: string;
        sellerAgreementSignatureDueAt: string | null;
        sellerAgreementSignedAt: string | null;
        sellerAgreementAdminSignedAt: string | null;
        sellerAgreementAdminSignerId: string | null;
        sellerAgreementAdminRejectedAt: string | null;
        sellerAgreementAdminRejectionReason: string | null;
        sellerAgreementRejectedAt: string | null;
        sellerAgreementExpiredAt: string | null;
        sellerAgreementDocuSignEnvelopeId: string | null;
        sellerAgreementReleaseFormUrl: string | null;
        manualPaymentEvidenceUrl: string | null;
        stripePaymentIntentId: string | null;
        stripeInvoicePaymentIntentId: string | null;
        depositPaidAt: string | null;
        agreementSignedAt: string | null;
        invoiceSubmittedAt: string | null;
        invoicePaidAt: string | null;
        ownershipTransferredAt: string | null;
        expiryDate: string | null;
        paymentDetails?: {
            amount?: string;
            clientSecret?: string;
            paymentNotifiedAt?: string;
            depositConfirmedAt?: string;
            depositPaymentIntentId?: string;
            invoicePaymentIntentId?: string;
            manualTransferRequested?: boolean;
            manualTransferRequestedAt?: string;
            depositConfirmationEmailSentAt?: string;
        };
        ownershipTransferDocumentUrl: string | null;
        ownershipTransferDocumentUploadedAt: string | null;
        ownershipTransferNotes: string | null;
        ownershipTransferCompletedById: string | null;
        notes: string | null;
        sellerPaymentInformation?: TSellerPaymentInformation | null;
        netPayoutAmount: number;
        currency: string;
        payoutStatus: string;
        payoutReadyAt: string | null;
        payoutProcessedAt: string | null;
        payoutReference: string | null;
        payoutMetadata: unknown | null;
    };

    export type TGetAdminSettlementsResponse = {
        data: TAdminSettlement[];
        totalRecords: number;
        page: number;
        size: number;
        totalPages: number;
        statusCounts: Record<string, number>;
    };

    export type TGetAdminSettlementsParams = {
        page?: number;
        size?: number;
        status?: TAdminPayoutStatus | string;
        /** Match seller email (partial, case-insensitive) */
        sellerEmail?: string;
        /** Filter by seller user id */
        sellerId?: string;
        /** Filter by transaction id (exact match) */
        transactionId?: string;
        /** Minimum total amount for settlement filter */
        minAmount?: number;
        /** Maximum total amount for settlement filter */
        maxAmount?: number;
        /** ISO date-time string: created after or equal */
        dateFrom?: string;
        /** ISO date-time string: created before or equal */
        dateTo?: string;
    };

    export type TUpdateAdminSettlementRequest = {
        payoutStatus?: TAdminPayoutStatus;
        payoutReference?: string;
        payoutReadyAt?: string;
        payoutProcessedAt?: string;
        payoutMetadata?: Record<string, unknown>;
    };
}

export { payout };
