"use client";

import {
    useInfiniteQuery,
    type DefaultError,
    type InfiniteData,
    type QueryClient,
    type QueryKey,
    type UseInfiniteQueryOptions,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface SentinelRef<T extends HTMLElement> {
    (node: T | null): void;
    readonly current: T | null;
}

export interface UseInfiniteScrollOptions<
    T extends HTMLElement = HTMLDivElement,
> {
    /**
     * Whether there are more items to fetch.
     * When false, the observer disconnects and onLoadMore will not fire.
     * @default true
     */
    hasNextPage?: boolean;

    /**
     * Whether an asynchronous fetch is currently in progress.
     * Prevents triggering multiple redundant or concurrent fetch requests while scrolling.
     * @default false
     */
    isFetching?: boolean;

    /**
     * Callback function invoked when the sentinel element intersects the viewport.
     */
    onLoadMore?: () => void | Promise<unknown>;

    /**
     * Margin around the root element. Defaults to "250px" to prefetch before reaching the bottom.
     * @default "250px"
     */
    rootMargin?: string;

    /**
     * Number between 0 and 1 indicating the percentage of target visibility required.
     * @default 0
     */
    threshold?: number | number[];

    /**
     * Element used as the viewport for checking visibility. Defaults to browser viewport.
     * @default null
     */
    root?: Element | Document | null;

    /**
     * Manually disable intersection detection.
     * @default false
     */
    disabled?: boolean;
}

export interface UseInfiniteScrollReturn<
    T extends HTMLElement = HTMLDivElement,
> {
    /**
     * Callback ref and container to attach to the sentinel DOM element.
     */
    sentinelRef: SentinelRef<T>;

    /**
     * Semantic alias for sentinelRef.
     */
    targetRef: SentinelRef<T>;

    /**
     * Direct reference to the currently observed DOM element.
     */
    targetElement: T | null;
}

/**
 * Low-level IntersectionObserver hook for detecting scroll intersection at the bottom of a list.
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>({
    hasNextPage = true,
    isFetching = false,
    onLoadMore,
    rootMargin = "250px",
    threshold = 0,
    root = null,
    disabled = false,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
    const [targetElement, setTargetElement] = useState<T | null>(null);
    const nodeRef = useRef<T | null>(null);

    // Keep the latest onLoadMore in a ref to avoid recreating the observer on callback identity changes
    const onLoadMoreRef = useRef(onLoadMore);
    useEffect(() => {
        onLoadMoreRef.current = onLoadMore;
    }, [onLoadMore]);

    // Stable callback to update the target DOM element
    const setTargetRef = useCallback((node: T | null) => {
        nodeRef.current = node;
        setTargetElement(node);
    }, []);

    // Create a stable callable ref that also exposes `.current`
    const sentinelRef = useMemo(() => {
        const fn = (node: T | null) => {
            setTargetRef(node);
        };
        Object.defineProperty(fn, "current", {
            get: () => nodeRef.current,
            enumerable: true,
            configurable: true,
        });
        return fn as SentinelRef<T>;
    }, [setTargetRef]);

    const hasOnLoadMore = Boolean(onLoadMore);

    useEffect(() => {
        const target = targetElement;

        // Skip setup if target is absent, no next page, currently fetching, disabled, or no callback provided
        if (
            !target ||
            !hasNextPage ||
            isFetching ||
            disabled ||
            !hasOnLoadMore
        ) {
            return;
        }

        // SSR and browser safety check
        if (
            typeof window === "undefined" ||
            !("IntersectionObserver" in window)
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry?.isIntersecting) {
                    onLoadMoreRef.current?.();
                }
            },
            {
                root,
                rootMargin,
                threshold,
            }
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [
        targetElement,
        hasNextPage,
        isFetching,
        disabled,
        hasOnLoadMore,
        root,
        rootMargin,
        threshold,
    ]);

    return {
        sentinelRef,
        targetRef: sentinelRef,
        targetElement,
    };
}

export type UseInfiniteQueryConfig<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = InfiniteData<TQueryFnData>,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = number,
    TElement extends HTMLElement = HTMLDivElement,
> = UseInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
> & {
    /**
     * Margin around the root element for intersection observer (e.g., '250px').
     * @default "250px"
     */
    rootMargin?: string;

    /**
     * Visibility threshold for intersection observer.
     * @default 0
     */
    threshold?: number | number[];

    /**
     * Optional root element for intersection observer.
     * @default null
     */
    root?: Element | Document | null;

    /**
     * Whether automatic scroll-triggered fetching is disabled.
     * @default false
     */
    disableAutoFetch?: boolean;
};

export type UseInfiniteReturn<
    TData = unknown,
    TError = DefaultError,
    TElement extends HTMLElement = HTMLDivElement,
