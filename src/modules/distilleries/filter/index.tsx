import CountBadge from "@/components/shared/count-badge";
import InputFilter from "@/components/shared/input-filter";
import LabelFilter from "@/components/shared/label-filter";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    handleConvertParamsOriginalDistillery,
    handleConvertParamsReverseDistillery,
} from "@/helpers";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import {
    DATA_FILTER_DISTILLERIES,
    filterDistilleryValDefault,
    TDataFilterDistilleries,
    TOptionCheckBox,
} from "@/lib/constants";
import { DISTILLERY_KEYS } from "@/lib/constants/key";
import { PARAMS } from "@/lib/constants/route";
import { convertStringToLabel, isEmpty } from "@/lib/utils";
import { filterSchemaDistillery } from "@/lib/validators";
import distilleriesServices from "@/services/distilleries";
import { useBoundStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SortFilterAccordion } from "../sort";
import SideBarFooter, { SideBarFooterSkeleton } from "../sidebar/footer";

const FilterTagsList = ({
    tags,
    removeTag,
}: {
    tags: {
        label?: string;
        value?: string;
        id?: string;
        type: string;
    }[];
    removeTag: (id: string, type: string) => void;
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
            const rows = 2;
            const maxAllowedHeight = singleRowHeight * rows + 16;

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
                        key={`measure-${tag.id}-${idx}`}
                        value={tag.value || ""}
                    />
                ))}
                <CountBadge count={tags.length} />
            </div>

            {/* Actual visible container */}
            <div className="flex flex-wrap gap-1">
                {displayedTags.map((tag, idx) => (
                    <LabelFilter
                        key={`${tag.id}-${idx}`}
                        value={tag.value || ""}
                        onClick={() => removeTag(tag.id || "", tag.type)}
                    />
                ))}
                {showExpandButton && (
                    <button
                        type="button"
                        onClick={() => setExpanded(true)}
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
    const router = useRouter();
    const { updateParams, valueParams } = useUpdateSearchParams(PARAMS.filter);
    const {
        isReset,
        setIsResetDistilleries,
        updateFilterDistilleries,
        updateDistilleriesData,
        tagsDistilleries,
        clearAllDistilleries,
        deleteTagDistilleries,
    } = useBoundStore();

    const [dataFilterConvert, setDataFilterConvert] =
        useState<TDataFilterDistilleries>(DATA_FILTER_DISTILLERIES);

    const paramsRegions = useMemo(() => {
        return handleSplitParams(valueParams ?? "", "regions");
    }, [valueParams]);

    const paramsCompanies = useMemo(() => {
        return handleSplitParams(valueParams ?? "", "companies");
    }, [valueParams]);

    const paramsCountries = useMemo(() => {
        return handleSplitParams(valueParams ?? "", "countries");
    }, [valueParams]);

    const paramsStatus = useMemo(() => {
        return handleSplitParams(valueParams ?? "", "statuses");
    }, [valueParams]);

    const regions = useQuery({
        queryKey: [DISTILLERY_KEYS.REGIONS, paramsRegions],
        queryFn: () => distilleriesServices.getRegions(paramsRegions ?? ""),
    });
    const companies = useQuery({
        queryKey: [DISTILLERY_KEYS.COMPANIES, paramsCompanies],
        queryFn: () => distilleriesServices.getCompanies(paramsCompanies ?? ""),
    });
    const countries = useQuery({
        queryKey: [DISTILLERY_KEYS.COUNTRIES, paramsCountries],
        queryFn: () => distilleriesServices.getCountries(paramsCountries ?? ""),
    });
    const statuses = useQuery({
        queryKey: [DISTILLERY_KEYS.STATUSES, paramsStatus],
        queryFn: () => distilleriesServices.getStatus(paramsStatus ?? ""),
    });

    const isLoading =
        regions.isLoading ||
        companies.isLoading ||
        countries.isLoading ||
        statuses.isLoading;

    const form = useForm<z.infer<typeof filterSchemaDistillery>>({
        resolver: zodResolver(filterSchemaDistillery),
        defaultValues: filterDistilleryValDefault,
    });
    function handleSplitParams(params: string, type: string) {
        const paramsArray = params.split("&");
        return paramsArray
            .map((param) => {
                const [key] = param.split("=");
                if (key !== type) return param;
                return null;
            })
            .join("&");
    }

    const dataReverts = handleConvertParamsReverseDistillery(valueParams ?? "");

    const handleSubmit = async (
        data: z.infer<typeof filterSchemaDistillery>
    ) => {
        const params = handleConvertParamsOriginalDistillery(data);

        updateParams(params);
        updateFilterDistilleries(data);
    };

    const removeTag = (id: string, type: string) => {
        const filterCask = deleteTagDistilleries({ id, type });
        const params = handleConvertParamsOriginalDistillery(filterCask);
        updateParams(params);
    };

    const handleLocalClear = () => {
        clearAllDistilleries();
        const newParams = new URLSearchParams(window.location.search);
        newParams.delete(PARAMS.filter);
        newParams.delete(PARAMS.search);
        const qs = newParams.toString();
        router.push(`${window.location.pathname}${qs ? `?${qs}` : ""}`);
    };

    useEffect(() => {
        if (dataReverts?.regions) form.setValue("regions", dataReverts.regions);
        if (dataReverts?.countries)
            form.setValue("countries", dataReverts.countries);
        if (dataReverts?.statuses)
            form.setValue("statuses", dataReverts.statuses);
        if (dataReverts?.companies)
            form.setValue("companies", dataReverts.companies);

        updateFilterDistilleries(form.getValues());
    }, [valueParams]);

    useEffect(() => {
        if (regions?.data && companies?.data && countries?.data) {
            // Create a deep copy of DATA_FILTER_CASKS to avoid mutating the original
            const updatedDataFilter = JSON.parse(
                JSON.stringify(DATA_FILTER_DISTILLERIES)
            );

            // Update cask type options
            updatedDataFilter.regions = {
                ...updatedDataFilter.regions,
                options: [
                    ...updatedDataFilter.regions.options,
                    ...regions?.data?.regions?.map((val) => ({
                        label: val || "",
                        value: convertStringToLabel(val || ""),
                        checked: false,
                        id: val,
                    })),
                ] as TOptionCheckBox[],
            };

            updatedDataFilter.countries = {
                ...updatedDataFilter.countries,
                options: [
                    ...updatedDataFilter.countries.options,
                    ...countries?.data?.countries?.map((val) => ({
                        label: val || "",
                        value: convertStringToLabel(val || ""),
                        checked: false,
                        id: val,
                    })),
                ] as TOptionCheckBox[],
            };

            updatedDataFilter.statuses = {
                ...updatedDataFilter.statuses,
                options: [
                    ...updatedDataFilter.statuses.options,
                    ...(statuses?.data?.statuses || []).map((val) => ({
                        label: val.slice(0, 1).toUpperCase() + val.slice(1),
                        value: val,
                        checked: false,
                        id: val,
                    })),
                ] as TOptionCheckBox[],
            };

            updatedDataFilter.companies = {
                ...updatedDataFilter.companies,
                options: [
                    ...updatedDataFilter.companies.options,
                    ...companies?.data?.companies?.map((val) => ({
                        label: val || "",
                        value: convertStringToLabel(val || ""),
                        checked: false,
                        id: val,
                    })),
                ] as TOptionCheckBox[],
            };

            setDataFilterConvert(updatedDataFilter);
        }
    }, [
        regions?.data?.regions?.length,
        companies?.data?.companies?.length,
        countries?.data?.countries?.length,
        statuses?.data?.statuses?.length,
    ]);

    useEffect(() => {
        //set data to match label with tags
        const dataRegions = regions?.data;
        const dataCompanies = companies?.data;
        const dataCountries = countries?.data;
        const dataStatuses = statuses?.data;
        const dataFilter = {
            ...(!isEmpty(dataRegions) && {
                regions: dataRegions?.regions?.map((item) => ({
                    label: item || "",
                    value: convertStringToLabel(item || ""),
                    checked: false,
                    id: item,
                    name: item,
                })),
            }),
            ...(!isEmpty(dataCountries) && {
                countries: dataCountries?.countries?.map((item) => ({
                    label: item || "",
                    value: convertStringToLabel(item || ""),
                    checked: false,
                    id: item,
                    name: item,
                })),
            }),
            ...(!isEmpty(dataCompanies) && {
                companies: dataCompanies?.companies?.map((item) => ({
                    label: item || "",
                    value: convertStringToLabel(item || ""),
                    checked: false,
                    id: item,
                    name: item,
                })),
            }),
            ...(!isEmpty(dataStatuses) && {
                statuses: dataStatuses?.statuses?.map((item) => ({
                    label: item,
                    value: item,
                    checked: false,
                    id: item,
                    name: item.slice(0, 1).toUpperCase() + item.slice(1),
                })),
            }),
        };
        updateDistilleriesData({
            ...dataFilter,
        });
        updateFilterDistilleries(form.getValues());
    }, [regions?.data, countries?.data, companies?.data, statuses?.data]);

    useEffect(() => {
        const { unsubscribe } = form.watch(() => {
            updateFilterDistilleries(form.getValues());
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isReset) {
            form.reset();
            updateParams("");
            setIsResetDistilleries(false);
        }
    }, [isReset]);

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-bg-main pr-6 tb:px-5 tb:py-0 mb:px-4">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    onBlur={form.handleSubmit(handleSubmit)}
                    onChange={(e) => {
                        if (
                            (e.target as unknown as HTMLInputElement).type ===
                            "checkbox"
                        ) {
                            form.handleSubmit(handleSubmit)(e);
                        }
                    }}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="sticky top-0 flex flex-col gap-6 border-b border-bd-main pb-6 pt-10 tb:gap-4 tb:pt-0 mb:pb-4 mb:pt-6">
                        <div className="flex items-center justify-between leading-none">
                            <span className="flex items-center gap-1 font-reckless text-xl font-medium text-typo-primary tb:text-xl mb:text-lg">
                                <span className="mb:hidden">Filter</span>
                                <span className="hidden mb:inline">
                                    Filter and Sort
                                </span>
                                <CountBadge count={tagsDistilleries.length} />
                            </span>
                            {tagsDistilleries.length > 0 && (
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
                            tags={tagsDistilleries}
                            removeTag={removeTag}
                        />
                    </div>

                    {/* Scrollable Content */}
                    <ScrollArea className="-mr-5 min-h-0 flex-1 pr-5 transition-all duration-200 ease-in-out">
                        <div className="py-6 mb:p-0">
                            {isLoading ? (
                                <FilterSkeleton />
                            ) : (
                                <Accordion
                                    type="multiple"
                                    // defaultValue={[
                                    //     "sort",
                                    //     ...Object.keys(dataFilterConvert),
                                    // ]}

                                    className="flex flex-col gap-6 mb:gap-4"
                                >
                                    <SortFilterAccordion />
                                    {Object.entries(dataFilterConvert).map(
                                        ([key, value]) => {
                                            return (
                                                <FormField
                                                    key={key}
                                                    name={
                                                        key as keyof z.infer<
                                                            typeof filterSchemaDistillery
                                                        >
                                                    }
                                                    control={form.control}
                                                    render={({ field }) => {
                                                        return (
                                                            <FormControl>
                                                                {value.options
                                                                    .length >
                                                                0 ? (
                                                                    <InputFilter
                                                                        key={`${key}-${value.title}`}
                                                                        {...value}
                                                                        field={
                                                                            field as unknown as Parameters<
                                                                                typeof InputFilter
                                                                            >[0]["field"]
                                                                        }
                                                                        isHaveSearch={
                                                                            value.isHaveSearch
                                                                        }
                                                                    />
                                                                ) : null}
                                                            </FormControl>
                                                        );
                                                    }}
                                                />
                                            );
                                        }
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
            {/* Mobile Sort By Skeleton */}
            <div className="border-b border-bd-main pb-6 dk:hidden tb:pb-4">
                <div className="flex items-center justify-between pb-4">
                    <div className="h-5 w-20 animate-pulse rounded bg-bg-sf3" />
                    <div className="h-4 w-4 animate-pulse rounded bg-bg-sf3" />
                </div>
            </div>

            {/* Checkbox Group Skeletons */}
            {[1, 2, 3, 4].map((groupIndex) => (
                <div
                    key={groupIndex}
                    className="border-b border-bd-main pb-6 tb:pb-4"
                >
                    <div className="flex items-center justify-between pb-4">
                        <div className="flex items-center gap-1">
                            <div className="h-5 w-24 animate-pulse rounded bg-bg-sf3" />
                        </div>
                        <div className="h-4 w-4 animate-pulse rounded bg-bg-sf3" />
                    </div>
                    <div className="flex flex-col gap-4 pt-4">
                        {/* Search input skeleton (distillery filter has search in Country, Region, Company) */}
                        {groupIndex !== 1 && (
                            <div className="h-11 w-full animate-pulse rounded bg-bg-sf4" />
                        )}
                        <div className="mt-4 flex flex-col gap-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2"
                                >
                                    <div className="h-3.5 w-3.5 animate-pulse rounded-sm bg-bg-sf3" />
                                    <div className="h-4 w-28 animate-pulse rounded bg-bg-sf3" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
