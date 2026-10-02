import axiosInstance from "@/config/axios";
import { PATH_NOTIFICATION_PREFERENCES } from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";
import { notificationPreference } from "@/types";

class NotificationPreferenceService {
    async getNotificationPreferences() {
        const response =
            await handleRequest<notificationPreference.TNotificationPreferencesResponse>(
                axiosInstance.get(PATH_NOTIFICATION_PREFERENCES)
            );
        return response;
    }

    async updateChannelPreference(
        eventType: string,
        payload: notificationPreference.TUpdateChannelPayload
    ) {
        const response =
            await handleRequest<notificationPreference.TNotificationPreferenceItem>(
                axiosInstance.patch(
                    `${PATH_NOTIFICATION_PREFERENCES}/${eventType}`,
                    payload
                )
            );
        return response;
    }

    async updateThresholdPreference(
        eventType: string,
        payload: notificationPreference.TUpdateThresholdPayload
    ) {
        const response =
            await handleRequest<notificationPreference.TNotificationPreferenceItem>(
                axiosInstance.patch(
                    `${PATH_NOTIFICATION_PREFERENCES}/${eventType}/threshold`,
                    payload
                )
            );
        return response;
    }
}

const notificationPreferenceService = new NotificationPreferenceService();
export default notificationPreferenceService;
