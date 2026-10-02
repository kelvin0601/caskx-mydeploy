import { KEY_MARKET_DATA, PATH_MARKET_DATA } from "@/lib/constants";
import { BaseServerAction } from "./base";
import { MarketOperations } from "@/types/market-operations";

class MarketDataViewServerAction extends BaseServerAction {
    constructor() {
        super();
    }

    async getCaskMarketDataView(caskId: string) {
        return await this.get<MarketOperations.TCaskMarketDataView>(
            `${PATH_MARKET_DATA}/${KEY_MARKET_DATA.VIEW}/${KEY_MARKET_DATA.CASK}/${caskId}`
        );
    }
}

export const marketDataViewServerAction = new MarketDataViewServerAction();
