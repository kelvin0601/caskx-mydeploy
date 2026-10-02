"use client";

import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStoreDialogWrap } from "@/modules/security/two-fa-form/provider/security-dialog-provider";
import { JSX, PropsWithChildren, useRef } from "react";

type TSecurityChildItem = {
    title: string;
    subTitle?: string | (() => JSX.Element);
    midContent?: () => JSX.Element;
    rightContent?: () => JSX.Element;
    children?: React.ReactNode;
    icon: JSX.Element;
    action?: () => void;
    isActive?: boolean;
    className?: string;
};

export const SecurityChildItem = (props: TSecurityChildItem) => {
    const {
        title,
        subTitle,
        children,
        icon,
        midContent,
        rightContent,
        isActive,
        action,
        className,
    } = props;
    const Icon = icon;
    return (
        <div
            className={cn(
                "flex flex-row items-center gap-3 border-b border-bd-brown py-4 mb:gap-2",
                isActive && "rounded-md border-none bg-bg-sf1 px-4 mb:pl-4",
                action && "cursor-pointer",
                className
            )}
            onClick={action}
        >
            {/* Icon box */}
            <div
                className={cn(
                    "relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-bd-brown bg-bg-sf1 shadow-[0px_0px_0px_1px_rgba(10,13,18,0.18)_inset,0px_-2px_0px_0px_rgba(10,13,18,0.05)_inset,0px_1px_2px_0px_rgba(16,24,40,0.05)]",
                    isActive && "bg-bg-main"
                )}
            >
                <div className="h-5 w-5">{Icon}</div>
                {/* Active indicator dot */}
                {isActive && (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-bg-main bg-success" />
                )}
            </div>

            {/* Title + subtitle */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="text-left text-sm font-semibold capitalize text-typo-primary">
                    {title}
                </div>
                {subTitle && (
                    <div className="truncate text-left text-sm text-typo-soft">
                        {typeof subTitle === "function" ? subTitle() : subTitle}
                    </div>
                )}
            </div>

            {/* Mid content - hidden on mobile */}
            {midContent && (
                <div className="shrink-0 mb:hidden">{midContent()}</div>
            )}

            {/* Right action */}
            {rightContent && (
                <div className="ml-auto shrink-0 self-center">
                    {rightContent()}
                </div>
            )}

            {children}
        </div>
    );
};

export type TSecurityItemWithDialog = TSecurityChildItem &
    PropsWithChildren & {
        handleAfterClose?: () => void;
    };

// With Dialog must wrap DialogWrapProvider outside to get form
export const SecurityItemWithDialog = (props: TSecurityItemWithDialog) => {
    const { handleAfterClose, children, ...rest } = props;
    const { isOpen, setIsOpenDialog } = useStoreDialogWrap();
    const isPassStep = useRef<boolean>(false);

    return (
        <Dialog
            {...rest}
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && isPassStep.current) {
                    handleAfterClose?.();
                } else {
                    isPassStep.current = true;
                }
                setIsOpenDialog(open);
            }}
        >
            <div
                onClick={() => {
                    setIsOpenDialog(true);
                }}
            >
                <SecurityChildItem {...rest} />
            </div>
            {children}
        </Dialog>
    );
};

export const MiddleContent = ({
    leftTitle,
    rightTitle,
}: {
    leftTitle: string;
    rightTitle: string;
}) => {
    return (
        <div className="flex flex-row items-center gap-1.5 text-sm text-typo-soft">
            <span>{leftTitle}</span>
            <span className="text-typo-disable">·</span>
            <span>{rightTitle}</span>
        </div>
    );
};
