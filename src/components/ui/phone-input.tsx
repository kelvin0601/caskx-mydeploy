import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { CircleFlag } from "react-circle-flags";
import * as RPNInput from "react-phone-number-input";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useFormField } from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
    React.ComponentProps<"input">,
    "onChange" | "value" | "ref"
> &
    Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
        onChange?: (value: RPNInput.Value) => void;
    };

// Simple React Context to share the active country state with inner components
const PhoneInputContext = React.createContext<{
    activeCountry?: RPNInput.Country;
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
}>({
    isOpen: false,
    setIsOpen: () => {},
});

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
    React.forwardRef<
        React.ElementRef<typeof RPNInput.default>,
        PhoneInputProps
    >(({ className, onChange, ...props }, ref) => {
        const [activeCountry, setActiveCountry] = React.useState<
            RPNInput.Country | undefined
        >(props.defaultCountry || "US");
        const [isOpen, setIsOpen] = React.useState(false);

        // Safely determine form error state
        let isError = false;
        try {
            const formField = useFormField();
            isError = !!formField.error;
        } catch {
            // ignore outside form context
        }

        // Memoize context value to prevent unnecessary re-renders of all context consumers
        const contextValue = React.useMemo(
            () => ({
                activeCountry: activeCountry || "US",
                isOpen,
                setIsOpen,
            }),
            [activeCountry, isOpen]
        );

        return (
            <PhoneInputContext.Provider value={contextValue}>
                <div
                    data-state={isOpen ? "open" : "closed"}
                    className={cn(
                        "flex h-12 w-full items-center gap-3 border bg-bg-sf4 px-4 transition-all dark:bg-bg-dark-sf4 mb:h-10",
                        // Default border
                        "border-transparent",
                        // Hover state
                        "hover:border-bd-main dark:hover:border-bd-dark-main",
                        "data-[state=open]:border data-[state=open]:border-bd-brown dark:data-[state=open]:border-bd-dark-inverse",
                        // Focus state
                        "focus-within:!border-bd-brown focus-within:ring-0 dark:focus-within:!border-bd-dark-inverse",
                        // Error state
                        isError &&
                            "border-error bg-error-lighter focus-within:border-error hover:border-error",
                        className
                    )}
                >
                    <RPNInput.default
                        ref={ref}
                        className="flex w-full items-center gap-3 bg-transparent"
                        flagComponent={
                            FlagComponent as unknown as (
                                props: RPNInput.FlagProps
                            ) => React.ReactElement
                        }
                        countrySelectComponent={CountrySelect}
                        inputComponent={InputComponent}
                        smartCaret={false}
                        international={false} // Force national format in input box
                        onCountryChange={(country) => {
                            setActiveCountry(country);
                            if (props.onCountryChange) {
                                props.onCountryChange(country);
                            }
                        }}
                        onChange={(value) =>
                            onChange?.(value || ("" as RPNInput.Value))
                        }
                        {...props}
                    />
                </div>
            </PhoneInputContext.Provider>
        );
    });
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
    return (
        <div className="flex h-full flex-1 items-center gap-2.5 bg-transparent">
            <input
                className={cn(
                    "h-full w-full truncate border-none bg-transparent p-0 font-inter text-base font-normal text-typo-primary outline-none placeholder:text-typo-soft/50 focus:ring-0 dark:text-typo-dark-primary dark:placeholder:text-typo-dark-soft/50",
                    className
                )}
                {...props}
                ref={ref}
            />
        </div>
    );
});
InputComponent.displayName = "InputComponent";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
    disabled?: boolean;
    value: RPNInput.Country;
    options: CountryEntry[];
    onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({
    disabled,
    value: selectedCountry,
    options: countryList,
    onChange,
}: CountrySelectProps) => {
    const activeSelectedCountry = selectedCountry || "US";
    const { isOpen: open, setIsOpen: setOpen } =
        React.useContext(PhoneInputContext);

    // Stable selection callback to avoid creating new functions in render loops
    const handleSelect = React.useCallback(
        (country: RPNInput.Country) => {
            onChange(country);
            setOpen(false);
        },
        [onChange]
    );

    return (
        <Popover modal open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"empty"}
                    type="button"
                    className={cn(
                        "-ml-4 flex h-12 w-[4.375rem] min-w-0 shrink-0 select-none items-center justify-between gap-x-1.5 rounded-none border-0 border-bd-main bg-bg-sf4 px-4 text-typo-primary shadow-none outline-none transition-colors hover:bg-bg-sf3 focus:ring-0 focus-visible:border-bd-brown focus-visible:bg-bg-sf3 dark:border-bd-dark-main dark:bg-bg-dark-sf4 dark:text-typo-dark-primary dark:hover:bg-bg-dark-sf3 dark:focus-visible:border-bd-dark-brown dark:focus-visible:bg-bg-dark-sf3 mb:h-10 mb:w-[3.375rem] mb:px-2",
                        disabled && "cursor-not-allowed opacity-50"
                    )}
                    disabled={disabled}
                >
                    <div className="flex items-center gap-1.5">
                        <FlagComponent
                            country={activeSelectedCountry}
                            countryName={activeSelectedCountry}
                        />
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
                className="z-[60] w-[19rem] min-w-full rounded-none border border-bd-main bg-bg-sf1 px-4 py-4 shadow-[0px_0.5rem_1.5rem_0px_rgba(0,0,0,0.08)] dark:border-bd-dark-main dark:bg-bg-dark-sf1 tb:w-[calc(100%+1rem)]"
            >
                <Command className="overflow-visible bg-transparent">
                    <CommandInput
                        placeholder="Find a country..."
                        className="mb-0 h-10 rounded-none border-0 bg-bg-sf4 px-3 shadow-none ring-0 focus-within:ring-0 hover:ring-0 focus:ring-0 focus-visible:ring-0 dark:bg-bg-dark-sf4 [&>input]:font-inter [&>input]:text-sm [&>input]:font-normal [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-typo-note dark:[&>svg]:text-typo-dark-note"
                    />
                    <CommandList className="-mx-4 overflow-hidden">
                        <ScrollArea className="mr-1.5 max-h-60 pr-0">
                            <CommandEmpty className="p-3 font-inter text-sm text-typo-disable">
                                No country found.
                            </CommandEmpty>
                            <CommandGroup className="p-0">
                                {countryList.map(({ value, label }) =>
                                    value ? (
                                        <CountrySelectOption
                                            key={value}
                                            country={value}
                                            countryName={label}
                                            selectedCountry={selectedCountry}
                                            onChange={handleSelect}
                                        />
                                    ) : null
                                )}
                            </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

type CountrySelectOptionProps = {
    country: RPNInput.Country;
    countryName: string;
    selectedCountry: RPNInput.Country;
    onChange: (country: RPNInput.Country) => void;
};

// Memoize CountrySelectOption with a custom comparison function to prevent redundant rendering
const CountrySelectOption = React.memo(
    ({
        country,
        countryName,
        selectedCountry,
        onChange,
    }: CountrySelectOptionProps) => {
        const isSelected = country === (selectedCountry || "US");
        const callingCode = RPNInput.getCountryCallingCode(country);

        return (
            <CommandItem
                // Include country code (e.g. US) and calling code in the search value for improved filtering
                value={`${countryName} ${country} +${callingCode}`.toLowerCase()}
                className={cn(
                    "relative flex cursor-pointer select-none items-center justify-between gap-3 rounded-none px-4 py-2 font-inter text-sm text-typo-primary transition-colors after:absolute after:inset-x-2 after:inset-y-0 after:z-[1] after:transition-all after:content-[''] dark:text-typo-dark-primary",
                    isSelected
                        ? "after:bg-bg-sf2 dark:after:bg-bg-dark-sf3"
                        : "hover:after:bg-bg-sf2 dark:hover:after:bg-bg-dark-sf3"
                )}
                onSelect={() => onChange(country)}
            >
                <div className="relative z-10 flex items-center gap-2 overflow-hidden">
                    <FlagComponent
                        country={country}
                        countryName={countryName}
                    />
                    <span className="truncate font-normal text-typo-primary">
                        {countryName}
                    </span>
                </div>
                <span className="relative z-10 shrink-0 font-inter text-sm font-normal text-typo-soft">
                    +{callingCode}
                </span>
            </CommandItem>
        );
    },
    (prevProps, nextProps) => {
        // An option only needs to re-render if its selection state changed
        const prevSelected = prevProps.country === prevProps.selectedCountry;
        const nextSelected = nextProps.country === nextProps.selectedCountry;
        return (
            prevProps.country === nextProps.country &&
            prevProps.countryName === nextProps.countryName &&
            prevProps.onChange === nextProps.onChange &&
            prevSelected === nextSelected
        );
    }
);
CountrySelectOption.displayName = "CountrySelectOption";

// Memoize FlagComponent to avoid redundant re-renders of the CircleFlag / img tag
const FlagComponent = React.memo(
    ({ country, countryName }: RPNInput.FlagProps) => {
        if (!country) {
            return (
                <span className="flex h-4 w-4 shrink-0 rounded-full bg-black/10" />
            );
        }
        return (
            <div className="flex h-4 w-4 shrink-0 select-none items-center justify-center overflow-hidden rounded-full">
                <CircleFlag
                    countryCode={country.toLowerCase()}
                    className="h-4 w-4"
                    title={countryName}
                />
            </div>
        );
    }
);
FlagComponent.displayName = "FlagComponent";

export { CountrySelect, FlagComponent, PhoneInput };
