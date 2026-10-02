"use client";

import IconCheck from "@/components/shared/icons/icon-check";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn, convertRemToPx } from "@/lib/utils";
import { useMemo, useRef, useState } from "react";
import { CircleFlag } from "react-circle-flags";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import { FixedSizeList } from "react-window";

type TSelectFlagProps<T extends FieldValues> = {
    field?: ControllerRenderProps<T>;
};

export function SelectFlag<T extends FieldValues>({
    field,
}: TSelectFlagProps<T>) {
    const [focusIndex, setFocusIndex] = useState<number | null>(null);
    const options = useMemo(() => {
        return RPNInput.getCountries().map((country) => {
            const regionNames = new Intl.DisplayNames(["en"], {
                type: "region",
            });
            return {
                value: country,
                label: regionNames.of(country),
            };
        });
    }, []);
    const listRef = useRef<FixedSizeList>(null);
    const [search, setSearch] = useState("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const key = event.key.toLowerCase();
        if (/^[a-z0-9]$/i.test(key)) {
            setSearch((prev) => prev + key);

            const foundIndex = options.findIndex((item) =>
                item?.label?.toLowerCase()?.startsWith(search + key)
            );

            if (foundIndex !== -1 && listRef.current) {
                listRef.current.scrollToItem(foundIndex, "start");
                setFocusIndex(foundIndex);
            }

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                setSearch("");
            }, 1000);
        }
    };
    const handleScrollToItem = (index: number) => {
        if (listRef.current) {
            listRef.current.scrollToItem(index, "start");
        }
    };
    return (
        <Select
            {...field}
            onValueChange={(value) => {
                field?.onChange(value as RPNInput.Country);
            }}
            value={field?.value as RPNInput.Country}
            onOpenChange={(open) => {
                if (open) {
                    handleScrollToItem(
                        options.findIndex((item) => item.value === field?.value)
                    );
                }
            }}
        >
            <SelectTrigger className="w-full">
                <SelectValue>
                    <CountrySelectItem
                        value={field?.value}
                        label={
                            options.find(
                                (option) => option.value === field?.value
                            )?.label
                        }
                    />
                </SelectValue>
            </SelectTrigger>
            <SelectContent onKeyDown={handleKeyDown} tabIndex={0}>
                <ScrollArea className="h-64">
                    <FixedSizeList
                        ref={listRef}
                        className="pointer-events-none"
                        width={"100%"}
                        height={convertRemToPx(16)}
                        itemCount={options.length}
                        itemSize={32}
                    >
                        {({ index, style }) => {
                            const isFocus = focusIndex === index;
                            const currentValue = field?.value;

                            return (
                                <SelectItem
                                    className={cn(
                                        "js-select-item pointer-events-auto w-full [&_>span]:w-full",
                                        isFocus && "bg-bg-sf1"
                                    )}
                                    value={options[index].value}
                                    key={options[index].value}
                                    style={{
                                        ...style,
                                    }}
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <CountrySelectItem
                                            value={options[index].value}
                                            label={options[index].label}
                                        />
                                        {currentValue ===
                                            options[index].value && (
                                            <div className="h-5 w-5">
                                                <IconCheck />
                                            </div>
                                        )}
                                    </div>
                                </SelectItem>
                            );
                        }}
                    </FixedSizeList>
                </ScrollArea>
            </SelectContent>
        </Select>
    );
}

export const CountrySelectItem = ({
    value,
    label,
}: {
    value?: string;
    label?: string;
}) => {
    return (
        <div className="flex items-center gap-2" data-value={value}>
            <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full [&svg]:h-full [&svg]:w-auto">
                <CircleFlag
                    countryCode={value?.toLowerCase() as RPNInput.Country}
                />
            </div>
            <div className="text-sm font-medium text-typo-soft">{label}</div>
        </div>
    );
};
