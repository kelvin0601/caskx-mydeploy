"use client";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn, convertRemToPx } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import IconArrowDownBold from "@/components/shared/icons/icon-ar-down-bold";
import { Command as CommandPrimitive } from "cmdk";
import React, { useMemo } from "react";
import { useFormField } from "./form";

type Option = {
    value: string;
    label: string;
};

type VirtualizedCommandProps = {
    height: string;
    options: Option[];
    placeholder: string;
    onSelectOption?: (option: string) => void;
};

const VirtualizedCommand = ({
    height,
    options,
    placeholder,
    onSelectOption,
}: VirtualizedCommandProps) => {
    const [search, setSearch] = React.useState("");
    const [focusedIndex, setFocusedIndex] = React.useState(0);
    const [isKeyboardNavActive, setIsKeyboardNavActive] = React.useState(false);

    const filteredOptions = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) {
            return options;
        }

        return options.filter(
            (option) =>
                option.label.toLowerCase().includes(normalizedSearch) ||
                option.value.toLowerCase().includes(normalizedSearch)
        );
    }, [options, search]);

    const parentRef = React.useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: filteredOptions.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40,
    });

    const virtualOptions = virtualizer.getVirtualItems();

    const scrollToIndex = (index: number) => {
        if (index < 0 || index >= filteredOptions.length) {
            return;
        }

        virtualizer.scrollToIndex(index, {
            align: "center",
        });
    };

    const handleSearch = (search: string) => {
        setIsKeyboardNavActive(false);
        setSearch(search);
        setFocusedIndex(0);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (filteredOptions.length === 0) {
            return;
        }

        switch (event.key) {
            case "ArrowDown": {
                event.preventDefault();
                setIsKeyboardNavActive(true);
                setFocusedIndex((prev) => {
                    const newIndex =
                        prev === -1
                            ? 0
                            : Math.min(prev + 1, filteredOptions.length - 1);
                    scrollToIndex(newIndex);
                    return newIndex;
                });
                break;
            }
            case "ArrowUp": {
                event.preventDefault();
                setIsKeyboardNavActive(true);
                setFocusedIndex((prev) => {
                    const newIndex =
                        prev === -1
                            ? filteredOptions.length - 1
                            : Math.max(prev - 1, 0);
                    scrollToIndex(newIndex);
                    return newIndex;
                });
                break;
            }
            case "Enter": {
                event.preventDefault();
                if (filteredOptions[focusedIndex]) {
                    onSelectOption?.(filteredOptions[focusedIndex].value);
                }
                break;
            }
            default:
                break;
        }
    };

    return (
        <Command
            shouldFilter={false}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-typo-primary dark:text-typo-dark-primary"
        >
            <CommandInput
                className="mb-0"
                aria-label={placeholder}
                onValueChange={handleSearch}
                placeholder={placeholder}
            />
            <CommandPrimitive.List
                ref={parentRef}
                className="min-w-0 overflow-y-auto overflow-x-hidden"
                style={{
                    height:
                        filteredOptions.length > 0
                            ? `min(${height}, ${virtualizer.getTotalSize()}px)`
                            : "auto",
                    width: "100%",
                }}
                onMouseDown={() => setIsKeyboardNavActive(false)}
                onMouseMove={() => setIsKeyboardNavActive(false)}
            >
                <CommandEmpty>No item found.</CommandEmpty>
                <CommandGroup>
                    <div
                        style={{
                            height: `${virtualizer.getTotalSize()}px`,
                            width: "100%",
                            position: "relative",
                        }}
                    >
                        {virtualOptions.map((virtualOption) => (
                            <CommandItem
                                key={filteredOptions[virtualOption.index].value}
                                disabled={isKeyboardNavActive}
                                className={cn(
                                    "absolute left-0 top-0 flex w-full cursor-pointer items-center justify-between bg-transparent px-4 py-2.5 text-sm font-medium text-typo-primary/70 transition-colors dark:text-typo-dark-primary/70",
                                    virtualOption.index !==
                                        filteredOptions.length - 1 &&
                                        "border-b border-bd-main dark:border-bd-dark-main",
                                    focusedIndex === virtualOption.index &&
                                        "bg-bg-sf2 text-typo-primary dark:bg-bg-dark-sf3 dark:text-typo-dark-primary",
                                    isKeyboardNavActive &&
                                        focusedIndex !== virtualOption.index &&
                                        "bg-transparent text-typo-primary/70 aria-selected:bg-bg-sf2 aria-selected:text-typo-primary dark:text-typo-dark-primary/70 dark:aria-selected:bg-bg-dark-sf3 dark:aria-selected:text-typo-dark-primary"
                                )}
                                style={{
                                    height: `${virtualOption.size}px`,
                                    transform: `translateY(${virtualOption.start}px)`,
                                }}
                                value={
                                    filteredOptions[virtualOption.index].value
                                }
                                onMouseEnter={() =>
                                    !isKeyboardNavActive &&
                                    setFocusedIndex(virtualOption.index)
                                }
                                onMouseLeave={() =>
                                    !isKeyboardNavActive && setFocusedIndex(-1)
                                }
                                onSelect={onSelectOption}
                            >
                                <span className="w-full truncate">
                                    {filteredOptions[virtualOption.index].label}
                                </span>
                            </CommandItem>
                        ))}
                    </div>
                </CommandGroup>
            </CommandPrimitive.List>
        </Command>
    );
};

