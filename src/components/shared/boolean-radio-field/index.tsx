"use client";

import { FormItem, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ControllerRenderProps } from "react-hook-form";

export function BooleanRadioField({
    field,
    trueItemId,
    falseItemId,
    trueLabel,
    falseLabel,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: ControllerRenderProps<any, "isListed" | "readyToSell">;
    trueItemId: string;
    falseItemId: string;
    trueLabel: string;
    falseLabel: string;
}) {
    return (
        <FormItem>
            <RadioGroup
                className="flex gap-6"
                value={String(field.value)}
                onValueChange={(v) => field.onChange(v === "true")}
            >
                <div className="flex cursor-pointer items-center gap-2">
                    <RadioGroupItem id={trueItemId} value="true" />
                    <label htmlFor={trueItemId} className="text-sm">
                        {trueLabel}
                    </label>
                </div>
                <div className="flex cursor-pointer items-center gap-2">
                    <RadioGroupItem id={falseItemId} value="false" />
                    <label htmlFor={falseItemId} className="text-sm">
                        {falseLabel}
                    </label>
                </div>
            </RadioGroup>
            <FormMessage />
        </FormItem>
    );
}
