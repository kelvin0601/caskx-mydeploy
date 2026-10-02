"use client";

import { Button } from "@/components/ui/button";
import { NOTIFICATION_KEYS } from "@/lib/constants";
import notificationService from "@/services/notification";
import {
    NotificationListResponse,
    NotificationUnreadCountResponse,
} from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useInfinite from "@/hooks/useInfinite";
import { useAuth } from "@/hooks/useAuth";
import { useCallback, useMemo } from "react";
import { TNotificationItem } from "@/lib/constants/notification";
import {
    markNotificationReadInCache,
    markNotificationsReadInCache,
} from "./cache";
import {
    groupNotificationsByDate,
    mapNotificationResponse,
    mapTabToBackendCategory,
} from "./mapping";
import NotificationHeader from "./notification-header";
import NotificationList from "./notification-list";
import { useNotification } from "./provider";

export default function NotificationInbox() {
    const { activeTab, showUnreadOnly, setShowUnreadOnly } = useNotification();
    const {
        isAuthenticated,
        status,
        accessToken,
        isLoading: isAuthLoading,
    } = useAuth();
    const queryClient = useQueryClient();

    // Map UI category tab to backend category filter
    const backendCategory = useMemo(
        () => mapTabToBackendCategory(activeTab),
        [activeTab]
    );

    // Ready to fetch if user is logged in via store, session token exists, or NextAuth is authenticated
    const isReadyToFetch = Boolean(
        isAuthenticated || accessToken || status === "authenticated"
    );

    // 1. Fetch notification list from server with scroll pagination via useInfinite
    const {
        data,
        isLoading,
        isPending,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        sentinelRef,
    } = useInfinite<NotificationListResponse>({
        queryKey: [
            NOTIFICATION_KEYS.ROOT,
            NOTIFICATION_KEYS.LIST,
            {
                category: backendCategory,
                isRead: showUnreadOnly ? false : undefined,
                size: 30,
            },
        ],
        queryFn: ({ pageParam = 1 }) =>
            notificationService.getList({
                category: backendCategory,
                isRead: showUnreadOnly ? false : undefined,
                page: pageParam,
                size: 30,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (!lastPage || !lastPage.data || lastPage.data.length === 0) {
                return undefined;
            }
            const currentPage = lastPage.page || 1;
            const totalPages = lastPage.totalPages || 0;
            if (currentPage < totalPages) {
                return currentPage + 1;
            }
            if (
                lastPage.data.length === (lastPage.size || 30) &&
                currentPage * (lastPage.size || 30) <
                    (lastPage.totalRecords || 0)
            ) {
                return currentPage + 1;
            }
            return undefined;
        },
        enabled: isReadyToFetch,
    });

    // 2. Fetch unread count for the header badge
    const { data: unreadData } = useQuery({
        queryKey: [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.UNREAD_COUNT],
        queryFn: () => notificationService.getUnreadCount(),
        enabled: isReadyToFetch,
    });

    // 3. Map backend response items to UI representation (deduplicated across all pages)
    const notifications = useMemo((): TNotificationItem[] => {
        if (!data?.pages) return [];
        const seen = new Set<string>();
        const list: TNotificationItem[] = [];
        for (const page of data.pages) {
            for (const item of page?.data || []) {
                if (!seen.has(item.id)) {
                    seen.add(item.id);
                    list.push(mapNotificationResponse(item));
                }
            }
        }
        return list;
    }, [data?.pages]);

    // 4. Group mapped notifications by date (Today, Yesterday, Earlier)
    const notificationGroups = useMemo(
        () => groupNotificationsByDate(notifications),
        [notifications]
    );

    // Calculate unread count (prefer unread count response with local fallback)
    const unreadCount =
        unreadData?.unreadCount ??
        notifications.filter((n) => !n.isRead).length;

    // 5. Mutation: Mark single notification as read (Optimistic Update)
    const markReadMutation = useMutation({
        mutationFn: (id: string) => notificationService.markRead(id),
        onMutate: async (id: string) => {
            markNotificationReadInCache(queryClient, id);

            // Decrement unread count in cache immediately
            queryClient.setQueryData<NotificationUnreadCountResponse>(
                [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.UNREAD_COUNT],
                (old) => ({
                    unreadCount: Math.max(0, (old?.unreadCount || 1) - 1),
                })
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    NOTIFICATION_KEYS.ROOT,
                    NOTIFICATION_KEYS.UNREAD_COUNT,
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.PREVIEW],
            });
            queryClient.invalidateQueries({
                queryKey: [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.LIST],
            });
        },
    });

    // 6. Mutation: Mark all notifications as read (Optimistic Update)
    const markAllReadMutation = useMutation({
        mutationFn: () => notificationService.markAllRead(backendCategory),
        onMutate: async () => {
            markNotificationsReadInCache(queryClient, backendCategory);

            // Reset unread count if all categories, or decrement
            if (!backendCategory) {
                queryClient.setQueryData<NotificationUnreadCountResponse>(
                    [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.UNREAD_COUNT],
                    { unreadCount: 0 }
                );
            }
        },
        onSuccess: ({ updated }) => {
            if (!backendCategory) return;

            queryClient.setQueryData<NotificationUnreadCountResponse>(
                [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.UNREAD_COUNT],
                (old) => ({
                    unreadCount: Math.max(0, (old?.unreadCount ?? 0) - updated),
                })
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    NOTIFICATION_KEYS.ROOT,
                    NOTIFICATION_KEYS.UNREAD_COUNT,
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.LIST],
            });
            queryClient.invalidateQueries({
                queryKey: [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.PREVIEW],
            });
        },
    });

    const handleMarkAsRead = useCallback(
        (id: string) => {
            markReadMutation.mutate(id);
        },
        [markReadMutation]
    );

    const handleMarkAllRead = useCallback(() => {
        markAllReadMutation.mutate();
    }, [markAllReadMutation]);

    // The list is loading if we don't have data yet, auth is pending, or query is fetching
    const isListLoading =
        !isError &&
        (!isReadyToFetch || isAuthLoading || isLoading || isPending || !data);

    return (
        <div className="flex w-full flex-col">
            <NotificationHeader
                activeTab={activeTab}
                unreadCount={unreadCount}
                showUnreadOnly={showUnreadOnly}
                isMarkingAllRead={markAllReadMutation.isPending}
                onToggleUnreadOnly={setShowUnreadOnly}
                onMarkAllRead={handleMarkAllRead}
            />

            {isError ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                    <p className="font-inter text-base font-medium text-typo-primary">
                        Failed to load notifications.
                    </p>
                    <Button variant="default" onClick={() => refetch()}>
                        Retry
                    </Button>
                </div>
            ) : (
                <NotificationList
                    groups={notificationGroups}
                    isLoading={isListLoading}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    isUnreadOnly={showUnreadOnly}
                    markingId={
                        markReadMutation.isPending
                            ? markReadMutation.variables
                            : undefined
                    }
                    onLoadMore={fetchNextPage}
                    onMarkAsRead={handleMarkAsRead}
                    sentinelRef={sentinelRef}
                />
            )}
        </div>
    );
}
