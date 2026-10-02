import axiosInstance from "@/config/axios";
import { CASK_KEYS, FILTER_KEYS } from "@/lib/constants/key";
import {
    PATH_API_FE_CASK_PERMITTER,
    PATH_BID_SUGGESTION,
    PATH_CASKS,
    PATH_FILTER_OPTIONS,
    PATH_META_DATA_CASK,
    PATH_SUGGEST_CASK_ASK_BID,
} from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";
import { cask, distillery } from "@/types";
import { global } from "@/types/global/global";

class CaskServices {
    async getAllCasks() {
        return handleRequest(axiosInstance.get<cask.TCask[]>(`${PATH_CASKS}`));
    }

    async createCask(
        data: Partial<cask.CaskCreateInput> | Record<string, unknown>
    ): Promise<cask.TCask> {
        // Normalize to Record<string, unknown> for easier handling
        const createData: Record<string, unknown> = { ...data } as Record<
            string,
            unknown
        >;
        const imageFile =
            createData.image instanceof File
                ? (createData.image as File)
                : null;

        // If there's an image file, send as multipart/form-data
        if (imageFile) {
            delete createData.image;
            const formData = new FormData();

            // Append all other fields
            Object.keys(createData).forEach((key) => {
                const value = createData[key];
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
                axiosInstance.post(`${PATH_CASKS}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
            );
        }

        // No image, send as regular JSON
        return handleRequest(axiosInstance.post(`${PATH_CASKS}`, createData));
    }
    async getCaskListing(params: string) {
        return handleRequest(
            axiosInstance.get<global.TDataWithPagination<cask.TCask[]>>(
                `${PATH_CASKS}/${CASK_KEYS.LISTING}${params ? `?${params}` : ""}`
            )
        );
    }
    async getRecentViewCasks({ params }: { params: string }) {
        return handleRequest(
            axiosInstance.get<global.TDataRecentlyViewed<cask.TCask>[]>(
                `${PATH_CASKS}/${CASK_KEYS.RECENTLY_VIEWED}${params ? `?${params}` : ""}`
            )
        );
    }
    async getGrowthCasks() {
        return handleRequest(
            axiosInstance.get<global.TDataWithPagination<cask.TCask[]>>(
                `${PATH_CASKS}/${CASK_KEYS.LISTING}?page=1&size=10&sortBy=averageGrowth&sortOrder=DESC`
            )
        );
    }
    async getFeaturedCasks() {
        return handleRequest(
            axiosInstance.get<global.TDataWithPagination<cask.TCask[]>>(
                `${PATH_CASKS}/${CASK_KEYS.LISTING}?sortBy=viewCount&sortOrder=DESC&size=10&page=1`
            )
        );
    }
    async getHighVoltageCasks() {
        return handleRequest(
            axiosInstance.get<global.TDataWithPagination<cask.TCask[]>>(
                `${PATH_CASKS}/${CASK_KEYS.LISTING}?page=1&size=10&sortBy=abv&sortOrder=DESC`
            )
        );
    }

    async getDetailCask(id: number | string) {
        return handleRequest(
            axiosInstance.get<cask.TCask>(`${PATH_CASKS}/${id}`)
        );
    }
    async getCaskTypes(params: string) {
        return handleRequest(
            axiosInstance.get<{
                caskTypes: (cask.TCaskType & { count: number })[];
            }>(
                `${PATH_CASKS}${PATH_FILTER_OPTIONS}/${FILTER_KEYS.CASK_TYPE}?${params}`
            )
        );
    }
    async getDistillery(params: string) {
        return handleRequest(
            axiosInstance.get<{
                distilleries: (distillery.TDistillery & { count: number })[];
            }>(
                `${PATH_CASKS}${PATH_FILTER_OPTIONS}/${FILTER_KEYS.DISTILLERIES_CASKS}?${params}`
            )
        );
    }

    async updateDetailCask(
        id: string,
        data: Record<string, unknown>
    ): Promise<unknown> {
        const updatedData = { ...data };
        const imageFile =
            updatedData.image instanceof File
                ? (updatedData.image as File)
                : null;

        // Remove image from data if it's a File (will be sent as separate field "image")
        if (imageFile) {
            delete updatedData.image;
        }

        // If there's an image file, send as multipart/form-data
        if (imageFile) {
            const formData = new FormData();

            // Append all other fields
            Object.keys(updatedData).forEach((key) => {
                const value = updatedData[key];
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
                axiosInstance.put(`${PATH_CASKS}/${id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
            );
        }

        // No image, send as regular JSON
        return handleRequest(
            axiosInstance.put(`${PATH_CASKS}/${id}`, updatedData)
        );
    }
    async getCaskRange(signal?: AbortSignal) {
        return handleRequest(
            axiosInstance.get<cask.TCaskRangeType>(
                `${PATH_META_DATA_CASK}/${FILTER_KEYS.CASK_RANGE}`,
                { signal }
            )
        );
    }
    async getSortedCasks() {
        return handleRequest(
            axiosInstance.get<{
                sortOptions: cask.TCaskSort[];
            }>(`${PATH_META_DATA_CASK}/${CASK_KEYS.SORT_CASK}`)
        );
    }
    async increaseViewCount(id: number | string) {
        return handleRequest(axiosInstance.post(`${PATH_CASKS}/${id}/view`));
    }
    async deleteCask(id: number | string) {
        return handleRequest(axiosInstance.delete(`${PATH_CASKS}/${id}`));
    }
    async searchCasks(params: string) {
        return handleRequest(
            axiosInstance.get<cask.TCask[]>(
                `${PATH_CASKS}/${CASK_KEYS.SEARCH_CASK}?query=${params}&page=1&size=10`
            )
        );
    }
    async getListPermitter() {
        try {
            return (await fetch(PATH_API_FE_CASK_PERMITTER, {
                cache: "force-cache",
                next: {
                    revalidate: 60 * 60 * 24,
                },
            })
                .then((res) => res.json())
                .then((res) => res)) as cask.TCaskPermitter;
        } catch (error) {
            console.error("Error fetching permitted cask:", error);
        }
    }
    async getSimilarCask(id: number | string, limit = 4) {
        return handleRequest(
            axiosInstance.get<{
                similarCasks: cask.TCask[];
            }>(`${PATH_CASKS}/${id}/${CASK_KEYS.SIMILAR_CASKS}?limit=${limit}`)
        );
    }

    async getCaskBidSuggestion(id: number | string) {
        return handleRequest(
            axiosInstance.get(
                `${PATH_BID_SUGGESTION}/${CASK_KEYS.BID_SUGGESTION}/${id}`
            )
        );
    }
}

const caskServices = new CaskServices();

export default caskServices;
