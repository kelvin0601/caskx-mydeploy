import { NotificationCategory, NotificationItem } from "@/types/notification";
import {
    TNotificationCategory,
    TNotificationGroup,
    TNotificationIcon,
    TNotificationItem,
} from "@/lib/constants/notification";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { formatTimeAgo, parseDate } from "@/lib/utils";

type NotificationAction = {
    label: string;
    resolveHref: (item: NotificationItem) => string | undefined;
};

const NO_NOTIFICATION_ACTION = null;

const NO_ACTION_EVENT_TYPES = new Set([
    "VERIFY_EMAIL",
    "FORGOT_PASSWORD",
    "PASSWORD_CHANGED",
    "TWO_FACTOR_AUTH_ENABLED",
    "TWO_FACTOR_AUTH_DISABLED",
    "PAYMENT_CREATED_BUYER",
    "SELLER_CONFIRMATION_FAILED_BUYER",
    "DEPOSIT_EXPIRED_BUYER",
    "PAYMENT_AGREEMENT_EXPIRED_BUYER",
    "PAYMENT_AGREEMENT_REJECTED_BUYER",
    "PAYMENT_AGREEMENT_ADMIN_REJECTED_BUYER",
    "REMAINING_PAYMENT_RECEIVED_BUYER",
    "REMAINING_PAYMENT_PROOF_RECEIVED_BUYER",
    "PAYMENT_FAILED_EXPIRATION_BUYER",
    "OWNERSHIP_TRANSFER_COMPLETED_SELLER",
    "PAYOUT_AGREEMENT_FINALIZED_SELLER",
    "PAYOUT_AGREEMENT_EXPIRED_SELLER",
    "PAYOUT_AGREEMENT_REJECTED_SELLER",
    "PAYOUT_AGREEMENT_ADMIN_REJECTED_SELLER",
    "PAYOUT_COMPLETED_SELLER",
    "PAYOUT_FAILED_PAYMENT_FAILURE_SELLER",
    "ASK_EXPIRED_SELLER",
    "BID_EXPIRED_BUYER",
]);

const metadataString = (
    item: NotificationItem,
    keys: string[]
): string | undefined => {
    for (const key of keys) {
        const value = item.metadata?.[key];
        if (typeof value === "string" && value.trim()) return value;
    }
    return undefined;
};

const relatedId = (item: NotificationItem, ...metadataKeys: string[]) =>
    metadataString(item, [...metadataKeys, "linkId"]) ??
    item.linkId ??
    item.relatedItemId ??
    undefined;

const checkoutHref = (item: NotificationItem) => {
    const id = relatedId(item, "checkoutSessionId", "checkoutId", "sessionId");
    return id ? `${ROUTE_PUBLIC.CHECKOUT}/${id}` : undefined;
};

const checkoutRelatedItemHref = (item: NotificationItem) =>
    item.relatedItemId
        ? `${ROUTE_PUBLIC.CHECKOUT}/${item.relatedItemId}`
        : undefined;

const receiptHref = (item: NotificationItem) => {
    const href = metadataString(item, [
        "receiptUrl",
        "receiptURL",
        "receiptLink",
        "receipt_url",
        "receipt_link",
    ]);
    if (!href) return undefined;
    return href.startsWith("/") || /^https?:\/\//.test(href) ? href : undefined;
};

const payoutHref = (item: NotificationItem) => {
    const payoutId = relatedId(item, "payoutId", "payout_id");
    return payoutId ? `${ROUTE_PUBLIC.PAYOUT}/${payoutId}` : undefined;
};

