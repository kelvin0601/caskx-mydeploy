import {
    PATH_CASKS,
    PATH_FILTER_OPTIONS,
    PATH_META_DATA_CASK,
    PATH_CLASSIFICATION,
    PATH_REGIONS,
} from "@/lib/constants/path";
import { CASK_KEYS, FILTER_KEYS } from "@/lib/constants/key";
import { BaseServerAction } from "./base";
import { cask, distillery, region } from "@/types";
import { classification } from "@/types/classification";

class CaskServerAction extends BaseServerAction {
    constructor() {
        super();
    }
    async getDetailCask(id: string) {
        return await this.get<cask.TCask>(`${PATH_CASKS}/${id}`);
    }
    async getSimilarCask(id: string, limit = 10) {
        return await this.get<{
            similarCasks: cask.TCask[];
        }>(`${PATH_CASKS}/${id}/${CASK_KEYS.SIMILAR_CASKS}?limit=${limit}`);
    }
    async getCaskTypes(params: string) {
        return await this.get<{
            caskTypes: (cask.TCaskType & { count: number })[];
        }>(
            `${PATH_CASKS}${PATH_FILTER_OPTIONS}/${FILTER_KEYS.CASK_TYPE}?${params}`,
            {},
            true
        );
    }
    async getDistillery(params: string) {
        return await this.get<{
            distilleries: (distillery.TDistillery & { count: number })[];
        }>(
            `${PATH_CASKS}${PATH_FILTER_OPTIONS}/${FILTER_KEYS.DISTILLERIES_CASKS}?${params}`,
            {},
            true
        );
    }
    async getClassification() {
        return await this.get<{
            classifications: classification.TClassification[];
        }>(`${PATH_META_DATA_CASK}${PATH_CLASSIFICATION}`, {}, true);
    }
    async getRegions(params?: string) {
        return await this.get<region.TRegion[]>(
            `${PATH_REGIONS}${params ? `?${params}` : ""}`,
            {},
            true
        );
    }
    async getCaskRange() {
        return await this.get<cask.TCaskRangeType>(
            `${PATH_META_DATA_CASK}/${FILTER_KEYS.CASK_RANGE}`,
            {},
            true
        );
    }
}

export const caskServerAction = new CaskServerAction();
