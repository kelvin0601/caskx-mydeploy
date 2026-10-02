"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TNotificationCategory } from "@/lib/constants/notification";
import { PARAMS } from "@/lib/constants/route";

export type TNotificationContextType = {
    activeTab: TNotificationCategory;
    setActiveTab: (tab: TNotificationCategory) => void;
    showUnreadOnly: boolean;
    setShowUnreadOnly: (show: boolean) => void;
};

const NotificationContext = createContext<TNotificationContextType | undefined>(
    undefined
);

export function parseNotificationCategory(
    categoryParam?: string | null
): TNotificationCategory {
    if (!categoryParam) return "all";
    const lower = categoryParam.toLowerCase();
    if (lower === "buying" || lower === "transaction") return "buying";
    if (lower === "market" || lower === "marketplace") return "market";
    if (lower === "account") return "account";
    if (lower === "system") return "system";
    return "all";
}

export function parseIsReadParam(
    searchParams?: { get: (key: string) => string | null } | null
): boolean {
    if (!searchParams) return false;
    const isRead = searchParams.get(PARAMS.isRead);
    const unread = searchParams.get(PARAMS.unread);
    return isRead === "false" || unread === "true";
}

export function NotificationProvider({
    children,
    initialTab,
    initialUnreadOnly,
}: {
    children?: ReactNode;
    initialTab?: TNotificationCategory;
    initialUnreadOnly?: boolean;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const activeTab = useMemo<TNotificationCategory>(() => {
        const paramCat = searchParams?.get(PARAMS.category);
        if (paramCat) {
            return parseNotificationCategory(paramCat);
        }
        return initialTab || "all";
    }, [searchParams, initialTab]);

    const showUnreadOnly = useMemo<boolean>(() => {
        if (
            searchParams?.has?.(PARAMS.isRead) ||
            searchParams?.has?.(PARAMS.unread)
        ) {
            return parseIsReadParam(searchParams);
        }
        return initialUnreadOnly ?? false;
    }, [searchParams, initialUnreadOnly]);

    const setActiveTab = useCallback(
        (tab: TNotificationCategory) => {
            const params = new URLSearchParams(searchParams?.toString() || "");
            if (tab === "all") {
                params.delete(PARAMS.category);
            } else {
                params.set(PARAMS.category, tab);
            }
            const qs = params.toString();
            const target = pathname || "/notifications";
            router?.replace?.(`${target}${qs ? `?${qs}` : ""}`, {
                scroll: false,
            });
        },
        [pathname, router, searchParams]
    );

    const setShowUnreadOnly = useCallback(
        (show: boolean) => {
            const params = new URLSearchParams(searchParams?.toString() || "");
            if (show) {
                params.set(PARAMS.isRead, "false");
                params.delete(PARAMS.unread);
            } else {
                params.delete(PARAMS.isRead);
                params.delete(PARAMS.unread);
            }
            const qs = params.toString();
            const target = pathname || "/notifications";
            router?.replace?.(`${target}${qs ? `?${qs}` : ""}`, {
                scroll: false,
            });
        },
        [pathname, router, searchParams]
    );

    return (
        <NotificationContext.Provider
            value={{
                activeTab,
                setActiveTab,
                showUnreadOnly,
                setShowUnreadOnly,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            "useNotification must be used within a NotificationProvider"
        );
    }
    return context;
}
