import IconMail from "@/components/shared/icons/icon-mail";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import authService from "@/services/auth";
import { useBoundStore } from "@/store";
import { useMutation } from "@tanstack/react-query";
import { PropsWithChildren, useCallback } from "react";
import { useCaskDetail } from "../provider";

type TAuthStatus = {
    description?: string;
    buttonText?: string;
    action?: () => void;
    isDisableButton?: boolean;
    messageError?: string;
    className?: string;
} & PropsWithChildren;

export default function PopupVerify({ className, ...data }: TAuthStatus) {
    const { setIsOpenDialogVerify, setDialogType } = useCaskDetail();
    const { user } = useBoundStore();
    const resendEmail = useMutation({
        mutationFn: authService.resendEmailVerification,
    });

    const handleResendEmail = useCallback(async () => {
        await resendEmail.mutateAsync(user?.email ?? "");
        setIsOpenDialogVerify(false);
        data.action?.();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setDialogType("send");
        setIsOpenDialogVerify(true);
    }, [resendEmail, setIsOpenDialogVerify, setDialogType, user?.email]);

    return (
        <div
            className={cn(
                "flex w-full flex-col items-center gap-8 tb:gap-6",
                className
            )}
        >
            {/* Circle Mail Icon Container */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-bd-brown-lighter bg-transparent text-bd-brown-lighter">
                <IconMail className="h-8 w-8" />
            </div>

            {/* Content Text Wrapper */}
            <div className="flex w-full flex-col items-center gap-2 text-center">
                <h3 className="font-reckless text-xl font-medium text-typo-primary">
                    Verify Your Email
                </h3>
                <p className="max-w-sm font-inter text-sm leading-relaxed text-typo-soft">
                    {data.description ||
                        "You need to verify your email to start trading on Cask Exchange. It only takes a minute."}
                </p>
            </div>

            {/* Action Button */}
            <div className="flex w-full flex-col gap-2">
                <Button
                    size={"xl"}
                    className="w-full"
                    variant="action"
                    disabled={data.isDisableButton || resendEmail.isPending}
                    onClick={handleResendEmail}
                >
                    {resendEmail.isPending
                        ? "..."
                        : data.buttonText || "Verify now"}
                </Button>
                {data.messageError && (
                    <p className="mt-1 text-center text-sm font-medium text-destructive first-letter:capitalize">
                        {data.messageError}
                    </p>
                )}
            </div>
        </div>
    );
}
