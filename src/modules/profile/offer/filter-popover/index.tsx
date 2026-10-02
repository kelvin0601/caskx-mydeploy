"use client";

import IconFilterLines from "@/components/shared/icons/icon-filter-lines";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type TPartialFillFilter = "yes" | "no";

type TFilterPopoverProps = {
    selectedStatus?: string;
    statusOptions: Array<{
        value: string;
        label: string;
    }>;
    selectedPartialFill?: TPartialFillFilter;
    onStatusChange: (status: string) => void;
    onPartialFillChange: (option: TPartialFillFilter) => void;
};

export default function FilterPopover({
    selectedStatus,
    statusOptions,
    selectedPartialFill,
    onStatusChange,
    onPartialFillChange,
}: TFilterPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="flex h-10 min-w-0 flex-row items-center gap-2 rounded-none border border-bd-main py-[0.8125rem] pl-5 pr-4 transition hover:border-bd-inverse hover:bg-bg-sf3 data-[state=open]:border-transparent data-[state=open]:bg-bg-dark-main data-[state=open]:text-typo-dark-primary"
                >
                    <span className="text-sm font-medium capitalize">
                        Filter
                    </span>
                    <span className="size-3.5 shrink-0">
                        <IconFilterLines />
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="flex w-[15.625rem] flex-col gap-4 rounded-none border border-bd-main bg-bg-main p-4 shadow-custom outline-none"
            >
                <div className="flex flex-col gap-2">
                    <span className="text-base font-semibold text-typo-primary">
                        Status
                    </span>
                    <RadioGroup
                        value={selectedStatus ?? "all"}
                        onValueChange={onStatusChange}
                        className="flex flex-col gap-2"
                    >
                        <label className="flex cursor-pointer select-none flex-row items-center justify-between gap-2 text-sm hover:opacity-80">
                            <div className="flex flex-row items-center gap-2">
                                <RadioGroupItem
                                    value="all"
                                    aria-label="All statuses"
                                />
                                <span className="text-sm font-normal text-typo-primary">
                                    All
                                </span>
                            </div>
                        </label>
                        {statusOptions.map((statusOption) => {
                            return (
                                <label
                                    key={statusOption.value}
                                    className="flex min-w-0 cursor-pointer select-none flex-row items-center justify-between gap-2 text-sm hover:opacity-80"
                                >
                                    <div className="flex min-w-0 flex-row items-center gap-2">
                                        <RadioGroupItem
                                            value={statusOption.value}
                                            aria-label={statusOption.label}
                                        />
                                        <span
                                            className="truncate text-sm font-normal capitalize text-typo-primary"
                                            title={statusOption.label}
                                        >
                                            {statusOption.label}
                                        </span>
                                    </div>
                                </label>
                            );
                        })}
                    </RadioGroup>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-base font-semibold text-typo-primary">
                        Partially fulfilled?
                    </span>
                    <RadioGroup
                        value={selectedPartialFill}
                        onValueChange={(value) => {
                            if (value === "yes" || value === "no") {
                                onPartialFillChange(value);
                            }
                        }}
                        className="flex flex-col gap-2"
                    >
                        {(["yes", "no"] as const).map((option) => (
                            <label
                                key={option}
                                className="flex cursor-pointer select-none flex-row items-center gap-2 text-sm capitalize hover:opacity-80"
                            >
                                <RadioGroupItem
                                    value={option}
                                    aria-label={option === "yes" ? "Yes" : "No"}
                                />
                                <span className="text-sm font-normal text-typo-primary">
                                    {option === "yes" ? "Yes" : "No"}
                                </span>
                            </label>
                        ))}
                    </RadioGroup>
                </div>
            </PopoverContent>
        </Popover>
    );
}
