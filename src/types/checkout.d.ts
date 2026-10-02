import {
    CHECKOUT_PAYMENT_METHOD,
    CHECKOUT_STATUS,
    CHECKOUT_STEP,
} from "@/enum/checkout";
import { cask } from "./cask";
import { transaction } from "./transaction";
import { docusign } from "./docusign";
import { EDocuSignStatus } from "@/enum/docusign";

declare namespace checkout {
    type TStatusCheckout = CHECKOUT_STATUS;
    type TStep = CHECKOUT_STEP | PAYOUT_STEP;
    type TCreateSession = {
        caskId: string;
        totalAmount: number;
        discountAmount?: number;
    };

    type TTransactionStatus = {
        id: string;
        currentStep: TStep;
        status: TStatusCheckout;
        paymentMethod?: CHECKOUT_PAYMENT_METHOD | string | null;
        manualPaymentStatus: string;
        totalAmount: number | string;
        originalAmount: number;
        processingFeeAmount?: number;
        depositAmount: number | string;
        remainingAmount: number | string;
        processingFeePercent?: number;
        expiryDate: string;
        cask: cask.TCask;
        quantity: number;
        transactions: transaction.TTransaction[];
        manualPaymentEvidenceUrl: string | null;
        manualPaymentNotes: string | null;
        manualPaymentRejectionReason?: string | null;
        manualPaymentReviewedAt: string | null;
        manualPaymentReviewerId: string | null;
        ownershipTransferDocumentUrl: string | null;
        ownershipTransferDocumentUploadedAt: string | null;
        ownershipTransferNotes: string | null;
        buyerDocuSignStatus: EDocuSignStatus;
        buyerDocuSignEnvelopeId?: string;
        buyerDocuSignAdminSignedAt?: string;
        paymentDetails?: {
            amount?: string;
            clientSecret?: string;
            depositPaymentIntentId?: string;
            invoicePaymentIntentId?: string;
            depositConfirmedAt?: string;
            invoiceConfirmedAt?: string;
            depositConfirmationEmailSentAt?: string;
            associatedTransactionIds?: string[];
            manualPaymentStatus?: string | null;
            manualPaymentRejectionReason?: string | null;
            manualTransferRequested?: boolean;
            manualTransferRequestedAt?: string | null;
            paymentNotifiedAt?: string | null;
        } | null;
    };

    // Params for admin checkout sessions list
    export type TAdminCheckoutSessionListParams = {
        page?: number;
        size?: number;
        status?: TStatusCheckout;
        currentStep?: CHECKOUT_STEP;
        buyerId?: string;
        caskId?: string;
    };

    export type TCheckoutSession = {
        id: string;
        buyerId: string;
        caskId: string;
        transactions: Array<transaction.TTransaction>;
        totalAmount: number;
        depositAmount: number;
        remainingAmount: number;
        discountAmount: string | number;
        quantity: number;
        status: string;
        currentStep: string;
        paymentMethod: CHECKOUT_PAYMENT_METHOD | null;
        stripePaymentIntentId: string | null;
        stripeInvoicePaymentIntentId: string | null;
        depositPaidAt: string | null;
        agreementSignedAt: string | null;
        invoiceSubmittedAt: string | null;
        invoicePaidAt: string | null;
        ownershipTransferredAt: string | null;
        expiryDate: string;
        agreementDetails: unknown;
        paymentDetails: unknown;
        certificateUrl: string | null;
        matchedBids: unknown;
        notes: string | null;
        createdAt: string;
        updatedAt: string;
    };

