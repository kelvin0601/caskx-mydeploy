import { PATH_CASK_MASTERS } from "@/lib/constants";
import { BaseServerAction } from "./base";
import { caskMaster } from "@/types";
import { global } from "@/types/global/global";

class CaskMasterServerAction extends BaseServerAction {
    constructor() {
        super();
    }

    async getCaskMastersListing(params: string) {
        return await this.get<
            global.TDataWithPagination<caskMaster.TCaskMaster[]>
        >(`${PATH_CASK_MASTERS}${params ? `?${params}` : ""}`, {}, true);
    }

    async getDetailCaskMaster(id: string) {
        return await this.get<caskMaster.TCaskMasterWithChildren>(
            `${PATH_CASK_MASTERS}/${id}`
        );
    }

    async getSimilarCaskMasters(id: string, limit = 4) {
        return await this.get<caskMaster.TSimilarCaskMaster[]>(
            `${PATH_CASK_MASTERS}/${id}/similar?limit=${limit}`
        );
    }
}

export const caskMasterServerAction = new CaskMasterServerAction();
