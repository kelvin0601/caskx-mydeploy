"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { m } from "motion/react";

import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{
    activeValue: string;
    layoutId: string;
    registerTrigger: (value: string, el: HTMLButtonElement | null) => void;
    setListEl: (el: HTMLDivElement | null) => void;
    indicatorX: number;
    indicatorW: number;
}>({
    activeValue: "",
    layoutId: "",
    registerTrigger: () => undefined,
    setListEl: () => undefined,
    indicatorX: 0,
    indicatorW: 0,
});

const Tabs = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, defaultValue, value, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(
        defaultValue?.toString() || ""
    );
    const layoutId = React.useId();
    const currentValue = value !== undefined ? value.toString() : internalValue;

    const listElRef = React.useRef<HTMLDivElement | null>(null);
    const triggersRef = React.useRef(new Map<string, HTMLButtonElement>());
    const [indicatorX, setIndicatorX] = React.useState(0);
    const [indicatorW, setIndicatorW] = React.useState(0);

    const setListEl = React.useCallback((el: HTMLDivElement | null) => {
        listElRef.current = el;
    }, []);

    const registerTrigger = React.useCallback(
        (val: string, el: HTMLButtonElement | null) => {
            const key = String(val);
            if (!el) {
                triggersRef.current.delete(key);
                return;
            }
            triggersRef.current.set(key, el);
        },
        []
    );

    const recomputeIndicator = React.useCallback(() => {
        const listEl = listElRef.current;
        const activeEl = triggersRef.current.get(String(currentValue));
        if (!listEl || !activeEl) return;

        const listRect = listEl.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        setIndicatorX(activeRect.left - listRect.left);
        setIndicatorW(activeRect.width);
    }, [currentValue]);

    React.useEffect(() => {
        recomputeIndicator();
    }, [recomputeIndicator]);

    React.useEffect(() => {
        const onResize = () => recomputeIndicator();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [recomputeIndicator]);

    return (
        <TabsContext.Provider
            value={{
                activeValue: currentValue,
                layoutId,
                registerTrigger,
                setListEl,
                indicatorX,
                indicatorW,
            }}
        >
            <TabsPrimitive.Root
                ref={ref}
                defaultValue={defaultValue}
                value={value}
                onValueChange={(val) => {
                    setInternalValue(val);
                    onValueChange?.(val);
                }}
                className={cn("w-full rounded-lg bg-bg-sf1 p-6", className)}
                {...props}
            />
        </TabsContext.Provider>
    );
});
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
        hideIndicator?: boolean;
    }
>(({ className, hideIndicator = false, ...props }, ref) => {
    const { setListEl, indicatorW, indicatorX } = React.useContext(TabsContext);

    return (
        <TabsPrimitive.List
            ref={(node) => {
                setListEl(node as unknown as HTMLDivElement | null);
                if (typeof ref === "function") ref(node);
                else if (ref)
                    (ref as React.MutableRefObject<unknown>).current = node;
            }}
            className={cn(
                "relative inline-flex items-center justify-center",
                className
            )}
            {...props}
        >
            {props.children}
            {!hideIndicator && indicatorW > 0 ? (
                <m.div
                    className="absolute bottom-0 left-0 h-[0.125rem] origin-center bg-current"
                    style={{ width: indicatorW }}
                    animate={{ x: indicatorX }}
                    transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.4,
                    }}
                />
            ) : null}
        </TabsPrimitive.List>
    );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, value, ...props }, ref) => {
    const { activeValue, registerTrigger } = React.useContext(TabsContext);
    const isActive = activeValue === value;

    return (
        <TabsPrimitive.Trigger
            ref={(node) => {
                registerTrigger(value, node);
                if (typeof ref === "function") ref(node);
                else if (ref)
                    (ref as React.MutableRefObject<unknown>).current = node;
            }}
            value={value}
            className={cn(
                "relative inline-flex items-center justify-center whitespace-nowrap pb-3 text-sm font-semibold text-typo-note ring-offset-background transition-colors focus-visible:bg-black/5 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-typo-primary",
                className
            )}
            {...props}
        >
            {children}
            {isActive ? null : null}
        </TabsPrimitive.Trigger>
    );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsTriggerCustom = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
        onPrefetch?: () => void;
    }
>(({ className, onPrefetch, children, value, ...props }, ref) => {
    const { activeValue, layoutId } = React.useContext(TabsContext);
    const isActive = activeValue === value;

    const childrenClone = React.cloneElement(
        children as React.ReactElement<{ className: string }>,
        { className: "z-10 contents" }
    );
    return (
        <TabsPrimitive.Trigger
            ref={ref}
            value={value}
            onMouseEnter={() => onPrefetch?.()}
            className={cn(
                "relative inline-flex items-center justify-center whitespace-nowrap rounded-sm border-x border-transparent px-3 py-2 text-sm font-semibold text-typo-note ring-offset-background transition-colors focus-visible:bg-black/5 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-typo-primary",
                !isActive ? "" : "border-x border-bd-main",
                className
            )}
            {...props}
        >
            <span className="relative z-10">{children}</span>
            {isActive && (
                <m.div
                    layoutId={`tab-bg-${layoutId}`}
                    className="absolute inset-0 z-0 min-h-[calc(100%+1px)] rounded-sm bg-[#F5F2EC]"
                    transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.4,
                    }}
                />
            )}
        </TabsPrimitive.Trigger>
    );
});
TabsTriggerCustom.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "pt-6 focus-visible:bg-black/5 focus-visible:outline-none",
            className
        )}
        {...props}
    />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsTriggerCustom };
