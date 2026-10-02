import { KEY_ASK, PATH_ASK } from "@/lib/constants";
import { BaseServerAction } from "./base";
import { caskAsk } from "@/types/cask-ask";

class CaskAskServerAction extends BaseServerAction {
    constructor() {
        super();
    }

    async getLowestAsk(caskId: string) {
        return await this.get<caskAsk.TCaskOrder | null>(
            `${PATH_ASK}/${KEY_ASK.ASK_LOWEST}/${caskId}`
        );
    }
}

export const caskAskServerAction = new CaskAskServerAction();
