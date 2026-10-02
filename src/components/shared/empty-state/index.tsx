"use client";

import LinkCustom from "@/components/shared/link-custom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TEmptyStateProps = {
    title: string;
    description?: string | React.ReactNode;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
        variant?: "action" | "primary" | "link";
    };
    className?: string;
    height?: string;
};

export default function EmptyState({
    title,
    description,
    action,
    className,
    height,
}: TEmptyStateProps) {
    return (
        <div
            className={cn(
                "flex min-h-[50vh] w-full flex-col items-center justify-center gap-6 tb:gap-5",
                height,
                className
            )}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="font-reckless text-3xl font-medium leading-none text-typo-primary tb:text-2xl mb:text-xl">
                    {title}
                </h2>
                {description && (
                    <div className="text-base font-normal leading-normal text-typo-soft tb:text-sm">
                        {typeof description === "string" ? (
                            <p>{description}</p>
                        ) : (
                            description
                        )}
                    </div>
                )}
            </div>
            {action && (
                <>
                    {action.href ? (
                        <LinkCustom href={action.href}>
                            <Button
                                variant={action.variant || "action"}
                                className="px-5 py-3.5"
                            >
                                {action.label}
                            </Button>
                        </LinkCustom>
                    ) : (
                        <Button
                            variant={action.variant || "action"}
                            className="px-5 py-3.5"
                            onClick={action.onClick}
                        >
                            {action.label}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
