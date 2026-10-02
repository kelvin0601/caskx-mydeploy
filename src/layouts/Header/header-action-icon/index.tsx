import { cn } from "@/lib/utils";
import React from "react";

export const HeaderActionIcon = React.forwardRef<
    HTMLButtonElement,
    {
        icon: React.ReactNode;
        onClick?: () => void;
        className?: string;
        hasNotification?: boolean;
        badgeCount?: number;
        isOpen?: boolean;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(
    (
        {
            icon,
            onClick,
            className,
            hasNotification,
            badgeCount,
            isOpen,
            ...props
        },
        ref
    ) => {
        const showDot = Boolean(
            hasNotification ||
            (typeof badgeCount === "number" && badgeCount > 0)
        );

        return (
            <button
                type="button"
                ref={ref}
                className={cn(
                    "hover:bg-white/5 group relative flex h-full w-[3.75rem] cursor-pointer touch-manipulation items-center justify-center self-stretch border-bd-brown p-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white-main tb:w-[3.25rem] mb:w-12",
                    className
                )}
                onClick={onClick}
                {...props}
            >
                <div
                    className={cn(
                        "relative h-4 w-4 text-typo-dark-sub transition-colors group-hover:text-white-main",
                        isOpen && "text-typo-dark-primary"
                    )}
                >
                    {icon}
                </div>
                {showDot && (
                    <div
                        data-testid="header-notification-dot"
                        className="absolute right-[1.35rem] top-[1.05rem] h-[0.3125rem] w-[0.3125rem] rounded-full border-2 border-black bg-error p-0.5 tb:right-[1.125rem] tb:top-4 mb:right-4 mb:top-3.5"
                    />
                )}
            </button>
        );
    }
);
HeaderActionIcon.displayName = "HeaderActionIcon";
