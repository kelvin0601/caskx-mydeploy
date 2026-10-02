import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center capitalize justify-center rounded-full transition-colors focus:outline-none select-none whitespace-nowrap",
    {
        variants: {
            variant: {
                default: "bg-bg-sf3 text-typo-primary",
                warning: "bg-bg-sf3 text-warn",
                destructive: "bg-bg-sf3 text-error",
                success: "bg-bg-sf3 text-success",
                outline:
                    "border border-bd-main text-typo-primary bg-transparent",
                complete: "bg-bg-sf3 text-complete",
                static: "bg-bg-sf3 text-typo-soft",
                pending: "bg-pink-50 text-pink",
                progressing: "bg-purple-50 text-purple",
                info: "bg-bg-sf3 text-info",
                errorDarker: "bg-bg-sf3 text-error-darker",
            },
            dotColor: {
                default: "bg-typo-primary",
                warning: "bg-warn",
                destructive: "bg-error",
                success: "bg-success",
                outline: "bg-typo-primary",
                complete: "bg-complete",
                static: "bg-typo-soft",
                progressing: "bg-purple",
                pending: "bg-pink",
                info: "bg-info",
                errorDarker: "bg-error-darker",
            },
            size: {
                xs: "h-5 px-2 text-xs font-semibold leading-[1.2] gap-1",
                sm: "px-2 py-0.5 text-xs font-semibold gap-1",
                md: "px-3 py-1 text-xs font-semibold gap-1",
                lg: "px-4 py-2 text-base font-semibold gap-2",
            },
        },
        defaultVariants: {
            variant: "default",
            dotColor: "default",
            size: "md",
        },
    }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof badgeVariants> & {
        isHaveDot?: boolean;
    };

export type TBadgeVariant = VariantProps<typeof badgeVariants>["variant"];
function Badge({ className, variant, size, children, ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                badgeVariants({ variant, size, dotColor: null }),
                "font-inter capitalize",
                className
            )}
            {...props}
        >
            {props.isHaveDot && (
                <div
                    className={cn(
                        badgeVariants({ dotColor: variant, variant: null }),
                        "h-1.5 w-1.5 shrink-0 rounded-full"
                    )}
                />
            )}
            {children}
        </div>
    );
}

export { Badge, badgeVariants };
