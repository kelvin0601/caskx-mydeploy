// Mock query-string to avoid ESM issues
jest.mock("query-string", () => ({
    stringify: jest.fn((obj) =>
        Object.entries(obj)
            .map(([k, v]) => `${k}=${v}`)
            .join("&")
    ),
    parse: jest.fn((str) => Object.fromEntries(new URLSearchParams(str))),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
    usePathname: () => "/notifications",
    useSearchParams: () => mockSearchParams,
}));

import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useDebounce, useDebouncedCallback } from "@/hooks/useDebounce";
import { useThrottleCallback } from "@/hooks/useThrottleCallback";
import { useInfinite, useInfiniteScroll } from "@/hooks/useInfinite";

describe("useDebounce()", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("returns initial value immediately", () => {
        const { result } = renderHook(() => useDebounce("hello", 500));
        expect(result.current).toBe("hello");
    });

    it("debounces value changes", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: "initial", delay: 500 } }
        );

        expect(result.current).toBe("initial");

        rerender({ value: "updated", delay: 500 });

        // Value should not change immediately
        expect(result.current).toBe("initial");

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(result.current).toBe("updated");
    });

    it("uses default delay of 500ms", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value),
            { initialProps: { value: "initial" } }
        );

        rerender({ value: "updated" });

        act(() => {
            jest.advanceTimersByTime(499);
        });
        expect(result.current).toBe("initial");

        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(result.current).toBe("updated");
    });

    it("cancels previous timeout on rapid changes", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            { initialProps: { value: "initial" } }
        );

        rerender({ value: "update1" });
        rerender({ value: "update2" });
        rerender({ value: "update3" });

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(result.current).toBe("update3");
    });
});

describe("useDebouncedCallback()", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls callback after wait period", () => {
        const callback = jest.fn();
        const { result } = renderHook(() =>
            useDebouncedCallback(callback, 500)
        );

        act(() => {
            result.current("arg1");
        });

        expect(callback).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledWith("arg1");
    });

    it("cancels previous call on rapid invocations", () => {
        const callback = jest.fn();
        const { result } = renderHook(() =>
            useDebouncedCallback(callback, 500)
        );

        act(() => {
            result.current("first");
        });

        act(() => {
            jest.advanceTimersByTime(200);
        });

        act(() => {
            result.current("second");
        });

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("second");
    });

    it("passes multiple arguments", () => {
        const callback = jest.fn();
        const { result } = renderHook(() =>
            useDebouncedCallback(callback, 100)
        );

        act(() => {
            result.current("a", "b", "c");
        });

        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(callback).toHaveBeenCalledWith("a", "b", "c");
    });
});

describe("useThrottleCallback()", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls callback immediately on first invocation", () => {
        const callback = jest.fn();
        const { result } = renderHook(() => useThrottleCallback(callback, 500));

        act(() => {
            result.current("arg1");
        });

        expect(callback).toHaveBeenCalledWith("arg1");
    });

    it("throttles subsequent calls within delay", () => {
        const callback = jest.fn();
        const { result } = renderHook(() => useThrottleCallback(callback, 500));

        act(() => {
            result.current("first");
        });

        act(() => {
            jest.advanceTimersByTime(200);
        });

        act(() => {
            result.current("second");
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("first");
    });

    it("allows call after delay period", () => {
        const callback = jest.fn();
        const { result } = renderHook(() => useThrottleCallback(callback, 500));

        act(() => {
            result.current("first");
        });

        act(() => {
            jest.advanceTimersByTime(500);
        });

        act(() => {
            result.current("second");
        });

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith("second");
    });
});

describe("useInfiniteScroll()", () => {
    let originalIntersectionObserver: typeof window.IntersectionObserver;
    let mockInstances: Array<{
        callback: IntersectionObserverCallback;
        observe: jest.Mock;
        unobserve: jest.Mock;
        disconnect: jest.Mock;
        options?: IntersectionObserverInit;
    }>;

    beforeEach(() => {
        mockInstances = [];
        originalIntersectionObserver = window.IntersectionObserver;

        window.IntersectionObserver = jest.fn((callback, options) => {
            const instance = {
                callback,
                options,
                observe: jest.fn(),
                unobserve: jest.fn(),
                disconnect: jest.fn(),
                takeRecords: jest.fn(() => []),
                root: options?.root ?? null,
                rootMargin: options?.rootMargin ?? "",
                thresholds: options?.threshold
                    ? Array.isArray(options.threshold)
                        ? options.threshold
                        : [options.threshold]
                    : [0],
            };
            mockInstances.push(instance);
            return instance as unknown as IntersectionObserver;
        }) as unknown as typeof window.IntersectionObserver;
    });

    afterEach(() => {
        window.IntersectionObserver = originalIntersectionObserver;
    });

    it("attaches sentinelRef and updates targetElement and sentinelRef.current", () => {
        const onLoadMore = jest.fn();
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
            })
        );

        expect(result.current.targetElement).toBeNull();
        expect(result.current.sentinelRef.current).toBeNull();

        const element = document.createElement("div");
        act(() => {
            result.current.sentinelRef(element);
        });

        expect(result.current.targetElement).toBe(element);
        expect(result.current.sentinelRef.current).toBe(element);
        expect(result.current.targetRef.current).toBe(element);
    });

    it("creates an IntersectionObserver and observes the target element", () => {
        const onLoadMore = jest.fn();
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                rootMargin: "300px",
                threshold: 0.5,
            })
        );

        const element = document.createElement("div");
        act(() => {
            result.current.sentinelRef(element);
        });

        expect(mockInstances).toHaveLength(1);
        expect(mockInstances[0].observe).toHaveBeenCalledWith(element);
        expect(mockInstances[0].options?.rootMargin).toBe("300px");
        expect(mockInstances[0].options?.threshold).toBe(0.5);
    });

    it("triggers onLoadMore when sentinel intersects viewport", () => {
        const onLoadMore = jest.fn();
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
            })
        );

        const element = document.createElement("div");
        act(() => {
            result.current.sentinelRef(element);
        });

        const observer = mockInstances[0];
        expect(observer).toBeDefined();

        // Simulate intersection event
        act(() => {
            observer.callback(
                [
                    {
                        isIntersecting: true,
                        target: element,
                        boundingClientRect: {} as DOMRectReadOnly,
                        intersectionRatio: 1,
                        intersectionRect: {} as DOMRectReadOnly,
                        rootBounds: null,
                        time: Date.now(),
                    },
                ],
                observer as unknown as IntersectionObserver
            );
        });

        expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it("does not trigger onLoadMore when isIntersecting is false", () => {
        const onLoadMore = jest.fn();
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
            })
        );

        const element = document.createElement("div");
        act(() => {
            result.current.sentinelRef(element);
        });

        const observer = mockInstances[0];

        act(() => {
            observer.callback(
                [
                    {
                        isIntersecting: false,
                        target: element,
                        boundingClientRect: {} as DOMRectReadOnly,
                        intersectionRatio: 0,
                        intersectionRect: {} as DOMRectReadOnly,
                        rootBounds: null,
                        time: Date.now(),
                    },
                ],
                observer as unknown as IntersectionObserver
            );
        });

        expect(onLoadMore).not.toHaveBeenCalled();
    });

    it("does not observe or load more when hasNextPage is false", () => {
        const onLoadMore = jest.fn();
        const { result } = renderHook(() =>
            useInfiniteScroll({
                hasNextPage: false,
                onLoadMore,
            })
        );

        const element = document.createElement("div");
        act(() => {
            result.current.sentinelRef(element);
        });

        expect(mockInstances).toHaveLength(0);
        expect(onLoadMore).not.toHaveBeenCalled();
    });

    it("disconnects when isFetching is true and re-observes when false", () => {
        const onLoadMore = jest.fn();
        const { result, rerender } = renderHook(
            ({ isFetching }) =>
                useInfiniteScroll({
                    isFetching,
                    onLoadMore,
                }),
            { initialProps: { isFetching: false } }
        );

        const element = document.createElement("div");
        act(() => {
            result.current.sentinelRef(element);
        });

        expect(mockInstances).toHaveLength(1);
        expect(mockInstances[0].observe).toHaveBeenCalledWith(element);

        // Transition to fetching
        rerender({ isFetching: true });
        expect(mockInstances[0].disconnect).toHaveBeenCalled();

        // Transition back to not fetching
        rerender({ isFetching: false });
        expect(mockInstances).toHaveLength(2);
        expect(mockInstances[1].observe).toHaveBeenCalledWith(element);
    });

    it("disconnects observer when unmounted", () => {
        const onLoadMore = jest.fn();
        const { result, unmount } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
            })
        );

        const element = document.createElement("div");
        act(() => {
            result.current.sentinelRef(element);
        });

        expect(mockInstances).toHaveLength(1);
        unmount();
        expect(mockInstances[0].disconnect).toHaveBeenCalled();
    });

    it("does not crash when IntersectionObserver is not available in environment", () => {
        // @ts-expect-error simulating environment without IntersectionObserver
        delete window.IntersectionObserver;

        const onLoadMore = jest.fn();
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
            })
        );

        const element = document.createElement("div");
        expect(() => {
            act(() => {
                result.current.sentinelRef(element);
            });
        }).not.toThrow();

        expect(onLoadMore).not.toHaveBeenCalled();
    });
});

