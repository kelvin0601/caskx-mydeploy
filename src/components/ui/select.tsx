"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { m } from "motion/react";
import * as React from "react";
import { FixedSizeList as List } from "react-window";

import { cn, convertRemToPx } from "@/lib/utils";
import IconArrowDownBold from "../shared/icons/icon-ar-down-bold";
import IconArUpBold from "../shared/icons/icon-ar-up-bold";
import { useFormField } from "./form";
import { ScrollArea } from "./scroll-area";

const Select = ({ children, ...props }: SelectPrimitive.SelectProps) => {
    const { required: _required, ...rest } = props;
    return <SelectPrimitive.Root {...rest}>{children}</SelectPrimitive.Root>;
};

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTriggerWithForm = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
        subLabel?: string;
        inputSize?: "md" | "lg";
        variant?: "input" | "button";
    }
>(
    (
        {
            className,
            children,
            subLabel,
            inputSize = "lg",
            variant = "input",
            ...props
        },
        ref
    ) => {
        const { error } = useFormField();

        return (
            <SelectPrimitive.Trigger
                ref={ref}
                className={cn(
                    "flex w-full select-none items-center justify-between gap-3 text-sm text-typo-primary shadow-none outline-none transition-all disabled:cursor-not-allowed disabled:bg-bg-disable dark:text-typo-dark-primary dark:disabled:bg-bg-dark-disable",
                    // Sizing
                    inputSize === "lg"
                        ? "h-12 pl-4 pr-3 mb:h-10 mb:pl-3"
                        : "h-10 pl-3 pr-2",
                    // Variant-specific styles
                    variant === "input"
                        ? "border border-transparent bg-bg-sf4 hover:border-bd-main focus:border-bd-brown-lighter focus-visible:border-bd-brown-lighter data-[state=open]:border-bd-brown-lighter data-[state=open]:bg-bg-sf4 dark:bg-bg-dark-sf4 dark:hover:border-bd-dark-main dark:focus:border-bd-dark-inverse dark:focus-visible:border-bd-dark-inverse dark:data-[state=open]:border-bd-dark-inverse dark:data-[state=open]:bg-bg-dark-sf4"
                        : "border border-bd-main bg-bg-main hover:border-bd-brown focus:border-bd-brown-lighter focus-visible:border-bd-brown-lighter data-[state=open]:border-bd-brown-lighter dark:border-bd-dark-main dark:bg-bg-dark-main dark:hover:border-bd-dark-brown dark:focus:border-bd-dark-inverse dark:focus-visible:border-bd-dark-inverse dark:data-[state=open]:border-bd-dark-inverse",
                    // Error State
                    error &&
                        "border-error bg-error-lighter hover:border-error data-[state=open]:border-error",
                    className
                )}
                {...props}
            >
                <div className="flex-1 truncate text-left">
                    {subLabel && (
                        <span className="mr-1 inline text-sm font-medium text-typo-primary">
                            {subLabel}
                        </span>
                    )}
                    {children}
                </div>
                <SelectPrimitive.Icon asChild className="flex-shrink-0">
                    <div className="h-5 w-5 transition-transform duration-200 data-[state=open]:rotate-180">
                        <IconArrowDownBold />
                    </div>
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
        );
    }
);
SelectTriggerWithForm.displayName = SelectPrimitive.Trigger.displayName;

const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
        subLabel?: string;
        inputSize?: "md" | "lg";
        variant?: "input" | "button" | "underline";
        hideCaret?: boolean;
    }
