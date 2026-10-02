"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode, useState } from "react";
import IconDotVrt from "../icons/icon-dot-vrt";

export type TRowActionsDropdownItem = {
    label: string;
    onClick: () => void;
    icon: ReactNode;
    isDisabled?: boolean;
    tooltip?: string;
};

export function RowActionsDropdown({
    items,
    align = "end",
}: {
    items?: TRowActionsDropdownItem[] | null;
    align?: "start" | "center" | "end";
}) {
    const [value, setValue] = useState("");

    if (!items || items.length === 0) return null;

    return (
        <Select
            value={value}
            onValueChange={(val) => {
                const selectedItem = items.find((item) => item.label === val);
                if (selectedItem && !selectedItem.isDisabled) {
                    selectedItem.onClick();
                }
                setValue("");
            }}
        >
            <SelectTrigger
                variant="button"
                inputSize="md"
                className="h-10 w-10 min-w-10 shrink-0 rounded-none border-none bg-transparent p-0 hover:border-none hover:bg-transparent focus:border-none focus-visible:border-none data-[state=open]:border data-[state=open]:border-bd-main data-[state=open]:bg-bg-sf2 data-[state=open]:focus:border-bd-main data-[state=open]:focus-visible:border-bd-main"
                hideCaret
            >
                <div className="flex size-full items-center justify-center rounded-full p-2 text-icon-main transition-colors group-hover:text-icon-highlight group-data-[state=open]:text-icon-highlight">
                    <IconDotVrt />
                </div>
            </SelectTrigger>
            <SelectContent align={align} className="w-[10rem] min-w-[10rem]">
                <TooltipProvider delayDuration={150}>
                    {items.map((item, index) => {
                        const content = (
                            <div className="flex cursor-pointer flex-row items-center gap-2 text-typo-primary">
                                {item.icon ? (
                                    <div className="size-4 shrink-0">
                                        {item.icon}
                                    </div>
                                ) : null}
                                <div className="text-sm">{item.label}</div>
                            </div>
                        );

                        return (
                            <SelectItem
                                key={`${item.label}-${index}`}
                                value={item.label}
                                disabled={item.isDisabled}
                            >
                                {item.isDisabled && item.tooltip ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div
                                                className="pointer-events-auto flex cursor-not-allowed flex-row items-center gap-2 text-typo-disable"
                                                title={item.tooltip}
                                            >
                                                {item.icon ? (
                                                    <div className="size-4 shrink-0">
                                                        {item.icon}
                                                    </div>
                                                ) : null}
                                                <div className="text-sm">
                                                    {item.label}
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="top"
                                            sideOffset={6}
                                            className="line-clamp-none max-w-[18.75rem] whitespace-normal rounded-lg bg-bg-dark-main px-3 py-2 text-start text-xs leading-snug text-typo-dark-primary shadow-md"
                                        >
                                            {item.tooltip}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    content
                                )}
                            </SelectItem>
                        );
                    })}
                </TooltipProvider>
            </SelectContent>
        </Select>
    );
}
