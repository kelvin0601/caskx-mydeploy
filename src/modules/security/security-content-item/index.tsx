"use client";

import { cn } from "@/lib/utils";
import { JSX, PropsWithChildren } from "react";

type TSecurityContentItem = {
    /** Bold title (16px, semibold) */
    title: string;
    /** Muted subtitle (14px) */
    subtitle?: string;
    /** Inline meta row - browser | location | date */
    meta?: string[];
    /** Right-side action element */
    rightAction?: JSX.Element;
    className?: string;
    subtitleClassName?: string;
    onClick?: () => void;
};

export default function SecurityContentItem({
    title,
    subtitle,
    meta,
    rightAction,
    className,
    subtitleClassName,
    onClick,
}: TSecurityContentItem) {
    return (
        <div
            className={cn(
                "flex flex-row items-center justify-between gap-4 bg-bg-sf4 p-4 mb:flex-col mb:gap-2",
                onClick && "cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            {/* Left: title + subtitle/meta */}
            <div className="flex min-w-0 flex-1 flex-col gap-1 mb:gap-0.5 mb:self-start">
                <p className="text-base font-semibold text-typo-primary tb:text-sm">
                    {title}
                </p>
                {subtitle && (
                    <p
                        className={cn(
                            "text-sm text-typo-soft tb:text-xs",
                            subtitleClassName
                        )}
                    >
                        {subtitle}
                    </p>
                )}
                {meta && meta.length > 0 && (
                    <div className="flex flex-row flex-wrap items-center gap-2 text-sm text-typo-soft mb:gap-1 mb:text-xs">
                        {meta.map((item, i) => (
                            <span
                                key={i}
                                className="flex items-center gap-2 mb:gap-1"
                            >
                                {i > 0 && (
                                    <span className="text-typo-disable">|</span>
                                )}
                                <span>{item}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: link action */}
            {rightAction && (
                <div className="shrink-0 self-center mb:self-start">
                    {rightAction}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SecurityContentItemDialog
// Wraps SecurityContentItem so clicking opens a Dialog/Drawer.
// Must be used inside a DialogWrapProvider.
// ─────────────────────────────────────────────────────────────
import { Dialog } from "@/components/ui/dialog";
import { useStoreDialogWrap } from "../two-fa-form/provider/security-dialog-provider";
import { useRef } from "react";

type TSecurityContentItemDialog = TSecurityContentItem &
    PropsWithChildren & {
        handleAfterClose?: () => void;
        onOpenAction?: () => void;
    };

export function SecurityContentItemDialog({
    children,
    handleAfterClose,
    onOpenAction,
    ...itemProps
}: TSecurityContentItemDialog) {
    const { isOpen, setIsOpenDialog } = useStoreDialogWrap();
    const hasOpened = useRef(false);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && hasOpened.current) {
                    handleAfterClose?.();
                } else {
                    hasOpened.current = true;
                }
                setIsOpenDialog(open);
            }}
        >
            <SecurityContentItem
                {...itemProps}
                onClick={() => {
                    onOpenAction?.();
                    setIsOpenDialog(true);
                }}
            />
            {children}
        </Dialog>
    );
}
