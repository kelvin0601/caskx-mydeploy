import NotificationLayout from "@/layouts/NotificationLayout";
import { NotificationProvider } from "@/modules/notification-inbox/provider";
import React, { Suspense } from "react";

export default function NotificationsInboxLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense>
            <NotificationProvider>
                <NotificationLayout>{children}</NotificationLayout>
            </NotificationProvider>
        </Suspense>
    );
}
