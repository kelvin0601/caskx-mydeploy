import ImagePreload from "@/components/shared/image-preload";
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
        <div className={cn("flex-center flex-col space-y-4", className)}>
            <div className={cn("aspect-[220/178] h-auto w-[11.125rem]")}>
                <ImagePreload
                    src="/images/verify_popup.png"
                    typePlaceHolder="image"
                    width={200}
                    height={100}
                    fetchPriority="high"
                    priority
                />
            </div>
            <div className="text-center text-base text-typo-primary">
                {data.description}
            </div>
            <Button
                className="w-full"
                variant="secondary"
                disabled={data.isDisableButton}
                onClick={handleResendEmail}
            >
                {resendEmail.isPending ? "..." : data.buttonText}
            </Button>
            {data.messageError && (
                <p
                    className={
                        "!mt-[0.375rem] text-sm font-medium text-destructive first-letter:capitalize"
                    }
                >
                    {data.messageError}
                </p>
            )}
        </div>
    );
}