>(
    (
        {
            className,
            children,
            hideCaret,
            subLabel,
            inputSize = "lg",
            variant = "input",
            ...props
        },
        ref
    ) => {
        return (
            <SelectPrimitive.Trigger
                ref={ref}
                className={cn(
                    "group flex w-full select-none items-center justify-between gap-3 text-sm text-typo-primary shadow-none outline-none transition-all disabled:cursor-not-allowed disabled:bg-bg-disable dark:text-typo-dark-primary dark:disabled:bg-bg-dark-disable",
                    // Sizing
                    variant === "underline"
                        ? "h-auto rounded-none border-0 border-b border-bd-main bg-transparent p-0 pb-4 font-semibold hover:border-bd-main focus:border-bd-main dark:border-bd-dark-main dark:bg-transparent"
                        : inputSize === "lg"
                          ? "h-12 pl-4 pr-3 tb:pl-3 tb:pr-2.5 mb:h-10 mb:pl-3 mb:pr-2.5"
                          : "h-10 pl-3 pr-2",
                    // Variant-specific styles
                    variant === "underline"
                        ? ""
                        : variant === "input"
                          ? "border border-transparent bg-bg-sf4 hover:border-bd-main focus:border-bd-brown-lighter focus-visible:border-bd-brown-lighter data-[state=open]:border-bd-brown-lighter data-[state=open]:bg-bg-sf4 dark:bg-bg-dark-sf4 dark:hover:border-bd-dark-main dark:focus:border-bd-dark-inverse dark:focus-visible:border-bd-dark-inverse dark:data-[state=open]:border-bd-dark-inverse dark:data-[state=open]:bg-bg-dark-sf4"
                          : "border border-bd-main bg-bg-main hover:border-bd-brown focus:border-bd-brown-lighter focus-visible:border-bd-brown-lighter data-[state=open]:border-bd-brown-lighter dark:border-bd-dark-main dark:bg-bg-dark-main dark:hover:border-bd-dark-brown dark:focus:border-bd-dark-inverse dark:focus-visible:border-bd-dark-inverse dark:data-[state=open]:border-bd-dark-inverse",
                    className
                )}
                {...props}
            >
                <div className="flex-1 truncate text-left">
                    {subLabel && (
                        <span className="mr-1 inline text-sm font-medium text-typo-primary">
                            {subLabel}
                        </span>
                    )}
                    {children}
                </div>
                {!hideCaret && (
                    <SelectPrimitive.Icon asChild className="flex-shrink-0">
                        <div
                            className={cn(
                                "size-4 transition-transform duration-200 group-data-[state=open]:rotate-180",
                                variant === "underline"
                                    ? "text-typo-primary dark:text-typo-dark-primary"
                                    : "text-icon-main"
                            )}
                        >
                            <IconArrowDownBold />
                        </div>
                    </SelectPrimitive.Icon>
                )}
            </SelectPrimitive.Trigger>
        );
    }
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn(
            "flex cursor-default items-center justify-center py-1",
            className
        )}
        {...props}
    >
        <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn(
            "flex cursor-default items-center justify-center py-1",
            className
        )}
        {...props}
    >
        <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
    SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [dotTop, setDotTop] = React.useState<number | null>(null);
    const dotTopRef = React.useRef<number | null>(null);
    const itemCoordsRef = React.useRef<Map<Element, number>>(new Map());
    const firstInit = React.useRef<boolean>(false);

    const updateDotTop = React.useCallback((y: number) => {
        const roundedY = Math.round(y);
        if (dotTopRef.current !== roundedY) {
            dotTopRef.current = roundedY;
            setDotTop(roundedY);
        }
    }, []);

    const getItemCenterY = React.useCallback(
        (content: HTMLElement, el: Element): number | null => {
            const contentRect = content.getBoundingClientRect();
            const itemRect = el.getBoundingClientRect();
            const distance =
                itemRect.top - contentRect.top + itemRect.height / 2;
            return distance;
        },
        []
    );

    const moveToChecked = React.useCallback(
        (content: HTMLElement) => {
            const checked = content.querySelector('[data-state="checked"]');
            if (checked) {
                let y = itemCoordsRef.current.get(checked);
                if (y === undefined) {
                    const centerY = getItemCenterY(content, checked);
                    if (centerY !== null) {
                        y = centerY;
                        itemCoordsRef.current.set(checked, centerY);
                    }
                }
                if (y !== undefined) updateDotTop(y);
                return;
            }

            dotTopRef.current = null;
            setDotTop(null);
        },
        [getItemCenterY, updateDotTop]
    );

    const setRefs = React.useCallback(
        (node: HTMLDivElement | null) => {
            contentRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
        },
        [ref]
    );
    const updatePosition = React.useCallback(() => {
        const content = contentRef.current;
        if (!content) return;

        itemCoordsRef.current.clear();

        const active =
            content.querySelector("[data-highlighted]") ??
            content.querySelector('[data-state="checked"]');
        if (active) {
            const centerY = getItemCenterY(content, active);
            if (centerY !== null) {
                itemCoordsRef.current.set(active, centerY);
                updateDotTop(centerY);
            }
            return;
        }

        dotTopRef.current = null;
        setDotTop(null);
    }, [getItemCenterY, updateDotTop]);
    // useLayoutEffect fires synchronously after DOM is painted - catches the checked item
    // before the browser composites the frame, giving accurate getBoundingClientRect values.
    React.useLayoutEffect(() => {
        // Measure immediately after layout (most reliable for static dropdowns)
        updatePosition();

        // Staggered fallbacks to handle Radix Portal animation frames
        const id1 = requestAnimationFrame(updatePosition);
        const id2 = requestAnimationFrame(() =>
            requestAnimationFrame(updatePosition)
        );
        const t1 = setTimeout(updatePosition, 50);
        const t2 = setTimeout(updatePosition, 150);

        return () => {
            cancelAnimationFrame(id1);
            cancelAnimationFrame(id2);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [children, updatePosition]);

    // MutationObserver: keep dot in sync when Radix highlights or checks an item.
    React.useEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        const updatePosition = () => {
            const active =
                content.querySelector("[data-highlighted]") ??
                content.querySelector('[data-state="checked"]');
            if (active) {
                const centerY = getItemCenterY(content, active);
                if (centerY !== null) {
                    itemCoordsRef.current.set(active, centerY);
                    updateDotTop(centerY);
                }
            } else {
                dotTopRef.current = null;
                setDotTop(null);
            }
        };

        const observer = new MutationObserver((mutations) => {
            // Only re-measure when Radix changes the active item state.
            const relevant = mutations.some(
                (m) =>
                    m.type === "attributes" &&
                    (m.attributeName === "data-state" ||
                        m.attributeName === "data-highlighted")
            );
            if (relevant) {
                itemCoordsRef.current.clear();
                updatePosition();
            }
        });
        observer.observe(content, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ["data-state", "data-highlighted"],
        });

        return () => observer.disconnect();
    }, [children, getItemCenterY, updateDotTop]);

    // React event handlers - no need for addEventListener
    const handlePointerMove = React.useCallback(
        (e: React.PointerEvent | React.MouseEvent) => {
            const content = contentRef.current;
            if (!content) return;
            const item = (e.target as Element).closest('[role="option"]');
            if (item && content.contains(item)) {
                let y = itemCoordsRef.current.get(item);
                if (y === undefined) {
                    const centerY = getItemCenterY(content, item);
                    if (centerY !== null) {
                        y = centerY;
                        itemCoordsRef.current.set(item, centerY);
                    }
                }
                if (y !== undefined) updateDotTop(y);
            }
        },
        [getItemCenterY, updateDotTop]
    );

    const handlePointerLeave = React.useCallback(() => {
        const content = contentRef.current;
        if (content) moveToChecked(content);
    }, [moveToChecked]);

    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                ref={setRefs}
                onFocus={() => {
                    if (firstInit.current) return;
                    updatePosition();
                    firstInit.current = true;
                }}
                className={cn(
                    "relative z-50 w-[calc(var(--radix-popper-anchor-width))] min-w-[10.875rem] origin-[--radix-select-content-transform-origin] overflow-hidden border border-bd-main bg-bg-main px-4 py-1 text-typo-primary shadow-[0px_0.5rem_1.5rem_0px_rgba(0,0,0,0.08)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-bd-dark-main dark:bg-bg-dark-main dark:text-typo-dark-primary",
                    position === "popper" &&
                        "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                    className
                )}
                position={position}
                onPointerMove={handlePointerMove}
                onClick={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                {...props}
            >
                <SelectPrimitive.Viewport
                    className={cn(
                        position === "popper" &&
                            "-mr-4 h-[var(--radix-select-trigger-height)] w-auto pr-4"
                    )}
                >
                    <ScrollArea className="max-h-[calc(min(var(--radix-select-content-available-height),20rem))]">
                        {children}
                    </ScrollArea>
                </SelectPrimitive.Viewport>
                {dotTop !== null && (
                    <m.span
                        className="pointer-events-none absolute right-4 size-1 flex-shrink-0 rounded-full bg-typo-primary dark:bg-typo-dark-primary"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, top: dotTop - 2 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                    />
                )}
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

// Virtualized SelectContent for large lists
const VirtualizedSelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
        itemCount: number;
        itemSize?: number;
        maxHeight?: number;
        selectedValue?: string;
        getItemValue: (index: number) => string;
        renderItem: (props: {
            index: number;
            style: React.CSSProperties;
        }) => React.ReactNode;
    }
