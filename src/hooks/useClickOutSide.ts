import React from "react";

export default function useClickOutSide(
    cb: () => void,
    ref: React.RefObject<HTMLDivElement | null>
) {
    const handleClickOutside = (event: MouseEvent) => {
        const selectViewport = document.querySelector(
            "[data-radix-select-viewport]"
        );

        if (
            ref.current &&
            !ref.current.contains(event.target as Node) &&
            !(event.target as Node).contains(selectViewport)
        ) {
            cb();
        }
    };
    React.useEffect(() => {
        document.addEventListener("click", handleClickOutside, true);
        return () => {
            document.removeEventListener("click", handleClickOutside, true);
        };
    }, [cb]);
}
