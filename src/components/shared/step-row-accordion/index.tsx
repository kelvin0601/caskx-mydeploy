import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { EBadgeVariant } from "@/enum/transaction";
import { payout } from "@/types";
import React from "react";

type StepRowProps = {
    title: string;
    rightIcon?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
    isDisabled?: boolean;
    isActive?: boolean;
    value: string;
    status?: payout.TAdminPayoutStatus;
    isAccordion?: boolean;
};

export default function StepRowAccordion({
    title,
    rightIcon,
    className,
    children,
    value,
    isActive,
    isDisabled,
    status,
    isAccordion = true,
}: StepRowProps) {
    const statusMap = {
        pending: EBadgeVariant.WARNING,
        completed: EBadgeVariant.SUCCESS,
        expired: EBadgeVariant.STATIC,
    };
    const statusColor = statusMap[
        status as keyof typeof statusMap
    ] as EBadgeVariant;

    const content = (
        <div
            className={
                "flex w-full items-center justify-between text-typo-note" +
                (className || "")
            }
        >
            <div className="flex w-full items-center justify-between gap-2">
                <div
                    className={`text-base font-semibold ${!isDisabled ? "text-typo-primary" : "text-typo-disable"}`}
                >
                    {title}
                </div>
                {isActive && status && !isDisabled && (
                    <Badge variant={statusColor} className="capitalize">
                        {status}
                    </Badge>
                )}
            </div>
        </div>
    );

    if (!isAccordion) {
        return (
            <div
                className={
                    "flex flex-col rounded-xl border bg-bg-main px-6 py-4" +
                    (isDisabled ? " border-bd-surface bg-bg-sf1" : "")
                }
            >
                <div className="border-b pb-4">{content}</div>

                {isActive && children && !isDisabled && <div>{children}</div>}
            </div>
        );
    }

    return (
        <div>
            <AccordionItem
                value={value}
                className={
                    "rounded-xl border bg-bg-main" +
                    (isDisabled ? " border-bd-surface bg-bg-sf1" : "")
                }
            >
                <AccordionTrigger
                    className="px-4 py-4"
                    disabled={isDisabled}
                    classNameChevron={
                        isDisabled ? "text-typo-disable" : "text-typo-primary"
                    }
                >
                    {content}
                </AccordionTrigger>
                {isActive && children && !isDisabled && (
                    <AccordionContent className="border-t px-4 pb-4">
                        {children}
                    </AccordionContent>
                )}
            </AccordionItem>
        </div>
    );
}
