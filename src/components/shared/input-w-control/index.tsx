import { InputWithoutForm } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React from "react";
import IconMinus from "../icons/icon-minus";
import IconPlus from "../icons/icon-plus";

export default function InputWControl({
    value,
    setValue,
    className,
    onBlur,
}: {
    value: number;
    setValue: (value: number) => void;
    className?: string;
    onBlur?: () => void;
}) {
    const MIN_QUANTITY = 1;

    return (
        <div className={cn("relative", className)}>
            <div
                className={cn(
                    "absolute left-1 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full p-2.5 text-typo-soft transition-all duration-300 hover:bg-bg-main",
                    value <= MIN_QUANTITY &&
                        "pointer-events-none text-typo-disable"
                )}
                onClick={() => {
                    if (value > MIN_QUANTITY) {
                        setValue(value - 1);
                    }
                }}
            >
                <div className="h-4 w-4">
                    <IconMinus />
                </div>
            </div>
            <InputWithoutForm
                type="number"
                value={
                    value === 0 ? "0" : value < 10 ? `0${value}` : `${value}`
                }
                onBlur={onBlur}
                onChange={(e) => {
                    const value = e.target.value;
                    setValue(parseInt(value));
                }}
                className="h-full bg-transparent text-center font-medium text-typo-soft"
            />
            <div
                className={cn(
                    "absolute right-1 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full p-2.5 transition-all duration-300 hover:bg-bg-main"
                )}
                onClick={() => {
                    setValue(value + 1);
                }}
            >
                <div className="h-4 w-4">
                    <IconPlus />
                </div>
            </div>
        </div>
    );
}
