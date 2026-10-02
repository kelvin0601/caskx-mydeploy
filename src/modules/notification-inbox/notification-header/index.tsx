"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TNotificationCategory } from "@/lib/constants/notification";
import IconReadAll from "@/components/shared/icons/icon-read-all";
import IconSetting from "@/components/shared/icons/icon-settings";
import LinkCustom from "@/components/shared/link-custom";
import { ROUTE_PUBLIC } from "@/lib/constants";

import { cn } from "@/lib/utils";

type TNotificationHeaderProps = {
    activeTab: TNotificationCategory;
    unreadCount: number;
    showUnreadOnly: boolean;
    isMarkingAllRead?: boolean;
    onToggleUnreadOnly: (value: boolean) => void;
    onMarkAllRead: () => void;
};

const TAB_TITLES: Record<
    TNotificationCategory,
    { title: string; description: string }
> = {
    all: {
        title: "All Notifications",
        description:
            "Stay updated with your marketplace activity, transactions, and account updates.",
    },
    buying: {
        title: "Buying",
        description:
            "Track your purchases, payments, and order status updates.",
    },
    market: {
        title: "Market",
        description:
            "Stay informed about price changes, market trends, and trading opportunities.",
    },
    account: {
        title: "Account",
        description:
            "Receive updates about your account security, profile changes, and verification status.",
    },
    system: {
        title: "System",
        description:
            "Get notified about platform updates, maintenance, and important announcements.",
    },
};

export default function NotificationHeader({
    activeTab,
    unreadCount,
    showUnreadOnly,
    isMarkingAllRead,
    onToggleUnreadOnly,
    onMarkAllRead,
}: TNotificationHeaderProps) {
    const { title, description } = TAB_TITLES[activeTab];
    const isMarkAllDisabled = Boolean(isMarkingAllRead || unreadCount === 0);

    return (
        <div className="flex flex-col gap-6 pb-8 tb:px-5 tb:pb-6 mb:gap-4 mb:px-4">
            {/* Title Row */}
            <div className="flex items-end justify-between gap-4 tb:flex-col tb:items-start tb:gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="font-reckless text-3xl font-medium leading-none text-typo-primary tb:text-2xl mb:text-xl">
                        {title}
                    </h2>
                    <p className="text-sm leading-relaxed text-typo-soft">
                        {description}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mb:w-full">
                    {/* Unread Toggle */}
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={showUnreadOnly}
                            onCheckedChange={onToggleUnreadOnly}
                        />
                        <span className="text-sm font-medium text-typo-primary">
                            Unread only
                        </span>
                    </div>

                    {/* Mark All Read */}
                    <button
                        type="button"
                        disabled={isMarkAllDisabled}
                        className={cn(
                            "flex items-center gap-2 text-sm font-medium text-typo-primary transition-colors",
                            isMarkAllDisabled
                                ? "cursor-not-allowed opacity-40"
                                : "cursor-pointer hover:text-typo-soft"
                        )}
                        onClick={onMarkAllRead}
                    >
                        <div className="size-4 text-typo-soft">
                            <IconReadAll />
                        </div>
                        <span>
                            {isMarkingAllRead ? "Marking..." : "Mark all read"}
                        </span>
                    </button>
                    <Button
                        variant={"empty"}
                        className="min-w-0 cursor-pointer p-0 mb:ml-auto"
                        asChild
                    >
                        <LinkCustom href={ROUTE_PUBLIC.SETTINGS_NOTIFICATION}>
                            <div className="size-6 text-icon-main">
                                <IconSetting />
                            </div>
                        </LinkCustom>
                    </Button>
                </div>
            </div>
        </div>
    );
}
