import { CHECKOUT_PAYMENT_METHOD } from "@/enum/checkout";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { PATH_CHECKOUT } from "@/lib/constants/path";
import { checkout } from "@/types/checkout";
import { BaseServerAction } from "./base";

export class CheckoutServerAction extends BaseServerAction {
    constructor() {
        super();
    }
    async getCheckout(id: string) {
        return await this.get(`${CHECKOUT_KEYS.GET_CHECKOUT}/${id}`);
    }
    // GET /api/checkout/session/:sessionId
    async getStatusSessionServer({
        sessionId,
        token,
    }: {
        sessionId: string;
        token: string;
    }): Promise<checkout.TTransactionStatus> {
        const headers = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            next: {
                revalidate: 0,
                cache: "no-store",
            },
        };

        return await this.get(
            `${PATH_CHECKOUT}/${CHECKOUT_KEYS.GET_STATUS_SESSION}/${sessionId}`,
            headers
        );
    }
    async getCheckoutSessionDocumentsServer(sessionId: string): Promise<{
        success: boolean;
        sessionId: string;
        documents: Array<{
            id?: string;
            name?: string;
            label?: string;
            type: import("@/enum/checkout").CHECKOUT_DOCUMENT_TYPE;
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
        return await this.get(
            `transactions/checkout-sessions/${sessionId}/documents`,
            {},
            true
        );
    }
    async createDepositSecretServer(checkoutSessionId: string): Promise<{
        paymentIntentId: string;
        clientSecret: string;
        amount: number;
    }> {
        return await this.post(
            `${PATH_CHECKOUT}/${CHECKOUT_KEYS.CREATE_DEPOSIT_SECRET}`,
            {
                body: JSON.stringify({ checkoutSessionId }),
                headers: {
                    "Content-Type": "application/json",
                },
            },
            false,
            true
        );
    }
    async createInvoiceSecretServer(
        checkoutSessionId: string,
        paymentMethod = CHECKOUT_PAYMENT_METHOD.STRIPE
    ): Promise<{
        paymentIntentId: string;
        success: boolean;
        clientSecret: string;
    }> {
        return await this.post(
            `${PATH_CHECKOUT}/${CHECKOUT_KEYS.CREATE_INVOICE_SECRET}`,
            {
                body: JSON.stringify({
                    checkoutSessionId,
                    paymentMethod,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            },
            false,
            true
        );
    }
    async signAgreementServer({
        checkoutSessionId,
        signature,
        agreementAccepted,
    }: {
        checkoutSessionId: string;
        signature: string;
        agreementAccepted: boolean;
    }): Promise<checkout.TSignAgreementResponse> {
        return await this.post<checkout.TSignAgreementResponse>(
            `${PATH_CHECKOUT}/${CHECKOUT_KEYS.SIGN_AGREEMENT}`,
            {
                body: JSON.stringify({
                    checkoutSessionId,
                    signature,
                    agreementAccepted,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            },
            false,
            true
        );
    }
}

export const checkoutServerAction = new CheckoutServerAction();
