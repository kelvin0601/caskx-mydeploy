"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "lucide-react";
import * as React from "react";
import {
    Chevron,
    DayButton,
    DayPicker,
    getDefaultClassNames,
    CustomComponents,
} from "react-day-picker";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./scroll-area";

// ── Specialized Select Components for Calendar ────────────────────────────────

const CalendarSelect = SelectPrimitive.Root;

const CalendarSelectValue = SelectPrimitive.Value;

const CalendarSelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            "group flex h-auto w-auto items-center justify-between gap-1.5 border-none bg-transparent p-0 text-sm font-medium text-typo-primary outline-none hover:bg-transparent focus:ring-0",
            className
        )}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDownIcon className="h-4 w-4 text-icon-main transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
CalendarSelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const CalendarSelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                "relative z-[100] mt-1 max-h-60 min-w-[8.125rem] overflow-hidden border border-bd-main bg-bg-main text-typo-primary shadow-[0px_3px_8px_0px_rgba(23,0,0,0.1),0px_4px_6px_0px_rgba(15,0,0,0.1)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                position === "popper" &&
                    "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                className
            )}
            position={position}
            {...props}
        >
            <ScrollArea className="h-full max-h-60">
                <SelectPrimitive.Viewport
                    className={cn(
                        "px-2",
                        position === "popper" &&
                            "w-full min-w-[var(--radix-select-trigger-width)]"
                    )}
                >
                    <div className="flex flex-col py-2">{children}</div>
                </SelectPrimitive.Viewport>
            </ScrollArea>
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
));
CalendarSelectContent.displayName = SelectPrimitive.Content.displayName;

const CalendarSelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex w-full cursor-pointer select-none items-center justify-between px-2 py-2 text-sm font-normal text-typo-primary outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            // Figma Design: Selected state has background extending slightly outside text
            "after:absolute after:-inset-x-0 after:inset-y-0 after:z-[-1] after:transition-colors data-[highlighted]:after:bg-bg-sf2/50 data-[state=checked]:after:bg-bg-sf2",
            className
        )}
        {...props}
    >
        <div className="relative z-10 flex flex-1 items-center justify-between">
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </div>
    </SelectPrimitive.Item>
));
CalendarSelectItem.displayName = SelectPrimitive.Item.displayName;

// ── Memoized Subcomponents ──────────────────────────────────────────────────

const CalendarRoot = React.memo(
    ({
        className,
        rootRef,
        ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
        rootRef?: React.Ref<HTMLDivElement>;
    }) => (
        <div
            data-slot="calendar"
            ref={rootRef}
            className={cn(className)}
            {...props}
        />
    )
);
CalendarRoot.displayName = "CalendarRoot";

const CalendarWeekday = React.memo(
    ({
        children,
        className,
        ...props
    }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
        <th className={cn(className, "w-auto")} {...props}>
            <div className="text-center text-sm capitalize text-typo-soft mb:text-xs">
                {children}
            </div>
        </th>
    )
);
CalendarWeekday.displayName = "CalendarWeekday";

const CalendarChevron = React.memo(
    ({
        className,
        orientation,
        ...props
    }: {
        className?: string;
        orientation?: "left" | "right" | "up" | "down";
    } & React.SVGAttributes<SVGSVGElement>) => {
        if (orientation === "left") {
            return (
                <ChevronLeftIcon
                    className={cn("size-4", className)}
                    {...props}
                />
            );
        }

        if (orientation === "right") {
            return (
                <ChevronRightIcon
                    className={cn("size-4", className)}
                    {...props}
                />
            );
        }

        return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
        );
    }
);
CalendarChevron.displayName = "CalendarChevron";

const CalendarWeekNumber = React.memo(
    ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
        <td {...props}>
            <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
            </div>
        </td>
    )
);
CalendarWeekNumber.displayName = "CalendarWeekNumber";

