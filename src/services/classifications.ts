import axiosInstance from "@/config/axios";
import { CLASSIFICATION_KEYS } from "@/lib/constants/key";
import { PATH_CLASSIFICATION, PATH_META_DATA_CASK } from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";
import { classification } from "@/types/classification";
import { global } from "@/types/global/global";

class ClassificationsServices {
    async getClassification() {
        return handleRequest(
            axiosInstance.get<{
                classifications: classification.TClassification[];
            }>(`${PATH_META_DATA_CASK}${PATH_CLASSIFICATION}`)
        );
    }

    async getBrowseClassifications() {
        return handleRequest(
            axiosInstance.get<{
                data: classification.TClassificationBrowse[];
            }>(`${PATH_META_DATA_CASK}${PATH_CLASSIFICATION}/browse`)
        );
    }

    async getClassificationsListing(params: string) {
        return handleRequest(
            axiosInstance.get<
                global.TDataWithPagination<classification.TClassification[]>
            >(`${PATH_CLASSIFICATION}/${CLASSIFICATION_KEYS.LISTING}?${params}`)
        );
    }

    async createClassification(
        data: classification.TClassificationCreateInput
    ): Promise<unknown> {
        const createData = { ...data } as Record<string, unknown>;
        const imageFile =
            createData.image instanceof File
                ? (createData.image as File)
                : null;

        if (imageFile) {
            delete createData.image;
            const formData = new FormData();

            Object.entries(createData).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    formData.append(key, String(value));
                }
            });
            formData.append("image", imageFile);

            return handleRequest(
                axiosInstance.post(`${PATH_CLASSIFICATION}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
            );
        }

        return handleRequest(
            axiosInstance.post(`${PATH_CLASSIFICATION}`, createData)
        );
    }

    async getDetailClassification(id: string) {
        return handleRequest(
            axiosInstance.get<classification.TClassification>(
                `${PATH_CLASSIFICATION}/${id}`
            )
        );
    }

    async updateClassification(
        id: string,
        data: classification.TClassificationUpdateInput
    ): Promise<unknown> {
        const updateData = { ...data } as Record<string, unknown>;
        const imageFile =
            updateData.image instanceof File
                ? (updateData.image as File)
                : null;

        if (imageFile) {
            delete updateData.image;
            const formData = new FormData();

            Object.entries(updateData).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    formData.append(key, String(value));
                }
            });
            formData.append("image", imageFile);

            return handleRequest(
                axiosInstance.put(`${PATH_CLASSIFICATION}/${id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
            );
        }

        return handleRequest(
            axiosInstance.put(`${PATH_CLASSIFICATION}/${id}`, updateData)
        );
    }

    async deleteClassification(id: string) {
        return handleRequest(
            axiosInstance.delete(`${PATH_CLASSIFICATION}/${id}`)
        );
    }
}

const classificationsServices = new ClassificationsServices();

export default classificationsServices;
