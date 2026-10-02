"use client";

import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
} from "@/components/ui/command";
import { LabelWithOutForm } from "@/components/ui/label";
import CountBadge from "@/components/shared/count-badge";
import ScrollAreaWithFade from "@/components/shared/scroll-area-with-fade";
import { TOptionCheckBox } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import React, { useCallback } from "react";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

type TFilterCheckboxGroupProps = {
    title: string;
    field: ControllerRenderProps<FieldValues, FieldPath<FieldValues>>;
    options: TOptionCheckBox[];
    isHaveSearch?: boolean;
    className?: string;
};

const FilterCheckboxGroup = React.memo(function FilterCheckboxGroup(
    props: TFilterCheckboxGroupProps
) {
    const { title, field, options, isHaveSearch, className } = props;

    const handleCheckboxChange = useCallback(
        (checked: boolean, itemId: string) => {
            if (!Array.isArray(field.value)) return;

            if (checked) {
                const isAll = itemId === "all";
                if (isAll) {
                    field.onChange([itemId]);
                    return;
                }

                field.onChange([
                    ...field.value.filter((val) => val !== "all"),
                    itemId,
                ]);
            } else {
                field.onChange(field.value.filter((val) => val !== itemId));
            }
        },
        [field]
    );

    const activeCount = options.filter(
        (item) =>
            Array.isArray(field.value) && field.value.includes(item.id as never)
    ).length;

    const renderItems = () => (
        <div className="flex w-full flex-col gap-2">
            {options.map((item, index) => {
                const key = `${item.label}-${item.id}-${index}-${field.name}`;
                const isChecked =
                    Array.isArray(field.value) &&
                    field.value.includes(item.id as never);

                return (
                    <div
                        key={key}
                        className="group flex w-full cursor-pointer flex-row items-center gap-2"
                    >
                        <Checkbox
                            id={item.id}
                            value={item.id}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                                handleCheckboxChange(
                                    checked as boolean,
                                    item.id || ""
                                );
                            }}
                            className="data-[state=checked]:text-white h-3.5 w-3.5 flex-shrink-0 rounded-none border-bd-main data-[state=checked]:bg-black"
                        />
                        <div className="flex flex-1 flex-row items-center justify-between gap-1">
                            <LabelWithOutForm
                                htmlFor={item.id}
                                className="flex-1 cursor-pointer font-inter text-sm font-normal leading-normal text-typo-primary mb:text-sm"
                            >
                                {item.label?.split("-").join(" ")}
                            </LabelWithOutForm>
                            <span className="font-inter text-sm font-normal leading-normal text-typo-primary">
                                {item.count || 0}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div
            className={cn(
                "border-b border-bd-main pb-6 last:border-b-0 mb:pb-4",
                className
            )}
        >
            <AccordionItem value={field.name} className="border-none">
                <AccordionTrigger className="py-0">
                    <div className="flex flex-row items-center gap-1">
                        <h3 className="font-inter text-lg font-semibold leading-tight text-typo-primary">
                            {title}
                        </h3>
                        <CountBadge count={activeCount} />
                    </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 pb-0 pt-4">
                    {isHaveSearch ? (
                        <Command className="w-full rounded-none border-none bg-transparent">
                            <CommandInput
                                placeholder={`Search for a ${title?.toLowerCase()}`}
                                className="mb-0 h-11 border-none bg-bg-sf4 px-3 focus-within:border-none hover:border-none"
                            />
                            <CommandPrimitive.List className="relative mt-4 overflow-hidden">
                                <ScrollAreaWithFade className="h-64 w-full">
                                    <CommandEmpty className="text-start font-inter text-sm text-typo-note">
                                        No {title?.toLowerCase()}s found.
                                    </CommandEmpty>
                                    <CommandGroup>{renderItems()}</CommandGroup>
                                </ScrollAreaWithFade>
                            </CommandPrimitive.List>
                        </Command>
                    ) : (
                        renderItems()
                    )}
                </AccordionContent>
            </AccordionItem>
        </div>
    );
});

export default FilterCheckboxGroup;