// ── Calendar Component ────────────────────────────────────────────────────────
function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "label",
    buttonVariant = "ghost",
    formatters,
    components,
    ...props
}: React.ComponentProps<typeof DayPicker> & {
    buttonVariant?: React.ComponentProps<typeof Button>["variant"];
} & { selected?: string | Date | number }) {
    const defaultClassNames = getDefaultClassNames();

    const defaultMonth = React.useMemo(() => {
        return props?.selected
            ? new Date(props?.selected as string | Date | number)
            : undefined;
    }, [props.selected]);

    const mergedFormatters = React.useMemo(
        () => ({
            formatWeekdayName: (
                date: Date,
                options?: { locale?: { code?: string } }
            ) =>
                date.toLocaleString(options?.locale?.code ?? "en-US", {
                    weekday: "short",
                }),
            formatMonthDropdown: (date: Date) =>
                date.toLocaleString("default", { month: "short" }),
            ...formatters,
        }),
        [formatters]
    );

    const mergedClassNames = React.useMemo(
        () => ({
            root: cn("w-fit gap-2", defaultClassNames.root),
            months: cn(
                "relative flex flex-col gap-4 md:flex-row",
                defaultClassNames.months
            ),
            month: cn(
                "flex w-full flex-col gap-3 z-20",
                defaultClassNames.month
            ),
            nav: cn(
                "absolute inset-x-0 z-30 pointer-events-none mb:h-8 [&_button]:pointer-events-auto top-0 -translate-y-1 flex w-full items-center justify-between gap-1",
                defaultClassNames.nav
            ),
            button_previous: cn(
                buttonVariants({ variant: buttonVariant, size: "icon" }),
                "size-7 mb:size-4 bg-transparent text-typo-primary p-0 opacity-50 hover:opacity-100 transition-opacity",
                defaultClassNames.button_previous
            ),
            button_next: cn(
                buttonVariants({ variant: buttonVariant, size: "icon" }),
                "size-7 mb:size-4 bg-transparent text-typo-primary p-0 opacity-50 hover:opacity-100 transition-opacity",
                defaultClassNames.button_next
            ),
            month_caption: cn(
                "flex mx-4 text-typo-primary items-center justify-center h-auto text-sm",
                defaultClassNames.month_caption
            ),
            dropdowns: cn(
                "flex w-full items-center justify-center gap-4 text-base font-medium",
                defaultClassNames.dropdowns
            ),
            dropdown_root: cn(
                "border-bd-main relative rounded-md border bg-bg-sf2 px-2",
                defaultClassNames.dropdown_root
            ),
            dropdown: cn(
                "absolute inset-0 opacity-0 cursor-pointer",
                defaultClassNames.dropdown
            ),
            caption_label: cn(
                "select-none font-medium text-base",
                defaultClassNames.caption_label
            ),
            table: "w-full border-collapse",
            weekdays: cn(
                "flex mx-auto justify-center gap-0 w-full py-2",
                defaultClassNames.weekdays
            ),
            weekday: cn(
                "text-typo-note flex-1 select-none text-xs font-normal uppercase text-center",
                defaultClassNames.weekday
            ),
            week: cn("flex w-full mt-1 gap-2", defaultClassNames.week),
            day: cn(
                "relative aspect-square mb:size-[1.875rem] h-full w-full select-none p-0 text-center",
                defaultClassNames.day
            ),
            today: cn("text-brand font-bold", defaultClassNames.today),
            outside: cn(
                "text-typo-note opacity-20 aria-selected:opacity-100",
                defaultClassNames.outside
            ),
            disabled: cn(
                "text-typo-note opacity-20",
                defaultClassNames.disabled
            ),
            hidden: cn("invisible", defaultClassNames.hidden),
            ...classNames,
        }),
        [classNames, buttonVariant, defaultClassNames]
    );

    const mergedComponents = React.useMemo(
        () => ({
            Root: CalendarRoot,
            Weekday: CalendarWeekday,
            Chevron: CalendarChevron,
            DayButton: CalendarDayButton,
            WeekNumber: CalendarWeekNumber,
            Dropdown: CalendarDropdown,
            ...components,
        }),
        [components]
    );

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            weekStartsOn={1}
            defaultMonth={defaultMonth}
            className={cn(
                "group/calendar rounded-none border border-bd-main bg-bg-main px-6 py-5 shadow-lg [--cell-size:2.5rem] mb:px-4 mb:py-4",
                String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
                String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
                className
            )}
            captionLayout={captionLayout}
            formatters={mergedFormatters}
            classNames={mergedClassNames}
            components={mergedComponents as Partial<CustomComponents>}
            {...props}
        />
    );
}

const CalendarDayButton = React.memo(function CalendarDayButton({
    className,
    day,
    modifiers,
    ...props
}: React.ComponentProps<typeof DayButton>) {
    const defaultClassNames = getDefaultClassNames();

    const ref = React.useRef<HTMLButtonElement>(null);
    React.useEffect(() => {
        if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);

    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            data-day={day.date.toLocaleDateString()}
            data-selected-single={
                modifiers.selected &&
                !modifiers.range_start &&
                !modifiers.range_end &&
                !modifiers.range_middle
            }
            data-range-start={modifiers.range_start}
            data-range-end={modifiers.range_end}
            data-range-middle={modifiers.range_middle}
            className={cn(
                "relative flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 bg-transparent font-normal leading-none hover:bg-bg-sf2 hover:text-typo-primary data-[range-end=true]:rounded-none data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-none data-[range-end=true]:bg-error data-[range-middle=true]:bg-bg-sf1 data-[range-start=true]:bg-error data-[selected-single=true]:bg-bg-dark-main data-[range-end=true]:text-typo-dark-primary data-[range-middle=true]:text-typo-primary data-[range-start=true]:text-typo-dark-primary data-[selected-single=true]:text-typo-dark-primary group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring [&>span]:text-xs [&>span]:opacity-70",
                defaultClassNames.day,
                className
            )}
            {...props}
        />
    );
});
CalendarDayButton.displayName = "CalendarDayButton";

// Custom Dropdown for month/year using specialized components
const CalendarDropdown = React.memo(function CalendarDropdown({
    options,
    value,
    onChange,
}: {
    options?: { value: string | number; label: string; disabled: boolean }[];
    value?: string | number | readonly string[];
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}) {
    const handleValueChange = React.useCallback(
        (newValue: string) => {
            if (onChange) {
                const syntheticEvent = {
                    target: { value: newValue },
                } as React.ChangeEvent<HTMLSelectElement>;
                onChange(syntheticEvent);
            }
        },
        [onChange]
    );

    return (
        <CalendarSelect
            value={value?.toString()}
            onValueChange={handleValueChange}
        >
            <CalendarSelectTrigger>
                <CalendarSelectValue />
            </CalendarSelectTrigger>
            <CalendarSelectContent>
                {options?.map(
                    (option: {
                        value: string | number;
                        label: string;
                        disabled: boolean;
                    }) => (
                        <CalendarSelectItem
                            key={option.value}
                            value={option.value.toString()}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </CalendarSelectItem>
                    )
                )}
            </CalendarSelectContent>
        </CalendarSelect>
    );
});
CalendarDropdown.displayName = "CalendarDropdown";

export { Calendar, CalendarDayButton };
