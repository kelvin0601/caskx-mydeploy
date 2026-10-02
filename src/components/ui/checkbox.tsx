"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import IconChecked from "../shared/icons/icon-checked";

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            "peer h-3.5 w-3.5 shrink-0 rounded-none border border-bd-main text-typo-dark-primary transition-all focus-visible:border-bd-brown focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-black data-[state=checked]:bg-black",
            className
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator
            className={cn(
                "flex h-full w-full items-center justify-center text-current transition-all"
            )}
        >
            <IconChecked />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
