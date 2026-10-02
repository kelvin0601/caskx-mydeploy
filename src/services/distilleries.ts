import axiosInstance from "@/config/axios";
import { DISTILLERY_KEYS } from "@/lib/constants/key";
import { PATH_DISTILLERIES } from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";
import { cask, distillery } from "@/types";
import { global } from "@/types/global/global";

class DistilleriesServices {
    async createDistillery(data: Record<string, unknown>): Promise<unknown> {
        const createData = { ...data };
        const imageFile =
            createData.image instanceof File
                ? (createData.image as File)
                : null;

        // Remove image from data if it's a File (will be sent as separate field "image")
        if (imageFile) {
            delete createData.image;
        }

        // If there's an image file, send as multipart/form-data
        if (imageFile) {
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
                axiosInstance.post(`${PATH_DISTILLERIES}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
            );
        }

        // No image, send as regular JSON
        return handleRequest(
            axiosInstance.post(`${PATH_DISTILLERIES}`, createData)
        );
    }
    async getDistillery(params: string) {
        return handleRequest(
            axiosInstance.get<distillery.TDistillery[]>(
                `${PATH_DISTILLERIES}?${params}`
            )
        );
    }
    async getCountries(params: string) {
        return handleRequest(
            axiosInstance.get<{ countries: string[] }>(
                `${PATH_DISTILLERIES}/${DISTILLERY_KEYS.COUNTRIES}?${params}`
            )
        );
    }
    async getStatus(params: string) {
        return handleRequest(
            axiosInstance.get<{ statuses: string[] }>(
                `${PATH_DISTILLERIES}/${DISTILLERY_KEYS.STATUSES}?${params}`
            )
        );
    }
    async getRegions(params: string) {
        return handleRequest(
            axiosInstance.get<{ regions: string[] }>(
                `${PATH_DISTILLERIES}/${DISTILLERY_KEYS.REGIONS}?${params}`
            )
        );
    }
    async getCompanies(params: string) {
        return handleRequest(
            axiosInstance.get<{ companies: string[] }>(
                `${PATH_DISTILLERIES}/${DISTILLERY_KEYS.COMPANIES}?${params}`
            )
        );
    }
    async getDistilleryTopRank() {
        return handleRequest(
            axiosInstance.get<distillery.TTopDistillery[]>(
                `${PATH_DISTILLERIES}/${DISTILLERY_KEYS.TOP_DISTILLERIES}`
            )
        );
    }
    async getDistilleriesListing(params: string) {
        return handleRequest(
            axiosInstance.get<
                global.TDataWithPagination<distillery.TDistillery[]>
            >(`${PATH_DISTILLERIES}/${DISTILLERY_KEYS.LISTING}?${params}`)
        );
    }
    async getDetailDistillery(id: string) {
        return handleRequest(
            axiosInstance.get<distillery.TDistillery>(
                `${PATH_DISTILLERIES}/${id}`
            )
        );
    }

    async filterCasksByRange() {}

    async updateDetailDistillery(
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
                axiosInstance.put(`${PATH_DISTILLERIES}/${id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
            );
        }

        // No image, send as regular JSON
        return handleRequest(
            axiosInstance.put(`${PATH_DISTILLERIES}/${id}`, updatedData)
        );
    }

    async deleteDistillery(id: string) {
        return handleRequest(
            axiosInstance.delete<cask.TCask[]>(`${PATH_DISTILLERIES}/${id}`)
        );
    }

    async searchDistilleries(query: string) {
        return handleRequest(
            axiosInstance.get<distillery.TDistillery[]>(
                `${PATH_DISTILLERIES}/search/${query}`
            )
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
        const params = `${limit ? `limit=${limit}` : ""}${limit ? "&" : ""}${candidateDistilleries ? `candidateDistilleries=${candidateDistilleries.join(",")}` : ""}`;

        return handleRequest(
            axiosInstance.get<{
                relatedDistilleries: distillery.TDistillery[];
                total: number;
            }>(
                `${PATH_DISTILLERIES}/${id}/${DISTILLERY_KEYS.RELATED}?${params}`
            )
        );
    }
}

const distilleriesServices = new DistilleriesServices();

export default distilleriesServices;
