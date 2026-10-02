import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { LabelWithOutForm } from "@/components/ui/label";
import CountBadge from "@/components/shared/count-badge";
import ScrollAreaWithFade from "@/components/shared/scroll-area-with-fade";
import {
    filterCaskValDefault,
    filterDistilleryValDefault,
    TOptionCheckBox,
    TOptionRange,
} from "@/lib/constants";
import {
    cn,
    formatNumber,
    formatNumberToDecimal,
    isEmpty,
    isValidDecimal,
} from "@/lib/utils";
import { filterSchemaCask, filterSchemaDistillery } from "@/lib/validators";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ControllerRenderProps, Path } from "react-hook-form";
import { z } from "zod";

// Define the generic type for options
type FilterOptions<T> = T extends "checkbox" ? TOptionCheckBox[] : TOptionRange;

// Main input filter type
type TInputFilter<T extends "checkbox" | "range" = "checkbox" | "range"> = {
    type: T;
    title: string;
    field: ControllerRenderProps<
        | z.infer<typeof filterSchemaCask>
        | z.infer<typeof filterSchemaDistillery>,
        Path<typeof filterCaskValDefault | typeof filterDistilleryValDefault>
    >;
    isHaveSearch?: boolean;
    options: FilterOptions<T>;
    unit?: string;
    positionUnit?: "prefix" | "suffix";
    step?: string;
    maxRange?: number;
    isDisableDecimal?: boolean;
    isDisableCommon?: boolean;
    onRangeSubmit?: () => void;
};

// InputFilter component with proper typing
export default function InputFilter<T extends "checkbox" | "range">(
    props: TInputFilter<T>
) {
    const { type, options, onRangeSubmit, ...params } = props;
    return type === "checkbox" ? (
        <InputCheckBox
            options={options as FilterOptions<"checkbox">}
            type="checkbox"
            {...params}
        />
    ) : (
        <InputRange
            options={options as FilterOptions<"range">}
            type={"range"}
            onRangeSubmit={onRangeSubmit}
            {...params}
        />
    );
}

function areFieldValuesEqual(
    prev: readonly unknown[] | undefined,
    next: readonly unknown[] | undefined
) {
    if (prev === next) return true;
    if (!Array.isArray(prev) || !Array.isArray(next)) return prev === next;
    if (prev.length !== next.length) return false;
    return prev.every((v, i) => v === next[i]);
}

const InputCheckBox = React.memo(
    function InputCheckBox({
        options,
        title,
        field,
        isHaveSearch,
    }: TInputFilter<"checkbox">) {
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
        const handleRenderGroupCheckBox = () => {
            const CheckboxWrap = isHaveSearch ? CommandItem : "div";
            return (
                <div className="flex w-full flex-col gap-2">
                    {options.map((item, index) => {
                        const key = `${item.label}-${item.id}-${item.value}-${index}-${field.name}`;

                        return (
                            <CheckboxWrap
                                key={key}
                                className={cn(
                                    "cursor-pointer py-0 data-[selected='true']:bg-transparent"
                                )}
                            >
                                <div className="flex w-full cursor-pointer flex-row items-center gap-2">
                                    <Checkbox
                                        id={item.id}
                                        value={item.id}
                                        checked={
                                            Array.isArray(field.value) &&
                                            field.value.includes(
                                                item.id as never
                                            )
                                        }
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
                                            className={cn(
                                                "flex-1 cursor-pointer font-inter text-sm font-normal leading-normal text-typo-primary mb:text-sm"
                                            )}
                                        >
                                            {item.label?.split("-").join(" ")}
                                        </LabelWithOutForm>
                                        <span className="font-inter text-sm font-normal leading-normal text-typo-primary">
                                            {item.count || 0}
                                        </span>
                                    </div>
                                </div>
                            </CheckboxWrap>
                        );
                    })}
                </div>
            );
        };
        const handleRenderGroupCheckBoxWithSearch = () => {
            return (
                <div className="flex flex-col gap-4">
                    <Command className="-mr-4 w-auto min-w-full rounded-none border-none bg-transparent pr-4">
                        <CommandInput
                            placeholder={`Search for a ${title?.toLowerCase()}`}
                            className="mb-0 h-11 border-none bg-bg-sf4 px-3 focus-within:border-none hover:border-none"
                        />
                        <CommandList className="relative mt-4 overflow-hidden">
                            <CommandEmpty className="text-start font-inter text-sm text-typo-note">
                                No {title?.toLowerCase()}s found.
                            </CommandEmpty>
                            <CommandGroup>
                                {handleRenderGroupCheckBox()}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>
            );
        };
        const lengthDisplay = options.filter(
            (item) =>
                Array.isArray(field.value) &&
                field.value.includes(item.id as never)
        ).length;

        return (
            <div className="border-b border-bd-main pb-6 last:border-b-0 mb:pb-4">
                <AccordionItem value={field.name} className="border-none">
                    <AccordionTrigger className="py-0">
                        <div className="flex flex-row items-center gap-1">
                            <div className="flex items-center gap-1">
                                <h3 className="font-inter text-lg font-semibold leading-tight text-typo-primary tb:text-base">
                                    {title}
                                </h3>
                                <CountBadge count={lengthDisplay} />
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 pb-0 pt-4">
                        {isHaveSearch
                            ? handleRenderGroupCheckBoxWithSearch()
                            : handleRenderGroupCheckBox()}
                    </AccordionContent>
                </AccordionItem>
            </div>
        );
    },
    (prev, next) =>
        prev.title === next.title &&
        prev.isHaveSearch === next.isHaveSearch &&
        prev.options === next.options &&
        prev.field.name === next.field.name &&
        areFieldValuesEqual(prev.field.value, next.field.value)
);

