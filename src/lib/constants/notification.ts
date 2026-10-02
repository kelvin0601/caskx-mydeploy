import IconNotifAccount from "@/components/shared/icons/icon-notif-account";
import IconNotifAll from "@/components/shared/icons/icon-notif-all";
import IconNotifBuying from "@/components/shared/icons/icon-notif-buying";
import IconNotifMarket from "@/components/shared/icons/icon-notif-market";
import IconNotifSystem from "@/components/shared/icons/icon-notif-system";
import type { ComponentType } from "react";

export type TNotificationCategory =
    | "all"
    | "buying"
    | "market"
    | "account"
    | "system";

export type TNotificationIcon =
    | "shopping-cart"
    | "chart"
    | "shield"
    | "wallet"
    | "user"
    | "settings";

export const NOTIFICATION_ITEM_ICONS: Record<
    TNotificationIcon,
    ComponentType<{ className?: string }>
> = {
    "shopping-cart": IconNotifBuying,
    chart: IconNotifMarket,
    shield: IconNotifAccount,
    wallet: IconNotifBuying,
    user: IconNotifAccount,
    settings: IconNotifSystem,
};

export type TNotificationItem = {
    id: string;
    category: TNotificationCategory;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    timestamp: string;
    isRead: boolean;
    icon: TNotificationIcon;
    createdAt?: string;
};

export type TNotificationGroup = {
    label: string;
    items: TNotificationItem[];
};

export const NOTIFICATION_TABS: {
    key: TNotificationCategory;
    label: string;
    Icon: ComponentType<{ className?: string }>;
}[] = [
    { key: "all", label: "All", Icon: IconNotifAll },
    { key: "buying", label: "Buying", Icon: IconNotifBuying },
    { key: "market", label: "Market", Icon: IconNotifMarket },
    { key: "account", label: "Account", Icon: IconNotifAccount },
];
