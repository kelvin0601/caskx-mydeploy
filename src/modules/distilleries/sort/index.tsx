import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { SORT_DISTILLERIES } from "@/lib/constants";
import { PARAMS } from "@/lib/constants/route";
import { useEffect, useMemo, useState } from "react";

function useSortDistilleries() {
    const { updateParams, valueParamsUpdate } = useUpdateSearchParams(
        PARAMS.sortBy
    );

    const [valueSelect, setValueSelect] = useState<string | undefined>(
        undefined
    );

    const handleRevertParams = useMemo(
        () => (params: string | undefined) => {
            if (!params) return undefined;
            const paramsArr = params.split("&");
            const newParams = paramsArr
                .map((param) => {
                    const splitParam = param.split("=");
                    if (splitParam[0] === PARAMS.sortOrder) {
                        return splitParam[1]?.toLowerCase();
                    }
                    return param;
                })
                .join("_");
            return newParams;
        },
        []
    );
    const defaultParams = handleRevertParams(valueParamsUpdate);

    const handleChange = (value: string) => {
        const splitParams = value.split("_");
        const newParams = splitParams
            .map((param, idx) => {
                if (idx > 0) {
                    return `${PARAMS.sortOrder}=${param.toUpperCase()}`;
                }
                return param;
            })
            .join("&");
        setValueSelect(value);
        updateParams(newParams);
    };

    useEffect(() => {
        setValueSelect(defaultParams);
    }, [defaultParams]);

    return { valueSelect, defaultParams, handleChange };
}

export function SortFilter() {
    const { valueSelect, defaultParams, handleChange } = useSortDistilleries();

    return (
        <div className="relative">
            <Select
                value={valueSelect}
                defaultValue={defaultParams}
                onValueChange={handleChange}
            >
                <SelectTrigger className="w-full font-medium placeholder:font-normal">
                    <SelectValue placeholder="Number of ratings (Decreasing)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {SORT_DISTILLERIES.map((sort) => {
                            return (
                                <SelectItem
                                    value={`${sort.value}_${sort.defaultOrder.toLowerCase()}`}
                                    key={sort.name}
                                >
                                    {sort.name}
                                </SelectItem>
                            );
                        })}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}

export function SortFilterAccordion() {
    const { valueSelect, handleChange } = useSortDistilleries();

    return (
        <AccordionItem value="sort" className="hidden mb:block">
            <AccordionTrigger className="py-4 tb:pb-6 tb:pt-0 mb:py-4">
                <h3 className="text-base font-medium text-typo-primary">
                    Sort by
                </h3>
            </AccordionTrigger>
            <AccordionContent className="tb:pb-6 mb:pb-4">
                <RadioGroup
                    value={valueSelect}
                    onValueChange={handleChange}
                    className="flex flex-col gap-2"
                >
                    {SORT_DISTILLERIES.map((sort) => {
                        const val = `${sort.value}_${sort.defaultOrder.toLowerCase()}`;
                        return (
                            <label
                                key={sort.name}
                                className="flex cursor-pointer flex-row items-center gap-2"
                            >
                                <RadioGroupItem
                                    value={val}
                                    className="text-typo-soft"
                                />
                                <span className="text-sm text-typo-primary">
                                    {sort.name}
                                </span>
                            </label>
                        );
                    })}
                </RadioGroup>
            </AccordionContent>
        </AccordionItem>
    );
}
