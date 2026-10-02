"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    TNotificationIcon,
    TNotificationItem,
    NOTIFICATION_ITEM_ICONS,
} from "@/lib/constants/notification";
import IconNotifSystem from "@/components/shared/icons/icon-notif-system";

type TNotificationItemProps = {
    notification: TNotificationItem;
    onMarkAsRead?: (id: string) => void;
    isMarkingRead?: boolean;
};

export default function NotificationItem({
    notification,
    onMarkAsRead,
    isMarkingRead,
}: TNotificationItemProps) {
    const router = useRouter();
    const {
        id,
        title,
        description,
        actionLabel,
        actionHref,
        timestamp,
        isRead,
        icon,
    } = notification;

    const isClickable = !isRead || Boolean(actionHref);

    const handleRowClick = () => {
        if (!isClickable) return;
        if (!isRead && onMarkAsRead && !isMarkingRead) {
            onMarkAsRead(id);
        }
        if (actionHref) {
            router.push(actionHref);
        }
    };

    return (
        <div
            onClick={isClickable ? handleRowClick : undefined}
            className={cn(
                "group/noti group flex gap-4 border-x border-b border-bd-main border-x-transparent px-4 py-6 transition-colors",
                isClickable
                    ? "cursor-pointer hover:border-bd-main hover:bg-bg-sf4"
                    : "cursor-default",
                "tb:px-0 tb:py-5",
                "mb:px-0 mb:py-4"
            )}
        >
            {/* Icon */}
            <div className="flex shrink-0 items-start pt-1">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-bg-sf4 tb:h-9 tb:w-9 mb:h-8 mb:w-8">
                    <div className="size-5 tb:size-4 mb:size-4">
                        <NotificationIcon icon={icon} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col gap-3 tb:relative">
                {/* Header Row */}
                <div>
                    <div className="flex items-start justify-between gap-2">
                        <p className="font-inter text-base font-medium leading-[1.5] text-typo-primary tb:text-sm mb:text-sm">
                            {title}
                        </p>
                        <div className="flex shrink-0 items-center gap-1.5 dk:relative">
                            {/* Unread: green dot */}
                            <div
                                className={cn(
                                    "flex flex-row items-center gap-[0.3125rem] pt-[0.3125rem] transition-all",
                                    !isRead &&
                                        onMarkAsRead &&
                                        "group-hover/noti:dk:opacity-0"
                                )}
                            >
                                {!isRead && (
                                    <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
                                )}
                                {/* Timestamp */}
                                <span
                                    title={
                                        notification.createdAt
                                            ? new Date(
                                                  notification.createdAt
                                              ).toLocaleString()
                                            : undefined
                                    }
                                    className="whitespace-nowrap font-inter text-xs font-normal leading-[1.2] text-typo-soft transition-all"
                                >
                                    {timestamp}
                                </span>
                            </div>
                            {/* Read icon - only shows on hover for unread items */}
                            {!isRead && onMarkAsRead && (
                                <button
                                    type="button"
                                    disabled={isMarkingRead}
                                    className={cn(
                                        "absolute right-0 top-0 items-center justify-center text-icon-main opacity-0 transition-colors group-hover/noti:dk:opacity-100 tb:bottom-0 tb:top-auto tb:opacity-100",
                                        isMarkingRead
                                            ? "pointer-events-none cursor-not-allowed opacity-40"
                                            : "cursor-pointer hover:text-typo-primary"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isMarkingRead) {
                                            onMarkAsRead(id);
                                        }
                                    }}
                                    aria-label="Mark as read"
                                >
                                    <ReadIcon className="h-6 w-6 tb:h-5 tb:w-5 mb:h-5 mb:w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="mt-0.5 line-clamp-2 font-inter text-sm font-normal text-typo-soft mb:max-w-[90%]">
                        {description}
                    </p>
                </div>
                {/* Action */}
                {actionLabel && actionHref && (
                    <div className="flex">
                        <Button asChild groupHover variant="link">
                            <Link
                                href={actionHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                        !isRead &&
                                        onMarkAsRead &&
                                        !isMarkingRead
                                    ) {
                                        onMarkAsRead(id);
                                    }
                                }}
                            >
                                {actionLabel}
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function NotificationIcon({ icon }: { icon: TNotificationIcon }) {
    const Icon = NOTIFICATION_ITEM_ICONS[icon] || IconNotifSystem;
    return (
        <Icon className="h-5 w-5 text-typo-primary tb:h-4 tb:w-4 mb:h-4 mb:w-4" />
    );
}

function ReadIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M17 7L8.0625 16L4 11.9091"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="square"
                strokeLinejoin="round"
            />
            <path
                d="M20 10L14.1667 16L13 14.8"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="square"
                strokeLinejoin="round"
            />
        </svg>
    );
}
