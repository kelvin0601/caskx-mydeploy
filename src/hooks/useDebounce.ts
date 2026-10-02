import { useCallback, useEffect, useRef, useState } from "react";

export const useDebounce = <T>(value: T, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timeout);
    }, [value, delay]);

    return debouncedValue;
};

export function useDebouncedCallback<A extends unknown[]>(
    callback: (...args: A) => void,
    wait: number
) {
    // track args & timeout handle between calls
    const argsRef = useRef<A>([] as unknown as A);
    const timeout = useRef<ReturnType<typeof setTimeout>>(null);

    function cleanup() {
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
    }

    // make sure our timeout gets cleared if
    // our consuming component gets unmounted
    useEffect(() => cleanup, []);

    return function debouncedCallback(...args: A) {
        // capture latest args
        argsRef.current = args;

        // clear debounce timer
        cleanup();

        // start waiting again
        timeout.current = setTimeout(() => {
            if (argsRef.current) {
                callback(...argsRef.current);
            }
        }, wait);
    };
}
