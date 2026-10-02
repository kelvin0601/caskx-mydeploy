"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, children, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
            "relative z-50 line-clamp-1 max-w-[22.5rem] origin-[--radix-tooltip-content-transform-origin] truncate rounded-md bg-bg-dark-main px-3 py-2 text-xs text-typo-dark-primary shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
        )}
        {...props}
    >
        <div className="absolute left-1/2 top-full w-4 -translate-x-1/2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                viewBox="0 0 16 10"
                fill="none"
            >
                <path
                    d="M14.0711 -2.232C14.962 -2.232 15.4081 -1.15485 14.7782 -0.524888L8.70711 5.54619C8.31658 5.93671 7.68342 5.93671 7.29289 5.54619L1.22183 -0.524888C0.591867 -1.15485 1.03803 -2.232 1.92894 -2.232L14.0711 -2.232Z"
                    className="fill-bg-dark-main"
                />
            </svg>
        </div>
        {children}
    </TooltipPrimitive.Content>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
