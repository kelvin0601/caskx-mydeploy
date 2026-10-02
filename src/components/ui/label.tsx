"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useFormField } from "./form";

const labelVariants = cva(
    "text-sm mb:text-xs text-typo-primary inline-block after:content-['*'] after:ml-0.5 after:text-brand-darker after:hidden has-[+_div_input.required]:after:inline-block peer-disabled:cursor-not-allowed has-[+_textarea.required]:after:inline-block has-[+_*.required]:after:inline-block"
);

const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
        VariantProps<typeof labelVariants> & {
            required?: boolean;
        }
>(({ className, required, ...props }, ref) => {
    const { error } = useFormField();

    return (
        <LabelPrimitive.Root
            ref={ref}
            className={cn(
                labelVariants(),
                required && "after:inline-block",
                error && "after:text-error",
                className
            )}
            {...props}
        />
    );
});
Label.displayName = LabelPrimitive.Root.displayName;

const LabelWithOutForm = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
        VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => {
    return (
        <LabelPrimitive.Root
            ref={ref}
            className={cn(labelVariants(), className)}
            {...props}
        />
    );
});
LabelWithOutForm.displayName = "LabelWithOutForm";
export { Label, LabelWithOutForm };