const EVENT_ACTIONS: Record<string, NotificationAction | null> = {
    WELCOME_ACCOUNT_VERIFIED: {
        label: "Browse Marketplace",
        resolveHref: () => ROUTE_PUBLIC.CASK_DETAILS,
    },
    NEW_LOGIN_DETECTED: {
        label: "Secure My Account",
        resolveHref: () => ROUTE_PUBLIC.SETTINGS_SECURITY,
    },
    DEPOSIT_PAYMENT_REQUIRED_BUYER: {
        label: "Deposit Now",
        resolveHref: checkoutHref,
    },
    AGREEMENT_READY_TO_SIGN_BUYER: {
        label: "Sign Now",
        resolveHref: checkoutRelatedItemHref,
    },
    AGREEMENT_REQUIRES_UPDATE_BUYER: {
        label: "Update Now",
        resolveHref: checkoutRelatedItemHref,
    },
    REMAINING_PAYMENT_REQUIRED_BUYER: {
        label: "Pay Now",
        resolveHref: checkoutHref,
    },
    REMAINING_PAYMENT_PROOF_UPDATE_BUYER: {
        label: "Upload Now",
        resolveHref: checkoutHref,
    },
    DEPOSIT_RECEIVED_BUYER: {
        label: "Download Receipt",
        resolveHref: receiptHref,
    },
    OWNERSHIP_TRANSFER_COMPLETED_BUYER: {
        label: "View Ownership Document",
        resolveHref: checkoutRelatedItemHref,
    },
    PAYOUT_CREATED_SELLER: {
        label: "Sign Now",
        resolveHref: (item) => {
            const askId = relatedId(item, "ask_id", "askId");
            return askId ? `${ROUTE_PUBLIC.PAYOUT}/${askId}` : undefined;
        },
    },
    PAYOUT_AGREEMENT_REQUIRES_UPDATE_SELLER: {
        label: "Update Now",
        resolveHref: payoutHref,
    },
    ASK_NEAR_BID_BUYING: {
        label: "View Listing",
        resolveHref: (item) => {
            const bidId = metadataString(item, ["bidId"]);
            return bidId ? `${ROUTE_PUBLIC.OFFER_DETAIL}/${bidId}` : undefined;
        },
    },
    BID_NEAR_ASK_SELLING: {
        label: "View Offer",
        resolveHref: (item) => {
            const askId = metadataString(item, ["askId", "askID", "ask_id"]);
            return askId ? `${ROUTE_PUBLIC.PAYOUT}/${askId}` : undefined;
        },
    },
    FLOOR_PRICE_UPDATED_BUYER: {
        label: "Review Offer",
        resolveHref: () => ROUTE_PUBLIC.PROFILE_OFFER,
    },
    NEW_HIGHEST_BID_SELLER: {
        label: "Review Listing",
        resolveHref: () => ROUTE_PUBLIC.PROFILE_LISTINGS,
    },
};

for (const eventType of NO_ACTION_EVENT_TYPES) {
    EVENT_ACTIONS[eventType] = NO_NOTIFICATION_ACTION;
}

/**
 * Maps frontend UI tab key to backend notification category filter.
 */
export function mapTabToBackendCategory(
    tab: TNotificationCategory
): NotificationCategory | undefined {
    switch (tab) {
        case "buying":
            return NotificationCategory.TRANSACTION;
        case "market":
            return NotificationCategory.MARKETPLACE;
        case "account":
            return NotificationCategory.ACCOUNT;
        case "system":
        case "all":
        default:
            return undefined;
    }
}

/**
 * Maps backend notification category to frontend UI tab key.
 */
export function mapBackendCategoryToTab(
    category: NotificationCategory | string
): TNotificationCategory {
    switch (category) {
        case NotificationCategory.TRANSACTION:
        case "TRANSACTION":
            return "buying";
        case NotificationCategory.MARKETPLACE:
        case "MARKETPLACE":
            return "market";
        case NotificationCategory.ACCOUNT:
        case "ACCOUNT":
            return "account";
        default:
            return "system";
    }
}

/**
 * Resolves appropriate icon for a notification based on category and eventType.
 */
export function resolveNotificationIcon(
    category: NotificationCategory | string,
    eventType: string
): TNotificationIcon {
    const typeUpper = (eventType || "").toUpperCase();

    if (
        typeUpper.includes("PAYMENT") ||
        typeUpper.includes("CHECKOUT") ||
        typeUpper.includes("ORDER")
    ) {
        return "shopping-cart";
    }

    if (
        typeUpper.includes("BID") ||
        typeUpper.includes("OFFER") ||
        typeUpper.includes("PAYOUT")
    ) {
        return "wallet";
    }

    if (
        typeUpper.includes("PRICE") ||
        typeUpper.includes("MARKET") ||
        typeUpper.includes("FLOOR") ||
        category === NotificationCategory.MARKETPLACE ||
        category === "MARKETPLACE"
    ) {
        return "chart";
    }

    if (typeUpper.includes("USER") || typeUpper.includes("PROFILE")) {
        return "user";
    }

    if (
        typeUpper.includes("SECURITY") ||
        typeUpper.includes("LOGIN") ||
        typeUpper.includes("AUTH") ||
        typeUpper.includes("VERIF") ||
        category === NotificationCategory.ACCOUNT ||
        category === "ACCOUNT"
    ) {
        return "shield";
    }

    if (
        typeUpper.includes("MAINTENANCE") ||
        typeUpper.includes("SYSTEM") ||
        typeUpper.includes("POLICY")
    ) {
        return "settings";
    }

    return "shopping-cart";
}

/**
 * Resolves action button text for a notification based on its related item type and event type.
 */
