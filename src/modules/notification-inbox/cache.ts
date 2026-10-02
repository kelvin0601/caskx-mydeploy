import { NOTIFICATION_KEYS } from "@/lib/constants/key";
import {
    NotificationCategory,
    NotificationItem,
    NotificationListResponse,
} from "@/types/notification";
import { InfiniteData, QueryClient } from "@tanstack/react-query";

type TNotificationCategoryFilter = NotificationCategory | string | undefined;

function matchesCategory(
    notification: NotificationItem,
    category: TNotificationCategoryFilter
) {
    return !category || notification.category === category;
}

function markAsRead(
    notification: NotificationItem,
    category: TNotificationCategoryFilter,
    readAt: string
) {
    if (!matchesCategory(notification, category) || notification.isRead) {
        return notification;
    }

    return {
        ...notification,
        isRead: true,
        readAt,
    };
}

/**
 * Keeps every cached notification surface consistent after a read mutation.
 * The unread-count cache is maintained separately because category mutations
 * receive the authoritative number of updated records from the API.
 */
export function markNotificationsReadInCache(
    queryClient: QueryClient,
    category?: TNotificationCategoryFilter
) {
    const readAt = new Date().toISOString();

    queryClient.setQueryData<NotificationItem[]>(
        [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.PREVIEW],
        (old = []) =>
            old.map((notification) =>
                markAsRead(notification, category, readAt)
            )
    );

    queryClient.setQueriesData<InfiniteData<NotificationListResponse>>(
        { queryKey: [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.LIST] },
        (old) => {
            if (!old || !Array.isArray(old.pages)) return old;

            return {
                ...old,
                pages: old.pages.map((page) => ({
                    ...page,
                    data: page.data.map((notification) =>
                        markAsRead(notification, category, readAt)
                    ),
                })),
            };
        }
    );
}

export function markNotificationReadInCache(
    queryClient: QueryClient,
    id: string
) {
    const readAt = new Date().toISOString();

    queryClient.setQueryData<NotificationItem[]>(
        [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.PREVIEW],
        (old = []) =>
            old.map((notification) =>
                notification.id === id
                    ? { ...notification, isRead: true, readAt }
                    : notification
            )
    );

    queryClient.setQueriesData<InfiniteData<NotificationListResponse>>(
        { queryKey: [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.LIST] },
        (old) => {
            if (!old || !Array.isArray(old.pages)) return old;

            return {
                ...old,
                pages: old.pages.map((page) => ({
                    ...page,
                    data: page.data.map((notification) =>
                        notification.id === id
                            ? { ...notification, isRead: true, readAt }
                            : notification
                    ),
                })),
            };
        }
    );
}
