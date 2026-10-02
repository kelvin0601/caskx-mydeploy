import { Page } from "@playwright/test";
import { NotificationItem } from "@/types/notification";

export interface MockNotificationOptions {
    initialItems?: NotificationItem[];
    multiPage?: boolean;
}

export function createDefaultMockNotifications(): NotificationItem[] {
    const now = new Date();
    const todayDate = new Date(now.getTime() - 10 * 60 * 1000).toISOString(); // 10 mins ago (Today)
    const todayDate2 = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // 1 hr ago (Today)
    const yesterdayDate = new Date(
        now.getTime() - 25 * 60 * 60 * 1000
    ).toISOString(); // 25 hrs ago (Yesterday)
    const earlierDate = new Date(
        now.getTime() - 5 * 24 * 60 * 60 * 1000
    ).toISOString(); // 5 days ago (Earlier)

    return [
        {
            id: "notif-today-order",
            title: "Order Confirmed",
            message: "Your purchase of Highland Park 1990 has been confirmed.",
            category: "TRANSACTION",
            eventType: "PAYMENT_CONFIRMED",
            relatedItemType: "order",
            relatedItemId: "order-123",
            isRead: false,
            readAt: null,
            createdAt: todayDate,
        },
        {
            id: "notif-today-system",
            title: "System Maintenance Notice",
            message: "Scheduled maintenance will occur tonight at 2 AM UTC.",
            category: "SYSTEM",
            eventType: "SYSTEM_ALERT",
            relatedItemType: null,
            relatedItemId: null,
            isRead: false,
            readAt: null,
            createdAt: todayDate2,
        },
        {
            id: "notif-yesterday-bid",
            title: "New Bid Placed",
            message: "A new bid of $12,500 was placed on Macallan 1995.",
            category: "MARKETPLACE",
            eventType: "BID_PLACED",
            relatedItemType: "bid",
            relatedItemId: "bid-456",
            isRead: true,
            readAt: yesterdayDate,
            createdAt: yesterdayDate,
        },
        {
            id: "notif-yesterday-account",
            title: "Account Verified",
            message:
                "Your identity verification has been completed successfully.",
            category: "ACCOUNT",
            eventType: "ACCOUNT_VERIFIED",
            relatedItemType: null,
            relatedItemId: null,
            isRead: true,
            readAt: yesterdayDate,
            createdAt: yesterdayDate,
        },
        {
            id: "notif-earlier-info",
            title: "Platform Terms Updated",
            message:
                "Our terms of service and privacy policy have been updated.",
            category: "SYSTEM",
            eventType: "TERMS_UPDATE",
            relatedItemType: null,
            relatedItemId: null,
            isRead: true,
            readAt: earlierDate,
            createdAt: earlierDate,
        },
    ];
}

/**
 * Mocks notification-related API endpoints during E2E tests
 * with full interactive state for mark-as-read, filtering, and pagination.
 */
export async function mockNotificationApis(
    page: Page,
    options?: MockNotificationOptions
) {
    let notifications =
        options?.initialItems ?? createDefaultMockNotifications();

    // Mock whoami for fast and reliable user authentication in tests
    await page.route("**/api/auth/whoami*", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                id: "test-user-id",
                email: "test@example.com",
                firstName: "Test",
                lastName: "User",
                twoFactorMethods: [],
            }),
        });
    });

    // Prevent SSE connection from hanging test runs
    await page.route("**/unread-count/stream*", async (route) => {
        await route.abort();
    });

    // 1. Unread count endpoint
    await page.route("**/api/notifications/unread-count*", async (route) => {
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount }),
        });
    });

    // 2. Notifications preview endpoint (dropdown)
    await page.route("**/api/notifications/preview*", async (route) => {
        const url = new URL(route.request().url());
        const limit = Number(url.searchParams.get("previewLimit") || "5");
        const previewItems = notifications.slice(0, limit);
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(previewItems),
        });
    });

    // 3. Mark single notification as read
    await page.route("**/api/notifications/*/read*", async (route) => {
        if (route.request().method() === "PATCH") {
            const url = new URL(route.request().url());
            const parts = url.pathname.split("/");
            // Pattern: .../notifications/:id/read
            const readIndex = parts.indexOf("read");
            const notifId = readIndex > 0 ? parts[readIndex - 1] : "";

            const targetIndex = notifications.findIndex(
                (n) => n.id === notifId
            );
            if (targetIndex !== -1) {
                notifications[targetIndex] = {
                    ...notifications[targetIndex],
                    isRead: true,
                    readAt: new Date().toISOString(),
                };
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify(notifications[targetIndex]),
                });
                return;
            }
        }
        await route.fallback();
    });

    // 4. Mark all notifications as read
    await page.route("**/api/notifications/read-all*", async (route) => {
        if (route.request().method() === "PATCH") {
            notifications = notifications.map((n) => ({
                ...n,
                isRead: true,
                readAt: new Date().toISOString(),
            }));
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    updated: notifications.length,
                }),
            });
            return;
        }
        await route.fallback();
    });

    // 5. Notifications list pagination & filtering
    await page.route("**/api/notifications*", async (route) => {
        // Never intercept document navigations (Next.js page loads)
        if (route.request().resourceType() === "document") {
            return route.continue();
        }

        const url = new URL(route.request().url());
        if (
            url.pathname.endsWith("/unread-count") ||
            url.pathname.endsWith("/preview") ||
            url.pathname.includes("/read") ||
            url.pathname.includes("/stream")
        ) {
            return route.fallback();
        }
        const category = url.searchParams.get("category");
        const isRead = url.searchParams.get("isRead");
        const pageNum = Number(url.searchParams.get("page") || "1");
        const pageSize = options?.multiPage
            ? 2
            : Number(url.searchParams.get("size") || "30");

        let filtered = [...notifications];

        if (category) {
            filtered = filtered.filter(
                (n) => n.category.toUpperCase() === category.toUpperCase()
            );
        }

        if (isRead !== null && isRead !== undefined) {
            const isReadBool = isRead === "true";
            filtered = filtered.filter((n) => n.isRead === isReadBool);
        }

        const totalRecords = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
        const start = (pageNum - 1) * pageSize;
        const paginatedData = filtered.slice(start, start + pageSize);

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                data: paginatedData,
                page: pageNum,
                size: pageSize,
                totalRecords,
                totalPages,
            }),
        });
    });
}
