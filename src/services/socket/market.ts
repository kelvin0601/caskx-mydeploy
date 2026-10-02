import { cask } from "@/types";
import { BaseSocketService } from "./baseSocket";
import { SOCKET_KEYS } from "@/lib/constants/key";

export enum MarketType {
    Asks = "asks",
    Bids = "bids",
    Sales = "sales",
}
class MarketSocketService extends BaseSocketService {
    constructor() {
        super(SOCKET_KEYS.MARKET);
    }

    subscribeToMarket(
        type: MarketType,
        callback: (data: cask.TMarket[]) => void
    ) {
        if (!this.isConnected()) return;
        this.socket?.on(type, callback);
    }

    getMarket(type: MarketType) {
        if (!this.isConnected()) return;
        this.socket?.emit(`get_${type}`);
    }
    updateMarket(type: MarketType, data?: cask.TMarket[]) {
        if (!this.isConnected()) return;
        this.socket?.emit(`update_${type}`, data);
    }
}

export const marketSocket = new MarketSocketService();
/**
 *  @example:
 *  marketSocket.subscribeToMarket(MarketType.Asks, (data) => {
 *      console.log(data);
 *  });
 *  marketSocket.getMarket(MarketType.Asks);
 */
