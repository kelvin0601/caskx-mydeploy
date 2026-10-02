import IconLoading from "@/components/shared/icons/icon-loading";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCheckout } from "@/store/checkout";
import { PropsWithChildren } from "react";

type TAuthStatus = {
    status: string;
    title?: string;
    buttonText?: string;
    action?: () => void;
    isDisableButton?: boolean;
    messageError?: string;
    className?: string;
} & PropsWithChildren;

export default function PopupConfirmCheckoutStatus({
    status,
    className,
    ...data
}: TAuthStatus) {
    const { setIsOpenPopup } = useCheckout();
    const imageWithStatus = {
        success: (
            <ImagePlaceholder
                alt="Signup success"
                src="/icons/signup-success.svg"
                width={80}
                height={80}
            />
        ),
        error: (
            <ImagePlaceholder
                alt="Signup error"
                src="/icons/signup-error.svg"
                width={80}
                height={80}
            />
        ),
        pending: <IconLoading />,
        idle: "",
        resend: (
            <ImagePlaceholder
                alt="Signup resend"
                src="/icons/sign-up-email.svg"
                width={80}
                height={80}
            />
        ),
        wallet: (
            <ImagePlaceholder
                alt="Signup wallet"
                src="/icons/sign-credit.svg"
                width={80}
                height={80}
            />
        ),
        signature: (
            <ImagePlaceholder
                alt="Signup signature"
                src="/icons/sign-signature.svg"
                width={80}
                height={80}
            />
        ),
    };
    return (
        <div
            className={cn(
                "flex-center flex-col space-y-8 mb:space-y-4",
                className
            )}
        >
            <div
                className={cn(
                    "h-20 w-20 tb:h-16 tb:w-16 mb:h-[3.125rem] mb:w-[3.125rem]"
                )}
            >
                {imageWithStatus[status as keyof typeof imageWithStatus] &&
                    imageWithStatus[status as keyof typeof imageWithStatus]}
            </div>
            <div className="text-center">
                <div className="mb-2 text-lg font-semibold capitalize text-typo-primary">
                    {data.title}
                </div>
                <div className="text-sm text-typo-soft">{data.children}</div>
            </div>
            <div className="flex flex-row gap-3">
                <Button
                    variant="outline"
                    disabled={data.isDisableButton}
                    onClick={() => data.action?.()}
                >
                    Back to home
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setIsOpenPopup(false)}
                >
                    {data.buttonText}
                </Button>
            </div>
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
