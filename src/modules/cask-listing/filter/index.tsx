"use client";

import InputFilter from "@/components/shared/input-filter";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    handleConvertParamsOriginal,
    handleConvertParamsReverse,
} from "@/helpers";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import {
    DATA_FILTER_CASKS,
    filterCaskValDefault,
    TOptionCheckBox,
} from "@/lib/constants";
import {
    CASK_KEYS,
    CLASSIFICATION_KEYS,
    FILTER_KEYS,
    REGION_KEYS,
} from "@/lib/constants/key";
import { PARAMS } from "@/lib/constants/route";
import { convertStringToLabel } from "@/lib/utils";
import { filterSchemaCask } from "@/lib/validators";
import caskServices from "@/services/cask";
import classificationsServices from "@/services/classifications";
import regionsServices from "@/services/region";
import { useBoundStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SortFilterAccordion } from "../sort";

function splitParamsExcluding(params: string, type: string) {
    return params
        .split("&")
        .filter((param) => {
            const [key] = param.split("=");
            return key !== type;
        })
        .join("&");
}

import CountBadge from "@/components/shared/count-badge";
import LabelFilter from "@/components/shared/label-filter";
import SideBarFooter, { SideBarFooterSkeleton } from "../sidebar/footer";

const FilterTagsList = ({
    tags,
    removeTag,
}: {
    tags: {
        label: string;
        field: keyof z.infer<typeof filterSchemaCask>;
        value: string | [string, string];
        count?: number;
    }[];
    removeTag: (
        field: keyof z.infer<typeof filterSchemaCask>,
        value: string | [string, string]
    ) => void;
}) => {
    const [expanded, setExpanded] = useState(false);
    const [visibleCount, setVisibleCount] = useState(tags.length);
    const measureRef = useRef<HTMLDivElement>(null);

    // Reset expanded state whenever tags change so it defaults to collapsed
    useEffect(() => {
        setExpanded(false);
    }, [tags.length]);

    useEffect(() => {
        if (!measureRef.current) return;

        const measure = () => {
            const container = measureRef.current;
            if (!container) return;

            const parent = container.parentElement;
            if (parent) {
                container.style.width = `${parent.clientWidth}px`;
            }

            const children = Array.from(container.children) as HTMLElement[];
            if (children.length === 0) return;

            // Reset all displays to visible first
            children.forEach((child) => {
                child.style.display = "";
            });

            const firstChild = children[0];
            const singleRowHeight = firstChild.offsetHeight || 28;
            const row = 2;
            // 3 rows height limit: 3 * row height + 16px tolerance for gap
            const maxAllowedHeight = singleRowHeight * row + 16;

            // If the entire container (all tags + CountBadge) fits in 3 rows
            if (container.offsetHeight <= maxAllowedHeight) {
                setVisibleCount(tags.length);
                return;
            }

            // Otherwise, find the maximum tags we can show so that they plus the CountBadge fit in 3 rows
            let fitCount = 1;
            for (let k = tags.length - 1; k >= 1; k--) {
                // Hide tag k
                children[k].style.display = "none";

                if (container.offsetHeight <= maxAllowedHeight) {
                    fitCount = k;
                    break;
                }
            }

            // Clean up: reset displays back
            children.forEach((child) => {
                child.style.display = "";
            });

            setVisibleCount(fitCount);
        };

        measure();
        window.addEventListener("resize", measure);
        const timeout = setTimeout(measure, 100);
        return () => {
            window.removeEventListener("resize", measure);
            clearTimeout(timeout);
        };
    }, [tags]);

    if (tags.length === 0) return null;

    const showExpandButton = !expanded && visibleCount < tags.length;
    const displayedTags = expanded ? tags : tags.slice(0, visibleCount);

    return (
        <div className="relative">
            {/* Hidden measuring container */}
            <div
                ref={measureRef}
                className="pointer-events-none absolute left-0 top-0 -z-10 flex w-full flex-wrap gap-1 opacity-0"
                aria-hidden="true"
            >
                {tags.map((tag, idx) => (
                    <LabelFilter
                        key={`measure-${tag.field}-${idx}`}
                        value={tag.label}
                    />
                ))}
                <CountBadge count={tags.length} />
            </div>

            {/* Actual visible container */}
            <div className="flex flex-wrap gap-1">
                {displayedTags.map((tag, idx) => (
                    <LabelFilter
                        key={`${tag.field}-${idx}`}
                        value={tag.label}
                        onClick={() => removeTag(tag.field, tag.value)}
                    />
                ))}
                {showExpandButton && (
                    <button
                        type="button"
                        onClick={() => setExpanded(true)}
                        aria-expanded={expanded}
                        aria-label={`Show ${tags.length - visibleCount} more filter tags`}
                        className="flex items-center justify-center rounded-full bg-bg-sf4 px-3 py-1 opacity-80 transition-all hover:bg-bg-sf3 hover:opacity-100"
                    >
                        <span className="font-inter text-sm font-medium text-typo-primary">
                            +{tags.length - visibleCount}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default function FormFilter() {
    const { updateParams, valueParams } = useUpdateSearchParams(PARAMS.filter);
    const {
        updateFilterCask,
        updateCaskTypes,
        updateDistilleries,
        isReset,
        setIsResetCask,
    } = useBoundStore();
    const [dataFilter, setDataFilter] =
        useState<typeof DATA_FILTER_CASKS>(DATA_FILTER_CASKS);
    const lastPushedParams = useRef<string>("");
    const isResettingRef = useRef(false);
    const selfPushedRef = useRef(false);

    const paramsCask = useMemo(
        () => splitParamsExcluding(valueParams ?? "", "caskTypeIds"),
        [valueParams]
    );
    const paramsDistillery = useMemo(
        () => splitParamsExcluding(valueParams ?? "", "distilleryIds"),
        [valueParams]
    );
    const paramsCategory = useMemo(
        () => splitParamsExcluding(valueParams ?? "", "classificationIds"),
        [valueParams]
    );
    const paramsRegion = useMemo(
        () => splitParamsExcluding(valueParams ?? "", "regionIds"),
        [valueParams]
    );

    const dataReverts = useMemo(
        () => handleConvertParamsReverse(valueParams ?? ""),
        [valueParams]
    );

    const caskTypeQuery = useQuery({
        queryKey: [FILTER_KEYS.CASK_TYPE, paramsCask],
        queryFn: () => caskServices.getCaskTypes(paramsCask),
        gcTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    const distilleryQuery = useQuery({
        queryKey: [FILTER_KEYS.DISTILLERIES, paramsDistillery],
        queryFn: () => caskServices.getDistillery(paramsDistillery),
        placeholderData: keepPreviousData,
    });

    const categoryQuery = useQuery({
        queryKey: [CLASSIFICATION_KEYS.GET_CLASSIFICATIONS, paramsCategory],
        queryFn: () => classificationsServices.getClassification(), // Note: Update if backend supports params for counts
        placeholderData: keepPreviousData,
    });

    const regionQuery = useQuery({
        queryKey: [CASK_KEYS.LISTING, REGION_KEYS.GET_REGIONS, paramsRegion],
        queryFn: () => regionsServices.getRegions(paramsRegion),
        placeholderData: keepPreviousData,
    });

    const caskRangeQuery = useQuery({
        queryKey: [FILTER_KEYS.CASK_RANGE],
        queryFn: () => caskServices.getCaskRange(),
        placeholderData: keepPreviousData,
    });

    const form = useForm<z.infer<typeof filterSchemaCask>>({
        resolver: zodResolver(filterSchemaCask),
        defaultValues: filterCaskValDefault,
    });

    const pushFormToUrl = useCallback(() => {
        if (isResettingRef.current) return;
        const data = form.getValues();
        const params = handleConvertParamsOriginal(data);
        if (params === lastPushedParams.current) return;
        lastPushedParams.current = params;
        selfPushedRef.current = true;
        startTransition(() => {
            updateParams(params);
        });
    }, [updateParams, form]);

    // Build filter options from API responses + sync lookup data to store
    useEffect(() => {
        if (
            !caskTypeQuery.data ||
            !distilleryQuery.data ||
            !caskRangeQuery.data ||
            !categoryQuery.data ||
            !regionQuery.data
        )
            return;

        setDataFilter((prev) => {
            const updatedDataFilter = { ...DATA_FILTER_CASKS };

            if (updatedDataFilter.category) {
                updatedDataFilter.category = {
                    ...updatedDataFilter.category,
                    options: [
                        ...categoryQuery.data.classifications.map((val) => ({
                            label: val?.label || "",
                            value: convertStringToLabel(val.label || ""),
                            id: val.id,
                            count: 0, // Default to 0 if not provided by classification API
                            checked: false,
                        })),
                    ] as TOptionCheckBox[],
                };
            }

            updatedDataFilter.caskType = {
                ...updatedDataFilter.caskType,
                options: [
                    ...caskTypeQuery.data.caskTypes.map((val) => ({
                        label: val?.name || "",
                        value: convertStringToLabel(val.name || ""),
                        checked: false,
                        id: val.id,
                        count: val?.count,
                    })),
                ] as TOptionCheckBox[],
            };

            updatedDataFilter.region = {
                ...updatedDataFilter.region,
                options: [
                    ...regionQuery.data?.map((val) => ({
                        label: val?.name || "",
                        value: convertStringToLabel(val.name || ""),
                        id: val.id,
                        count: val?.count || 0,
                        checked: false,
                    })),
                ] as TOptionCheckBox[],
            };

            updatedDataFilter.distillery = {
                ...updatedDataFilter.distillery,
                options: [
                    ...distilleryQuery.data.distilleries.map((val) => ({
                        label: val?.name || "",
                        value: convertStringToLabel(val.name || ""),
                        id: val.id,
                        count: val.count || 0,
                        checked: false,
                    })),
                ] as TOptionCheckBox[],
            };

            const ranges = {
                rla: caskRangeQuery.data.rla,
                ola: caskRangeQuery.data.ola,
                year: caskRangeQuery.data.vintageYear,
                abv: caskRangeQuery.data.abv,
                bottles: caskRangeQuery.data.estimatedBottleCount,
                price: caskRangeQuery.data.price,
            };

            Object.entries(ranges).forEach(([key, range]) => {
                if (updatedDataFilter[key]) {
                    updatedDataFilter[key].options = [
                        parseFloat(range?.min || "0"),
                        parseFloat(range?.max || "0"),
                    ];
                }
            });
            return { ...updatedDataFilter };
        });

        updateCaskTypes(caskTypeQuery.data.caskTypes);
        updateDistilleries(distilleryQuery.data.distilleries);
        updateFilterCask(form.getValues() as z.infer<typeof filterSchemaCask>);
    }, [
        caskTypeQuery.data,
        distilleryQuery.data,
        caskRangeQuery.data,
        categoryQuery.data,
        regionQuery.data,
        updateCaskTypes,
        updateDistilleries,
    ]);

    // Sync form from URL params - skip when the URL change was self-initiated
    useEffect(() => {
        if (selfPushedRef.current) {
            selfPushedRef.current = false;
            return;
        }
        form.reset(dataReverts, { keepDefaultValues: true });
    }, [dataReverts]);

    // Single watcher: form changes → update store (tags + filterCask)
    useEffect(() => {
        const { unsubscribe } = form.watch((value, { name }) => {
            updateFilterCask(value as z.infer<typeof filterSchemaCask>);
            if (
                name === "caskType" ||
                name === "distillery" ||
                name === "category" ||
                name === "region"
            ) {
                pushFormToUrl();
            }
        });
        return () => unsubscribe();
    }, [updateFilterCask, pushFormToUrl, form]);

    // Handle external reset (clear all from store) - form reset only; URL is cleared at click site
    useEffect(() => {
        if (!isReset) return;
        isResettingRef.current = true;
        selfPushedRef.current = false;
        lastPushedParams.current = "";
        form.reset(filterCaskValDefault);
        setIsResetCask(false);
        requestAnimationFrame(() => {
            isResettingRef.current = false;
        });
    }, [isReset, form, setIsResetCask]);

    // Handle local clear (Clear button inside filter)
    const handleLocalClear = useCallback(() => {
        isResettingRef.current = true;
        selfPushedRef.current = false;
        lastPushedParams.current = "";
        form.reset(filterCaskValDefault);
        startTransition(() => {
            updateParams("");
        });
        requestAnimationFrame(() => {
            isResettingRef.current = false;
        });
    }, [form, updateParams]);

    const formValues = form.watch();
    const caskTypeVal = form.watch("caskType");
    const distilleryVal = form.watch("distillery");
    const categoryVal = form.watch("category");
    const regionVal = form.watch("region");
    const filterContainerRef = useRef<HTMLDivElement>(null);
    // Track chronological checkbox selection order
    const [selectionOrder, setSelectionOrder] = useState<
        { field: string; id: string }[]
    >([]);

    useEffect(() => {
        const currentSelected: { field: string; id: string }[] = [];

        if (Array.isArray(caskTypeVal)) {
            caskTypeVal.forEach((id) =>
                currentSelected.push({ field: "caskType", id })
            );
        }
        if (Array.isArray(distilleryVal)) {
            distilleryVal.forEach((id) =>
                currentSelected.push({ field: "distillery", id })
            );
        }
        if (Array.isArray(categoryVal)) {
            categoryVal.forEach((id) =>
                currentSelected.push({ field: "category", id })
            );
        }
        if (Array.isArray(regionVal)) {
            regionVal.forEach((id) =>
                currentSelected.push({ field: "region", id })
            );
        }

        setSelectionOrder((prev) => {
            // Check if currentSelected and prev have the same elements
            const isSame =
                prev.length === currentSelected.length &&
                prev.every((p) =>
                    currentSelected.some(
                        (c) => c.field === p.field && c.id === p.id
                    )
                );

            if (isSame) {
                return prev;
            }

            // Keep elements from prev that are still selected
            const nextOrder = prev.filter((item) =>
                currentSelected.some(
                    (c) => c.field === item.field && c.id === item.id
                )
            );
            // Append newly selected elements
            currentSelected.forEach((item) => {
                if (
                    !nextOrder.some(
                        (n) => n.field === item.field && n.id === item.id
                    )
                ) {
                    nextOrder.push(item);
                }
            });
            return nextOrder;
        });
    }, [caskTypeVal, distilleryVal, categoryVal, regionVal]);

    const activeFilterTags = useMemo(() => {
        const tags: {
            label: string;
            field: keyof z.infer<typeof filterSchemaCask>;
            value: string | [string, string];
            count?: number;
        }[] = [];

        // Checkbox fields in chronological selection order
        selectionOrder.forEach(({ field, id }) => {
            const optionsList = dataFilter[field as keyof typeof dataFilter]
                ?.options as TOptionCheckBox[] | undefined;
            const option = optionsList?.find((o) => o.id === id);
            if (option) {
                tags.push({
                    label: option.label,
                    field: field as keyof z.infer<typeof filterSchemaCask>,
                    value: id,
                    count: option.count,
                });
            }
        });

        // Range fields
        const rangeFields: (
            | "price"
            | "year"
            | "abv"
            | "rla"
            | "ola"
            | "bottles"
        )[] = ["price", "year", "abv", "rla", "ola", "bottles"];
        rangeFields.forEach((field) => {
            const range = formValues[field] as
                | [string | undefined, string | undefined]
                | undefined;
            const filterOption = dataFilter[field];
            if (!filterOption) return;

            const defaultRange = filterOption.options as [number, number];
            if (Array.isArray(range) && range.length === 2) {
                const minStr = range[0];
                const maxStr = range[1];

                const hasMin = typeof minStr === "string" && minStr !== "";
                const hasMax = typeof maxStr === "string" && maxStr !== "";

                if (hasMin || hasMax) {
                    const min = hasMin
                        ? parseFloat(minStr.replace(/,/g, ""))
                        : defaultRange[0];
                    const max = hasMax
                        ? parseFloat(maxStr.replace(/,/g, ""))
                        : defaultRange[1];

                    if (min !== defaultRange[0] || max !== defaultRange[1]) {
                        let label = "";
                        if (field === "price")
                            label = `£${min.toLocaleString()} - £${max.toLocaleString()}`;
                        else if (field === "abv") label = `${min}% - ${max}%`;
                        else if (field === "year") label = `${min} - ${max}`;
                        else label = `${min} - ${max} ${field.toUpperCase()}`;

                        tags.push({
                            label,
                            field,
                            value: range as [string, string],
                        });
                    }
                }
            }
        });

        return tags;
    }, [formValues, dataFilter, selectionOrder]);
    const removeTag = (
        field: keyof z.infer<typeof filterSchemaCask>,
        value: string | [string, string]
    ) => {
        if (
            field === "distillery" ||
            field === "caskType" ||
            field === "category" ||
            field === "region"
        ) {
            const current = form.getValues(field) || [];
            form.setValue(
                field,
                current.filter((v) => v !== value)
            );
        } else {
            form.setValue(field, [undefined, undefined]);
        }
        setTimeout(() => {
            pushFormToUrl();
        }, 0);
    };

    const isLoading =
        caskTypeQuery.isLoading ||
        distilleryQuery.isLoading ||
        caskRangeQuery.isLoading;

    return (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-bg-main pr-6 tb:px-5 tb:py-0 mb:px-4">
            <Form {...form}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        pushFormToUrl();
                    }}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="sticky top-0 flex flex-col gap-6 border-b border-bd-main pb-6 pt-10 tb:gap-4 tb:pt-0 mb:pb-4 mb:pt-6">
                        <div className="flex items-center justify-between leading-none">
                            <span className="flex items-center gap-1 font-reckless text-xl font-medium text-typo-primary tb:text-xl mb:text-lg">
                                <span className="tb:hidden">Filter</span>
                                <span className="hidden tb:inline">
                                    Filter and Sort
                                </span>
                                <CountBadge count={activeFilterTags.length} />
                            </span>
                            {activeFilterTags.length > 0 && (
                                <Button
                                    variant="link"
                                    type="button"
                                    onClick={handleLocalClear}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                        <FilterTagsList
                            tags={activeFilterTags}
                            removeTag={removeTag}
                        />
                    </div>

                    {/* Scrollable Content */}
                    <ScrollArea
                        ref={filterContainerRef}
                        className="-mr-5 min-h-0 flex-1 pr-5 transition-all duration-200 ease-in-out"
                    >
                        <div className="pb-6 pt-6 mb:pb-0 mb:pt-4">
                            {isLoading ? (
                                <FilterSkeleton />
                            ) : (
                                <Accordion
                                    type="multiple"
                                    // defaultValue={[...Object.keys(dataFilter)]}
                                    className="flex flex-col gap-6 mb:gap-4"
                                >
                                    <SortFilterAccordion />
                                    {Object.entries(dataFilter).map(
                                        ([key, value]) => (
                                            <FormField
                                                key={key}
                                                name={
                                                    key as keyof z.infer<
                                                        typeof filterSchemaCask
                                                    >
                                                }
                                                control={form.control}
                                                render={({ field }) => {
                                                    const isCheckbox =
                                                        value.type ===
                                                        "checkbox";
                                                    const hasNoOptions =
                                                        isCheckbox &&
                                                        (
                                                            value.options as TOptionCheckBox[]
                                                        ).length === 0;

                                                    if (hasNoOptions)
                                                        return <></>;

                                                    return (
                                                        <FormControl>
                                                            <InputFilter
                                                                key={
                                                                    value.title
                                                                }
                                                                {...value}
                                                                field={
                                                                    field as unknown as Parameters<
                                                                        typeof InputFilter
                                                                    >[0]["field"]
                                                                }
                                                                isHaveSearch={
                                                                    isCheckbox
                                                                }
                                                                onRangeSubmit={
                                                                    pushFormToUrl
                                                                }
                                                            />
                                                        </FormControl>
                                                    );
                                                }}
                                            />
                                        )
                                    )}
                                </Accordion>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Footer - Fixed */}
                    {isLoading ? (
                        <SideBarFooterSkeleton className="z-20 mt-auto border-t border-bd-main" />
                    ) : (
                        <SideBarFooter className="z-20 mt-auto border-t border-bd-main" />
                    )}
                </form>
            </Form>
        </div>
    );
}

const FilterSkeleton = () => {
    return (
        <div className="flex flex-col gap-6 tb:gap-4">
            {/* Sort By Skeleton */}
            <div className="border-b border-bd-main pb-6 dk:hidden tb:pb-4">
                <div className="flex items-center justify-between pb-4">
                    <div className="h-5 w-20 animate-pulse rounded bg-bg-sf3" />
                    <div className="h-4 w-4 animate-pulse rounded bg-bg-sf3" />
                </div>
            </div>

            {/* Checkbox Group Skeleton (e.g. Distillery) */}
            <div className="border-b border-bd-main pb-6 tb:pb-4">
                <div className="flex items-center justify-between pb-4">
                    <div className="flex items-center gap-1">
                        <div className="h-5 w-24 animate-pulse rounded bg-bg-sf3" />
                        <div className="h-5 w-8 animate-pulse rounded-full bg-bg-sf3" />
                    </div>
                    <div className="h-4 w-4 animate-pulse rounded bg-bg-sf3" />
                </div>
                <div className="flex flex-col gap-4 pt-4">
                    <div className="h-11 w-full animate-pulse rounded bg-bg-sf4" />
                    <div className="mt-4 flex flex-col gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="h-3.5 w-3.5 animate-pulse rounded-sm bg-bg-sf3" />
                                <div className="h-4 flex-1 animate-pulse rounded bg-bg-sf3" />
                                <div className="h-4 w-6 animate-pulse rounded bg-bg-sf3" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Range Group Skeleton (e.g. Price) */}
            <div className="border-b border-bd-main pb-6 tb:pb-4">
                <div className="flex items-center justify-between pb-4">
                    <div className="h-5 w-16 animate-pulse rounded bg-bg-sf3" />
                    <div className="h-4 w-4 animate-pulse rounded bg-bg-sf3" />
                </div>
                <div className="flex flex-col gap-4 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="h-11 flex-1 animate-pulse rounded bg-bg-sf4" />
                        <div className="h-0.5 w-2 animate-pulse bg-bg-sf3" />
                        <div className="h-11 flex-1 animate-pulse rounded bg-bg-sf4" />
                    </div>
                </div>
            </div>
        </div>
    );
};