    // Admin checkout session list (GET /api/admin/checkout-sessions)
    export type TAdminCheckoutSessionListItem = {
        id: string;
        buyerId: string;
        buyer: {
            id: string;
            firstName: string;
            lastName: string;
            fullName: string;
            email: string;
            phoneNumber: string;
        };
        caskId: string;
        transactions: Array<{
            id: string;
            checkoutSessionId: string;
            caskId: string;
            sellerId: string;
            buyerId: string;
            transactionPrice: number;
            currency: string;
            quantity: number;
            totalAmount: number;
            transactionType: string;
            bidId: string | null;
            askId: string | null;
            sellerAgreementStatus: string;
            sellerAgreementSignatureDueAt: string;
            sellerAgreementSignedAt: string | null;
            sellerAgreementExpiredAt: string | null;
            sellerAgreementDocuSignEnvelopeId: string | null;
            sellerAgreementReleaseFormUrl: string | null;
            payoutStatus: string;
            payoutReadyAt: string | null;
            payoutProcessedAt: string | null;
            payoutReference: string | null;
            payoutMetadata: unknown;
            seller: {
                id: string;
                firstName: string;
                lastName: string;
                fullName: string;
                email: string;
                phoneNumber: string;
            };
            buyer: {
                id: string;
                firstName: string;
                lastName: string;
                fullName: string;
                email: string;
                phoneNumber: string;
            };
            createdAt: string;
            updatedAt: string;
        }>;
        totalAmount: number;
        depositAmount: number;
        remainingAmount: number;
        discountAmount: number;
        quantity: number;
        matchedBids: unknown;
        sellers: Array<{
            id: string;
            firstName: string;
            lastName: string;
            fullName: string;
            email: string;
            phoneNumber: string;
        }>;
        status: TStatusCheckout;
        currentStep: string;
        paymentMethod: CHECKOUT_PAYMENT_METHOD | null;
        stripePaymentIntentId: string | null;
        stripeInvoicePaymentIntentId: string | null;
        depositPaidAt: string | null;
        agreementSignedAt: string | null;
        invoiceSubmittedAt: string | null;
        invoicePaidAt: string | null;
        ownershipTransferredAt: string | null;
        expiryDate: string;
        paymentDetails: {
            amount?: string;
            clientSecret?: string;
            depositPaymentIntentId?: string;
            invoicePaymentIntentId?: string;
            depositConfirmedAt?: string;
            invoiceConfirmedAt?: string;
            depositConfirmationEmailSentAt?: string;
            associatedTransactionIds?: string[];
            manualPaymentStatus?: string | null;
            manualPaymentRejectionReason?: string | null;
            manualTransferRequested?: boolean;
            manualTransferRequestedAt?: string | null;
            paymentNotifiedAt?: string | null;
        } | null;
        certificateUrl: string | null;
        ownershipTransferDocumentUrl: string | null;
        ownershipTransferDocumentUploadedAt: string | null;
        ownershipTransferNotes: string | null;
        ownershipTransferCompletedById: string | null;
        notes: string | null;
        createdAt: string;
        updatedAt: string;
    };

    export type TAdminCheckoutSessionListResponse = {
        data: TAdminCheckoutSessionListItem[];
        totalRecords: number;
        page: number;
        size: number;
        totalPages: number;
    };

    export type TAdminCheckoutSessionDetail = {
        id: string;
        buyerId: string;
        buyer: {
            id: string;
            firstName: string;
            lastName: string;
            fullName: string;
            email: string;
            phoneNumber: string;
        };
        caskId: string;
        transactions: transaction.TTransaction[];
        totalAmount: number;
        originalAmount: number;
        feeAmount: number;
        processingFeePercent: number;
        processingFeeAmount: number;
        depositAmount: number;
        remainingAmount: number;
        discountAmount: number;
        quantity: number;
        matchedBids: unknown;
        sellers: Array<{
            id: string;
            firstName: string;
            lastName: string;
            fullName: string;
            email: string;
            phoneNumber: string;
        }>;
        status: TStatusCheckout;
        agreementType: "direct" | "indirect";
        currentStep: string;
        paymentMethod: CHECKOUT_PAYMENT_METHOD | null;
        manualPaymentEvidenceUrl: string | null;
        manualPaymentStatus?: string | null;
        manualPaymentRejectionReason?: string | null;
        stripePaymentIntentId: string | null;
        stripeInvoicePaymentIntentId: string | null;
        depositPaidAt: string | null;
        agreementSignedAt: string | null;
        buyerDocuSignEnvelopeId: string | null;
        buyerDocuSignStatus: EDocuSignStatus;
        buyerDocuSignSignedAt: string | null;
        buyerDocuSignAdminSignedAt: string | null;
        buyerDocuSignAdminSignerId: string | null;
        buyerDocuSignAdminRejectedAt: string | null;
        buyerDocuSignAdminRejectionReason: string | null;
        buyerDocuSignRejectedAt: string | null;
        invoiceSubmittedAt: string | null;
        invoicePaidAt: string | null;
        ownershipTransferredAt: string | null;
        expiryDate: string;
        paymentDetails: {
            amount?: string;
            clientSecret?: string;
            depositConfirmedAt?: string;
            invoiceConfirmedAt?: string;
            depositPaymentIntentId?: string;
            invoicePaymentIntentId?: string;
            depositConfirmationEmailSentAt?: string;
            associatedTransactionIds?: string[];
            manualPaymentStatus?: string | null;
            manualPaymentRejectionReason?: string | null;
            manualTransferRequested?: boolean;
            manualTransferRequestedAt?: string | null;
            paymentNotifiedAt?: string | null;
        } | null;
        ownershipTransferDocumentUrl: string | null;
        ownershipTransferDocumentUploadedAt: string | null;
        ownershipTransferNotes: string | null;
        ownershipTransferCompletedById: string | null;
        notes: string | null;
        createdAt: string;
        updatedAt: string;
    };

    // Ownership transfer document response
    export type TOwnershipTransferDocument = {
        sessionId: string;
        status: string;
        documentUploadedAt: string;
        documentUrl: string;
        downloadUrl: string;
        ownershipTransferNotes: string | null;
        ownershipTransferredAt: string;
    };

    export type TSignAgreementResponse = {
        success: boolean;
        nextStep: string;
        envelopeId?: string;
        signingUrl?: string;
        agreements?: Array<{
            transactionId: string;
            envelopeId: string;
            signingUrl: string;
            status: string;
        }>;
        completed: boolean;
    };
}
