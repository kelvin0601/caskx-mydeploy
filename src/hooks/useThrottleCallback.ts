import { useRef, useCallback } from "react";

export function useThrottleCallback<T extends (...args: unknown[]) => void>(
    callback: T,
    delay: number
) {
    const lastCall = useRef(0);

    const throttled = useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();
            if (now - lastCall.current >= delay) {
                lastCall.current = now;
                callback(...args);
            }
        },
        [callback, delay]
    );

    return throttled;
}
