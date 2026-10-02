"use client";

import { useState, useRef } from "react";
import IconClose from "@/components/shared/icons/icon-close";
import IconSearch from "@/components/shared/icons/icon-search";
import IconChevonDown from "@/components/shared/icons/icon-chevon-down";
import { cn } from "@/lib/utils";
import { inputVariants } from "@/components/ui/input";

type TSearchInputProps = {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
    size?: "md" | "lg";
    showChevron?: boolean;
};

export default function SearchInput({
    value,
    onChange,
    placeholder = "Search",
    className,
    size = "md",
    showChevron = false,
}: TSearchInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (
            e.target instanceof HTMLElement &&
            !e.target.closest("button") &&
            !e.target.closest("input")
        ) {
            inputRef.current?.focus();
        }
    };

    return (
        <div
            onClick={handleWrapperClick}
            className={cn("relative cursor-text items-center gap-2", className)}
        >
            <div className="absolute left-3 top-1/2 size-4 shrink-0 -translate-y-1/2 text-icon-main dark:text-icon-dark-main">
                <IconSearch />
            </div>
            <input
                ref={inputRef}
                className={cn(
                    inputVariants({ inputSize: size }),
                    "h-full px-9 mb:px-8"
                )}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />

            <div className="absolute right-3 top-1/2 flex shrink-0 -translate-y-1/2 items-center gap-1.5">
                {value && (
                    <button
                        onClick={() => onChange("")}
                        className="flex h-4 w-4 cursor-pointer select-none items-center justify-center text-icon-main transition-colors hover:text-typo-primary dark:text-icon-dark-main dark:hover:text-typo-dark-primary"
                        type="button"
                        aria-label="Clear search"
                    >
                        <IconClose />
                    </button>
                )}
                {showChevron && (
                    <span className="pointer-events-none flex h-5 w-5 items-center justify-center text-icon-main dark:text-icon-dark-main">
                        <IconChevonDown />
                    </span>
                )}
            </div>
        </div>
    );
}
