"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";

import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef<
    React.ElementRef<typeof OTPInput>,
    React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
    <OTPInput
        ref={ref}
        containerClassName={cn(
            "flex items-center gap-2 has-[:disabled]:opacity-50  border-none outline-none overflow-hidden !mt-0",
            containerClassName
        )}
        className={cn("!opacity-0 disabled:cursor-not-allowed", className)}
        {...props}
    />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
    React.ElementRef<"div">,
    React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex w-max items-center justify-center gap-1 border-none outline-none",
            className
        )}
        {...props}
    />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
    React.ElementRef<"div">,
    React.ComponentPropsWithoutRef<"div"> & { index: number; isError?: boolean }
>(({ index, className, isError, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

    return (
        <div
            ref={ref}
            className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-none border border-bd-main text-base font-medium text-typo-primary transition-all focus-within:border-bg-dark-main focus:border-bg-dark-main",
                isActive && "z-10 border-bg-dark-main ring-0",
                isError && "border-error",
                className
            )}
            {...props}
        >
            {char}
            {hasFakeCaret && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="animate-caret-blink h-4 w-px bg-primary" />
                </div>
            )}
        </div>
    );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
    React.ElementRef<"div">,
    React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
        <Dot />
    </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
