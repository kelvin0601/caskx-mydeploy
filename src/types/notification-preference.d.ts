export namespace notificationPreference {
    export type TNotificationPreferenceItem = {
        id?: string;
        eventType: string;
        category?: "MARKETPLACE" | "SYSTEM" | string;
        inAppEnabled: boolean;
        emailEnabled: boolean;
        thresholdSupport?: boolean;
        thresholdPercent?: number | null;
        defaultThreshold?: number | null;
        createdAt?: string | null;
        updatedAt?: string | null;
    };

    export type TUpdateChannelPayload = {
        inAppEnabled: boolean;
        emailEnabled: boolean;
    };

    export type TUpdateThresholdPayload = {
        thresholdPercent: number;
    };

    export type TNotificationPreferencesResponse =
        | TNotificationPreferenceItem[]
        | { data: TNotificationPreferenceItem[] }
        | Record<string, TNotificationPreferenceItem>;
}
