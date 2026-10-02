"use client";

import { useSyncExternalStore } from "react";

const subscribers = new Set<() => void>();
let removeResizeListener: (() => void) | null = null;

const subscribeToViewport = (callback: () => void) => {
    subscribers.add(callback);

    if (typeof window !== "undefined" && !removeResizeListener) {
        const handleResize = () => {
            subscribers.forEach((subscriber) => subscriber());
        };

        window.addEventListener("resize", handleResize, { passive: true });
        removeResizeListener = () => {
            window.removeEventListener("resize", handleResize);
            removeResizeListener = null;
        };
    }

    return () => {
        subscribers.delete(callback);
        if (subscribers.size === 0) removeResizeListener?.();
    };
};

const getViewportWidth = () =>
    typeof window === "undefined" ? 0 : window.innerWidth;

const getServerViewportWidth = () => 0;

export default function useResponsive() {
    const viewportWidth = useSyncExternalStore(
        subscribeToViewport,
        getViewportWidth,
        getServerViewportWidth
    );
    return {
        isMobile: viewportWidth > 0 && viewportWidth <= 767,
        isTablet: viewportWidth >= 768 && viewportWidth <= 1024,
        isDesktop: viewportWidth > 1024,
        isDesktopXL: viewportWidth >= 1200,
        isDesktop2XL: viewportWidth >= 1400,
    };
}
