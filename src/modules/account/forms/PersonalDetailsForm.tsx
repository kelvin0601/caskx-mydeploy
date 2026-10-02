import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useStatesQuery } from "@/hooks/useLocationQuery";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { formatDateTime, isEqual } from "@/lib/utils";
import { useAccount, useBoundStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import { AccountFormWrapper } from "./account-form-wrapper";
import {
    personalDetailsSchema,
    type PersonalDetailsFormValues,
} from "./schemas";
import { CountrySelect, StateSelect, TState } from "./utils";

export default function PersonalDetailsForm({
    onSubmit,
    onClose,
    isSubmitting,
    data,
    onChange,
}: {
    onSubmit: (data: PersonalDetailsFormValues) => void;
    onClose: () => void;
    isSubmitting: boolean;
    data: PersonalDetailsFormValues;
    onChange?: (data: PersonalDetailsFormValues) => void;
}) {
    const form = useForm<PersonalDetailsFormValues>({
        resolver: zodResolver(personalDetailsSchema),
        defaultValues: {
            firstName: data?.firstName || "",
            lastName: data?.lastName || "",
            email: data?.email || "",
            dob: data?.dob || "",
            address1: data?.address1 || "",
            address2: data?.address2 || "",
            city: data?.city || "",
            state: data?.state || "",
            postalCode: data?.postalCode || "",
            country: data?.country || "",
            phone: data?.phone || "",
        },
    });
    const { handleSubmit, reset, setValue, watch } = form;
    const [open, setOpen] = useState(false);

    // State for country/state select
    const [countries, setCountries] = useState<
        { code: string; name: string }[]
    >([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [selectedCountryName, setSelectedCountryName] = useState("");
    const selectedCountry = watch("country");
    const router = useRouter();
    const { profile } = useAccount();
    const { user } = useBoundStore();

    const { data: states = [] as TState[], isLoading: loadingStates } =
        useStatesQuery(selectedCountryName);

    const isCurrentUser =
        profile?.rawStripeData?.individual?.email === user?.email;

    const requirements = profile?.rawStripeData?.requirements;
    const isVerificationDue =
        requirements?.currently_due?.some((req) =>
            req.includes("individual.verification")
        ) ||
        requirements?.past_due?.some((req) =>
            req.includes("individual.verification")
        );

    const hasUnverifiedPerson = isCurrentUser && isVerificationDue;

    const regionNames = useMemo(
        () => new Intl.DisplayNames(["en"], { type: "region" }),
        []
    );

    // Fetch country list on mount
    useEffect(() => {
        const countryList = RPNInput.getCountries().map((code) => ({
            code,
            name: regionNames.of(code) || code,
        }));
        setCountries(countryList);
        setLoadingCountries(false);
    }, [regionNames]);

    const watchCountry = form.watch("country");

    // After countries state and selectedCountryName are defined
    useEffect(() => {
        if (watchCountry) {
            const found = countries.find((c) => c.code === watchCountry);
            if (found && selectedCountryName !== found.name) {
                setSelectedCountryName(found.name);
            }
        }
    }, [countries, watchCountry, selectedCountryName]);

    const initialDataRef = useRef<PersonalDetailsFormValues>({ ...data });
    const dataKeys = Object.keys(data).join(",");

    useEffect(() => {
        if (data) {
            reset({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                email: data.email || "",
                dob: data.dob || "",
                address1: data.address1 || "",
                address2: data.address2 || "",
                city: data.city || "",
                state: data.state || "",
                postalCode: data.postalCode || "",
                country: data.country || "",
                phone: data.phone || "",
            });
            initialDataRef.current = { ...data };
        }
    }, [data, reset, dataKeys]);

    // Watch form values and compare with initial data
    const watchedValues = watch();
    const isChanged = !isEqual(watchedValues, initialDataRef.current);
    useEffect(() => {
        if (onChange && isChanged) {
            onChange(watchedValues);
        }
    }, [watchedValues, isChanged, onChange]);

    return (
        <Form {...form}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                id="personal-details-form"
                className="space-y-6"
            >
                <AccountFormWrapper
                    onClose={onClose}
                    isSubmitting={isSubmitting}
                    isChanged={isChanged}
                >
                    <div className="grid grid-cols-2 !gap-x-2">
                        <FormField
                            name="firstName"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="firstName">
                                        First name
                                    </Label>
                                    <FormControl>
                                        <Input
                                            id="firstName"
                                            placeholder="First name"
                                            autoComplete="given-name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <FormField
                            name="lastName"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="lastName">Last name</Label>
                                    <FormControl>
                                        <Input
                                            id="lastName"
                                            placeholder="Last name"
                                            autoComplete="family-name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 !gap-x-2">
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <FormControl>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Email"
                                            autoComplete="email"
                                            spellCheck={false}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <FormField
                            name="phone"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Support phone</Label>
                                    <FormControl>
                                        <PhoneInput
                                            id="phone"
                                            defaultCountry="US"
                                            international={true}
                                            placeholder="Enter phone number"
                                            autoComplete="tel"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 !gap-x-2">
                        <FormField
                            name="dob"
                            control={form.control}
                            render={({ field }) => {
                                const date = field.value;
                                return (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dob">
                                            Date of birth
                                        </Label>
                                        <FormControl>
                                            <Popover
                                                open={open}
                                                onOpenChange={setOpen}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        id="dob"
                                                        className="flex h-12 w-full items-center justify-between border border-transparent bg-bg-sf4 px-4 py-2 font-normal hover:border-bd-main hover:bg-transparent focus-visible:border-bd-brown data-[state=open]:border-bd-main data-[state=open]:bg-transparent"
                                                    >
                                                        {date ? (
                                                            formatDateTime(date)
                                                                .dataOnlyNumber
                                                        ) : (
                                                            <span className="opacity-40">
                                                                Select date
                                                            </span>
                                                        )}
                                                        <CalendarIcon className="size-4 opacity-40" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="z-[60] w-auto p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={
                                                            date
                                                                ? new Date(date)
                                                                : undefined
                                                        }
                                                        captionLayout="dropdown"
                                                        fromYear={1900}
                                                        onSelect={(
                                                            selected
                                                        ) => {
                                                            const formatted =
                                                                formatDateTime(
                                                                    selected
                                                                )?.formatDateYYYYMMDD;
                                                            if (formatted) {
                                                                field.onChange(
                                                                    formatted
                                                                );
                                                                setOpen(false);
                                                            }
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                );
                            }}
                        />
                        {!data?.ssnLast4Provided && (
                            <FormField
                                name="ssnLast4"
                                control={form.control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ssnLast4">
                                            SSN Last 4 Digits{" "}
                                            <span className="opacity-50">
                                                (Optional)
                                            </span>
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="ssnLast4"
                                                maxLength={4}
                                                placeholder="Enter"
                                                autoComplete="off"
                                                spellCheck={false}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                        )}
                    </div>
                    <FormField
                        name="address1"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="address1">Address 1</Label>
                                <FormControl>
                                    <Input
                                        id="address1"
                                        placeholder="Address 1"
                                        autoComplete="address-line1"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />
                    <FormField
                        name="address2"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="address2">Address 2</Label>
                                <FormControl>
                                    <Input
                                        id="address2"
                                        placeholder="Enter"
                                        autoComplete="address-line2"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />
                    <div className="grid grid-cols-2 !gap-x-2">
                        <FormField
                            name="country"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="country">Country</Label>
                                    <FormControl>
                                        <CountrySelect
                                            value={field.value}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setValue("state", "");
                                            }}
                                            items={countries}
                                            loading={loadingCountries}
                                            regionNames={regionNames}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <FormField
                            name="state"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="state">
                                        State/Province
                                    </Label>
                                    <FormControl>
                                        <StateSelect
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            countryName={selectedCountryName}
                                            disabled={!selectedCountry}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 !gap-x-2">
                        <FormField
                            name="city"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="city">City</Label>
                                    <FormControl>
                                        <Input
                                            id="city"
                                            placeholder="City"
                                            autoComplete="address-level2"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <FormField
                            name="postalCode"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="postalCode">
                                        Postal code
                                    </Label>
                                    <FormControl>
                                        <Input
                                            id="postalCode"
                                            placeholder="Postal code"
                                            autoComplete="postal-code"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Label>ID Verification</Label>
                        <Button
                            onClick={() =>
                                router.push(ROUTE_PUBLIC.STRIPE_ONBOARDING)
                            }
                            variant="outline"
                            className="w-max gap-2 border border-bd-main px-4 py-2 hover:bg-bg-sf4"
                        >
                            Upload file
                            <UploadIcon className="size-3" />
                        </Button>
                        {hasUnverifiedPerson && (
                            <p className="mt-1 text-xs font-medium text-error">
                                Your ID verification is not complete. Please
                                upload your documents to finish onboarding.
                            </p>
                        )}
                    </div>
                </AccountFormWrapper>
            </form>
        </Form>
    );
}

export type { PersonalDetailsFormValues } from "./schemas";
