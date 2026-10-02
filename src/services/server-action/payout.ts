import {
    KEY_PAYOUT,
    PATH_PAYOUT,
    PATH_SELLER_PAYOUT,
    PATH_SINGLE_TRANSACTION,
    SELLER_KEYS,
} from "@/lib/constants";
import { BaseServerAction } from "./base";
import { SellerPayout } from "@/types/seller-payout";

export class PayoutServerAction extends BaseServerAction {
    constructor() {
        super();
    }
    async getPayoutSummaryServer({
        sessionId,
        token,
    }: {
        sessionId: string;
        token: string;
    }): Promise<SellerPayout.TPayoutSummary> {
        const headers = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        return this.get(
            `${PATH_SINGLE_TRANSACTION}/${sessionId}/${SELLER_KEYS.SUMMARY}`,
            headers
        );
    }
}
