import axiosInstance from "@/config/axios";
import { CASK_TYPE_KEYS } from "@/lib/constants/key";
import { PATH_CASK_TYPES } from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";
import { caskType } from "@/types/cask-type";
import { global } from "@/types/global/global";

class CaskTypesServices {
    async getCaskTypesListing(params: string) {
        return handleRequest(
            axiosInstance.get<global.TDataWithPagination<caskType.TCaskType[]>>(
                `${PATH_CASK_TYPES}/${CASK_TYPE_KEYS.LISTING}?${params}`
            )
        );
    }

    async createCaskType(
        data: caskType.TCaskTypeCreateInput
    ): Promise<unknown> {
        return handleRequest(axiosInstance.post(`${PATH_CASK_TYPES}`, data));
    }

    async getDetailCaskType(id: string) {
        return handleRequest(
            axiosInstance.get<caskType.TCaskType>(`${PATH_CASK_TYPES}/${id}`)
        );
    }

    async updateCaskType(
        id: string,
        data: caskType.TCaskTypeUpdateInput
    ): Promise<unknown> {
        return handleRequest(
            axiosInstance.put(`${PATH_CASK_TYPES}/${id}`, data)
        );
    }

    async deleteCaskType(id: string) {
        return handleRequest(axiosInstance.delete(`${PATH_CASK_TYPES}/${id}`));
    }

    async toggleCaskTypeStatus(
        id: string,
        status: "active" | "inactive"
    ): Promise<unknown> {
        return handleRequest(
            axiosInstance.patch(`${PATH_CASK_TYPES}/${id}`, { status })
        );
    }
}

const caskTypesServices = new CaskTypesServices();

export default caskTypesServices;
