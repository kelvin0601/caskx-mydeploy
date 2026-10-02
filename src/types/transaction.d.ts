import { cask } from "./cask";

declare namespace transaction {
    type TTransaction = {
        status: ETransactionStatus;
        id: string;
        bid: {
            id: string;
            caskId: string;
            bidderId: string;
            bidPrice: number;
            currency: string;
            quantity: number;
            remainingQuantity: number;
            executionPolicy: string;
            status: ETransactionStatus;
        };
        ask: {
            id: string;
            caskId: string;
            sellerId: string;
            askPrice: number;
            currency: string;
            quantity: number;
            remainingQuantity: number;
            executionPolicy: string;
            status: ETransactionStatus;
        };
        caskTransactionId: string;
        checkoutSessionId: string;
        caskId: string;
        agreementType: "direct" | "indirect";
        sellerId: string;
        buyerId: string;
        transactionPrice: number | string;
        currency: string;
        transactionId: string;
        askId: string;
        bidId: string;
        totalAmount: number | string;
        netPayoutAmount: number;
        transactionType: string;
        sellerAgreementStatus: docusign.TSellerAgreementLinkResponse["status"];
        sellerAgreementSignatureDueAt: string | null;
        sellerAgreementSignatureDate: string | null;
        sellerAgreementSignedAt: string | null;
        sellerAgreementAdminSignedAt: string | null;
        sellerAgreementAdminSignerId: string | null;
        sellerAgreementAdminRejectedAt: string | null;
        sellerAgreementAdminRejectionReason: string | null;
        sellerAgreementRejectedAt: string | null;
        sellerAgreementExpiredAt: string | null;
        sellerAgreementDocuSignEnvelopeId: string | null;
        sellerAgreementReleaseFormUrl: string | null;
        buyerAgreementSignatureDueAt: string | null;
        buyerAgreementSignedAt: string | null;
        buyerDocuSignEnvelopeId: string | null;
        buyerAgreementDocuSignEnvelopeId?: string | null;
        buyerAgreementStatus: string | null;
        buyerAgreementAdminSignedAt?: string | null;
        buyerAgreementAdminRejectedAt?: string | null;
        buyerAgreementAdminRejectionReason?: string | null;
        buyerAgreementRejectedAt: string | null;
        buyerAgreementExpiredAt: string | null;
        payoutStatus: string;
        payoutReadyAt: string | null;
        payoutProcessedAt: string | null;
        payoutReference: string | null;
        payoutMetadata: unknown;
        seller?: auth.TUserInfo;
        buyer?: auth.TUserInfo;
        createdAt: string;
        updatedAt: string;
        quantity: number;
    };
    type TBidSummary = {
        id: string;
        caskId: string;
        bidderId: string;
        bidPrice: number;
        currency: string;
        quantity: number;
        remainingQuantity: number;
        executionPolicy: string;
        status: string;
        expirationDate: string;
        createdAt: string;
        updatedAt: string;
    };

    type TAskSummary = {
        cask: cask.TCask;
        id: string;
        caskId: string;
        sellerId: string;
        askPrice: number;
        currency: string;
        quantity: number;
        remainingQuantity: number;
        executionPolicy: string;
        status: string;
        expirationDate: string;
        createdAt: string;
        updatedAt: string;
    };

    export type TTransactionDetailResponse = {
        id: string;
        caskId: string;
        cask: cask.TCask;
        sellerId: string;
        seller: auth.TUserInfo;
        buyerId: string;
        buyer: auth.TUserInfo;
        transactionPrice: number | string;
        currency: string;
        transactionType: string;
        quantity?: number;
        totalAmount?: number | string;
        bidId: string;
        bid: TBidSummary;
        askId: string;
        ask: TAskSummary;
        currentStep?: string;
        status?: string;
        createdAt: string;
        updatedAt: string;
    };

    export type TTransactionDetail = TTransaction & {
        seller: auth.TUserInfo;
        buyer: auth.TUserInfo;
    };

    export type TTransactionListResponse = {
        transactions: TTransaction[];
        total: number;
        page?: number;
        limit?: number;
    };

    export type TCheckoutSessionDocumentSource =
        | "s3"
        | "docusign"
        | (string & {});
    export type TCheckoutSessionDocumentType =
        | "deposit_receipt"
        | "final_receipt"
        | "seller_agreement"
        | "ownership_transfer"
        | (string & {});

    type TCheckoutSessionDocumentBase = {
        type: TCheckoutSessionDocumentType;
        label: string;
        source: TCheckoutSessionDocumentSource;
        downloadUrl: string;
    };

    export type TCheckoutSessionS3Document = TCheckoutSessionDocumentBase & {
        source: "s3";
        url: string;
        generatedAt: string;
    };

    export type TCheckoutSessionDocuSignDocument =
        TCheckoutSessionDocumentBase & {
            source: "docusign";
            envelopeId: string;
            transactionId: string;
            agreementType: "direct" | "indirect";
            status: string;
            signedAt: string | null;
        };

    export type TCheckoutSessionDocument =
        | TCheckoutSessionS3Document
        | TCheckoutSessionDocuSignDocument;

    export type TCheckoutSessionDocumentsResponse = {
        success: boolean;
        sessionId: string;
        documents: TCheckoutSessionDocument[];
    };
}
