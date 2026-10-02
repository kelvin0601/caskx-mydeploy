"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
        orientation?: "vertical" | "horizontal";
    }
>(({ className, children, orientation = "vertical", ...props }, ref) => (
    <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn(
            "relative flex overflow-hidden",
            orientation === "vertical" ? "-mr-3 pr-3" : "-mb-2 pb-2",
            className
        )}
        {...props}
    >
        <ScrollAreaPrimitive.Viewport
            data-scroll-inner
            className="flex h-full max-h-[inherit] w-full flex-col rounded-[inherit] [&>div]:!block"
        >
            {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar orientation={orientation} />
        <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
    React.ComponentPropsWithoutRef<
        typeof ScrollAreaPrimitive.ScrollAreaScrollbar
    >
>(({ className, orientation = "vertical", ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
        ref={ref}
        orientation={orientation}
        className={cn(
            "flex touch-none select-none transition-colors",
            orientation === "vertical" &&
                "h-full w-1 border-l border-l-transparent",
            orientation === "horizontal" &&
                "h-1 flex-col border-t border-t-transparent",
            className
        )}
        {...props}
    >
        <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