describe("useInfinite() with TanStack Query", () => {
    let originalIntersectionObserver: typeof window.IntersectionObserver;
    let mockInstances: Array<{
        callback: IntersectionObserverCallback;
        observe: jest.Mock;
        unobserve: jest.Mock;
        disconnect: jest.Mock;
        options?: IntersectionObserverInit;
    }>;

    const createWrapper = () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        const Wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(
                QueryClientProvider,
                { client: queryClient },
                children
            );
        Wrapper.displayName = "QueryClientTestWrapper";
        return Wrapper;
    };

    beforeEach(() => {
        mockInstances = [];
        originalIntersectionObserver = window.IntersectionObserver;

        window.IntersectionObserver = jest.fn((callback, options) => {
            const instance = {
                callback,
                options,
                observe: jest.fn(),
                unobserve: jest.fn(),
                disconnect: jest.fn(),
                takeRecords: jest.fn(() => []),
                root: options?.root ?? null,
                rootMargin: options?.rootMargin ?? "",
                thresholds: options?.threshold
                    ? Array.isArray(options.threshold)
                        ? options.threshold
                        : [options.threshold]
                    : [0],
            };
            mockInstances.push(instance);
            return instance as unknown as IntersectionObserver;
        }) as unknown as typeof window.IntersectionObserver;
    });

    afterEach(() => {
        window.IntersectionObserver = originalIntersectionObserver;
    });

    it("integrates TanStack useInfiniteQuery and attaches scroll observer", async () => {
        const queryFn = jest.fn(({ pageParam = 1 }: { pageParam?: number }) =>
            Promise.resolve({
                page: pageParam,
                data: [`item-${pageParam}`],
                totalPages: 2,
            })
        );

        const { result } = renderHook(
            () =>
                useInfinite({
                    queryKey: ["test-tanstack-infinite"],
                    queryFn,
                    initialPageParam: 1,
                    getNextPageParam: (lastPage: {
                        page: number;
                        totalPages: number;
                    }) =>
                        lastPage.page < lastPage.totalPages
                            ? lastPage.page + 1
                            : undefined,
                }),
            { wrapper: createWrapper() }
        );

        expect(result.current.fetchNextPage).toBeDefined();
        expect(result.current.sentinelRef).toBeDefined();
        expect(result.current.targetRef).toBeDefined();

        const element = document.createElement("div");
        act(() => {
            result.current.sentinelRef(element);
        });

        expect(result.current.targetElement).toBe(element);

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.hasNextPage).toBe(true);
            expect(mockInstances).toHaveLength(1);
        });

        expect(mockInstances[0].observe).toHaveBeenCalledWith(element);
    });

    it("handles observer-only mode without crashing when queryFn is omitted", () => {
        const onLoadMore = jest.fn();
        const { result } = renderHook(
            () =>
                useInfinite({
                    hasNextPage: true,
                    isFetching: false,
                    onLoadMore,
                }),
            { wrapper: createWrapper() }
        );

        expect(result.current.sentinelRef).toBeDefined();

        const element = document.createElement("div");
        act(() => {
            result.current.sentinelRef(element);
        });

        expect(mockInstances).toHaveLength(1);
    });
});

import {
    parseNotificationCategory,
    parseIsReadParam,
    NotificationProvider,
    useNotification,
} from "@/modules/notification-inbox/provider";
import {
    mapTabToBackendCategory,
    mapBackendCategoryToTab,
    resolveNotificationIcon,
    resolveActionHref,
    resolveActionLabel,
    groupNotificationsByDate,
    mapNotificationResponse,
    formatNotificationTime,
} from "@/modules/notification-inbox/mapping";
import { NotificationCategory, NotificationItem } from "@/types/notification";

