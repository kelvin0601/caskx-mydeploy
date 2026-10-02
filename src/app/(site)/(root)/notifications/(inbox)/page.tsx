import { PAGE_METADATA } from "@/lib/constants/metadata";
import NotificationInbox from "@/modules/notification-inbox";

export const metadata = PAGE_METADATA.NOTIFICATIONS;

export default function NotificationsPage() {
    return <NotificationInbox />;
}
