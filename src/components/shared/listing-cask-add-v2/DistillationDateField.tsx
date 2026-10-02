"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import IconCalendar from "@/components/shared/icons/icon-calendar";
import { Button } from "@/components/ui/button";
import { cn, formatDateYYYYMMDD, parseDateYYYYMMDD } from "@/lib/utils";
import {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";

export function DistillationDateField({
    form,
    field,
    open,
    setOpen,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: ControllerRenderProps<any, "distillationDate">;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const selectedDate = parseDateYYYYMMDD(field.value);
    const toYear = React.useMemo(() => new Date().getFullYear() + 30, []);
    const formattedDate = selectedDate
        ? format(selectedDate, "dd/MM/yyyy")
        : null;

    return (
        <FormItem className="space-y-1.5">
            <FormLabel>Distillation Date </FormLabel>
            <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "h-12 w-full justify-between rounded-none border border-transparent bg-bg-sf4 px-4 text-sm font-normal focus-within:border-bd-brown-lighter hover:border-bd-main hover:bg-bg-sf4 focus:border-bd-brown-lighter focus-visible:border-bd-brown-lighter data-[state=open]:border-bd-brown-lighter data-[state=open]:bg-bg-sf4 mb:h-10 mb:px-3",
                                field.value
                                    ? "text-typo-primary"
                                    : "text-typo-disable",
                                form?.formState?.errors?.distillationDate
                                    ? "!border-error outline-error !ring-error focus-within:border-2 hover:ring-error-darker focus:border-2 focus-visible:border-2"
                                    : ""
                            )}
                        >
                            {formattedDate ?? "Select date"}
                            <div className="size-5 text-icon-main">
                                <IconCalendar />
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                    >
                        <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={toYear}
                            selected={selectedDate as unknown as Date}
                            defaultMonth={selectedDate || new Date()}
                            onSelect={(selected) => {
                                const formatted = formatDateYYYYMMDD(
                                    selected as Date
                                );
                                if (formatted) {
                                    field.onChange(formatted);
                                    setOpen(false);
                                }
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </FormControl>
            <FormMessage />
        </FormItem>
    );
}
