import React from "react";
import { Shield, ShoppingCart, TrendingUp } from "lucide-react";
import { IconBell } from "@/components/shared/icons/icon-bell";
import { cn, formatTimeAgo } from "@/lib/utils";

export type TDropdownNotification = {
    id: string;
    type?: string;
    category?: string;
    title: string;
    description?: string;
    message?: string;
    time?: string;
    createdAt?: string;
    read?: boolean;
    isRead?: boolean;
};

type TNotificationDropdownItemProps = {
    notification: TDropdownNotification;
    onClick?: () => void;
    isClickable?: boolean;
};

const getIcon = (type?: string, category?: string) => {
    const key = (category || type || "").toLowerCase();
    switch (key) {
        case "transaction":
        case "payment":
        case "buying":
            return <ShoppingCart className="h-5 w-5 text-typo-dark-soft" />;
        case "account":
        case "security":
            return <Shield className="h-5 w-5 text-typo-dark-soft" />;
        case "marketplace":
        case "market":
            return <TrendingUp className="h-5 w-5 text-typo-dark-soft" />;
        default:
            return <IconBell className="h-5 w-5 text-typo-dark-soft" />;
    }
};

export default function NotificationDropdownItem({
    notification,
    onClick,
    isClickable,
}: TNotificationDropdownItemProps) {
    const isRead = notification.isRead ?? notification.read ?? false;
    const canClick = isClickable ?? Boolean(onClick);
    const description = notification.message || notification.description || "";
    const timeDisplay =
        notification.time || formatTimeAgo(notification.createdAt);

    return (
        <div
            role={canClick ? "button" : undefined}
            tabIndex={canClick ? 0 : undefined}
            onClick={canClick ? onClick : undefined}
            onKeyDown={
                canClick
                    ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onClick?.();
                          }
                      }
                    : undefined
            }
            className={cn(
                "flex items-start gap-4 border-b border-bd-brown p-4 transition-colors last:border-b-0",
                canClick
                    ? "cursor-pointer hover:bg-bg-dark-sf4 focus-visible:bg-bg-dark-sf4 focus-visible:outline-none"
                    : "cursor-default",
                !isRead ? "bg-white/10" : ""
            )}
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-bg-dark-sf4">
                {getIcon(notification.type, notification.category)}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 tb:gap-0">
                <div className="flex w-full items-start justify-between">
                    <p className="font-inter text-sm font-medium text-typo-dark-primary">
                        {notification.title}
                    </p>
                    <div className="ml-2 flex shrink-0 items-center gap-[0.3125rem] text-typo-dark-soft">
                        {!isRead ? (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
                        ) : null}
                        {timeDisplay ? (
                            <span
                                title={
                                    notification.createdAt
                                        ? new Date(
                                              notification.createdAt
                                          ).toLocaleString()
                                        : undefined
                                }
                                className="whitespace-nowrap font-inter text-xs font-normal leading-[1.2] text-typo-dark-soft"
                            >
                                {timeDisplay}
                            </span>
                        ) : null}
                    </div>
                </div>
                {description ? (
                    <p className="truncate font-inter text-sm font-normal text-typo-dark-soft">
                        {description}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