> = UseInfiniteQueryResult<TData, TError> & {
    /**
     * Callback ref to attach to the sentinel DOM element.
     */
    sentinelRef: SentinelRef<TElement>;

    /**
     * Semantic alias for sentinelRef.
     */
    targetRef: SentinelRef<TElement>;

    /**
     * Direct reference to the currently observed DOM element.
     */
    targetElement: TElement | null;
};

// Internal dummy constants to satisfy React Hook rules when in observer-only mode
const DUMMY_QUERY_KEY: QueryKey = ["__noop_infinite_key__"];
const DUMMY_QUERY_FN = () => Promise.resolve({ pages: [], pageParams: [] });

/**
 * Reusable infinite query hook wrapping TanStack Query's `useInfiniteQuery`.
 * Automatically coordinates data fetching with IntersectionObserver scroll pagination.
 *
 * Supports both:
 * 1. TanStack Query mode: passes `queryKey`, `queryFn`, and pagination params.
 * 2. Observer mode: passes `hasNextPage`, `isFetching`, `onLoadMore` for pure scroll observation.
 */
export function useInfinite<
    TQueryFnData,
    TError = DefaultError,
    TData = InfiniteData<TQueryFnData>,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = number,
    TElement extends HTMLElement = HTMLDivElement,
>(
    options: UseInfiniteQueryConfig<
        TQueryFnData,
        TError,
        TData,
        TQueryKey,
        TPageParam,
        TElement
    >,
    queryClient?: QueryClient
): UseInfiniteReturn<TData, TError, TElement>;

export function useInfinite<TElement extends HTMLElement = HTMLDivElement>(
    options: UseInfiniteScrollOptions<TElement>
): UseInfiniteScrollReturn<TElement>;

export function useInfinite<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = InfiniteData<TQueryFnData>,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = number,
    TElement extends HTMLElement = HTMLDivElement,
>(
    options:
        | UseInfiniteQueryConfig<
              TQueryFnData,
              TError,
              TData,
              TQueryKey,
              TPageParam,
              TElement
          >
        | UseInfiniteScrollOptions<TElement>,
    queryClient?: QueryClient
):
    | UseInfiniteReturn<TData, TError, TElement>
    | UseInfiniteScrollReturn<TElement> {
    const isQueryMode = Boolean(
        options &&
        "queryFn" in options &&
        typeof (options as { queryFn?: unknown }).queryFn === "function" &&
        "queryKey" in options &&
        Array.isArray((options as { queryKey?: unknown }).queryKey)
    );

    const queryConfig = options as UseInfiniteQueryConfig<
        TQueryFnData,
        TError,
        TData,
        TQueryKey,
        TPageParam,
        TElement
    >;
    const scrollConfig = options as UseInfiniteScrollOptions<TElement>;

    // Unconditionally call useInfiniteQuery to adhere to React Rules of Hooks
    const queryResult = useInfiniteQuery<
        TQueryFnData,
        TError,
        TData,
        TQueryKey,
        TPageParam
    >(
        isQueryMode
            ? queryConfig
            : ({
                  queryKey: DUMMY_QUERY_KEY as TQueryKey,
                  queryFn: DUMMY_QUERY_FN as unknown as UseInfiniteQueryOptions<
                      TQueryFnData,
                      TError,
                      TData,
                      TQueryKey,
                      TPageParam
                  >["queryFn"],
                  initialPageParam: 1 as TPageParam,
                  getNextPageParam: () => undefined,
                  enabled: false,
              } as unknown as UseInfiniteQueryOptions<
                  TQueryFnData,
                  TError,
                  TData,
                  TQueryKey,
                  TPageParam
              >),
        queryClient
    );

    const hasNext = isQueryMode
        ? queryResult.hasNextPage
        : (scrollConfig.hasNextPage ?? false);

    const isFetching = isQueryMode
        ? queryResult.isFetchingNextPage
        : (scrollConfig.isFetching ?? false);

    const onLoadMore = isQueryMode
        ? queryResult.fetchNextPage
        : scrollConfig.onLoadMore;

    const rootMargin = options.rootMargin ?? "250px";
    const threshold = options.threshold ?? 0;
    const root = options.root ?? null;
    const disabled = isQueryMode
        ? Boolean(queryConfig.disableAutoFetch)
        : Boolean(scrollConfig.disabled);

    const { sentinelRef, targetRef, targetElement } =
        useInfiniteScroll<TElement>({
            hasNextPage: hasNext,
            isFetching,
            onLoadMore,
            rootMargin,
            threshold,
            root,
            disabled,
        });

    if (isQueryMode) {
        return {
            ...queryResult,
            sentinelRef,
            targetRef,
            targetElement,
        };
    }

    return {
        sentinelRef,
        targetRef,
        targetElement,
    };
}

export default useInfinite;
