"use client";

import { useCallback, useEffect, useState } from "react";
import browserNotificationService, {
    SendBrowserNotificationOptions,
    TBrowserNotificationPermission,
} from "@/services/browser-notification";

export function useBrowserNotification() {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] =
        useState<TBrowserNotificationPermission>("unsupported");
    const [isEnabled, setIsEnabled] = useState(false);

    // Synchronize initial browser notification status on mount
    useEffect(() => {
        const supported = browserNotificationService.isSupported();
        setIsSupported(supported);

        if (supported) {
            const currentPerm = browserNotificationService.getPermission();
            setPermission(currentPerm);
            setIsEnabled(browserNotificationService.isEnabled());

            // If permission is already granted, attempt SW registration
            if (currentPerm === "granted") {
                browserNotificationService
                    .registerServiceWorker()
                    .catch(() => {});
            }
        }
    }, []);

    /**
     * Request user permission for browser notifications.
     */
    const requestPermission = useCallback(async () => {
        const result = await browserNotificationService.requestPermission();
        setPermission(result);
        setIsEnabled(browserNotificationService.isEnabled());
        return result;
    }, []);

    /**
     * Toggles browser notifications on/off. Requests permission if not yet granted.
     */
    const toggleEnabled = useCallback(
        async (enabled: boolean) => {
            if (enabled) {
                if (permission !== "granted") {
                    const newPerm = await requestPermission();
                    if (newPerm === "granted") {
                        browserNotificationService.setEnabled(true);
                        setIsEnabled(true);
                        return true;
                    }
                    return false;
                }
                browserNotificationService.setEnabled(true);
                setIsEnabled(true);
                return true;
            } else {
                browserNotificationService.setEnabled(false);
                setIsEnabled(false);
                return false;
            }
        },
        [permission, requestPermission]
    );

    /**
     * Sends a browser push notification.
     */
    const sendNotification = useCallback(
        async (title: string, options?: SendBrowserNotificationOptions) => {
            return browserNotificationService.sendNotification(title, options);
        },
        []
    );

    return {
        isSupported,
        permission,
        isEnabled,
        requestPermission,
        toggleEnabled,
        sendNotification,
    };
}
