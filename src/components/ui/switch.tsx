"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const switchVariants = cva(
    "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center !rounded-full border-2 border-transparent transition-colors focus-visible:outline-none disabled:cursor-not-allowed mb:h-5 mb:w-9",
    {
        variants: {
            mode: {
                light: "data-[state=unchecked]:bg-bg-disable",
                dark: "data-[state=unchecked]:bg-bg-dark-sf3",
            },
            variant: {
                default: "data-[state=checked]:bg-success",
                black: "",
            },
        },
        compoundVariants: [
            {
                mode: "light",
                variant: "black",
                class: "data-[state=checked]:bg-bg-dark-main",
            },
            {
                mode: "dark",
                variant: "black",
                class: "data-[state=checked]:bg-bg-dark-sf3",
            },
        ],
        defaultVariants: {
            mode: "light",
            variant: "default",
        },
    }
);

type SwitchProps = React.ComponentPropsWithoutRef<
    typeof SwitchPrimitives.Root
> &
    VariantProps<typeof switchVariants>;

const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    SwitchProps
>(({ className, mode, variant, ...props }, ref) => (
    <SwitchPrimitives.Root
        className={cn(switchVariants({ mode, variant }), className)}
        {...props}
        ref={ref}
    >
        <SwitchPrimitives.Thumb
            className={cn(
                "pointer-events-none block size-5 !rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 mb:size-4 mb:data-[state=checked]:translate-x-4"
            )}
        />
    </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
