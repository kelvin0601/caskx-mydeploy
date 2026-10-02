import { DISTILLERY_KEYS, PATH_DISTILLERIES } from "@/lib/constants";
import { BaseServerAction } from "./base";
import { distillery } from "@/types";
import { global } from "@/types/global/global";

class DistilleryServerAction extends BaseServerAction {
    constructor() {
        super();
    }

    async getDistilleryTopRank() {
        return await this.get<distillery.TTopDistillery[]>(
            `${PATH_DISTILLERIES}/${DISTILLERY_KEYS.TOP_DISTILLERIES}`
        );
    }

    async getDistilleriesListing(params: string) {
        return await this.get<
            global.TDataWithPagination<distillery.TDistillery[]>
        >(
            `${PATH_DISTILLERIES}/${DISTILLERY_KEYS.LISTING}?${params}`,
            {},
            true
        );
    }

    async getDetailDistillery(id: string) {
        return await this.get<distillery.TDistillery>(
            `${PATH_DISTILLERIES}/${id}`
        );
    }

    async getRelatedDistilleries({
        id,
        limit,
        candidateDistilleries,
    }: {
        id: string;
        limit?: number;
        candidateDistilleries?: string[];
    }) {
        const params = `${limit ? `limit=${limit}` : ""}${limit ? "&" : ""}${
            candidateDistilleries
                ? `candidateDistilleries=${candidateDistilleries.join(",")}`
                : ""
        }`;

        return await this.get<{
            relatedDistilleries: distillery.TDistillery[];
            total: number;
        }>(`${PATH_DISTILLERIES}/${id}/${DISTILLERY_KEYS.RELATED}?${params}`);
    }

    async getCountries(params: string) {
        return await this.get<{ countries: string[] }>(
            `${PATH_DISTILLERIES}/${DISTILLERY_KEYS.COUNTRIES}?${params}`,
            {},
            true
        );
    }

    async getStatus(params: string) {
        return await this.get<{ statuses: string[] }>(
            `${PATH_DISTILLERIES}/${DISTILLERY_KEYS.STATUSES}?${params}`,
            {},
            true
        );
    }

    async getRegions(params: string) {
        return await this.get<{ regions: string[] }>(
            `${PATH_DISTILLERIES}/${DISTILLERY_KEYS.REGIONS}?${params}`,
            {},
            true
        );
    }

    async getCompanies(params: string) {
        return await this.get<{ companies: string[] }>(
            `${PATH_DISTILLERIES}/${DISTILLERY_KEYS.COMPANIES}?${params}`,
            {},
            true
        );
    }
}

export const distilleryServerAction = new DistilleryServerAction();
