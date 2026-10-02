"use client";

import IconMinus from "@/components/shared/icons/icon-minus";
import IconPlus from "@/components/shared/icons/icon-plus";
import { type TRowActionsDropdownItem } from "@/components/shared/row-actions-dropdown";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type ReactNode } from "react";

type TMobileOrderCardProps = {
    value: string;
    title: string;
    vintage: string | number;
    actions?: TRowActionsDropdownItem[] | null;
    status: ReactNode;
    children: ReactNode;
};

export function MobileOrderCardDetail({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="flex h-[1.3125rem] min-w-0 items-center justify-between gap-4">
            <span className="text-sm font-normal leading-[1.5] text-typo-soft">
                {label}
            </span>
            <div className="min-w-0 text-right text-sm font-medium leading-[1.5] text-typo-primary">
                {children}
            </div>
        </div>
    );
}

export function MobileOrderCard({
    value,
    title,
    vintage,
    actions,
    status,
    children,
}: TMobileOrderCardProps) {
    return (
        <AccordionItem
            value={value}
            className="border border-bd-main bg-bg-main p-[0.9375rem] font-inter"
        >
            <AccordionTrigger
                className="group w-full items-start gap-3 p-0 text-left"
                classNameChevron="hidden"
            >
                <div className="flex min-w-0 max-w-[80%] flex-col items-start overflow-hidden">
                    <span
                        className="block w-full truncate text-sm font-semibold leading-[1.5] text-typo-primary"
                        title={title}
                    >
                        {title}
                    </span>
                    <span className="flex items-center gap-1 text-sm leading-[1.5]">
                        <span className="font-normal text-typo-soft">
                            Vintage
                        </span>
                        <span className="font-semibold text-typo-primary">
                            {vintage}
                        </span>
                    </span>
                </div>
                <div
                    className="w-4 shrink-0 self-start pt-1 text-icon-main"
                    aria-hidden="true"
                >
                    <span className="block group-data-[state=open]:hidden">
                        <IconPlus />
                    </span>
                    <span className="hidden group-data-[state=open]:block">
                        <IconMinus />
                    </span>
                </div>
            </AccordionTrigger>

            <AccordionContent className="pb-0" containerClassName="mt-3">
                <div className="flex flex-col gap-1.5 pt-2">{children}</div>

                {actions && actions.length > 0 ? (
                    <div className="mt-3 grid auto-cols-fr grid-flow-col !gap-1">
                        {actions.slice(0, 3).map((action) => (
                            <Button
                                key={action.label}
                                type="button"
                                variant="outline"
                                disabled={action.isDisabled}
                                className="h-10 min-w-0 px-2 text-sm font-medium capitalize"
                                onClick={action.onClick}
                            >
                                <span className="truncate">{action.label}</span>
                            </Button>
                        ))}
                    </div>
                ) : null}
            </AccordionContent>

            <div className="mt-3 flex h-[2.0625rem] min-w-0 items-center justify-between gap-4 border-t border-bd-main pt-[0.6875rem]">
                <span className="text-sm font-normal leading-[1.5] text-typo-soft">
                    Status
                </span>
                <div className="min-w-0 [&>*]:h-5 [&>*]:text-xs [&>*]:font-semibold [&>*]:leading-[1.2]">
                    {status}
                </div>
            </div>
        </AccordionItem>
    );
}

export function MobileOrderCardSkeleton({
    children,
}: {
    children?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3 border border-bd-main bg-bg-main p-[0.9375rem]">
            <div className="flex h-[2.625rem] items-start justify-between gap-4">
                <div className="flex flex-1 flex-col gap-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="size-4" />
            </div>
            {children}
            <div className="flex h-[2.0625rem] items-end justify-between border-t border-bd-main pt-[0.6875rem]">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
        </div>
    );
}

export function MobileOrderCardExpandedSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 pt-2">
                {Array.from({ length: 7 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex h-[1.3125rem] items-center justify-between"
                    >
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-3 !gap-1">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-10" />
                ))}
            </div>
        </div>
    );
}
