import {
    filterDistilleryValDefault,
    MAP_KEY_FILTER_DISTILLERIES,
} from "@/lib/constants";
import { isEmpty } from "@/lib/utils";
import { filterSchemaDistillery } from "@/lib/validators";
import { z } from "zod";

export const handleConvertParamsOriginalDistillery = (
    data: z.infer<typeof filterSchemaDistillery>
) => {
    const result = Object.entries(data).reduce(
        (acc: { [key: string]: string }, [key, value]) => {
            const filterKey = {
                countries: "countries",
                regions: "regions",
                statuses: "statuses",
                companies: "companies",
            };

            const keySearch = filterKey[key as keyof typeof filterKey];
            // Early return if value is empty or contains "all"
            if (
                isEmpty(value) ||
                (Array.isArray(value) && value.includes("all" as never))
            ) {
                return acc; // Return accumulated result without processing this value
            }

            if (typeof keySearch === "string") {
                const cleanValues = Array.isArray(value)
                    ? value.filter(
                          (v) =>
                              v &&
                              typeof v === "string" &&
                              v !== "[object Object]" &&
                              v !== "all"
                      )
                    : [value as string];

                if (cleanValues.length > 0) {
                    const joined = cleanValues.join(",");
                    if (!acc[keySearch]) {
                        acc[keySearch] = joined;
                    } else {
                        acc[keySearch] += `,${joined}`;
                    }
                }
            }

            return acc;
        },
        {}
    );
    const dataParams = Object.entries(result)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
    return dataParams;
};
// Reverse function to convert filter string back to object
export const handleConvertParamsReverseDistillery = (
    filterString: string
): z.infer<typeof filterSchemaDistillery> => {
    if (!filterString) return filterDistilleryValDefault;

    const filterStringArr = filterString.split("&");

    const filterStringObj = filterStringArr.reduce(
        (acc: { [key: string]: string }, val) => {
            const [key, value] = val.split("=");
            acc[key] = value;
            return acc;
        },
        {}
    );
    //Update key real,
    const mapFormKey = Object.entries(MAP_KEY_FILTER_DISTILLERIES).reduce(
        (
            acc: { [key: string]: Array<number | string | never | undefined> },
            [key, value]
        ) => {
            const searchKey = value.search_key;
            if (typeof searchKey === "string") {
                const findValue = Object.entries(filterStringObj).find(
                    ([keyFind]) => searchKey === keyFind
                );
                acc[key] = findValue
                    ? findValue[1]
                          .split(",")
                          .filter((v) => v && v !== "[object Object]")
                    : [];
            }
            return acc;
        },
        {}
    );
    return mapFormKey;
};