describe("Notification URL & Filter Parsers", () => {
    describe("parseNotificationCategory()", () => {
        it("returns all for null or empty category", () => {
            expect(parseNotificationCategory(null)).toBe("all");
            expect(parseNotificationCategory(undefined)).toBe("all");
            expect(parseNotificationCategory("")).toBe("all");
        });

        it("parses buying and transaction category", () => {
            expect(parseNotificationCategory("buying")).toBe("buying");
            expect(parseNotificationCategory("transaction")).toBe("buying");
            expect(parseNotificationCategory("TRANSACTION")).toBe("buying");
        });

        it("parses market and marketplace category", () => {
            expect(parseNotificationCategory("market")).toBe("market");
            expect(parseNotificationCategory("marketplace")).toBe("market");
            expect(parseNotificationCategory("MARKETPLACE")).toBe("market");
        });

        it("parses account category", () => {
            expect(parseNotificationCategory("account")).toBe("account");
            expect(parseNotificationCategory("ACCOUNT")).toBe("account");
        });

        it("parses system category", () => {
            expect(parseNotificationCategory("system")).toBe("system");
        });

        it("falls back to all for unknown categories", () => {
            expect(parseNotificationCategory("random-category")).toBe("all");
        });
    });

    describe("parseIsReadParam()", () => {
        it("returns false for null or empty params", () => {
            expect(parseIsReadParam(null)).toBe(false);
            expect(parseIsReadParam(undefined)).toBe(false);
            expect(parseIsReadParam(new URLSearchParams())).toBe(false);
        });

        it("returns true when isRead is false", () => {
            const params = new URLSearchParams("isRead=false");
            expect(parseIsReadParam(params)).toBe(true);
        });

        it("returns true when unread is true", () => {
            const params = new URLSearchParams("unread=true");
            expect(parseIsReadParam(params)).toBe(true);
        });

        it("returns false when isRead is true", () => {
            const params = new URLSearchParams("isRead=true");
            expect(parseIsReadParam(params)).toBe(false);
        });
    });
});

describe("NotificationProvider & useNotification()", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams = new URLSearchParams();
    });

    it("throws error when used outside NotificationProvider", () => {
        // Suppress expected console.error from React
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        expect(() => renderHook(() => useNotification())).toThrow(
            "useNotification must be used within a NotificationProvider"
        );
        spy.mockRestore();
    });

    it("provides default state and allows initial values", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(
                NotificationProvider,
                { initialTab: "buying", initialUnreadOnly: true },
                children
            );

        const { result } = renderHook(() => useNotification(), { wrapper });
        expect(result.current.activeTab).toBe("buying");
        expect(result.current.showUnreadOnly).toBe(true);
    });

    it("defaults to all tab and unreadOnly false", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(NotificationProvider, null, children);

        const { result } = renderHook(() => useNotification(), { wrapper });
        expect(result.current.activeTab).toBe("all");
        expect(result.current.showUnreadOnly).toBe(false);
    });

    it("derives activeTab and showUnreadOnly from searchParams", () => {
        mockSearchParams = new URLSearchParams("category=market&isRead=false");
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(NotificationProvider, null, children);

        const { result } = renderHook(() => useNotification(), { wrapper });
        expect(result.current.activeTab).toBe("market");
        expect(result.current.showUnreadOnly).toBe(true);
    });

    it("updates URL when setActiveTab is called", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(NotificationProvider, null, children);

        const { result } = renderHook(() => useNotification(), { wrapper });
        act(() => {
            result.current.setActiveTab("buying");
        });

        expect(mockReplace).toHaveBeenCalledWith(
            "/notifications?category=buying",
            {
                scroll: false,
            }
        );

        act(() => {
            result.current.setActiveTab("all");
        });

        expect(mockReplace).toHaveBeenCalledWith("/notifications", {
            scroll: false,
        });
    });

    it("updates URL when setShowUnreadOnly is called", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(NotificationProvider, null, children);

        const { result } = renderHook(() => useNotification(), { wrapper });
        act(() => {
            result.current.setShowUnreadOnly(true);
        });

        expect(mockReplace).toHaveBeenCalledWith(
            "/notifications?isRead=false",
            {
                scroll: false,
            }
        );

        act(() => {
            result.current.setShowUnreadOnly(false);
        });

        expect(mockReplace).toHaveBeenCalledWith("/notifications", {
            scroll: false,
        });
    });
});