const InputRange = React.memo(
    function InputRange({
        options,
        title,
        field,
        unit,
        isDisableDecimal,
        isDisableCommon,
        positionUnit,
        onRangeSubmit,
        ...props
    }: TInputFilter<"range">) {
        const [valueInput, setValueInput] = useState<Array<undefined | string>>(
            [field.value?.[0], field.value?.[1]]
        );
        const [defaultMin, defaultMax] = options;

        const parseFormattedNumber = (value?: string) => {
            const cleanValue = value?.replace(/[,\s]/g, "");
            const number = cleanValue ? Number(cleanValue) : undefined;
            return number;
        };
        const handleSwapValue = useCallback(() => {
            if (!Array.isArray(valueInput)) return;

            const [minString, maxString] = valueInput;
            const min = parseFormattedNumber(minString);
            const max = parseFormattedNumber(maxString);

            if (!min || !max) {
                const minV = min
                    ? min < defaultMin
                        ? min
                        : min >= defaultMax
                          ? defaultMax
                          : min
                    : undefined;
                const maxV = max
                    ? max <= defaultMin
                        ? defaultMin
                        : max >= defaultMax
                          ? defaultMax
                          : max
                    : undefined;
                // field.onChange([]);
                // setValueInput([minV?.toString(), maxV?.toString()]);
                return;
            }

            if (max < min) {
                const minV =
                    max < defaultMax ? max.toString() : defaultMax.toString();
                const maxV =
                    min < defaultMax ? min.toString() : defaultMax.toString();
                field.onChange([minV, maxV]);
                setValueInput([minV, maxV]);
                return;
            }
            const valMax = Math.min(max, defaultMax);

            field.onChange([min.toString(), valMax.toString()]);
            setValueInput([min.toString(), valMax.toString()]);
        }, [valueInput, options, setValueInput]);

        useEffect(() => {
            if (isEmpty(field.value)) {
                setValueInput([]);
            }
        }, [JSON.stringify(field.value)]);
        console.log("field.name", field.name);
        return (
            <div className="border-b border-bd-main pb-6 last:border-b-0 mb:pb-4">
                <AccordionItem value={field.name} className="border-none">
                    <AccordionTrigger className="py-0">
                        <h3 className="font-inter text-lg font-semibold leading-tight text-typo-primary tb:text-base">
                            {title}
                        </h3>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col pb-0 pt-4">
                        <div className="flex flex-row items-center gap-2">
                            <div className="relative flex h-11 flex-1 items-center overflow-hidden bg-bg-sf4 p-2 tb:h-8">
                                {unit && positionUnit === "prefix" && (
                                    <div className="mr-1 font-inter text-base font-normal leading-normal text-typo-primary">
                                        {unit}
                                    </div>
                                )}
                                <Input
                                    type="text"
                                    isHideError
                                    placeholder={`0`}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSwapValue();
                                            onRangeSubmit?.();
                                        }
                                    }}
                                    onBlur={() => {
                                        handleSwapValue();
                                        onRangeSubmit?.();
                                    }}
                                    className={cn(
                                        "h-full border-none bg-transparent p-0 px-0 font-inter font-normal leading-normal focus-visible:ring-0 tb:px-0 mb:h-full mb:px-0"
                                    )}
                                    value={formatNumberToDecimal(
                                        valueInput?.[0]?.toString(),
                                        isDisableDecimal,
                                        isDisableCommon
                                    )}
                                    onSubmit={handleSwapValue}
                                    onFocus={(e) =>
                                        e.target.addEventListener(
                                            "wheel",
                                            function (e) {
                                                e.preventDefault();
                                            },
                                            { passive: false }
                                        )
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const isHaveDot = value.includes(".");
                                        const maxLength = isHaveDot
                                            ? Number(props.maxRange) + 3
                                            : Number(props.maxRange) || 13;
                                        const limitValue = value.slice(
                                            0,
                                            maxLength
                                        );

                                        if (isValidDecimal(limitValue)) return;
                                        setValueInput([
                                            limitValue,
                                            valueInput?.[1],
                                        ]);
                                    }}
                                />
                                {unit && positionUnit === "suffix" && (
                                    <div className="ml-1 font-inter text-sm font-normal leading-normal text-typo-primary">
                                        {unit}
                                    </div>
                                )}
                            </div>

                            <p className="font-inter text-sm font-normal leading-normal text-typo-primary">
                                -
                            </p>

                            <div className="relative flex h-11 flex-1 items-center overflow-hidden bg-bg-sf4 p-2 tb:h-8">
                                {unit && positionUnit === "prefix" && (
                                    <div className="mr-1 font-inter text-base font-normal leading-normal text-typo-primary">
                                        {unit}
                                    </div>
                                )}
                                <Input
                                    type="text"
                                    placeholder={`${field.name === "year" ? defaultMax : formatNumber(defaultMax)}`}
                                    isHideError
                                    className={cn(
                                        "h-full border-none bg-transparent p-0 px-0 font-inter font-normal leading-normal focus-visible:ring-0 tb:px-0 mb:h-full mb:px-0"
                                    )}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSwapValue();
                                            onRangeSubmit?.();
                                        }
                                    }}
                                    onFocus={(e) =>
                                        e.target.addEventListener(
                                            "wheel",
                                            function (e) {
                                                e.preventDefault();
                                            },
                                            { passive: false }
                                        )
                                    }
                                    value={formatNumberToDecimal(
                                        valueInput?.[1]?.toString(),
                                        isDisableDecimal,
                                        isDisableCommon
                                    )}
                                    onSubmit={handleSwapValue}
                                    onBlur={() => {
                                        handleSwapValue();
                                        onRangeSubmit?.();
                                    }}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const isHaveDot = value.includes(".");
                                        const maxLength = isHaveDot
                                            ? Number(props.maxRange) + 3
                                            : Number(props.maxRange) || 13;
                                        const limitValue = value.slice(
                                            0,
                                            maxLength
                                        );

                                        if (!isValidDecimal(limitValue)) {
                                            setValueInput([
                                                valueInput?.[0],
                                                limitValue,
                                            ]);
                                        }
                                    }}
                                />
                                {unit && positionUnit === "suffix" && (
                                    <div className="ml-1 font-inter text-sm font-normal leading-normal text-typo-primary">
                                        {unit}
                                    </div>
                                )}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </div>
        );
    },
    (prev, next) =>
        prev.title === next.title &&
        prev.unit === next.unit &&
        prev.options === next.options &&
        prev.isDisableDecimal === next.isDisableDecimal &&
        prev.isDisableCommon === next.isDisableCommon &&
        prev.maxRange === next.maxRange &&
        prev.field.name === next.field.name &&
        areFieldValuesEqual(prev.field.value, next.field.value)
);
