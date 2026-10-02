"use client";

import IconMinus from "@/components/shared/icons/icon-minus";
import IconPlus from "@/components/shared/icons/icon-plus";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type TMobileTransactionCardItem = {
    id: string;
    number: number;
    quantity: ReactNode;
    price: ReactNode;
    subtotal: ReactNode;
    statusLabel: ReactNode;
    statusVariant: BadgeProps["variant"];
    lastUpdated?: ReactNode;
    action?: ReactNode;
};

type TMobileTransactionCardsProps = {
    items: TMobileTransactionCardItem[];
    defaultOpenItemId?: string;
    className?: string;
};

export default function MobileTransactionCards({
    items,
    defaultOpenItemId,
    className,
}: TMobileTransactionCardsProps) {
    if (items.length === 0) return null;

    return (
        <Accordion
            type="multiple"
            defaultValue={defaultOpenItemId ? [defaultOpenItemId] : []}
            className={cn("hidden flex-col gap-2 mb:flex", className)}
        >
            {items.map((item) => (
                <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border border-bd-main px-4"
                >
                    <AccordionTrigger
                        className="group py-4 text-sm font-normal text-typo-soft mb:py-4"
                        classNameChevron="hidden"
                    >
                        <span>
                            No.{" "}
                            <span className="font-medium text-typo-primary">
                                {item.number}
                            </span>
                        </span>
                        <span
                            className="size-4 text-icon-main group-data-[state=open]:hidden"
                            aria-hidden="true"
                        >
                            <IconPlus />
                        </span>
                        <span
                            className="hidden size-4 text-icon-main group-data-[state=open]:block"
                            aria-hidden="true"
                        >
                            <IconMinus />
                        </span>
                    </AccordionTrigger>

                    <AccordionContent className="pb-3 pt-2">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5 text-sm">
                                <div className="flex min-w-0 items-center justify-between gap-4">
                                    <span className="text-typo-soft">
                                        Quantity
                                    </span>
                                    <span className="min-w-0 truncate font-medium text-typo-primary">
                                        {item.quantity}
                                    </span>
                                </div>
                                <div className="flex min-w-0 items-center justify-between gap-4">
                                    <span className="text-typo-soft">
                                        Price
                                    </span>
                                    <span className="min-w-0 truncate font-medium text-typo-primary">
                                        {item.price}
                                    </span>
                                </div>
                                <div className="flex min-w-0 items-center justify-between gap-4">
                                    <span className="text-typo-soft">
                                        Cask subtotal
                                    </span>
                                    <span className="min-w-0 truncate font-medium text-typo-primary">
                                        {item.subtotal}
                                    </span>
                                </div>
                                {item.lastUpdated !== undefined && (
                                    <div className="flex min-w-0 items-center justify-between gap-4">
                                        <span className="text-typo-soft">
                                            Last updated
                                        </span>
                                        <span className="min-w-0 truncate font-medium text-typo-primary">
                                            {item.lastUpdated}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {item.action}
                        </div>
                    </AccordionContent>

                    <div className="flex min-w-0 items-center justify-between gap-4 border-t border-bd-main pb-4 pt-3 text-sm">
                        <span className="text-typo-soft">Status</span>
                        <Badge
                            variant={item.statusVariant}
                            size="xs"
                            className="max-w-[70%] truncate"
                        >
                            {item.statusLabel}
                        </Badge>
                    </div>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
