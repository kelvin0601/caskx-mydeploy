import { useEffect, useRef, useState } from "react";
// Alternative hook using only scroll events (simpler approach)
export const useStickyScrollDetector = <
    T extends HTMLElement = HTMLElement,
>() => {
    const [isSticky, setIsSticky] = useState(false);
    const elementRef = useRef<T>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const handleScroll = () => {
            const rect = element.getBoundingClientRect();
            const sticky = rect.top <= 0;
            setIsSticky(sticky);
        };

        // Check initial state
        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return { isSticky, elementRef };
};
