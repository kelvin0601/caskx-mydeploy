import { BaseServerAction } from "./base";
import { PATH_NOTIFICATION_PREFERENCES } from "@/lib/constants/path";
import { notificationPreference } from "@/types";

class NotificationPreferenceServerAction extends BaseServerAction {
    async getNotificationPreferences() {
        return this.get<notificationPreference.TNotificationPreferencesResponse>(
            PATH_NOTIFICATION_PREFERENCES,
            {},
            true
        );
    }
}

export const notificationPreferenceServerAction =
    new NotificationPreferenceServerAction();
