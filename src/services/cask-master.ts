import axiosInstance from "@/config/axios";
import {
    CASK_KEYS,
    PATH_CASK_MASTERS,
    PATH_CASK_MASTERS_ADMIN,
} from "@/lib/constants";
import { handleRequest } from "@/lib/utils";
import { caskMaster } from "@/types";
import { global } from "@/types/global/global";

export type TCaskMastersQueryParams = {
    page?: number;
    size?: number;
    search?: string;
    distilleryIds?: string[];
    caskTypeIds?: string[];
    regionIds?: string[];
    classification?: string;
    sortBy?: string;
    includeAllStatuses?: boolean;
} & Record<string, string | string[] | boolean | number>;

class CaskMasterServices {
    async getCaskMasters(
        params?: TCaskMastersQueryParams
    ): Promise<global.TDataWithPagination<caskMaster.TCaskMaster[]>> {
        const query = buildQueryString(params);
        return handleRequest(
            axiosInstance.get<
                global.TDataWithPagination<caskMaster.TCaskMaster[]>
            >(`${PATH_CASK_MASTERS}${query ? `?${query}` : ""}`)
        );
    }
    async getCaskMastersListing(params: string) {
        return handleRequest(
            axiosInstance.get<
                global.TDataWithPagination<caskMaster.TCaskMaster[]>
            >(`${PATH_CASK_MASTERS}${params ? `?${params}` : ""}`)
        );
    }
    async getCaskMastersAdmin(
        params?: TCaskMastersQueryParams
    ): Promise<global.TDataWithPagination<caskMaster.TCaskMaster[]>> {
        const query = buildQueryString(params);
        return handleRequest(
            axiosInstance.get<
                global.TDataWithPagination<caskMaster.TCaskMaster[]>
            >(`${PATH_CASK_MASTERS_ADMIN}${query ? `?${query}` : ""}`)
        );
    }

    async getDetailCaskMaster(
        id: string
    ): Promise<caskMaster.TCaskMasterWithChildren> {
        return handleRequest(
            axiosInstance.get<caskMaster.TCaskMasterWithChildren>(
                `${PATH_CASK_MASTERS}/${id}`
            )
        );
    }

    async getSimilarCaskMasters(id: string, limit = 4) {
        return handleRequest(
            axiosInstance.get<caskMaster.TSimilarCaskMaster[]>(
                `${PATH_CASK_MASTERS}/${id}/${CASK_KEYS.SIMILAR_CASKS}?limit=${limit}`
            )
        );
    }

    async createCaskMaster(
        data: caskMaster.TCaskMasterCreateInput
    ): Promise<caskMaster.TCaskMasterWithChildren> {
        const imageFile = data.image instanceof File ? data.image : null;
        if (imageFile) {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (key === "image") return;
                if (value !== undefined && value !== null && value !== "") {
                    formData.append(key, String(value));
                }
            });
            formData.append("image", imageFile);
            return handleRequest(
                axiosInstance.post(`${PATH_CASK_MASTERS}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
            );
        }
        return handleRequest(
            axiosInstance.post<caskMaster.TCaskMasterWithChildren>(
                `${PATH_CASK_MASTERS}`,
                data
            )
        );
    }

    async updateCaskMaster(
        id: string,
        data: Partial<caskMaster.TCaskMasterUpdateInput> & {
            image?: File | string;
            imageUrl?: string;
        }
    ): Promise<caskMaster.TCaskMasterWithChildren> {
        const updatedData: Record<string, unknown> = { ...data };
        const imageFile =
            updatedData.image instanceof File ? updatedData.image : null;

        // Remove image from data if it's a File (will be sent as separate field "image")
        if (imageFile) {
            delete updatedData.image;
            // We don't want to send blob/URL strings when uploading a new image file
            delete updatedData.imageUrl;
        }

        // If there's an image file, send as multipart/form-data
        if (imageFile) {
            const formData = new FormData();

            // Append all other fields
            Object.entries(updatedData).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    // Convert objects/arrays to JSON strings, keep primitives as-is
                    if (
                        typeof value === "object" &&
                        !(value instanceof File) &&
                        !Array.isArray(value)
                    ) {
                        formData.append(key, JSON.stringify(value));
                    } else if (Array.isArray(value)) {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            // Append image file with field name "image" as per backend API
            formData.append("image", imageFile);

            return handleRequest(
                axiosInstance.put(`${PATH_CASK_MASTERS}/${id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
            );
        }
        return handleRequest(
            axiosInstance.put<caskMaster.TCaskMasterWithChildren>(
                `${PATH_CASK_MASTERS}/${id}`,
                updatedData
            )
        );
    }

    async reorderCasks(
        id: string,
        data: caskMaster.TReorderCasksInput
    ): Promise<caskMaster.TReorderCasksResponse> {
        return handleRequest(
            axiosInstance.put<caskMaster.TReorderCasksResponse>(
                `${PATH_CASK_MASTERS}/${id}/${CASK_KEYS.REORDER_CASKS}`,
                data
            )
        );
    }

    async deleteCaskMaster(id: string): Promise<unknown> {
        return handleRequest(
            axiosInstance.delete(`${PATH_CASK_MASTERS}/${id}`)
        );
    }

    async increaseViewCount(id: string): Promise<unknown> {
        return handleRequest(
            axiosInstance.post(`${PATH_CASK_MASTERS}/${id}/view`)
        );
    }
    async getRecentViewCasks({ params }: { params: string }) {
        return handleRequest(
            axiosInstance.get<
                global.TDataRecentlyViewed<caskMaster.TCaskMaster>[]
            >(
                `${PATH_CASK_MASTERS}/${CASK_KEYS.RECENTLY_VIEWED}${params ? `?${params}` : ""}`
            )
        );
    }
}

const caskMasterServices = new CaskMasterServices();

export default caskMasterServices;

const buildQueryString = (params?: TCaskMastersQueryParams) => {
    if (!params) return "";

    const query = new URLSearchParams();

    const p = Object.entries(params).reduce((acc, [key, value]) => {
        if (value === undefined || value === null || value === "") return acc;
        acc.set(key, String(value));
        return acc;
    }, query);

    return p.toString();
};
