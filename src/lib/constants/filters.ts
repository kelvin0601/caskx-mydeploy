// Filter types and configurations
export type TOptionCheckBox = {
    label: string;
    value: string;
    checked: boolean;
    id?: string;
    count: number;
};

export type TOptionRange = number[];

type FilterTypes = {
    checkbox: TOptionCheckBox[];
    range: TOptionRange;
};

export type TDataFilterCask<T extends keyof FilterTypes = keyof FilterTypes> = {
    [key: string]: {
        title: string;
        name: string;
        type: T;
        unit?: string;
        options: FilterTypes[T];
        maxRange?: number;
        step?: string;
        positionUnit?: "prefix" | "suffix";
        isDisableDecimal?: boolean;
        isDisableCommon?: boolean;
        isHaveSearch?: boolean;
    };
};

export type TDataFilterDistilleries<
    T extends keyof FilterTypes = keyof FilterTypes,
> = {
    [key: string]: {
        title: string;
        name: string;
        type: T;
        unit?: string;
        options: FilterTypes[T];
        maxRange?: number;
        step?: string;
        isDisableDecimal?: boolean;
        isDisableCommon?: boolean;
        isHaveSearch?: boolean;
    };
};

export type TOptions<T extends keyof FilterTypes> = FilterTypes[T];

// Default filter values
export const filterCaskValDefault = {
    price: [],
    category: [],
    caskType: [],
    region: [],
    distillery: [],
    year: [],
    abv: [],
    rla: [],
    ola: [],
    bottles: [],
};

export const filterDistilleryValDefault = {
    countries: [],
    regions: [],
    statuses: [],
    companies: [],
};

// Filter key mappings
export const MAP_KEY_FILTER_CASK = {
    price: {
        min: "minPrice",
        max: "maxPrice",
    },
    category: "classificationIds",
    caskType: "caskTypeIds",
    region: "regionIds",
    distillery: "distilleryIds",
    year: {
        min: "minVintageYear",
        max: "maxVintageYear",
    },
    abv: {
        min: "minAbv",
        max: "maxAbv",
    },
    rla: {
        min: "minRla",
        max: "maxRla",
    },
    ola: {
        min: "minOla",
        max: "maxOla",
    },
    bottles: {
        min: "minEstimatedBottleCount",
        max: "maxEstimatedBottleCount",
    },
};

export const MAP_KEY_FILTER_DISTILLERIES = {
    countries: {
        store_key: "countryDistilleries",
        search_key: "countries",
    },
    regions: {
        store_key: "regionDistilleries",
        search_key: "regions",
    },
    statuses: {
        store_key: "statusDistilleries",
        search_key: "statuses",
    },
    companies: {
        store_key: "companyDistilleries",
        search_key: "companies",
    },
};

export type TKeyFilterDistilleries = keyof typeof MAP_KEY_FILTER_DISTILLERIES;

// Cask filter data configuration
export const DATA_FILTER_CASKS: TDataFilterCask = {
    price: {
        title: "Price",
        type: "range",
        name: "price",
        unit: "£",
        positionUnit: "prefix",
        maxRange: 13,
        options: [0, 0],
    },
    // category: {
    //     title: "Category",
    //     name: "category",
    //     type: "checkbox",
    //     options: [],
    //     isHaveSearch: true,
    // },
    caskType: {
        title: "Cask Type",
        name: "caskType",
        type: "checkbox",
        options: [],
        isHaveSearch: true,
    },
    region: {
        title: "Region",
        name: "region",
        type: "checkbox",
        options: [],
        isHaveSearch: true,
    },
    distillery: {
        title: "Distillery",
        name: "distillery",
        type: "checkbox" as const,
        options: [],
        isHaveSearch: true,
    },
    year: {
        title: "Vintage",
        type: "range",
        name: "year",
        options: [0, 0],
        maxRange: 4,
        isDisableDecimal: true,
        isDisableCommon: true,
    },
    abv: {
        title: "ABV",
        type: "range",
        name: "abv",
        unit: "%",
        positionUnit: "suffix",
        step: "0.01",
        options: [0, 0],
        maxRange: 3,
    },
    rla: {
        title: "RLA",
        type: "range",
        name: "rla",
        unit: "",
        step: "0.01",
        options: [0, 0],
        maxRange: 5,
    },
    ola: {
        title: "OLA",
        type: "range",
        name: "ola",
        unit: "",
        step: "0.01",
        options: [0, 0],
        maxRange: 5,
    },
    bottles: {
        title: "Bottles",
        type: "range",
        name: "bottles",
        options: [0, 0],
        maxRange: 5,
        isDisableDecimal: true,
    },
};

// Distillery filter data configuration
export const DATA_FILTER_DISTILLERIES: TDataFilterDistilleries = {
    countries: {
        title: "Country",
        type: "checkbox",
        name: "countries",
        isHaveSearch: true,
        options: [],
    },
    regions: {
        title: "Region",
        type: "checkbox",
        name: "regions",
        isHaveSearch: true,
        options: [],
    },
    statuses: {
        title: "Status",
        type: "checkbox",
        name: "statuses",
        options: [],
    },
    companies: {
        title: "Company",
        type: "checkbox",
        name: "companies",
        isHaveSearch: true,
        options: [],
    },
};

// Tag rules for casks
export const RULE_TAGS_CASK = {
    price: {
        label: "Price",
        unit: {
            value: "£",
            position: "prefix",
        },
    },
    category: {
        label: "",
        unit: undefined,
    },
    caskType: {
        label: "",
        unit: undefined,
    },
    region: {
        label: "",
        unit: undefined,
    },
    distillery: {
        label: "",
        unit: undefined,
    },
    year: {
        label: "Vintage",
        unit: undefined,
    },
    abv: {
        label: "ABV",
        unit: {
            value: "%",
            position: "suffix",
        },
    },
    rla: {
        label: "RLA",
        unit: undefined,
    },
    ola: {
        label: "OLA",
        unit: undefined,
    },
    bottles: {
        label: "Bottles",
        unit: undefined,
    },
};

// Tag rules for distilleries
export const RULE_TAGS_DISTILLERIES = {
    countries: {
        label: "Country",
        unit: undefined,
    },
    regions: {
        label: "Region",
        unit: undefined,
    },
    statuses: {
        label: "Status",
        unit: undefined,
    },
    companies: {
        label: "Company",
        unit: undefined,
    },
};

export const EXPLORE_CASK_FILTERS = [
    {
        label: "Top Traded",
        value: "sortBy=topTraded",
    },
    {
        label: "Most Watched",
        value: "sortBy=popularity",
    },
    {
        label: "Strategic Buy",
        value: "sortBy=strategicBuys&sortOrder=DESC",
    },
    {
        label: "New Listing",
        value: "sortBy=newListing&sortOrder=DESC",
    },
] as const;

export const BANNER_CASK_FILTER = "sortBy=demandScore&size=10";