export function resolveActionLabel(item: NotificationItem): string | undefined {
    if (item.metadata && typeof item.metadata.actionLabel === "string") {
        return item.metadata.actionLabel;
    }

    const relatedType = (item.relatedItemType || "").toLowerCase();
    const eventType = (item.eventType || "").toUpperCase();
    const eventAction = EVENT_ACTIONS[eventType];

    if (eventAction) return eventAction.label;
    if (eventType in EVENT_ACTIONS) return undefined;

    if (relatedType.includes("checkout")) {
        return item.isRead ? "View Checkout" : "Make Payment";
    }

    if (relatedType === "order") {
        return "View Order";
    }

    if (relatedType === "transaction") {
        return "View Transaction";
    }

    if (relatedType === "cask") {
        return "View Cask";
    }

    if (relatedType === "distillery") {
        return "View Distillery";
    }

    if (eventType.includes("BID") || eventType.includes("OFFER")) {
        return "View Offer";
    }

    if (eventType.includes("ASK") || eventType.includes("LISTING")) {
        return "View Listing";
    }

    if (eventType.includes("VERIF") || eventType.includes("ACCOUNT")) {
        return "Review Account";
    }

    return undefined;
}

/**
 * Resolves action destination link for a notification.
 */
export function resolveActionHref(item: NotificationItem): string | undefined {
    const eventType = (item.eventType || "").toUpperCase();
    if (
        eventType === "AGREEMENT_READY_TO_SIGN_BUYER" ||
        eventType === "AGREEMENT_REQUIRES_UPDATE_BUYER" ||
        eventType === "OWNERSHIP_TRANSFER_COMPLETED_BUYER"
    ) {
        return checkoutRelatedItemHref(item);
    }

    if (item.metadata && typeof item.metadata.actionHref === "string") {
        return item.metadata.actionHref;
    }

    const relatedType = (item.relatedItemType || "").toLowerCase();
    const relatedId = item.relatedItemId;
    const eventAction = EVENT_ACTIONS[eventType];

    if (eventAction) return eventAction.resolveHref(item);
    if (eventType in EVENT_ACTIONS) return undefined;

    if (relatedType.includes("checkout") && relatedId) {
        return `${ROUTE_PUBLIC.CHECKOUT}/${relatedId}`;
    }

    if (relatedType === "order") {
        return "/profile/portfolio";
    }

    if (relatedType === "transaction") {
        return "/profile/history";
    }

    if (relatedType === "cask" && relatedId) {
        return `/casks/${relatedId}`;
    }

    if (relatedType === "distillery" && relatedId) {
        return `/distilleries/${relatedId}`;
    }

    if (eventType.includes("BID") || eventType.includes("OFFER")) {
        return ROUTE_PUBLIC.PROFILE_OFFER;
    }

    if (eventType.includes("ASK") || eventType.includes("LISTING")) {
        return ROUTE_PUBLIC.PROFILE_LISTINGS;
    }

    if (
        item.eventType?.includes("ACCOUNT") ||
        item.eventType?.includes("VERIF")
    ) {
        return ROUTE_PUBLIC.SETTINGS_SECURITY;
    }

    return undefined;
}

/**
 * Formats notification creation date into human-readable relative string.
 * Uses relative time ('Just now', '5m ago', 'Yesterday', '4d ago', '2w ago')
 * and falls back to the client/browser's locale for older dates.
 */
export function formatNotificationTime(
    dateString?: string | null,
    locale?: string
): string {
    return formatTimeAgo(dateString, locale);
}

/**
 * Maps backend NotificationItem to frontend TNotificationItem representation.
 */
export function mapNotificationResponse(
    item: NotificationItem,
    locale?: string
): TNotificationItem {
    const actionHref = resolveActionHref(item);

    return {
        id: item.id,
        category: mapBackendCategoryToTab(item.category),
        title: item.title,
        description: item.message,
        actionLabel: actionHref ? resolveActionLabel(item) : undefined,
        actionHref,
        timestamp: formatNotificationTime(item.createdAt, locale),
        isRead: item.isRead,
        icon: resolveNotificationIcon(item.category, item.eventType),
        createdAt: item.createdAt,
    };
}

/**
 * Groups notification items into date sections: Today, Yesterday, Earlier.
 */
export function groupNotificationsByDate(
    items: TNotificationItem[]
): TNotificationGroup[] {
    const today: TNotificationItem[] = [];
    const yesterday: TNotificationItem[] = [];
    const earlier: TNotificationItem[] = [];

    const now = new Date();
    const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    ).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    items.forEach((item) => {
        const date = parseDate(item.createdAt);
        const itemTime = date ? date.getTime() : 0;
        if (itemTime >= todayStart) {
            today.push(item);
        } else if (itemTime >= yesterdayStart) {
            yesterday.push(item);
        } else {
            earlier.push(item);
        }
    });

    const groups: TNotificationGroup[] = [];
    if (today.length > 0) groups.push({ label: "Today", items: today });
    if (yesterday.length > 0)
        groups.push({ label: "Yesterday", items: yesterday });
    if (earlier.length > 0) groups.push({ label: "Earlier", items: earlier });

    return groups;
}
