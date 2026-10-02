import { useEffect } from "react";

export const useScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (!isLocked) return;
        const allowedSelectors: string[] = [
            "[data-radix-scroll-area-viewport]",
        ];

        const keys: { [key: number]: number } = {
            32: 1,
            33: 1,
            34: 1,
            35: 1,
            36: 1,
            37: 1,
            38: 1,
            39: 1,
            40: 1,
        };

        const preventDefault = (e: Event) => {
            if (
                allowedSelectors.some((selector) =>
                    (e.target as HTMLElement)?.closest(selector)
                )
            ) {
                return;
            }
            e.preventDefault();
        };

        const preventDefaultForScrollKeys = (e: KeyboardEvent) => {
            if (keys[e.keyCode]) {
                preventDefault(e);
                return false;
            }
        };

        const wheelOpt = { passive: false };
        const wheelEvent =
            "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

        window.addEventListener(wheelEvent, preventDefault, wheelOpt);

        window.addEventListener("touchmove", preventDefault, wheelOpt);

        window.addEventListener("keydown", preventDefaultForScrollKeys, false);

        return () => {
            window.removeEventListener(
                wheelEvent,
                preventDefault,
                wheelOpt as unknown as EventListenerOptions
            );
            window.removeEventListener(
                "touchmove",
                preventDefault,
                wheelOpt as unknown as EventListenerOptions
            );
            window.removeEventListener(
                "keydown",
                preventDefaultForScrollKeys,
                false
            );
        };
    }, [isLocked]);
};
