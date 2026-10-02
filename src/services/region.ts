import axiosInstance from "@/config/axios";
import { REGION_KEYS } from "@/lib/constants/key";
import { PATH_REGIONS } from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";
import { region } from "@/types";

class RegionsServices {
    async getRegions(params?: string) {
        return handleRequest(
            axiosInstance.get<region.TRegion[]>(
                `${PATH_REGIONS}${params ? `?${params}` : ""}`
            )
        );
    }
    async createRegions(data: region.TRegionCreateInput) {
        return handleRequest(axiosInstance.post(`${PATH_REGIONS}`, data));
    }
    async getRegionsListing() {
        return handleRequest(
            axiosInstance.get<region.TRegion[]>(
                `${PATH_REGIONS}/${REGION_KEYS.LIST}`
            )
        );
    }
    async getRegionDetails(id: string) {
        return handleRequest(
            axiosInstance.get<region.TRegion[]>(`${PATH_REGIONS}/${id}`)
        );
    }

    async updateRegionDetails(id: number, data: unknown) {
        return handleRequest(axiosInstance.put(`${PATH_REGIONS}/${id}`, data));
    }

    async deleteRegionDetails(id: string) {
        return handleRequest(axiosInstance.delete(`${PATH_REGIONS}/${id}`));
    }
}

const regionsServices = new RegionsServices();

export default regionsServices;
