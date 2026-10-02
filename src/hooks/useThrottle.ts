import { useCallback, useRef } from "react";

export const useThrottle = <T>(func: (params: T) => void, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback(
        (prams: T) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                func(prams);
            }, delay);
        },
        [func, delay]
    );
};
