import ImagePreload from "@/components/shared/image-preload";
import { Button } from "@/components/ui/button";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";

type TAuthStatus = {
    description?: string;
    buttonText?: string;
    isDisableButton?: boolean;
    messageError?: string;
    className?: string;
} & PropsWithChildren;

export default function PopupVerify({ className, ...data }: TAuthStatus) {
    const router = useRouter();
    return (
        <div className={cn("flex-center flex-col space-y-4", className)}>
            <div className={cn("aspect-[220/178] h-auto w-[11.125rem]")}>
                <ImagePreload
                    src="/images/processing_payout.png"
                    typePlaceHolder="image"
                    width={200}
                    height={100}
                    priority
                    fetchPriority="high"
                />
            </div>
            <div className="text-center text-base text-typo-primary">
                {data.description}
            </div>
            <Button
                className="w-full"
                variant="secondary"
                disabled={data.isDisableButton}
                onClick={() => {
                    router.push(ROUTE_PUBLIC.STRIPE_ONBOARDING);
                }}
            >
                {data.buttonText}
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
