import axiosInstance from "@/config/axios";
import { PATH_NOTIFICATIONS } from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";
import {
    NotificationCategory,
    NotificationItem,
    NotificationListResponse,
    NotificationQueryParams,
    NotificationReadAllResponse,
    NotificationUnreadCountResponse,
} from "@/types/notification";

class NotificationService {
    async getUnreadCount(): Promise<NotificationUnreadCountResponse> {
        return handleRequest<NotificationUnreadCountResponse>(
            axiosInstance.get(`${PATH_NOTIFICATIONS}/unread-count`)
        );
    }

    async getPreview(previewLimit = 5): Promise<NotificationItem[]> {
        const res = await handleRequest<
            NotificationItem[] | { data: NotificationItem[] }
        >(
            axiosInstance.get(`${PATH_NOTIFICATIONS}/preview`, {
                params: { previewLimit },
            })
        );
        if (Array.isArray(res)) return res;
        if (res && Array.isArray((res as { data?: NotificationItem[] }).data)) {
            return (res as { data: NotificationItem[] }).data;
        }
        return [];
    }

    async getList(
        params?: NotificationQueryParams
    ): Promise<NotificationListResponse> {
        return handleRequest<NotificationListResponse>(
            axiosInstance.get(PATH_NOTIFICATIONS, {
                params,
            })
        );
    }

    async markRead(id: string): Promise<NotificationItem> {
        return handleRequest<NotificationItem>(
            axiosInstance.patch(`${PATH_NOTIFICATIONS}/${id}/read`)
        );
    }

    async markAllRead(
        category?: NotificationCategory | string
    ): Promise<NotificationReadAllResponse> {
        const url = category
            ? `${PATH_NOTIFICATIONS}/read-all/${category}`
            : `${PATH_NOTIFICATIONS}/read-all`;

        return handleRequest<NotificationReadAllResponse>(
            axiosInstance.patch(url)
        );
    }
}

const notificationService = new NotificationService();
export default notificationService;
