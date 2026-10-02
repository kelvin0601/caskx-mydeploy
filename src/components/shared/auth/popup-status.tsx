import IconErrorStatus from "@/components/shared/icons/icon-error-status";
import IconPendingStatus from "@/components/shared/icons/icon-pending-status";
import IconResendStatus from "@/components/shared/icons/icon-resend-status";
import IconSuccessStatus from "@/components/shared/icons/icon-success-status";
import IconWalletStatus from "@/components/shared/icons/icon-wallet-status";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

export type TAuthStatus = {
    status: "success" | "error" | "pending" | "resend" | "idle" | "wallet";
    title?: string;
    buttonText?: string;
    buttonVariant?: Partial<ButtonProps["variant"]>;
    action?: () => void;
    isDisableButton?: boolean;
    messageError?: string;
    secondaryLinkText?: string;
    secondaryLinkAction?: () => void;
    className?: string;
} & PropsWithChildren;

export default function PopupStatus({
    status,
    className,
    buttonVariant = "primary",
    ...data
}: TAuthStatus) {
    const iconWithStatus = {
        success: <IconSuccessStatus />,
        error: <IconErrorStatus />,
        pending: <IconPendingStatus />,
        idle: null,
        resend: <IconResendStatus />,
        wallet: <IconWalletStatus />,
    };

    return (
        <div
            className={cn(
                "flex w-full select-none flex-col items-center justify-center space-y-10 mb:space-y-8",
                className
            )}
        >
            {iconWithStatus[status] && (
                <div className="flex items-center justify-center">
                    {iconWithStatus[status]}
                </div>
            )}

            <div className="flex w-full flex-col gap-2 text-center">
                <h2 className="font-reckless text-xl font-medium normal-case text-typo-primary tb:text-2xl mb:text-xl">
                    {data.title}
                </h2>
                <div className="mx-auto text-base text-typo-soft mb:text-sm">
                    {data.children}
                </div>
            </div>

            <div className="flex w-full flex-col gap-4">
                {data.buttonText && (
                    <Button
                        variant={buttonVariant}
                        disabled={data.isDisableButton}
                        size={"xl"}
                        className="w-full"
                        onClick={() => data.action?.()}
                    >
                        {data.buttonText}
                    </Button>
                )}
                {data.messageError && (
                    <p className="w-full text-center font-inter text-sm font-medium text-destructive">
                        {data.messageError}
                    </p>
                )}
                {data.secondaryLinkText && (
                    <div className="flex items-center justify-center gap-1 font-inter text-sm text-typo-soft">
                        <span>Or return to</span>
                        <Button
                            variant={"link"}
                            onClick={data.secondaryLinkAction}
                        >
                            {data.secondaryLinkText}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
