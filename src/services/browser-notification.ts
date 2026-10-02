// Service for managing Browser Push Notifications (Web Notifications API)

export const BROWSER_NOTIFICATION_STORAGE_KEY =
    "ce_browser_notifications_enabled";

export type TBrowserNotificationPermission =
    | NotificationPermission
    | "unsupported";

export interface SendBrowserNotificationOptions {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    url?: string;
    data?: unknown;
    onClick?: () => void;
}

class BrowserNotificationService {
    private swRegistration: ServiceWorkerRegistration | null = null;
    private isRegisteringSw = false;

    /**
     * Checks if the Web Notification API is supported in the current browser environment.
     */
    isSupported(): boolean {
        return typeof window !== "undefined" && "Notification" in window;
    }

    /**
     * Retrieves the current notification permission state.
     */
    getPermission(): TBrowserNotificationPermission {
        if (!this.isSupported()) return "unsupported";
        return Notification.permission;
    }

    /**
     * Checks whether notifications are allowed by browser permission AND enabled by user setting.
     */
    isEnabled(): boolean {
        if (this.getPermission() !== "granted") return false;
        if (typeof window === "undefined") return false;
        const stored = localStorage.getItem(BROWSER_NOTIFICATION_STORAGE_KEY);
        // Default to true if permission is already granted and no explicit opt-out
        return stored !== "false";
    }

    /**
     * Sets user preference for browser push notifications in local storage.
     */
    setEnabled(enabled: boolean): void {
        if (typeof window === "undefined") return;
        localStorage.setItem(
            BROWSER_NOTIFICATION_STORAGE_KEY,
            enabled ? "true" : "false"
        );
    }

    /**
     * Initializes Service Worker registration for background notifications.
     */
    async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
            return null;
        }

        if (this.swRegistration) {
            return this.swRegistration;
        }

        if (this.isRegisteringSw) {
            return null;
        }

        try {
            this.isRegisteringSw = true;
            const reg = await navigator.serviceWorker.register("/sw.js", {
                scope: "/",
            });
            this.swRegistration = reg;
            return reg;
        } catch (err) {
            console.warn(
                "ServiceWorker registration failed for browser notifications:",
                err
            );
            return null;
        } finally {
            this.isRegisteringSw = false;
        }
    }

    /**
     * Requests browser notification permission from the user.
     */
    async requestPermission(): Promise<TBrowserNotificationPermission> {
        if (!this.isSupported()) return "unsupported";

        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                this.setEnabled(true);
                // Also attempt SW registration in the background
                this.registerServiceWorker().catch(() => {});
            }
            return permission;
        } catch (err) {
            console.error("Error requesting notification permission:", err);
            return this.getPermission();
        }
    }

    /**
     * Triggers a native desktop/browser push notification.
     */
    async sendNotification(
        title: string,
        options: SendBrowserNotificationOptions = {}
    ): Promise<boolean> {
        if (!this.isEnabled()) return false;

        const defaultIcon = "/icons/logo.svg";
        const defaultBadge = "/icons/logo.svg";

        const notificationOptions: NotificationOptions = {
            body: options.body || "",
            icon: options.icon || defaultIcon,
            badge: options.badge || defaultBadge,
            tag: options.tag,
            data: {
                url: options.url || "/notifications",
                ...((options.data as object) || {}),
            },
        };

        try {
            // Try ServiceWorker registration first (required for mobile / modern background delivery)
            const reg = await this.registerServiceWorker();
            if (reg && "showNotification" in reg) {
                await reg.showNotification(title, notificationOptions);
                return true;
            }

            // Fallback to standard window.Notification constructor
            const notification = new Notification(title, notificationOptions);

            notification.onclick = (e) => {
                e.preventDefault();
                window.focus();
                if (options.url) {
                    window.location.href = options.url;
                }
                options.onClick?.();
                notification.close();
            };

            return true;
        } catch (err) {
            console.warn("Failed to dispatch browser notification:", err);
            return false;
        }
    }

    /**
     * Helper to quickly trigger a test notification. Requests permission if needed.
     */
    async triggerTest(
        title = "Cask Exchange",
        body = "You have a new notification from Cask Exchange!",
        url = "/notifications"
    ): Promise<boolean> {
        if (!this.isSupported()) return false;
        if (this.getPermission() === "default") {
            const perm = await this.requestPermission();
            if (perm !== "granted") return false;
        }
        return this.sendNotification(title, {
            body,
            url,
        });
    }
}

export const browserNotificationService = new BrowserNotificationService();

if (typeof window !== "undefined") {
    (
        window as unknown as {
            triggerNotification?: (
                title?: string,
                body?: string,
                url?: string
            ) => Promise<boolean>;
        }
    ).triggerNotification = (title, body, url) => {
        return browserNotificationService.triggerTest(title, body, url);
    };
}

export default browserNotificationService;
