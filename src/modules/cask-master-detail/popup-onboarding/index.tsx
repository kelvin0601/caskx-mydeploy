import ImagePreload from "@/components/shared/image-preload";
import { Button } from "@/components/ui/button";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";

type TAuthStatus = {
    title?: string;
    description?: string;
    buttonText?: string;
    isDisableButton?: boolean;
    messageError?: string;
    className?: string;
} & PropsWithChildren;

export default function PopupOnboarding({ className, ...data }: TAuthStatus) {
    const router = useRouter();

    return (
        <div
            className={cn(
                "flex w-full flex-col items-center gap-8 tb:gap-6",
                className
            )}
        >
            {/* Onboarding Image Container */}
            <div className="flex size-16 items-center justify-center rounded-full border-2 border-bd-main bg-transparent">
                <div className="size-[1.9375rem]">
                    <ImagePreload
                        src="/icons/icon-wallet.svg"
                        typePlaceHolder="image"
                        width={31}
                        height={31}
                        priority
                        fetchPriority="high"
                        className="h-full w-full object-contain"
                    />
                </div>
            </div>

            {/* Content Text Wrapper */}
            <div className="flex w-full flex-col items-center gap-2 text-center">
                <h3 className="font-reckless text-xl font-medium text-typo-primary">
                    {data.title || "Add your payment method"}
                </h3>
                <p className="max-w-sm font-inter text-sm font-normal leading-normal text-typo-soft">
                    {data.description ||
                        "Add your payment method first so we can send you the funds from your sale."}
                </p>
            </div>

            {/* Action Button */}
            <div className="flex w-full flex-col gap-2">
                <Button
                    size={"xl"}
                    className="w-full"
                    disabled={data.isDisableButton}
                    variant={"action"}
                    onClick={() => {
                        router.push(ROUTE_PUBLIC.STRIPE_ONBOARDING);
                    }}
                >
                    {data.buttonText || "Add payment method"}
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