>(
    (
        {
            className,
            position = "popper",
            itemCount,
            itemSize = convertRemToPx(2.5),
            maxHeight = convertRemToPx(20),
            selectedValue,
            getItemValue,
            renderItem,
            ...props
        },
        ref
    ) => {
        const viewportRef = React.useRef<HTMLDivElement>(null);
        const listRef = React.useRef<React.ComponentRef<typeof List>>(null);
        const contentRef = React.useRef<HTMLDivElement>(null);
        const [viewportWidth, setViewportWidth] = React.useState<number>(0);
        const hasScrolledRef = React.useRef(false);

        React.useEffect(() => {
            if (viewportRef.current) {
                setViewportWidth(viewportRef.current.offsetWidth || 0);
            }
        }, []);

        // Scroll to selected item when dropdown opens
        React.useEffect(() => {
            if (
                selectedValue &&
                listRef.current &&
                itemCount > 0 &&
                contentRef.current
            ) {
                // Check if dropdown is open by observing data-state attribute
                const observer = new MutationObserver(() => {
                    const isOpen =
                        contentRef.current?.getAttribute("data-state") ===
                        "open";
                    if (isOpen && !hasScrolledRef.current) {
                        // Find the index of the selected value
                        let selectedIndex = -1;
                        for (let i = 0; i < itemCount; i++) {
                            if (getItemValue(i) === selectedValue) {
                                selectedIndex = i;
                                break;
                            }
                        }

                        if (selectedIndex >= 0) {
                            // Small delay to ensure the list is rendered
                            setTimeout(() => {
                                listRef.current?.scrollToItem(
                                    selectedIndex,
                                    "smart"
                                );
                                hasScrolledRef.current = true;
                            }, 50);
                        }
                    } else if (!isOpen) {
                        hasScrolledRef.current = false;
                    }
                });

                observer.observe(contentRef.current, {
                    attributes: true,
                    attributeFilter: ["data-state"],
                });

                // Also try to scroll immediately if already open
                if (contentRef.current?.getAttribute("data-state") === "open") {
                    let selectedIndex = -1;
                    for (let i = 0; i < itemCount; i++) {
                        if (getItemValue(i) === selectedValue) {
                            selectedIndex = i;
                            break;
                        }
                    }
                    if (selectedIndex >= 0) {
                        setTimeout(() => {
                            listRef.current?.scrollToItem(
                                selectedIndex,
                                "smart"
                            );
                        }, 50);
                    }
                }

                return () => {
                    observer.disconnect();
                };
            }
        }, [selectedValue, itemCount, getItemValue]);

        return (
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    ref={(node) => {
                        if (typeof ref === "function") {
                            ref(node);
                        } else if (ref) {
                            ref.current = node;
                        }
                        contentRef.current = node;
                    }}
                    className={cn(
                        "relative z-50 mt-2 max-h-[--radix-select-content-available-height] w-[min(var(--radix-popper-anchor-width))] origin-[--radix-select-content-transform-origin] overflow-hidden border border-bd-main bg-bg-sf2 text-typo-primary shadow-[0px_0.5rem_1.5rem_0px_rgba(0,0,0,0.08)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-bd-dark-main dark:bg-bg-dark-sf1 dark:text-typo-dark-primary",
                        position === "popper" &&
                            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                        className
                    )}
                    position={position}
                    {...props}
                >
                    <SelectScrollUpButton />
                    <SelectPrimitive.Viewport
                        ref={viewportRef}
                        className={cn(
                            "overflow-hidden",
                            position === "popper" &&
                                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
                        )}
                    >
                        {itemCount > 0 && (
                            <List
                                ref={listRef}
                                height={Math.min(
                                    itemCount * itemSize,
                                    maxHeight
                                )}
                                itemCount={itemCount}
                                itemSize={itemSize}
                                width={viewportWidth || "100%"}
                            >
                                {renderItem}
                            </List>
                        )}
                    </SelectPrimitive.Viewport>
                    <SelectScrollDownButton />
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        );
    }
);
VirtualizedSelectContent.displayName = "VirtualizedSelectContent";

const SelectLabel = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
        {...props}
    />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
        isHaveIcon?: boolean;
    }
>(({ className, children, isHaveIcon, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "relative block w-full max-w-[max(calc(var(--radix-popper-anchor-width)-2rem),10.875rem)] cursor-pointer select-none items-center border-b border-bd-main py-3 pl-0 text-sm font-medium text-typo-primary/70 outline-none transition-all last:border-b-0 hover:text-typo-primary data-[disabled]:pointer-events-none data-[state=checked]:text-typo-primary data-[disabled]:opacity-50 dark:border-bd-dark-main dark:text-typo-dark-primary/70 dark:hover:text-typo-dark-primary dark:data-[state=checked]:text-typo-dark-primary",
            isHaveIcon && "pl-8",
            className
        )}
        {...props}
    >
        {isHaveIcon && (
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
            </span>
        )}

        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn("h-px bg-bd-main", className)}
        {...props}
    />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectTriggerWithForm,
    SelectValue,
    VirtualizedSelectContent,
};
