import { KEY_BID } from "@/lib/constants/key";
import {
    PATH_BID,
    PATH_SINGLE_BID,
} from "@/lib/constants/path";
import { caskBid } from "@/types/cask-bid";
import { BaseServerAction } from "./base";

export class CaskBidServerAction extends BaseServerAction {
    constructor() {
        super();
    }

    async getBidDetail(id: string, skipRedirect = false) {
        return await this.get<caskBid.TBidTransactionsResponse>(
            `${PATH_SINGLE_BID}/${id}/${KEY_BID.BID_TRANSACTIONS}`,
            {},
            skipRedirect
        );
    }

    /**
     * Server-side fetch for cask bid market data.
     */
    async getCaskBidMarketData(
        id: string
    ): Promise<caskBid.TCaskBidMarketData | null> {
        try {
            return await this.get<caskBid.TCaskBidMarketData>(
                `${PATH_BID}/${KEY_BID.BID_MARKET_DATA}/${id}`,
                { next: { revalidate: 30 } },
                true
            );
        } catch {
            return null;
        }
    }

    /**
     * Server-side fetch for highest bid.
     */
    async getHighBid(caskId: string) {
        try {
            return await this.get(
                `${PATH_BID}/${KEY_BID.BID_HIGHEST}/${caskId}`,
                { next: { revalidate: 30 } },
                true
            );
        } catch {
            return null;
        }
    }
}

export const caskBidServerAction = new CaskBidServerAction();