type VirtualizedComboboxProps = {
    options: Option[];
    searchPlaceholder?: string;
    width?: string;
    height?: string;
    className?: string;
    value?: string;
    required?: boolean;
    showChevron?: boolean;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
};

export function VirtualizedCombobox({
    options,
    searchPlaceholder = "Search items...",
    width = convertRemToPx(20) + "px",
    height = convertRemToPx(20) + "px",
    className,
    value,
    onValueChange,
    required = false,
    showChevron = true,
    disabled = false,
}: VirtualizedComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [selectedOption, setSelectedOption] = React.useState(value ?? "");
    const { error } = useFormField();
    React.useEffect(() => {
        if (value !== undefined) {
            setSelectedOption(value);
        }
    }, [value]);

    const contentStyle = width
        ? ({
              width,
              "--trigger-width": width,
          } as React.CSSProperties)
        : undefined;

    return (
        <Popover
            open={open}
            onOpenChange={(next) => !disabled && setOpen(next)}
        >
            <PopoverTrigger asChild>
                <Button
                    variant="empty"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "group flex h-12 w-full min-w-0 items-center justify-between gap-3 border border-transparent bg-bg-sf4 pl-4 pr-3 text-sm text-typo-primary transition-all hover:border-bd-main focus:border-bd-brown-lighter focus-visible:border-bd-brown-lighter disabled:cursor-not-allowed disabled:bg-bg-disable data-[state=open]:border-bd-brown-lighter data-[state=open]:bg-bg-sf4 dark:bg-bg-dark-sf4 dark:text-typo-dark-primary dark:hover:border-bd-dark-main dark:focus:border-bd-dark-inverse dark:focus-visible:border-bd-dark-inverse dark:disabled:bg-bg-dark-disable dark:data-[state=open]:border-bd-dark-inverse dark:data-[state=open]:bg-bg-dark-sf4 mb:h-10 mb:pl-3 mb:pr-2.5",
                        !selectedOption &&
                            "text-typo-soft dark:text-typo-dark-soft",
                        error &&
                            "border-error hover:border-error focus-visible:border-error",
                        className,
                        required && "required"
                    )}
                    data-placeholder={selectedOption ? undefined : true}
                >
                    <span className="min-w-0 flex-1 truncate text-left">
                        {selectedOption
                            ? (options.find(
                                  (option) => option.value === selectedOption
                              )?.label ?? searchPlaceholder)
                            : searchPlaceholder}
                    </span>
                    {showChevron && (
                        <div className="size-4 shrink-0 text-icon-main transition-transform duration-200 group-data-[state=open]:rotate-180 dark:text-icon-dark-main">
                            <IconArrowDownBold />
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className={cn(
                    "mt-2 rounded-md border border-bd-main bg-bg-main p-0 text-typo-primary shadow-[0px_0.5rem_1.5rem_0px_rgba(0,0,0,0.08)] dark:border-bd-dark-main dark:bg-bg-dark-main dark:text-typo-dark-primary",
                    width
                        ? "w-[var(--trigger-width)] min-w-[var(--trigger-width)]"
                        : "w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)]"
                )}
                style={contentStyle}
            >
                <VirtualizedCommand
                    height={height}
                    options={options}
                    placeholder={searchPlaceholder}
                    onSelectOption={(currentValue) => {
                        const nextValue =
                            currentValue === selectedOption ? "" : currentValue;
                        setSelectedOption(nextValue);
                        onValueChange?.(nextValue);
                        setOpen(false);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
