import { filterCaskValDefault, MAP_KEY_FILTER_CASK } from "@/lib/constants";
import { isEmpty } from "@/lib/utils";
import { filterSchemaCask } from "@/lib/validators";
import { z } from "zod";

export const handleConvertParamsOriginal = (
    data: z.infer<typeof filterSchemaCask>
) => {
    const result = Object.entries(data).reduce(
        (acc: { [key: string]: string }, [key, value]) => {
            const keySearch =
                MAP_KEY_FILTER_CASK[key as keyof typeof MAP_KEY_FILTER_CASK];
            // Early return if value is empty or contains "all"
            if (
                isEmpty(value) ||
                (Array.isArray(value) && value.includes("all" as never))
            ) {
                return acc; // Return accumulated result without processing this value
            }

            // replace key to key search, ex: caskType => casktypeId, destillery => distilleryId
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
            } else {
                Object.values(keySearch).forEach((val, index) => {
                    if (!acc[val] && value[index]) {
                        acc[val] = `${value[index]}`;
                    }
                });
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
export const handleConvertParamsReverse = (
    filterString: string
): z.infer<typeof filterSchemaCask> => {
    if (!filterString) return filterCaskValDefault;

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
    const mapFormKey = Object.entries(MAP_KEY_FILTER_CASK).reduce(
        (
            acc: { [key: string]: Array<number | string | never | undefined> },
            [key, value]
        ) => {
            if (typeof value === "string") {
                const findValue = Object.entries(filterStringObj).find(
                    ([keyFind]) => value === keyFind
                );
                acc[key] = findValue
                    ? findValue[1]
                          .split(",")
                          .filter((v) => v && v !== "[object Object]")
                    : [];
            } else {
                if (
                    isEmpty(filterStringObj[value.min]) &&
                    isEmpty(filterStringObj[value.max])
                )
                    return acc;

                acc[key] = [
                    filterStringObj[value.min],
                    filterStringObj[value.max],
                ];
            }
            return acc;
        },
        {}
    );
    return mapFormKey;
};
