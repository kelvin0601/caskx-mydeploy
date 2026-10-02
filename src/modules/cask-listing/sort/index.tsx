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
import { CASK_KEYS } from "@/lib/constants/key";
import { PARAMS } from "@/lib/constants/route";
import caskServices from "@/services/cask";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

function useSortCask() {
    const { updateParams, valueParamsUpdate } = useUpdateSearchParams(
        PARAMS.sortBy
    );

    const sortCaskData = useQuery({
        queryKey: [CASK_KEYS.SORT_CASK],
        queryFn: caskServices.getSortedCasks,
    });

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

    return { sortCaskData, valueSelect, defaultParams, handleChange };
}

export function SortFilter() {
    const { sortCaskData, valueSelect, defaultParams, handleChange } =
        useSortCask();

    return (
        <div className="relative">
            <Select
                value={valueSelect}
                defaultValue={defaultParams}
                onValueChange={handleChange}
            >
                <SelectTrigger className="w-full pr-2 font-medium placeholder:font-normal">
                    <SelectValue placeholder="Popular Cask" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {sortCaskData.data?.sortOptions.map((sort) => {
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
    const { sortCaskData, valueSelect, handleChange } = useSortCask();

    return (
        <div className="border-b border-bd-main pb-6 dk:hidden mb:pb-4">
            <AccordionItem value="sort" className="border-none">
                <AccordionTrigger className="py-0">
                    <h3 className="font-inter text-lg font-semibold leading-tight text-typo-primary tb:text-base">
                        Sort by
                    </h3>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 pb-0 pt-4">
                    <RadioGroup
                        value={valueSelect}
                        onValueChange={handleChange}
                        className="flex flex-col gap-2"
                    >
                        {sortCaskData.data?.sortOptions.map((sort) => {
                            const val = `${sort.value}_${sort.defaultOrder.toLowerCase()}`;
                            return (
                                <label
                                    key={sort.name}
                                    className="flex cursor-pointer flex-row items-center gap-2"
                                >
                                    <RadioGroupItem
                                        value={val}
                                        className="h-3.5 w-3.5 border-bd-main data-[state=checked]:border-black"
                                    />
                                    <span className="font-inter text-sm font-normal leading-normal text-typo-primary">
                                        {sort.name}
                                    </span>
                                </label>
                            );
                        })}
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>
        </div>
    );
}
