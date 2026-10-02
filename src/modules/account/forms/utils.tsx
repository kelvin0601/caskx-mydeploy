import IconArUpBold from "@/components/shared/icons/icon-ar-up-bold";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { FlagComponent } from "@/components/ui/phone-input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    SelectContent,
    SelectItem,
    VirtualizedSelectContent as UiVirtualizedSelectContent,
} from "@/components/ui/select";
import { useStatesQuery } from "@/hooks/useLocationQuery";
import { cn } from "@/lib/utils";
import { CountryCode } from "libphonenumber-js";
import { Check, ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

export type TState = { name: string; state_code?: string };
export type NamedItem = { name: string };
export type CodeNamedItem = { code: string; name: string };

export function CountrySelect({
    value,
    onValueChange,
    items,
    loading,
    placeholder = "Select country",
    searchPlaceholder = "Find a country...",
    disabled,
    regionNames,
}: {
    value?: string;
    onValueChange: (value: string) => void;
    items: CodeNamedItem[];
    loading?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    regionNames: Intl.DisplayNames;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectedItem = items.find((item) => item.code === value);

    return (
        <Popover modal open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"empty"}
                    type="button"
                    className={cn(
                        "flex h-12 w-full items-center justify-between gap-3 border bg-bg-sf4 px-4 transition-all data-[state=open]:border data-[state=open]:border-bd-main mb:h-10 mb:px-3",
                        // Default border
                        "border-transparent",
                        // Hover state
                        "hover:border-bd-main",
                        // Focus state
                        "!focus:ring-0 !focus-visible:ring-0 focus-within:!border-bd-brown focus-within:ring-0 focus:!border-bd-brown focus-visible:!border-bd-brown focus-visible:ring-0",
                        !value && "text-typo-note",
                        disabled && "cursor-not-allowed text-typo-disable"
                    )}
                    disabled={disabled || loading}
                >
                    <div className="flex-1 truncate text-left">
                        {selectedItem ? (
                            <span className="inline-flex items-center gap-1.5">
                                <FlagComponent
                                    country={selectedItem.code as CountryCode}
                                    countryName={selectedItem.name}
                                />
                                <span className="text-sm font-normal text-typo-primary">
                                    {selectedItem.name}
                                </span>
                            </span>
                        ) : (
                            <span className="text-sm font-normal text-typo-note">
                                {placeholder}
                            </span>
                        )}
                    </div>
                    <ChevronDownIcon
                        className={cn(
                            "h-4 w-4 text-typo-note opacity-70 transition-transform duration-200",
                            disabled ? "hidden" : "opacity-100",
                            open && "rotate-180"
                        )}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="z-[60] w-[var(--radix-popover-trigger-width)] min-w-[19rem] rounded-none border border-bd-main bg-bg-sf1 px-4 py-4 shadow-[0px_3px_8px_0px_rgba(23,0,0,0.1),0px_4px_6px_0px_rgba(15,0,0,0.1)] tb:w-[calc(100%+1rem)]"
            >
                <Command
                    className="overflow-visible bg-transparent"
                    shouldFilter={false}
                >
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={setSearch}
                        className="mb-0 h-10 rounded-none border-0 bg-bg-sf4 px-3 shadow-none ring-0 focus-within:ring-0 hover:ring-0 focus:ring-0 focus-visible:ring-0 [&>input]:font-inter [&>input]:text-sm [&>input]:font-normal [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-typo-note"
                    />
                    <CommandList className="-mx-4 mt-2 overflow-hidden">
                        <ScrollArea className="mr-1.5 max-h-60 pr-0">
                            <CommandEmpty className="p-3 font-inter text-sm text-typo-disable">
                                No country found.
                            </CommandEmpty>
                            <CommandGroup className="p-0">
                                {filteredItems.map((item) => (
                                    <CommandItem
                                        key={item.code}
                                        value={item.code}
                                        onSelect={() => {
                                            onValueChange(item.code);
                                            setOpen(false);
                                            setSearch("");
                                        }}
                                        className={cn(
                                            "relative flex cursor-pointer select-none items-center justify-between gap-3 rounded-none px-4 py-2 font-inter text-sm text-typo-primary transition-colors after:absolute after:inset-x-2 after:inset-y-0 after:z-[1] after:transition-all after:content-['']",
                                            value === item.code
                                                ? "after:bg-bg-sf2"
                                                : "hover:after:bg-bg-sf2"
                                        )}
                                    >
                                        <div className="relative z-10 flex items-center gap-2 overflow-hidden">
                                            <FlagComponent
                                                country={
                                                    item.code as CountryCode
                                                }
                                                countryName={item.name}
                                            />
                                            <span className="truncate font-normal text-typo-primary">
                                                {item.name}
                                            </span>
                                        </div>
                                        {value === item.code && (
                                            <Check className="relative z-10 ml-auto h-4 w-4 text-typo-primary" />
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export function StateSelect({
    value,
    onValueChange,
    countryName,
    disabled,
    placeholder = "Select state/province",
}: {
    value?: string;
    onValueChange: (value: string) => void;
    countryName: string;
    disabled?: boolean;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const { data: states = [], isLoading } = useStatesQuery(countryName);

    const filteredItems = states.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectedItem = states.find((item) => item.name === value);

    return (
        <Popover modal open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"empty"}
                    type="button"
                    className={cn(
                        "flex h-12 w-full items-center justify-between gap-3 border bg-bg-sf4 px-4 transition-all mb:h-10",
                        "border-transparent",
                        "hover:border-bd-main",
                        "!focus:ring-0 !focus-visible:ring-0 focus-within:!border-bd-brown focus-within:ring-0 focus:!border-bd-brown focus-visible:!border-bd-brown focus-visible:ring-0",
                        !value && "text-typo-soft",
                        (disabled || !countryName) &&
                            "cursor-not-allowed text-typo-disable"
                    )}
                    disabled={disabled || !countryName || isLoading}
                >
                    <div className="flex-1 truncate text-left">
                        {selectedItem ? (
                            <span className="text-sm font-normal text-typo-primary">
                                {selectedItem.name}
                            </span>
                        ) : (
                            <span className="text-sm font-normal text-typo-note">
                                {isLoading ? "Loading…" : placeholder}
                            </span>
                        )}
                    </div>
                    <ChevronDownIcon
                        className={cn(
                            "h-4 w-4 text-typo-note opacity-70 transition-transform duration-200",
                            disabled || !countryName ? "hidden" : "opacity-100",
                            open && "rotate-180"
                        )}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="z-[60] w-[var(--radix-popover-trigger-width)] min-w-[19rem] rounded-none border border-bd-main bg-bg-sf1 px-4 py-4 shadow-[0px_3px_8px_0px_rgba(23,0,0,0.1),0px_4px_6px_0px_rgba(15,0,0,0.1)] tb:w-[calc(100%+1rem)]"
            >
                <Command
                    className="overflow-visible bg-transparent"
                    shouldFilter={false}
                >
                    <CommandInput
                        placeholder="Find a state..."
                        value={search}
                        onValueChange={setSearch}
                        className="mb-0 h-10 rounded-none border-0 bg-bg-sf4 px-3 shadow-none ring-0 focus-within:ring-0 hover:ring-0 focus:ring-0 focus-visible:ring-0 [&>input]:font-inter [&>input]:text-sm [&>input]:font-normal [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-typo-note"
                    />
                    <CommandList className="-mx-4 mt-2 overflow-hidden">
                        <ScrollArea className="mr-1.5 max-h-60 pr-0">
                            <CommandEmpty className="p-3 font-inter text-sm text-typo-disable">
                                No state found.
                            </CommandEmpty>
                            <CommandGroup className="p-0">
                                {filteredItems.map((item) => (
                                    <CommandItem
                                        key={item.name}
                                        value={item.name}
                                        onSelect={() => {
                                            onValueChange(item.name);
                                            setOpen(false);
                                            setSearch("");
                                        }}
                                        className={cn(
                                            "relative flex cursor-pointer select-none items-center justify-between gap-3 rounded-none px-4 py-2 font-inter text-sm text-typo-primary transition-colors after:absolute after:inset-x-2 after:inset-y-0 after:z-[1] after:transition-all after:content-['']",
                                            value === item.name
                                                ? "after:bg-bg-sf2"
                                                : "hover:after:bg-bg-sf2"
                                        )}
                                    >
                                        <div className="relative z-10 flex items-center gap-2 overflow-hidden">
                                            <span className="truncate font-normal text-typo-primary">
                                                {item.name}
                                            </span>
                                        </div>
                                        {value === item.name && (
                                            <Check className="relative z-10 ml-auto h-4 w-4 text-typo-primary" />
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
export type RelationshipRole = {
    id: string;
    label: string;
    description?: string;
};

export const RELATIONSHIP_ROLES: RelationshipRole[] = [
    { id: "representative", label: "Account representative" },
    { id: "owner", label: "Owner" },
    { id: "director", label: "Director" },
    { id: "executive", label: "Executive" },
];

export function RelationshipSelect({
    selectedRoles,
    onRolesChange,
    disabled,
    placeholder = "Select relationship",
}: {
    selectedRoles: string[];
    onRolesChange: (roles: string[]) => void;
    disabled?: boolean;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);

    const toggleRole = (roleId: string) => {
        if (selectedRoles.includes(roleId)) {
            onRolesChange(selectedRoles.filter((id) => id !== roleId));
        } else {
            onRolesChange([...selectedRoles, roleId]);
        }
    };

    const selectedLabels = RELATIONSHIP_ROLES.filter((r) =>
        selectedRoles.includes(r.id)
    ).map((r) => r.label);

    const displayValue =
        selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder;

    return (
        <Popover modal open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"empty"}
                    type="button"
                    className={cn(
                        "flex h-12 w-full items-center justify-between gap-3 border bg-bg-sf4 px-4 transition-all mb:h-10",
                        "border-transparent",
                        "hover:border-bd-main",
                        "!focus:ring-0 !focus-visible:ring-0 focus-within:!border-bd-brown focus-within:ring-0 focus:!border-bd-brown focus-visible:!border-bd-brown focus-visible:ring-0",
                        "data-[state=open]:border data-[state=open]:border-bd-main",
                        selectedRoles.length === 0 && "text-typo-note",
                        disabled && "cursor-not-allowed text-typo-disable"
                    )}
                    disabled={disabled}
                >
                    <div className="flex-1 truncate text-left">
                        <span className="text-sm font-normal text-typo-primary">
                            {displayValue}
                        </span>
                    </div>
                    <ChevronDownIcon
                        className={cn(
                            "h-4 w-4 text-typo-note opacity-70 transition-transform duration-200",
                            disabled ? "hidden" : "opacity-100",
                            open && "rotate-180"
                        )}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="z-[60] w-[var(--radix-popover-trigger-width)] min-w-[19rem] rounded-none border border-bd-main bg-bg-main px-4 py-1 shadow-[0px_3px_8px_0px_rgba(23,0,0,0.1),0px_4px_6px_0px_rgba(15,0,0,0.1)] tb:w-[calc(100%+1rem)]"
            >
                <div className="flex flex-col">
                    {RELATIONSHIP_ROLES.map((role) => {
                        const isSelected = selectedRoles.includes(role.id);
                        return (
                            <div
                                key={role.id}
                                onClick={() => toggleRole(role.id)}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center justify-between gap-3 rounded-none border-b border-bd-main py-3 font-inter text-sm text-typo-primary transition-colors last:border-b-0"
                                )}
                            >
                                <span
                                    className={cn(
                                        "truncate font-medium",
                                        isSelected
                                            ? "text-typo-primary"
                                            : "text-typo-soft"
                                    )}
                                >
                                    {role.label}
                                </span>
                                {isSelected && (
                                    <div className="size-1 shrink-0 rounded-full bg-typo-primary" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function VirtualizedCountrySelectContent({
    loading,
    renderItem,
    items,
}: {
    items: CodeNamedItem[];
    loading?: boolean;
    renderItem?: (country: CodeNamedItem) => ReactNode;
}) {
    if (loading) {
        return (
            <SelectContent className="w-[20rem]">
                <SelectItem value="__loading__" disabled>
                    Loading…
                </SelectItem>
            </SelectContent>
        );
    }

    if (items.length === 0) {
        return (
            <SelectContent className="w-[20rem]">
                <SelectItem value="__no_data__" disabled>
                    No data
                </SelectItem>
            </SelectContent>
        );
    }

    return (
        <UiVirtualizedSelectContent
            className="w-[20rem]"
            itemCount={items.length}
            getItemValue={(index) => items[index].code}
            renderItem={({ index, style }) => {
                const country = items[index];
                return (
                    <div style={style}>
                        <SelectItem key={country.code} value={country.code}>
                            {renderItem ? renderItem(country) : country.name}
                        </SelectItem>
                    </div>
                );
            }}
        />
    );
}
