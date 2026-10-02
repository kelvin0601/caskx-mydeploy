import {
    KEY_TRANSACTIONS,
    PATH_SINGLE_TRANSACTION,
    PATH_TRANSACTIONS,
} from "@/lib/constants";
import { transaction } from "@/types/transaction";
import type { payout } from "@/types/payout";
import { BaseServerAction } from "./base";

export class TransactionServerAction extends BaseServerAction {
    constructor() {
        super();
    }
    async getTransactionDetailServer(
        transactionId: string,
        token: string
    ): Promise<transaction.TTransactionDetailResponse> {
        return await this.get(`${PATH_TRANSACTIONS}/${transactionId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
    /**
     *  /api/transactions/asks/{askId}
     */
    async getTransactionAskDetail(
        askId: string,
        token: string
    ): Promise<payout.TAskTransactionPayoutResponse> {
        //api GET: /api/transactions/asks/{askId}
        return await this.get(
            `${PATH_SINGLE_TRANSACTION}/${KEY_TRANSACTIONS.ASKS}/${askId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    }
}

export const transactionServerAction = new TransactionServerAction();
