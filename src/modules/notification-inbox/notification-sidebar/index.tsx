"use client";

import { cn } from "@/lib/utils";
import {
    NOTIFICATION_TABS,
    TNotificationCategory,
} from "@/lib/constants/notification";

type TNotificationSidebarProps = {
    activeTab: TNotificationCategory;
    onTabChange: (tab: TNotificationCategory) => void;
};

export default function NotificationSidebar({
    activeTab,
    onTabChange,
}: TNotificationSidebarProps) {
    return (
        <div className="flex w-full flex-col border-b border-bd-main tb:flex-row tb:overflow-x-auto mb:flex-col">
            {/* Title */}
            <div className="border-b border-bd-main px-6 py-4 tb:hidden">
                <h2 className="font-reckless text-xl font-medium leading-none text-typo-primary">
                    Notifications
                </h2>
            </div>

            {/* Tabs */}
            {NOTIFICATION_TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const Icon = tab.Icon;
                return (
                    <button
                        key={tab.key}
                        type="button"
                        className={cn(
                            "flex items-center gap-2 border-b border-bd-main px-6 py-4 text-left transition-colors tb:flex-1 tb:justify-center tb:px-4 tb:py-3",
                            isActive
                                ? "text-typo-primary"
                                : "text-typo-sub hover:text-typo-primary"
                        )}
                        onClick={() => onTabChange(tab.key)}
                    >
                        <div className="h-4 w-4 shrink-0">
                            <Icon className="h-4 w-4" />
                        </div>
                        <span className="whitespace-nowrap text-sm font-semibold">
                            {tab.label}
                        </span>
                        {isActive && (
                            <div className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-typo-primary tb:hidden" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
