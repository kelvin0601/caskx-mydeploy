import axiosInstance from "@/config/axios";
import {
    CHECKOUT_PAYMENT_METHOD,
    CHECKOUT_STEP,
    CHECKOUT_DOCUMENT_TYPE,
} from "@/enum/checkout";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import {
    PATH_ADMIN,
    PATH_CHECKOUT,
    PATH_SINGLE_TRANSACTION,
} from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";
import { checkout } from "@/types/checkout";
import { CheckoutServerAction } from "./server-action/checkout";
import { TransactionInvoiceType } from "@/modules/_checkout/table-info-transaction";

class CheckoutServices extends CheckoutServerAction {
    constructor() {
        super();
    }
    createSession(
        data: checkout.TCreateSession
    ): Promise<checkout.TTransactionStatus> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.CREATE_SESSION}`,
                data
            )
        );
    }
    // GET /api/checkout/session/{sessionId}/status
    getStatusSession(sessionId: string): Promise<checkout.TTransactionStatus> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.GET_STATUS_SESSION}/${sessionId}`
            )
        );
    }

    createDepositSecret(checkoutSessionId: string) {
        return handleRequest<{
            paymentIntentId: string;
            clientSecret: string;
            amount: number;
        }>(
            axiosInstance.post(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.CREATE_DEPOSIT_SECRET}`,
                {
                    checkoutSessionId,
                }
            )
        );
    }
    confirmDepositPayment(paymentIntentId: string) {
        return handleRequest<{
            success: boolean;
            nextStep: Omit<checkout.TStep, "deposit_payment">;
            sessionId: string;
        }>(
            axiosInstance.post(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.CONFIRM_DEPOSIT_PAYMENT}/${paymentIntentId}`
            )
        );
    }
    signAgreement({
        checkoutSessionId,
        signature,
        agreementAccepted,
    }: {
        checkoutSessionId: string;
        signature: string;
        agreementAccepted: boolean;
    }) {
        return handleRequest<{
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
        }>(
            axiosInstance.post(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.SIGN_AGREEMENT}`,
                {
                    checkoutSessionId,
                    signature,
                    agreementAccepted,
                }
            )
        );
    }
    // Buyer agree
    regenerateAgreement(checkoutSessionId: string) {
        return handleRequest(
            axiosInstance.post<{
                status: string;
                signingUrl: string;
                envelopeId: string;
            }>(`${PATH_CHECKOUT}/${CHECKOUT_KEYS.REGENERATE_AGREEMENT}`, {
                checkoutSessionId,
            })
        );
    }
    createInvoiceSecret(
        checkoutSessionId: string,
        method?: CHECKOUT_PAYMENT_METHOD
    ) {
        return handleRequest<{
            paymentIntentId: string;
            success: boolean;
            clientSecret: string;
        }>(
            axiosInstance.post(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.CREATE_INVOICE_SECRET}`,
                {
                    checkoutSessionId,
                    paymentMethod: method ?? CHECKOUT_PAYMENT_METHOD.STRIPE,
                }
            )
        );
    }

    confirmInvoicePayment(paymentIntentId: string) {
        return handleRequest<{
            success: boolean;
            nextStep: Omit<checkout.TStep, "deposit_payment">;
            sessionId: string;
        }>(
            axiosInstance.post(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.CONFIRM_INVOICE_PAYMENT}/${paymentIntentId}`
            )
        );
    }
    completeTransfer(sessionId: string) {
        return handleRequest(
            axiosInstance.post(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.COMPLETE_TRANSFER}/${sessionId}`
            )
        );
    }

    /**
     * POST /api/checkout/admin/manual-payment/{sessionId}/approve
     * Admin approve manual payment evidence
     * Marks manual transfer as approved, sets invoice paid, and moves to ownership transfer
     */
    approveManualPayment(sessionId: string) {
        return handleRequest<{
            success: boolean;
            nextStep: string;
        }>(
            axiosInstance.post(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.ADMIN_MANUAL_PAYMENT}/${sessionId}/${CHECKOUT_KEYS.ADMIN_MANUAL_PAYMENT_APPROVE}`
            )
        );
    }

    /**
     * POST /api/checkout/admin/manual-payment/{sessionId}/reject
     * Marks manual transfer evidence as rejected with optional reason
     */
    rejectManualPayment(sessionId: string, reason?: string) {
        return handleRequest(
            axiosInstance.post(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.ADMIN_MANUAL_PAYMENT}/${sessionId}/${CHECKOUT_KEYS.ADMIN_MANUAL_PAYMENT_REJECT}`,
                { reason }
            )
        );
    }

    getAdminCheckoutSessions(
        params?: checkout.TAdminCheckoutSessionListParams
    ) {
        return handleRequest<checkout.TAdminCheckoutSessionListResponse>(
            axiosInstance.get(
                `${PATH_ADMIN}/${CHECKOUT_KEYS.GET_ADMIN_SESSIONS}`,
                {
                    params,
                }
            )
        );
    }

    getAdminCheckoutSessionDetail(
        id: string
    ): Promise<checkout.TAdminCheckoutSessionDetail> {
        return handleRequest<checkout.TAdminCheckoutSessionDetail>(
            axiosInstance.get(
                `${PATH_ADMIN}/${CHECKOUT_KEYS.GET_ADMIN_SESSIONS}/${id}`
            )
        );
    }
    /**
     * GET /api/checkout/session/:sessionId/invoice-receipt?doc=invoice|receipt&type=deposit|final
     */
    getInvoiceDownloadUrl(
        checkoutSessionId: string,
        type: TransactionInvoiceType,
        doc: "invoice" | "receipt" = "invoice"
    ): Promise<{
        downloadUrl: string;
    }> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.GET_STATUS_SESSION}/${checkoutSessionId}/${CHECKOUT_KEYS.INVOICE_RECEIPT}?doc=${doc}&type=${type}`
            )
        );
    }
    getPaymentProofDownloadUrl(checkoutSessionId: string) {
        return handleRequest(
            axiosInstance.get(
                `${PATH_SINGLE_TRANSACTION}/${CHECKOUT_KEYS.GET_ADMIN_SESSIONS}/${checkoutSessionId}/${CHECKOUT_KEYS.GET_PAYMENT_PROOF_DOWNLOAD_URL}`
            )
        );
    }
    getCheckoutSessionDocuments(sessionId: string): Promise<{
        success: boolean;
        sessionId: string;
        documents: Array<{
            id?: string;
            name?: string;
            label?: string;
            type: CHECKOUT_DOCUMENT_TYPE;
            url?: string;
            downloadUrl?: string;
            createdAt?: string;
            updatedAt?: string;
            signedAt?: string;
            generatedAt?: string;
            envelopeId?: string;
            source?: string;
            agreementType?: string;
            status?: string;
        }>;
    }> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_SINGLE_TRANSACTION}/checkout-sessions/${sessionId}/documents`
            )
        );
    }
    /**
     *  POST /api/checkout/manual-payment-evidence
     */
    uploadManualPaymentEvidence(
        checkoutSessionId: string,
        file: File | Blob,
        notes?: string
    ) {
        const formData = new FormData();
        formData.append("checkoutSessionId", checkoutSessionId);
        formData.append("sessionId", checkoutSessionId);
        if (notes) {
            formData.append("notes", notes);
        }
        formData.append("file", file);

        return handleRequest(
            axiosInstance.post(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.UPLOAD_MANUAL_PAYMENT_EVIDENCE}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
        );
    }

    /**
     *  POST /api/checkout/manual-payment-evidence/resubmit
     *  Resubmit manual payment evidence after rejection
     */
    resubmitManualPaymentEvidence(
        checkoutSessionId: string,
        file: File | Blob,
        notes?: string
    ) {
        const formData = new FormData();
        formData.append("checkoutSessionId", checkoutSessionId);
        formData.append("sessionId", checkoutSessionId);
        if (notes) {
            formData.append("notes", notes);
        }
        formData.append("file", file);

        return handleRequest(
            axiosInstance.post(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.RESUBMIT_MANUAL_PAYMENT_EVIDENCE}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
        );
    }
    //POST /api/admin/checkout-sessions/:sessionId/ownership-transfer
    adminTransferOwnership(sessionId: string, files: File) {
        const formData = new FormData();
        formData.append("file", files);
        return handleRequest(
            axiosInstance.post(
                `${PATH_ADMIN}/${CHECKOUT_KEYS.GET_ADMIN_SESSIONS}/${sessionId}/${CHECKOUT_KEYS.ADMIN_TRANSFER_OWNERSHIP}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
        );
    }
    //GET /api/checkout/session/{sessionId}/ownership-transfer-document
    getOwnershipTransferDocument(
        sessionId: string
    ): Promise<checkout.TOwnershipTransferDocument> {
        return handleRequest<checkout.TOwnershipTransferDocument>(
            axiosInstance.get(
                `${PATH_CHECKOUT}/${CHECKOUT_KEYS.GET_STATUS_SESSION}/${sessionId}/${CHECKOUT_KEYS.OWNERSHIP_TRANSFER_DOCUMENT}`
            )
        );
    }

    /**
     * POST /api/admin/checkout-sessions/transactions/{transactionId}/seller-agreement/approve
     * Approve seller agreement for a direct transaction
     */
    approveSellerAgreement(transactionId: string) {
        return handleRequest<{
            success: boolean;
            status: string;
        }>(
            axiosInstance.post(
                `${PATH_ADMIN}/${CHECKOUT_KEYS.GET_ADMIN_SESSIONS}/transactions/${transactionId}/${CHECKOUT_KEYS.SELLER_AGREEMENT_APPROVE}`
            )
        );
    }

    /**
     * POST /api/admin/checkout-sessions/transactions/{transactionId}/seller-agreement/reject
     * Reject seller agreement for a direct transaction
     */
    rejectSellerAgreement(transactionId: string, reason?: string) {
        return handleRequest<{
            success: boolean;
            status: string;
        }>(
            axiosInstance.post(
                `${PATH_ADMIN}/${CHECKOUT_KEYS.GET_ADMIN_SESSIONS}/transactions/${transactionId}/${CHECKOUT_KEYS.SELLER_AGREEMENT_REJECT}`,
                { reason }
            )
        );
    }

    /**
     * POST /api/admin/checkout-sessions/transactions/{transactionId}/buyer-agreement/approve
     * Approve buyer agreements for a direct checkout session
     */
    approveBuyerAgreement(transactionId: string) {
        return handleRequest<{
            success: boolean;
            nextStep: string;
        }>(
            axiosInstance.post(
                `${PATH_ADMIN}/${CHECKOUT_KEYS.GET_ADMIN_SESSIONS}/transactions/${transactionId}/${CHECKOUT_KEYS.BUYER_AGREEMENT_APPROVE}`
            )
        );
    }

    /**
     * POST /api/admin/checkout-sessions/transactions/{transactionId}/buyer-agreement/reject
     * Reject buyer agreements for a direct checkout session
     */
    rejectBuyerAgreement(transactionId: string, reason: string) {
        return handleRequest<{
            success: boolean;
            status: string;
        }>(
            axiosInstance.post(
                `${PATH_ADMIN}/${CHECKOUT_KEYS.GET_ADMIN_SESSIONS}/transactions/${transactionId}/${CHECKOUT_KEYS.BUYER_AGREEMENT_REJECT}`,
                { reason }
            )
        );
    }

    /**
     * POST /api/admin/checkout-sessions/{id}/buyer-agreement/request-update
     * Request update for buyer agreement (e.g. note to seller)
     */
    requestUpdateBuyerAgreement(
        id: string,
        reason: string,
        transactionIds?: string[]
    ) {
        return handleRequest<{
            success: boolean;
            status?: string;
        }>(
            axiosInstance.post(
                `${PATH_ADMIN}/${CHECKOUT_KEYS.GET_ADMIN_SESSIONS}/${id}/${CHECKOUT_KEYS.BUYER_AGREEMENT_REQUEST_UPDATE}`,
                {
                    reason,
                    transactionIds: transactionIds,
                }
            )
        );
    }

    /**
     * POST /api/admin/checkout-sessions/{id}/seller-agreement/request-update
     * Request update for seller agreement (e.g. note to buyer)
     */
    requestUpdateSellerAgreement(transactionId: string, reason: string) {
        return handleRequest<{
            success: boolean;
            status?: string;
        }>(
            axiosInstance.post(
                `${PATH_ADMIN}/${CHECKOUT_KEYS.GET_ADMIN_SESSIONS}${PATH_SINGLE_TRANSACTION}/${transactionId}/${CHECKOUT_KEYS.SELLER_AGREEMENT_REQUEST_UPDATE}`,
                { reason }
            )
        );
    }
}

export const checkoutServices = new CheckoutServices();
