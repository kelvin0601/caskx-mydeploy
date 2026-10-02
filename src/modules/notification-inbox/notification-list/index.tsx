"use client";

import { SentinelRef, useInfiniteScroll } from "@/hooks/useInfinite";
import { TNotificationGroup } from "@/lib/constants/notification";
import EmptyState from "./empty-state";
import NotificationGroup from "./notification-group";
import NotificationListSkeleton from "./notification-list-skeleton";
import NotificationPageSkeleton from "./notification-page-skeleton";

type TNotificationListProps = {
    groups: TNotificationGroup[];
    isLoading?: boolean;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    isUnreadOnly?: boolean;
    markingId?: string;
    onLoadMore?: () => void;
    onMarkAsRead?: (id: string) => void;
    sentinelRef?: SentinelRef<HTMLDivElement> | React.Ref<HTMLDivElement>;
};

export default function NotificationList({
    groups,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    isUnreadOnly,
    markingId,
    onLoadMore,
    onMarkAsRead,
    sentinelRef: externalSentinelRef,
}: TNotificationListProps) {
    const { sentinelRef: internalSentinelRef } = useInfiniteScroll({
        hasNextPage,
        isFetching: isFetchingNextPage,
        onLoadMore,
        disabled: Boolean(externalSentinelRef),
    });

    const sentinelRef = externalSentinelRef ?? internalSentinelRef;

    if (isLoading) {
        return <NotificationListSkeleton />;
    }

    if (groups.length === 0) {
        return <EmptyState isUnreadOnly={isUnreadOnly} />;
    }

    return (
        <div className="flex flex-col gap-8 tb:gap-6 tb:px-5 mb:px-4">
            {groups.map((group) => (
                <NotificationGroup
                    key={group.label}
                    group={group}
                    markingId={markingId}
                    onMarkAsRead={onMarkAsRead}
                />
            ))}

            {/* Incremental loading skeleton when fetching subsequent pages */}
            {isFetchingNextPage && <NotificationPageSkeleton />}

            {/* Scroll observer sentinel */}
            {hasNextPage && <div ref={sentinelRef} className="h-4 w-full" />}
        </div>
    );
}

export {
    EmptyState,
    NotificationGroup,
    NotificationListSkeleton,
    NotificationPageSkeleton,
};
