import {
    markNotificationReadInCache,
    markNotificationsReadInCache,
} from "@/modules/notification-inbox/cache";
import { NOTIFICATION_KEYS } from "@/lib/constants/key";
import {
    NotificationCategory,
    NotificationItem,
    NotificationListResponse,
} from "@/types/notification";
import { InfiniteData, QueryClient } from "@tanstack/react-query";

const createNotification = (
    id: string,
    category: NotificationCategory,
    isRead = false
): NotificationItem => ({
    id,
    category,
    eventType: "TEST_EVENT",
    title: "Test notification",
    message: "Test message",
    relatedItemType: null,
    relatedItemId: null,
    isRead,
    readAt: null,
    createdAt: "2026-09-11T00:00:00.000Z",
});

function seedNotificationCache(queryClient: QueryClient) {
    const transaction = createNotification(
        "transaction",
        NotificationCategory.TRANSACTION
    );
    const marketplace = createNotification(
        "marketplace",
        NotificationCategory.MARKETPLACE
    );

    queryClient.setQueryData<NotificationItem[]>(
        [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.PREVIEW],
        [transaction, marketplace]
    );
    queryClient.setQueryData<InfiniteData<NotificationListResponse>>(
        [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.LIST, { size: 30 }],
        {
            pages: [
                {
                    data: [transaction, marketplace],
                    totalRecords: 2,
                    page: 1,
                    size: 30,
                    totalPages: 1,
                },
            ],
            pageParams: [1],
        }
    );
}

describe("notification cache synchronization", () => {
    it("marks only the selected category read in both inbox and dropdown caches", () => {
        const queryClient = new QueryClient();
        seedNotificationCache(queryClient);

        markNotificationsReadInCache(
            queryClient,
            NotificationCategory.TRANSACTION
        );

        const preview = queryClient.getQueryData<NotificationItem[]>([
            NOTIFICATION_KEYS.ROOT,
            NOTIFICATION_KEYS.PREVIEW,
        ]);
        const list = queryClient.getQueryData<
            InfiniteData<NotificationListResponse>
        >([NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.LIST, { size: 30 }]);

        expect(preview?.map(({ id, isRead }) => ({ id, isRead }))).toEqual([
            { id: "transaction", isRead: true },
            { id: "marketplace", isRead: false },
        ]);
        expect(
            list?.pages[0].data.map(({ id, isRead }) => ({ id, isRead }))
        ).toEqual([
            { id: "transaction", isRead: true },
            { id: "marketplace", isRead: false },
        ]);
    });

    it("keeps inbox and dropdown caches aligned when one notification is read", () => {
        const queryClient = new QueryClient();
        seedNotificationCache(queryClient);

        markNotificationReadInCache(queryClient, "marketplace");

        const preview = queryClient.getQueryData<NotificationItem[]>([
            NOTIFICATION_KEYS.ROOT,
            NOTIFICATION_KEYS.PREVIEW,
        ]);
        const list = queryClient.getQueryData<
            InfiniteData<NotificationListResponse>
        >([NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.LIST, { size: 30 }]);

        expect(preview?.[1].isRead).toBe(true);
        expect(list?.pages[0].data[1].isRead).toBe(true);
    });
});
