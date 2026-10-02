import { PARAMS } from "@/lib/constants/route";

export type ResourceSearchParams = Record<
    string,
    string | string[] | undefined
>;

export function resourceSearchValue(params: ResourceSearchParams) {
    const value = params[PARAMS.search];
    return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function resourcePageValue(params: ResourceSearchParams) {
    const value = params[PARAMS.page];
    const page = Number(Array.isArray(value) ? value[0] : value);
    return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
