import {
    filterDistilleryValDefault,
    MAP_KEY_FILTER_DISTILLERIES,
    RULE_TAGS_DISTILLERIES,
    STATUS_DISTILLERIES_DEFAULT,
    TKeyFilterDistilleries,
    TOptionCheckBox,
} from "@/lib/constants";
import { isEmpty } from "@/lib/utils";
import { filterSchemaDistillery } from "@/lib/validators";
import { store } from "@/types/store";
import { z } from "zod";
import { StateCreator } from "zustand";
import { distillery } from "../../types/distillery";

const initialState = {
    tagsDistilleries: [],
    isResetDistilleries: false,
    filterDistilleries: filterDistilleryValDefault,
    sortDistilleries: undefined,
    distilleriesData: {
        data: [],
        page: 1,
        size: 10,
        totalPages: 1,
        totalRecords: 0,
    },
};
const initStateFilter = {
    regionDistilleries: [],
    companyDistilleries: [],
    countryDistilleries: [],
    statusDistilleries: STATUS_DISTILLERIES_DEFAULT,
};

export const createDistilleriesSlice: StateCreator<
    store.TDistilleries,
    [],
    []
> = (set, get) => ({
    ...initialState,
    ...initStateFilter,

    updateDistilleriesData: (data) => {
        set({
            [MAP_KEY_FILTER_DISTILLERIES.statuses.store_key]: data.statuses,
            [MAP_KEY_FILTER_DISTILLERIES.countries.store_key]: data.countries,
            [MAP_KEY_FILTER_DISTILLERIES.companies.store_key]: data.companies,
            [MAP_KEY_FILTER_DISTILLERIES.regions.store_key]: data.regions,
        });
    },
    updateDataFilterDistilleries: (
        data: z.infer<typeof filterSchemaDistillery>
    ) => {
        set({ filterDistilleries: data });
    },
    clearSortCask: () => {
        set({ sortDistilleries: undefined });
    },
    clearFilterDistilleries: () => {
        set({ filterDistilleries: filterDistilleryValDefault });
    },
    setIsResetDistilleries: (isReset) => {
        set({ isReset });
    },
    updateSortDistilleries: (sort) => {
        set({ sortDistilleries: sort });
    },
    updateDistilleriesList: (data) => {
        set({ distilleriesData: data });
    },
    updateTagsDistilleries: () => {
        set((state) => {
            const cloneFilters = { ...state.filterDistilleries };

            const tagsGenerate = Object.entries(cloneFilters).reduce(
                (
                    acc: distillery.TDistilleryFilter[],
                    [key, values]: [string, string[] | (string | undefined)[]]
                ) => {
                    if (
                        isEmpty(values) ||
                        isEmpty(
                            MAP_KEY_FILTER_DISTILLERIES[
                                key as TKeyFilterDistilleries
                            ]
                        )
                    )
                        return acc;
                    const keyFilter = MAP_KEY_FILTER_DISTILLERIES[
                        key as TKeyFilterDistilleries
                    ].store_key as keyof typeof state;
                    const matchData = state[keyFilter];
                    if (Array.isArray(values)) {
                        values.forEach((val) => {
                            const valueMatch = matchData?.find(
                                (item: TOptionCheckBox) =>
                                    item.value?.toLowerCase() ===
                                    val?.toLowerCase()
                            );
                            acc.push({
                                label: RULE_TAGS_DISTILLERIES[
                                    key as keyof typeof RULE_TAGS_DISTILLERIES
                                ].label,
                                id: valueMatch?.id || val,
                                value: valueMatch?.label || valueMatch?.name || val,
                                type: key,
                            });
                        });
                    }

                    return acc;
                },
                []
            );
            return {
                ...state,
                tagsDistilleries: [...tagsGenerate],
            };
        });
    },

    deleteTagDistilleries: ({ id, type }) => {
        set((state) => {
            let filterTags = [...state.tagsDistilleries];
            let filterArray: z.infer<typeof filterSchemaDistillery> = {
                ...state.filterDistilleries,
            };
            if (!type) return state;

            if (Array.isArray(filterArray[type as keyof typeof filterArray])) {
                filterArray = {
                    ...filterArray,
                    [type]: (
                        filterArray[
                            type as keyof typeof filterArray
                        ] as string[]
                    ).filter((item) => item !== id),
                };
            }
            filterTags = filterTags.filter(
                (item) => item.type !== type || item.id !== id
            );

            return {
                ...state,
                tagsDistilleries: filterTags,
                filterDistilleries: filterArray,
            };
        });

        return get().filterDistilleries;
    },
    updateFilterDistilleries: (filter) => {
        set((state) => {
            return { ...state, filterDistilleries: filter };
        });
        get().updateTagsDistilleries();
    },
    clearTagsDistilleries: () => {
        set({
            tagsDistilleries: [],
            isResetDistilleries: true,
        });
    },
    clearSortDistilleries: () => {
        set({ sortDistilleries: undefined });
    },
    clearAllDistilleries: () => {
        set({
            ...initialState,
            isResetDistilleries: true,
            tagsDistilleries: [],
        });
    },
});
