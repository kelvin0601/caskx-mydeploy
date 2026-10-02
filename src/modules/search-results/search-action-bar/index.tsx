"use client";

import IconSwitchVertical from "@/components/shared/icons/icon-switch-vertical";
import SearchInput from "@/components/shared/search-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type TSearchActionBarProps = {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    showOwnedOnly: boolean;
    onToggleOwned: (value: boolean) => void;
    showBuyNow: boolean;
    onToggleBuyNow: (value: boolean) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    sortOptions: Array<{
        name: string;
        value: string;
        defaultOrder: string;
    }>;
    sortPlaceholder?: string;
    className?: string;
    showToggles?: boolean;
    placeholder?: string;
};

export default function SearchActionBar({
    searchQuery,
    onSearchChange,
    showOwnedOnly,
    onToggleOwned,
    showBuyNow,
    onToggleBuyNow,
    sortBy,
    onSortChange,
    sortOptions,
    sortPlaceholder = "Sort by",
    className,
    showToggles = true,
    placeholder = "Search...",
}: TSearchActionBarProps) {
    const renderSelectOptions = () => (
        <>
            {sortOptions.map((sort) => (
                <SelectItem
                    key={`${sort.value}-${sort.defaultOrder}`}
                    value={`${sort.value}_${sort.defaultOrder.toLowerCase()}`}
                    className="rounded-none py-3 text-sm"
                >
                    {sort.name}
                </SelectItem>
            ))}
        </>
    );

    return (
        <div className="-mx-[var(--padding-container)] flex flex-col border-b border-bd-main bg-bg-main">
            {/* Top row: Search input & Sort button (mobile) / Search input & Toggles & Sort select (desktop/tablet) */}
            <div
                className={cn(
                    "flex flex-row items-center justify-between gap-4 px-[var(--padding-container)] py-4 tb:gap-4 j-tb:gap-6 mb:flex-col mb:items-start mb:gap-4 mb:py-4",
                    className
                )}
            >
                {/* Search Input Container & Mobile Sort Trigger wrapper */}
                <div className="flex flex-1 items-center justify-between gap-1.5 tb:w-full mb:gap-1">
                    {/* Search Input */}
                    <SearchInput
                        value={searchQuery}
                        onChange={onSearchChange}
                        placeholder={placeholder}
                        size="lg"
                        className="dk:h-12 dk:w-[25.5rem] j-tb:w-60 mb:flex-1"
                    />

                    {/* Mobile Sort Icon Button */}
                    <div className="hidden mb:block">
                        <Select value={sortBy} onValueChange={onSortChange}>
                            <SelectTrigger className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-bd-main bg-bg-main p-0 focus:ring-0 data-[state=open]:border-black data-[state=open]:bg-black data-[state=open]:text-typo-dark-primary mb:px-0 [&>div:first-child]:flex [&>div:first-child]:h-full [&>div:first-child]:w-full [&>div:first-child]:items-center [&>div:first-child]:justify-center [&>div:last-child]:hidden">
                                <IconSwitchVertical className="h-5 w-5 shrink-0 text-typo-primary group-data-[state=open]:text-typo-dark-primary dark:text-typo-dark-primary" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border border-bd-main bg-bg-main">
                                {renderSelectOptions()}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Right Controls Container (Desktop/Tablet only) */}
                <div className="flex w-auto flex-row items-center justify-end gap-4 dk:gap-8 j-tb:gap-6">
                    {showToggles && (
                        <div className="flex items-center gap-8 tb:gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    variant={"black"}
                                    checked={showOwnedOnly}
                                    onCheckedChange={onToggleOwned}
                                />
                                <span className="select-none text-sm text-typo-primary dark:text-typo-dark-primary tb:text-xs">
                                    Owned by you
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={showBuyNow}
                                    variant={"black"}
                                    onCheckedChange={onToggleBuyNow}
                                />
                                <span className="select-none text-sm text-typo-primary dark:text-typo-dark-primary tb:text-xs">
                                    Buy now available
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb:hidden">
                        <span className="select-none text-sm text-typo-soft dark:text-typo-dark-soft">
                            Sort by
                        </span>
                        <Select value={sortBy} onValueChange={onSortChange}>
                            <SelectTrigger
                                className={cn(
                                    "h-12 w-[15.3125rem] bg-bg-sf4 dark:bg-bg-dark-sf4 tb:w-[8.25rem]"
                                )}
                            >
                                <SelectValue placeholder={sortPlaceholder} />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border border-bd-main bg-bg-main">
                                {renderSelectOptions()}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
