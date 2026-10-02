"use client";

import ClipPathTransition from "@/components/shared/animation/clip-path-transition";
import { IconBell } from "@/components/shared/icons/icon-bell";
import NotificationDropdownItem from "@/components/shared/notification-dropdown-item";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import useClickOutSide from "@/hooks/useClickOutSide";
import { HeaderActionIcon } from "@/layouts/Header/header-action-icon";
import { NOTIFICATION_KEYS } from "@/lib/constants/key";
import { ROUTE_AUTH, ROUTE_PUBLIC } from "@/lib/constants/route";
import { cn } from "@/lib/utils";
import { resolveActionHref } from "@/modules/notification-inbox/mapping";
import {
    markNotificationReadInCache,
    markNotificationsReadInCache,
} from "@/modules/notification-inbox/cache";
import notificationService from "@/services/notification";
import {
    NotificationItem,
    NotificationUnreadCountResponse,
} from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, BellRing, CheckCheck } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useBrowserNotification } from "@/hooks/useBrowserNotification";
import browserNotificationService from "@/services/browser-notification";

export default function NotificationDropdown({
    className,
}: {
    className?: string;
}) {
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const {
        isSupported,
        permission,
        isEnabled,
        requestPermission,
        toggleEnabled,
        sendNotification,
    } = useBrowserNotification();

    const { isAuthenticated, status, accessToken } = useAuth();
    const isReadyToFetch = Boolean(
        isAuthenticated || accessToken || status === "authenticated"
    );
    const isAuthLoading = status === "loading";

    useClickOutSide(() => setIsOpen(false), containerRef);

    // 1. Unread count query (poll every 30s)
    const { data: unreadData } = useQuery({
        queryKey: [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.UNREAD_COUNT],
        queryFn: () => notificationService.getUnreadCount(),
        enabled: isReadyToFetch,
        refetchInterval: 30000,
    });

    // 2. Preview 5 latest notifications (poll every 30s)
    const {
        data: previewList = [],
        isLoading,
        isPending,
    } = useQuery({
        queryKey: [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.PREVIEW],
        queryFn: () => notificationService.getPreview(5),
        enabled: isReadyToFetch,
        refetchInterval: 30000,
    });

    // Track previously seen notifications to notify only on genuinely new items
    const seenIdsRef = useRef<Set<string> | null>(null);

    useEffect(() => {
        if (!previewList || previewList.length === 0) return;

        if (seenIdsRef.current === null) {
            seenIdsRef.current = new Set(previewList.map((n) => n.id));
            return;
        }

        for (const notif of previewList) {
            if (!seenIdsRef.current.has(notif.id) && !notif.isRead) {
                seenIdsRef.current.add(notif.id);
                if (browserNotificationService.isEnabled()) {
                    const actionHref = resolveActionHref(notif);
                    sendNotification(notif.title, {
                        body: notif.message,
                        url: actionHref || "/notifications",
                        tag: notif.id,
                    });
                }
            }
        }
    }, [previewList, sendNotification]);

    const unreadCount = unreadData?.unreadCount ?? 0;
    const hasNotification = unreadCount > 0;
    const hasPreviewNotifications = isReadyToFetch && previewList.length > 0;

    const filteredNotifications = useMemo(() => {
        if (!unreadOnly) return previewList;
        return previewList.filter((n) => !n.isRead);
    }, [previewList, unreadOnly]);

    // 3. Mutation: Mark single notification as read (Optimistic Update)
    const markReadMutation = useMutation({
        mutationFn: (id: string) => notificationService.markRead(id),
        onMutate: async (id: string) => {
            markNotificationReadInCache(queryClient, id);

            // Decrement unread count
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

    // 4. Mutation: Mark all notifications as read (Optimistic Update)
    const markAllReadMutation = useMutation({
        mutationFn: () => notificationService.markAllRead(),
        onMutate: async () => {
            markNotificationsReadInCache(queryClient);

            // Reset unread count to 0
            queryClient.setQueryData<NotificationUnreadCountResponse>(
                [NOTIFICATION_KEYS.ROOT, NOTIFICATION_KEYS.UNREAD_COUNT],
                { unreadCount: 0 }
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

    const handleItemClick = (notification: NotificationItem) => {
        if (!notification.isRead) {
            markReadMutation.mutate(notification.id);
        }
        setIsOpen(false);
        const href = resolveActionHref(notification);
        if (href) {
            window.open(href, "_blank", "noopener,noreferrer");
        }
    };

    const handleMarkAllRead = () => {
        markAllReadMutation.mutate();
    };

    return (
        <div
            ref={containerRef}
            className="relative z-50 flex h-full items-center"
        >
            <HeaderActionIcon
                aria-label={
                    isOpen ? "Close notifications" : "Open notifications"
                }
                icon={<IconBell />}
                className={cn("border-r", className)}
                hasNotification={hasNotification}
                isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
            />
            <div>
                <ClipPathTransition
                    isOpen={isOpen}
                    className="absolute right-0 top-full z-50 w-[26.2rem] overflow-hidden rounded-md border border-bd-brown bg-bg-dark-main p-0 shadow-[0px_3px_8px_0px_rgba(23,0,0,0.1),0px_4px_6px_0px_rgba(15,0,0,0.1)] tb:-right-[3.25rem] tb:w-[23.125rem] mb:-right-16 mb:w-[calc(100vw)]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-bd-brown px-4 py-3">
                        <div className="flex items-center gap-2">
                            <p className="font-inter text-lg font-semibold text-typo-dark-primary tb:text-base">
                                Notifications
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isSupported && permission === "granted" && (
                                <button
                                    type="button"
                                    title={
                                        isEnabled
                                            ? "Browser notifications active (click to mute)"
                                            : "Browser notifications muted (click to unmute)"
                                    }
                                    aria-label="Toggle browser notifications"
                                    onClick={() => toggleEnabled(!isEnabled)}
                                    className="text-icon-dark-main transition-colors hover:text-typo-dark-primary"
                                >
                                    {isEnabled ? (
                                        <Bell className="h-4 w-4 text-brand" />
                                    ) : (
                                        <BellOff className="h-4 w-4 opacity-50" />
                                    )}
                                </button>
                            )}
                            <div className="flex items-center gap-1">
                                <Switch
                                    aria-label="Show unread notifications only"
                                    mode="dark"
                                    variant="default"
                                    checked={unreadOnly}
                                    onCheckedChange={setUnreadOnly}
                                />
                                <p className="font-inter text-xs font-medium text-typo-dark-soft">
                                    Unread only
                                </p>
                            </div>
                            <button
                                type="button"
                                title="Mark all as read"
                                aria-label="Mark all notifications as read"
                                disabled={
                                    unreadCount === 0 ||
                                    markAllReadMutation.isPending
                                }
                                onClick={handleMarkAllRead}
                                className={cn(
                                    "text-icon-dark-main transition-colors",
                                    unreadCount === 0 ||
                                        markAllReadMutation.isPending
                                        ? "cursor-not-allowed opacity-40"
                                        : "cursor-pointer hover:text-typo-dark-primary"
                                )}
                            >
                                <CheckCheck className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Browser Push Notifications Permission Prompt */}
                    {isSupported && permission === "default" && (
                        <div className="bg-white/5 flex items-center justify-between border-b border-bd-brown px-4 py-2">
                            <div className="flex items-center gap-2">
                                <BellRing className="h-4 w-4 shrink-0 text-brand" />
                                <span className="font-inter text-xs text-typo-dark-primary">
                                    Enable desktop push notifications
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={requestPermission}
                                className="h-auto rounded-none border-none px-2.5 py-1 font-inter text-xs font-medium outline-none focus-visible:outline-none"
                            >
                                Enable
                            </Button>
                        </div>
                    )}

                    {/* Notification List */}
                    <ScrollArea className="flex max-h-[25rem] flex-col">
                        {isAuthLoading ? (
                            <div className="flex flex-col">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-4 border-b border-bd-brown p-4 last:border-b-0"
                                    >
                                        <Skeleton className="h-10 w-10 shrink-0 rounded bg-bg-dark-sf4" />
                                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <Skeleton className="h-4 w-32 bg-bg-dark-sf4" />
                                                <Skeleton className="h-3 w-12 bg-bg-dark-sf4" />
                                            </div>
                                            <Skeleton className="h-3 w-48 bg-bg-dark-sf4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !isReadyToFetch ? (
                            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                                <p className="font-inter text-sm text-typo-dark-sub">
                                    Sign in to view your notifications.
                                </p>
                                <Button asChild size="sm" variant="default">
                                    <Link
                                        href={ROUTE_AUTH.LOGIN}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                </Button>
                            </div>
                        ) : (isLoading || isPending) &&
                          previewList.length === 0 ? (
                            <div className="flex flex-col">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-4 border-b border-bd-brown p-4 last:border-b-0"
                                    >
                                        <Skeleton className="h-10 w-10 shrink-0 rounded bg-bg-dark-sf4" />
                                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <Skeleton className="h-4 w-32 bg-bg-dark-sf4" />
                                                <Skeleton className="h-3 w-12 bg-bg-dark-sf4" />
                                            </div>
                                            <Skeleton className="h-3 w-48 bg-bg-dark-sf4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => {
                                const href = resolveActionHref(notification);
                                const isClickable =
                                    !notification.isRead || Boolean(href);
                                return (
                                    <NotificationDropdownItem
                                        key={notification.id}
                                        notification={notification}
                                        isClickable={isClickable}
                                        onClick={
                                            isClickable
                                                ? () =>
                                                      handleItemClick(
                                                          notification
                                                      )
                                                : undefined
                                        }
                                    />
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-sm text-typo-dark-sub">
                                {unreadOnly
                                    ? "No unread notifications."
                                    : "No notifications found."}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Footer */}
                    {hasPreviewNotifications ? (
                        <div className="flex flex-col items-center border-t border-bd-brown p-4">
                            <Button
                                asChild
                                variant="link"
                                className="text-typo-dark-primary [--text-color:hsl(var(--color-sand-dark))]"
                            >
                                <Link
                                    href={ROUTE_PUBLIC.NOTIFICATIONS}
                                    onClick={() => setIsOpen(false)}
                                >
                                    View All Notifications
                                </Link>
                            </Button>
                        </div>
                    ) : null}
                </ClipPathTransition>
            </div>
        </div>
    );
}
