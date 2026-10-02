// Distillery status options
export const STATUS_DISTILLERIES_DEFAULT = [
    {
        label: "Active",
        value: "active",
        id: "active",
        name: "Active",
    },
    {
        label: "Inactive",
        value: "inactive",
        id: "inactive",
        name: "Inactive",
    },
    {
        label: "Demolished",
        value: "demolished",
        id: "demolished",
        name: "Demolished",
    },
];

export type TStatusDistilleries = (typeof STATUS_DISTILLERIES_DEFAULT)[number];

// Distillery sorting options
export const SORT_DISTILLERIES = [
    {
        name: "Founding year: Latest first",
        defaultOrder: "DESC",
        value: "establishedYear",
    },
    {
        name: "Founding year: Oldest first",
        defaultOrder: "ASC",
        value: "establishedYear",
    },
    {
        name: "No. cask: Greatest first",
        defaultOrder: "DESC",
        value: "caskCount",
    },
    {
        name: "No. cask: Smallest first",
        defaultOrder: "ASC",
        value: "caskCount",
    },
    {
        name: "Name: A – Z",
        defaultOrder: "ASC",
        value: "name",
    },
    {
        name: "Name: Z – A",
        defaultOrder: "DESC",
        value: "name",
    },
];
