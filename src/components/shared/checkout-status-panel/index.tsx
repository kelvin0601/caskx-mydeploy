import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type TCheckoutStatusPanelProps = {
    icon: ReactNode;
    title: ReactNode;
    description: ReactNode;
    action?: ReactNode;
    className?: string;
};

export default function CheckoutStatusPanel({
    icon,
    title,
    description,
    action,
    className,
}: TCheckoutStatusPanelProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-10 bg-bg-sf4 px-6 py-10 text-center tb:gap-6 j-tb:py-8 mb:px-4 mb:py-6",
                className
            )}
        >
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-icon-main text-icon-main mb:size-12 mb:border-[1.5px]">
                <div className="size-8 mb:size-6">{icon}</div>
            </div>

            <div className="flex w-full max-w-2xl flex-col items-center gap-6 tb:gap-5">
                <div className="flex w-full flex-col items-center gap-2">
                    <h2 className="font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                        {title}
                    </h2>
                    <div className="text-sm leading-[1.5] text-typo-soft">
                        {description}
                    </div>
                </div>
                {action}
            </div>
        </div>
    );
}
