"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "motion/react";

const DropdownContext = React.createContext<{
    dotTop: number | null;
    updateDotTop: (y: number) => void;
    getItemCenterY: (el: Element) => number | null;
    containerRef: React.RefObject<HTMLDivElement | null>;
    dark?: boolean;
} | null>(null);

const Dropdown = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        activeSelector?: string;
        dark?: boolean;
        isShowDot?: boolean;
    }
>(
    (
        {
            className,
            children,
            activeSelector = '[data-active="true"]',
            dark = false,
            isShowDot = true,
            ...props
        },
        ref
    ) => {
        const containerRef = React.useRef<HTMLDivElement>(null);
        const [dotTop, setDotTop] = React.useState<number | null>(null);
        const dotTopRef = React.useRef<number | null>(null);

        React.useImperativeHandle(ref, () => containerRef.current!);

        const updateDotTop = React.useCallback((y: number) => {
            const roundedY = Math.round(y);
            if (dotTopRef.current !== roundedY) {
                dotTopRef.current = roundedY;
                setDotTop(roundedY);
            }
        }, []);

        const getItemCenterY = React.useCallback(
            (el: Element): number | null => {
                const content = containerRef.current;
                if (!content) return null;
                const contentRect = content.getBoundingClientRect();
                const itemRect = el.getBoundingClientRect();
                const distance =
                    itemRect.top - contentRect.top + itemRect.height / 2;
                return distance;
            },
            []
        );

        const moveToActive = React.useCallback(
            (content: HTMLElement) => {
                const active = content.querySelector(activeSelector);
                if (active) {
                    const y = getItemCenterY(active);
                    if (y !== null) updateDotTop(y);
                } else {
                    setDotTop(null);
                    dotTopRef.current = null;
                }
            },
            [activeSelector, getItemCenterY, updateDotTop]
        );

        const handlePointerMove = React.useCallback(
            (e: React.PointerEvent) => {
                const content = containerRef.current;
                if (!content) return;
                const item = (e.target as Element).closest("li");
                if (item && content.contains(item)) {
                    const y = getItemCenterY(item);
                    if (y !== null) updateDotTop(y);
                }
            },
            [getItemCenterY, updateDotTop]
        );

        const handlePointerLeave = React.useCallback(() => {
            const content = containerRef.current;
            if (content) moveToActive(content);
        }, [moveToActive]);

        // Initial positioning
        React.useEffect(() => {
            const content = containerRef.current;
            if (content) {
                const timer = setTimeout(() => {
                    moveToActive(content);
                }, 50);
                return () => clearTimeout(timer);
            }
        }, [children, moveToActive]);

        return (
            <DropdownContext.Provider
                value={{
                    dotTop,
                    updateDotTop,
                    getItemCenterY,
                    containerRef,
                    dark,
                }}
            >
                <div
                    ref={containerRef}
                    onPointerMove={handlePointerMove}
                    onPointerLeave={handlePointerLeave}
                    className={cn(
                        "relative border px-4 py-1 shadow-[0px_0.5rem_1.5rem_0px_rgba(0,0,0,0.08)]",
                        dark
                            ? "border-bd-brown bg-bg-dark-main text-typo-dark-primary"
                            : "border-bd-main bg-bg-main text-typo-primary",
                        className
                    )}
                    {...props}
                >
                    {children}
                    <AnimatePresence>
                        {dotTop !== null && isShowDot && (
                            <m.span
                                className={cn(
                                    "pointer-events-none absolute right-6 size-1.5 rounded-full",
                                    dark
                                        ? "bg-typo-dark-primary"
                                        : "bg-typo-primary"
                                )}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    top: dotTop - 3,
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </DropdownContext.Provider>
        );
    }
);
Dropdown.displayName = "Dropdown";

const DropdownList = React.forwardRef<
    HTMLUListElement,
    React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        className={cn("flex flex-col overflow-hidden", className)}
        {...props}
    />
));
DropdownList.displayName = "DropdownList";

const DropdownItem = React.forwardRef<
    HTMLLIElement,
    React.HTMLAttributes<HTMLLIElement> & {
        isActive?: boolean;
    }
>(({ className, isActive, ...props }, ref) => {
    const ctx = React.useContext(DropdownContext);
    const dark = ctx?.dark ?? false;

    return (
        <li
            ref={ref}
            data-active={isActive}
            className={cn(
                "cursor-pointer border-b py-4 text-sm font-medium outline-none transition-all",
                dark
                    ? "border-bd-brown text-typo-dark-soft hover:text-typo-dark-primary"
                    : "border-bd-main text-typo-primary hover:text-typo-primary",
                isActive &&
                    (dark
                        ? "bg-white/5 text-typo-dark-primary"
                        : "bg-bg-sf1 text-typo-primary"),
                "last:border-b-0",
                className
            )}
            {...props}
        />
    );
});
DropdownItem.displayName = "DropdownItem";

export { Dropdown, DropdownList, DropdownItem };
