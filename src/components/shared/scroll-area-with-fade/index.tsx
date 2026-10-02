"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ScrollAreaProps } from "@radix-ui/react-scroll-area";
import { useInView } from "motion/react";
import React, { useRef } from "react";

type ScrollAreaWithFadeProps = ScrollAreaProps & {
    overlayClassName?: string;
    fadeColor?: string; // Optional: specify the to-[color] explicitly if not to-bg-main
};

const ScrollAreaWithFade = React.forwardRef<
    React.ElementRef<typeof ScrollArea>,
    ScrollAreaWithFadeProps
>(
    (
        {
            className,
            children,
            overlayClassName,
            fadeColor = "to-bg-main",
            ...props
        },
        ref
    ) => {
        const sentinelRef = useRef<HTMLDivElement>(null);
        const isAtBottom = useInView(sentinelRef, { margin: "-20px" });

        return (
            <div className="relative -mr-3 flex h-full min-h-0 flex-1 flex-col overflow-hidden pr-3">
                <ScrollArea
                    ref={ref}
                    className={cn("h-full w-auto mb:w-auto", className)}
                    {...props}
                >
                    {children}
                    <div ref={sentinelRef} className="h-px w-full" />
                </ScrollArea>
                {/* Bottom Overlay */}
                <div
                    className={cn(
                        "pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-20 bg-gradient-to-b from-transparent transition-opacity duration-300",
                        fadeColor,
                        isAtBottom ? "opacity-0" : "opacity-100",
                        overlayClassName
                    )}
                />
            </div>
        );
    }
);
ScrollAreaWithFade.displayName = "ScrollAreaWithFade";

export default ScrollAreaWithFade;
