export enum NotificationCategory {
    ACCOUNT = "ACCOUNT",
    TRANSACTION = "TRANSACTION",
    MARKETPLACE = "MARKETPLACE",
}

export interface NotificationItem {
    id: string;
    category: NotificationCategory | string;
    eventType: string;
    title: string;
    message: string;
    relatedItemType: string | null;
    relatedItemId: string | null;
    /** Optional action target supplied by newer notification payloads. */
    linkId?: string | null;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    metadata?: Record<string, unknown> | null;
}

export interface NotificationListResponse {
    data: NotificationItem[];
    totalRecords: number;
    page: number;
    size: number;
    totalPages: number;
}

export interface NotificationUnreadCountResponse {
    unreadCount: number;
}

export interface NotificationQueryParams {
    page?: number;
    size?: number;
    category?: NotificationCategory | "ACCOUNT" | "TRANSACTION" | "MARKETPLACE";
    isRead?: boolean;
}

export interface NotificationReadAllResponse {
    updated: number;
}