describe("Notification Mapping Functions", () => {
    describe("mapTabToBackendCategory()", () => {
        it("maps buying to TRANSACTION", () => {
            expect(mapTabToBackendCategory("buying")).toBe(
                NotificationCategory.TRANSACTION
            );
        });

        it("maps market to MARKETPLACE", () => {
            expect(mapTabToBackendCategory("market")).toBe(
                NotificationCategory.MARKETPLACE
            );
        });

        it("maps account to ACCOUNT", () => {
            expect(mapTabToBackendCategory("account")).toBe(
                NotificationCategory.ACCOUNT
            );
        });

        it("maps all and system to undefined", () => {
            expect(mapTabToBackendCategory("all")).toBeUndefined();
            expect(mapTabToBackendCategory("system")).toBeUndefined();
        });
    });

    describe("mapBackendCategoryToTab()", () => {
        it("maps TRANSACTION to buying", () => {
            expect(
                mapBackendCategoryToTab(NotificationCategory.TRANSACTION)
            ).toBe("buying");
            expect(mapBackendCategoryToTab("TRANSACTION")).toBe("buying");
        });

        it("maps MARKETPLACE to market", () => {
            expect(
                mapBackendCategoryToTab(NotificationCategory.MARKETPLACE)
            ).toBe("market");
            expect(mapBackendCategoryToTab("MARKETPLACE")).toBe("market");
        });

        it("maps ACCOUNT to account", () => {
            expect(mapBackendCategoryToTab(NotificationCategory.ACCOUNT)).toBe(
                "account"
            );
            expect(mapBackendCategoryToTab("ACCOUNT")).toBe("account");
        });

        it("defaults unknown to system", () => {
            expect(mapBackendCategoryToTab("OTHER")).toBe("system");
        });
    });

    describe("resolveNotificationIcon()", () => {
        it("resolves payment/checkout/order events to shopping-cart", () => {
            expect(resolveNotificationIcon("TRANSACTION", "PAYMENT_DUE")).toBe(
                "shopping-cart"
            );
            expect(
                resolveNotificationIcon("TRANSACTION", "ORDER_CONFIRMED")
            ).toBe("shopping-cart");
        });

        it("resolves bid/offer events to wallet", () => {
            expect(resolveNotificationIcon("MARKETPLACE", "NEW_BID")).toBe(
                "wallet"
            );
            expect(
                resolveNotificationIcon("MARKETPLACE", "OFFER_RECEIVED")
            ).toBe("wallet");
        });

        it("resolves market/price events to chart", () => {
            expect(resolveNotificationIcon("MARKETPLACE", "PRICE_DROP")).toBe(
                "chart"
            );
        });

        it("resolves security/account events to shield", () => {
            expect(resolveNotificationIcon("ACCOUNT", "NEW_LOGIN")).toBe(
                "shield"
            );
        });
    });

    describe("resolveActionHref()", () => {
        const baseItem: NotificationItem = {
            id: "1",
            category: NotificationCategory.TRANSACTION,
            eventType: "PAYMENT_DUE",
            title: "Payment Due",
            message: "Please pay",
            relatedItemType: null,
            relatedItemId: null,
            isRead: false,
            readAt: null,
            createdAt: "2026-01-01T00:00:00Z",
        };

        it("resolves checkout href", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    relatedItemType: "checkout",
                    relatedItemId: "chk_123",
                })
            ).toBe("/checkout/chk_123");
        });

        it("resolves order href", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    relatedItemType: "order",
                })
            ).toBe("/profile/portfolio");
        });

        it("resolves transaction href", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    relatedItemType: "transaction",
                })
            ).toBe("/profile/history");
        });

        it("resolves cask href", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    relatedItemType: "cask",
                    relatedItemId: "cask_456",
                })
            ).toBe("/casks/cask_456");
        });

        it("resolves metadata actionHref override", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    metadata: { actionHref: "/custom/path" },
                })
            ).toBe("/custom/path");
        });

        it("resolves workbook checkout actions from linkId", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    eventType: "DEPOSIT_PAYMENT_REQUIRED_BUYER",
                    relatedItemType: null,
                    relatedItemId: null,
                    linkId: "checkout_123",
                })
            ).toBe("/checkout/checkout_123");
        });

        it("resolves buyer checkout actions from relatedItemId", () => {
            for (const eventType of [
                "AGREEMENT_READY_TO_SIGN_BUYER",
                "AGREEMENT_REQUIRES_UPDATE_BUYER",
                "OWNERSHIP_TRANSFER_COMPLETED_BUYER",
            ]) {
                expect(
                    resolveActionHref({
                        ...baseItem,
                        eventType,
                        relatedItemType: "checkout",
                        relatedItemId: "checkout_456",
                        linkId: "ignored_link_id",
                        metadata: { actionHref: "https://docusign.test/sign" },
                    })
                ).toBe("/checkout/checkout_456");
            }
        });

        it("resolves ASK_NEAR_BID_BUYING to offer detail from metadata.bidId", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    eventType: "ASK_NEAR_BID_BUYING",
                    relatedItemType: "bid",
                    relatedItemId: null,
                    metadata: { bidId: "bid_123" },
                })
            ).toBe("/profile/offer/bid_123");

            expect(
                resolveActionHref({
                    ...baseItem,
                    eventType: "ASK_NEAR_BID_BUYING",
                    relatedItemType: "bid",
                    relatedItemId: "bid_123",
                })
            ).toBeUndefined();
        });

        it("resolves BID_NEAR_ASK_SELLING to payout detail from metadata.askId", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    eventType: "BID_NEAR_ASK_SELLING",
                    relatedItemType: "ask",
                    relatedItemId: null,
                    metadata: { askId: "ask_456" },
                })
            ).toBe("/payout/ask_456");

            expect(
                resolveActionHref({
                    ...baseItem,
                    eventType: "BID_NEAR_ASK_SELLING",
                    relatedItemType: "ask",
                    relatedItemId: "ask_456",
                })
            ).toBeUndefined();
        });

        it("suppresses actions for workbook events without a CTA", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    eventType: "PAYMENT_CREATED_BUYER",
                    relatedItemType: "checkout",
                    relatedItemId: "checkout_123",
                })
            ).toBeUndefined();
        });

        it("resolves seller listing review route", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    eventType: "NEW_HIGHEST_BID_SELLER",
                    relatedItemType: null,
                    relatedItemId: "ask_123",
                })
            ).toBe("/profile/listings");
        });

        it("resolves seller payout route from ask_id", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    eventType: "PAYOUT_CREATED_SELLER",
                    relatedItemType: "payout",
                    relatedItemId: "payout_123",
                    metadata: { ask_id: "ask_123" },
                })
            ).toBe("/payout/ask_123");
        });

        it("resolves seller payout agreement updates from the payout id", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    eventType: "PAYOUT_AGREEMENT_REQUIRES_UPDATE_SELLER",
                    relatedItemType: "payout",
                    relatedItemId: "payout_123",
                })
            ).toBe("/payout/payout_123");
            expect(
                resolveActionHref({
                    ...baseItem,
                    eventType: "PAYOUT_AGREEMENT_REQUIRES_UPDATE_SELLER",
                    relatedItemType: null,
                    relatedItemId: null,
                    metadata: { payoutId: "payout_456" },
                })
            ).toBe("/payout/payout_456");
        });

        it("resolves the buyer deposit receipt link", () => {
            expect(
                resolveActionHref({
                    ...baseItem,
                    eventType: "DEPOSIT_RECEIVED_BUYER",
                    metadata: { receiptUrl: "https://files.test/receipt.pdf" },
                })
            ).toBe("https://files.test/receipt.pdf");

            expect(
                resolveActionLabel({
                    ...baseItem,
                    eventType: "DEPOSIT_RECEIVED_BUYER",
                })
            ).toBe("Download Receipt");
        });
    });

    describe("resolveActionLabel()", () => {
        const baseItem: NotificationItem = {
            id: "1",
            category: NotificationCategory.TRANSACTION,
            eventType: "PAYMENT_DUE",
            title: "Payment Due",
            message: "Please pay",
            relatedItemType: "checkout",
            relatedItemId: "chk_123",
            isRead: false,
            readAt: null,
            createdAt: "2026-01-01T00:00:00Z",
        };

        it("returns Make Payment for unread checkout", () => {
            expect(resolveActionLabel({ ...baseItem, isRead: false })).toBe(
                "Make Payment"
            );
        });

        it("returns View Checkout for read checkout", () => {
            expect(resolveActionLabel({ ...baseItem, isRead: true })).toBe(
                "View Checkout"
            );
        });

        it("returns custom metadata actionLabel when present", () => {
            expect(
                resolveActionLabel({
                    ...baseItem,
                    metadata: { actionLabel: "Pay Now!" },
                })
            ).toBe("Pay Now!");
        });

        it("uses event-specific CTA labels from the notification list", () => {
            expect(
                resolveActionLabel({
                    ...baseItem,
                    eventType: "REMAINING_PAYMENT_REQUIRED_BUYER",
                })
            ).toBe("Pay Now");
            expect(
                resolveActionLabel({
                    ...baseItem,
                    eventType: "ASK_EXPIRED_SELLER",
                })
            ).toBeUndefined();
        });
    });

    describe("groupNotificationsByDate()", () => {
        it("groups notifications into today, yesterday, and earlier", () => {
            const now = new Date();
            const todayItem = {
                id: "1",
                category: "buying" as const,
                title: "Today",
                description: "desc",
                timestamp: "Just now",
                isRead: false,
                icon: "shopping-cart" as const,
                createdAt: now.toISOString(),
            };

            const yesterdayDate = new Date(now.getTime() - 25 * 60 * 60 * 1000);
            const yesterdayItem = {
                id: "2",
                category: "buying" as const,
                title: "Yesterday",
                description: "desc",
                timestamp: "1d ago",
                isRead: true,
                icon: "shopping-cart" as const,
                createdAt: yesterdayDate.toISOString(),
            };

            const earlierDate = new Date(
                now.getTime() - 5 * 24 * 60 * 60 * 1000
            );
            const earlierItem = {
                id: "3",
                category: "market" as const,
                title: "Earlier",
                description: "desc",
                timestamp: "5d ago",
                isRead: true,
                icon: "chart" as const,
                createdAt: earlierDate.toISOString(),
            };

            const groups = groupNotificationsByDate([
                todayItem,
                yesterdayItem,
                earlierItem,
            ]);

            expect(groups.some((g) => g.label === "Today")).toBe(true);
            expect(groups.some((g) => g.label === "Earlier")).toBe(true);
        });
    });

    describe("mapNotificationResponse()", () => {
        it("maps full NotificationItem to TNotificationItem", () => {
            const raw: NotificationItem = {
                id: "item_99",
                category: NotificationCategory.TRANSACTION,
                eventType: "CHECKOUT_CREATED",
                title: "Checkout Ready",
                message: "Proceed to checkout",
                relatedItemType: "checkout",
                relatedItemId: "chk_99",
                isRead: false,
                readAt: null,
                createdAt: new Date().toISOString(),
            };

            const mapped = mapNotificationResponse(raw);
            expect(mapped.id).toBe("item_99");
            expect(mapped.category).toBe("buying");
            expect(mapped.title).toBe("Checkout Ready");
            expect(mapped.description).toBe("Proceed to checkout");
            expect(mapped.actionHref).toBe("/checkout/chk_99");
            expect(mapped.actionLabel).toBe("Make Payment");
            expect(mapped.isRead).toBe(false);
            expect(mapped.icon).toBe("shopping-cart");
        });
    });

    describe("formatNotificationTime()", () => {
        it("formats seconds, minutes, hours, days, weeks", () => {
            const now = Date.now();
            expect(
                formatNotificationTime(new Date(now - 10000).toISOString())
            ).toBe("Just now");
            expect(
                formatNotificationTime(
                    new Date(now - 10 * 60 * 1000).toISOString()
                )
            ).toBe("10m ago");
            expect(
                formatNotificationTime(
                    new Date(now - 4 * 3600 * 1000).toISOString()
                )
            ).toBe("4h ago");
            expect(
                formatNotificationTime(
                    new Date(now - 2 * 86400 * 1000).toISOString()
                )
            ).toBe("2d ago");
            expect(
                formatNotificationTime(
                    new Date(now - 14 * 86400 * 1000).toISOString()
                )
            ).toBe("2w ago");
        });

        it("formats older dates using provided or system locale", () => {
            const fixedNow = new Date("2026-09-07T12:00:00Z");
            jest.useFakeTimers().setSystemTime(fixedNow);

            const pastDate = "2026-01-15T12:00:00Z";
            expect(formatNotificationTime(pastDate, "en-US")).toBe("Jan 15");
            expect(formatNotificationTime(pastDate, "vi-VN")).toContain("15");

            const lastYear = "2024-05-10T12:00:00Z";
            expect(formatNotificationTime(lastYear, "en-US")).toContain("2024");

            jest.useRealTimers();
        });
    });
});
