"use client";

import { useEffect, useRef } from "react";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { env } from "@/config/env";
import { NOTIFICATION_KEYS, PATH_NOTIFICATIONS } from "@/lib/constants";
import {
    NotificationItem,
    NotificationListResponse,
    NotificationUnreadCountResponse,
} from "@/types/notification";
import browserNotificationService from "@/services/browser-notification";
import { resolveActionHref } from "@/modules/notification-inbox/mapping";

function isInfiniteNotificationData(
    data: NotificationListResponse | InfiniteData<NotificationListResponse>
): data is InfiniteData<NotificationListResponse> {
    return "pages" in data && Array.isArray(data.pages);
}

export function useNotificationStream(accessToken: string | null) {
    const queryClient = useQueryClient();
    const abortCtrlRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!accessToken) return;

        const controller = new AbortController();
        abortCtrlRef.current = controller;

        // Swagger endpoint: /api/notifications/unread-count/stream
        const streamUrl = `${process.env.NEXT_PUBLIC_DOMAIN_TEST}${PATH_NOTIFICATIONS}/unread-count/stream`;

        fetchEventSource(streamUrl, {
            method: "GET",
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,

            // When connection succeeds or reconnects after being offline:
            onopen: async (response) => {
                console.log("response_________", response);
                if (response.ok) {
                    // Revalidate queries to synchronize any notifications missed while disconnected
                    queryClient.invalidateQueries({
                        queryKey: [
                            NOTIFICATION_KEYS.ROOT,
                            NOTIFICATION_KEYS.UNREAD_COUNT,
                        ],
                    });
                    queryClient.invalidateQueries({
                        queryKey: [
                            NOTIFICATION_KEYS.ROOT,
                            NOTIFICATION_KEYS.PREVIEW,
                        ],
                    });
                    queryClient.invalidateQueries({
                        queryKey: [
                            NOTIFICATION_KEYS.ROOT,
                            NOTIFICATION_KEYS.LIST,
                        ],
                    });
                }
            },

            // Handle incoming SSE stream events
            onmessage: (event) => {
                if (!event.data) return;

                try {
                    const parsed = JSON.parse(event.data);

                    switch (event.event) {
                        // 1. Unread count update event (e.g. event: unread-count, data: {"unreadCount": 593})
                        case "unread-count": {
                            const newCount = parsed.unreadCount;
                            const previous =
                                queryClient.getQueryData<NotificationUnreadCountResponse>(
                                    [
                                        NOTIFICATION_KEYS.ROOT,
                                        NOTIFICATION_KEYS.UNREAD_COUNT,
                                    ]
                                );

                            queryClient.setQueryData<NotificationUnreadCountResponse>(
                                [
                                    NOTIFICATION_KEYS.ROOT,
                                    NOTIFICATION_KEYS.UNREAD_COUNT,
                                ],
                                {
                                    unreadCount: newCount,
                                }
                            );

                            // Invalidate preview and list queries when count changes to fetch fresh notifications
                            if (
                                previous === undefined ||
                                previous.unreadCount !== newCount
                            ) {
                                queryClient.invalidateQueries({
                                    queryKey: [
                                        NOTIFICATION_KEYS.ROOT,
                                        NOTIFICATION_KEYS.PREVIEW,
                                    ],
                                });
                                queryClient.invalidateQueries({
                                    queryKey: [
                                        NOTIFICATION_KEYS.ROOT,
                                        NOTIFICATION_KEYS.LIST,
                                    ],
                                });
                            }
                            break;
                        }

                        // 2. New notification created event
                        case "notification-created": {
                            const newNotification: NotificationItem =
                                parsed.notification;

                            // A. Update header preview dropdown (keep maximum of 5 items)
                            queryClient.setQueryData<NotificationItem[]>(
                                [
                                    NOTIFICATION_KEYS.ROOT,
                                    NOTIFICATION_KEYS.PREVIEW,
                                ],
                                (old = []) => {
                                    const filtered = old.filter(
                                        (item) => item.id !== newNotification.id
                                    );
                                    return [newNotification, ...filtered].slice(
                                        0,
                                        5
                                    );
                                }
                            );

                            // B. Update notifications listing page (/notifications)
                            queryClient.setQueriesData<
                                | NotificationListResponse
                                | InfiniteData<NotificationListResponse>
                            >(
                                {
                                    queryKey: [
                                        NOTIFICATION_KEYS.ROOT,
                                        NOTIFICATION_KEYS.LIST,
                                    ],
                                },
                                (oldData) => {
                                    if (!oldData) return oldData;

                                    if (isInfiniteNotificationData(oldData)) {
                                        return {
                                            ...oldData,
                                            pages: oldData.pages.map(
                                                (page, index) => {
                                                    if (index === 0) {
                                                        const filtered =
                                                            page.data.filter(
                                                                (item) =>
                                                                    item.id !==
                                                                    newNotification.id
                                                            );
                                                        return {
                                                            ...page,
                                                            data: [
                                                                newNotification,
                                                                ...filtered,
                                                            ],
                                                            totalRecords:
                                                                page.totalRecords +
                                                                1,
                                                        };
                                                    }
                                                    return {
                                                        ...page,
                                                        totalRecords:
                                                            page.totalRecords +
                                                            1,
                                                    };
                                                }
                                            ),
                                        };
                                    }

                                    if (oldData.page === 1) {
                                        const filtered = oldData.data.filter(
                                            (item) =>
                                                item.id !== newNotification.id
                                        );
                                        return {
                                            ...oldData,
                                            data: [
                                                newNotification,
                                                ...filtered,
                                            ].slice(0, oldData.size),
                                            totalRecords:
                                                oldData.totalRecords + 1,
                                        };
                                    }

                                    return {
                                        ...oldData,
                                        totalRecords: oldData.totalRecords + 1,
                                    };
                                }
                            );

                            // C. Dispatch native browser push notification
                            const actionHref =
                                resolveActionHref(newNotification);
                            browserNotificationService.sendNotification(
                                newNotification.title,
                                {
                                    body: newNotification.message,
                                    url: actionHref || "/notifications",
                                    tag: newNotification.id,
                                }
                            );
                            break;
                        }

                        // 3. Synchronize single notification read state
                        case "notification-read": {
                            const { id, readAt } = parsed;

                            queryClient.setQueryData<NotificationItem[]>(
                                [
                                    NOTIFICATION_KEYS.ROOT,
                                    NOTIFICATION_KEYS.PREVIEW,
                                ],
                                (old = []) =>
                                    old.map((item) =>
                                        item.id === id
                                            ? { ...item, isRead: true, readAt }
                                            : item
                                    )
                            );

                            queryClient.setQueriesData<
                                | NotificationListResponse
                                | InfiniteData<NotificationListResponse>
                            >(
                                {
                                    queryKey: [
                                        NOTIFICATION_KEYS.ROOT,
                                        NOTIFICATION_KEYS.LIST,
                                    ],
                                },
                                (oldData) => {
                                    if (!oldData) return oldData;

                                    if (isInfiniteNotificationData(oldData)) {
                                        return {
                                            ...oldData,
                                            pages: oldData.pages.map(
                                                (page) => ({
                                                    ...page,
                                                    data: page.data.map(
                                                        (item) =>
                                                            item.id === id
                                                                ? {
                                                                      ...item,
                                                                      isRead: true,
                                                                      readAt,
                                                                  }
                                                                : item
                                                    ),
                                                })
                                            ),
                                        };
                                    }

                                    return {
                                        ...oldData,
                                        data: oldData.data.map((item) =>
                                            item.id === id
                                                ? {
                                                      ...item,
                                                      isRead: true,
                                                      readAt,
                                                  }
                                                : item
                                        ),
                                    };
                                }
                            );
                            break;
                        }

                        // 4. Synchronize mark-all-as-read state
                        case "notifications-read-all": {
                            const { category, readAt } = parsed;

                            queryClient.setQueryData<NotificationItem[]>(
                                [
                                    NOTIFICATION_KEYS.ROOT,
                                    NOTIFICATION_KEYS.PREVIEW,
                                ],
                                (old = []) =>
                                    old.map((item) =>
                                        !category || item.category === category
                                            ? { ...item, isRead: true, readAt }
                                            : item
                                    )
                            );

                            queryClient.setQueriesData<
                                | NotificationListResponse
                                | InfiniteData<NotificationListResponse>
                            >(
                                {
                                    queryKey: [
                                        NOTIFICATION_KEYS.ROOT,
                                        NOTIFICATION_KEYS.LIST,
                                    ],
                                },
                                (oldData) => {
                                    if (!oldData) return oldData;

                                    if (isInfiniteNotificationData(oldData)) {
                                        return {
                                            ...oldData,
                                            pages: oldData.pages.map(
                                                (page) => ({
                                                    ...page,
                                                    data: page.data.map(
                                                        (item) =>
                                                            !category ||
                                                            item.category ===
                                                                category
                                                                ? {
                                                                      ...item,
                                                                      isRead: true,
                                                                      readAt,
                                                                  }
                                                                : item
                                                    ),
                                                })
                                            ),
                                        };
                                    }

                                    return {
                                        ...oldData,
                                        data: oldData.data.map((item) =>
                                            !category ||
                                            item.category === category
                                                ? {
                                                      ...item,
                                                      isRead: true,
                                                      readAt,
                                                  }
                                                : item
                                        ),
                                    };
                                }
                            );
                            break;
                        }

                        // 5. Default handler for un-named message events containing unreadCount
                        default: {
                            if (typeof parsed.unreadCount === "number") {
                                queryClient.setQueryData<NotificationUnreadCountResponse>(
                                    [
                                        NOTIFICATION_KEYS.ROOT,
                                        NOTIFICATION_KEYS.UNREAD_COUNT,
                                    ],
                                    {
                                        unreadCount: parsed.unreadCount,
                                    }
                                );
                            }
                            break;
                        }
                    }
                } catch (error) {
                    console.error(
                        "Failed to parse SSE notification payload:",
                        error
                    );
                }
            },

            onerror: (err) => {
                if (controller.signal.aborted) return;
                // Automatically retry; do not close stream unless component unmounts
                console.warn(
                    "Notification SSE connection error. Reconnecting...",
                    err
                );
            },
        });

        return () => {
            // Abort connection when accessToken changes or component unmounts
            controller.abort();
        };
    }, [accessToken, queryClient]);
}
