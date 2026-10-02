"use client";

import { TNotificationGroup } from "@/lib/constants/notification";
import NotificationItem from "../notification-item";

type TNotificationGroupProps = {
    group: TNotificationGroup;
    markingId?: string;
    onMarkAsRead?: (id: string) => void;
};

export default function NotificationGroup({
    group,
    markingId,
    onMarkAsRead,
}: TNotificationGroupProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* Date Group Header */}
            <h3 className="font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                {group.label}
            </h3>

            {/* Notification Items Container */}
            <div className="flex flex-col border-t border-bd-main">
                {group.items.map((item) => (
                    <NotificationItem
                        key={item.id}
                        notification={item}
                        isMarkingRead={markingId === item.id}
                        onMarkAsRead={onMarkAsRead}
                    />
                ))}
            </div>
        </div>
    );
}
