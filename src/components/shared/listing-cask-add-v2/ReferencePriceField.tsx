"use client";

import {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatNumberToDecimal, isValidDecimal } from "@/lib/utils";
import { ControllerRenderProps } from "react-hook-form";
import { VariantFormValues } from "./FormVariantsGroup";

export function ReferencePriceField({
    field,
}: {
    field: ControllerRenderProps<VariantFormValues, "priceReference">;
}) {
    return (
        <div className="col-span-2 grid grid-cols-2 !gap-x-2 gap-y-6 tb:grid-cols-1">
            <FormItem className="space-y-1.5">
                <FormLabel>Min Price (£) </FormLabel>
                <FormControl>
                    <Input
                        required
                        type="text"
                        placeholder="e.g., 6970"
                        value={
                            Array.isArray(field.value) && field.value[0]
                                ? formatNumberToDecimal(
                                      field.value[0]?.toString()
                                  )
                                : ""
                        }
                        onChange={(e) => {
                            const value = e.target.value;
                            const isHaveDot = value.includes(".");
                            const maxLength = isHaveDot ? 13 + 3 : 13;
                            const limitValue = value.slice(0, maxLength);

                            if (!isValidDecimal(value)) {
                                field.onChange([limitValue, field.value?.[1]]);
                            }
                        }}
                    />
                </FormControl>
                <FormMessage field="0" />
            </FormItem>

            <FormItem className="space-y-1.5">
                <FormLabel>Max Price (£) </FormLabel>
                <FormControl>
                    <Input
                        type="text"
                        placeholder="e.g., 9430"
                        value={
                            Array.isArray(field.value) && field.value[1]
                                ? formatNumberToDecimal(
                                      field.value[1]?.toString()
                                  )
                                : ""
                        }
                        onChange={(e) => {
                            const value = e.target.value;
                            const isHaveDot = value.includes(".");
                            const maxLength = isHaveDot ? 13 + 3 : 13;
                            const limitValue = value.slice(0, maxLength);

                            if (!isValidDecimal(value)) {
                                field.onChange([field.value?.[0], limitValue]);
                            }
                        }}
                    />
                </FormControl>
                <FormMessage field="1" />
            </FormItem>
        </div>
    );
}
