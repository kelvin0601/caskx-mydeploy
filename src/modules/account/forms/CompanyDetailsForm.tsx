import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlagComponent, PhoneInput } from "@/components/ui/phone-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    VirtualizedSelectContent,
} from "@/components/ui/select";
import { isEqual } from "@/lib/utils";

import { CountryCode } from "libphonenumber-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import {
    CountrySelect,
    StateSelect,
    VirtualizedCountrySelectContent,
} from "./utils";
import { AccountFormWrapper } from "./account-form-wrapper";
import { companyDetailsSchema, type CompanyDetailsFormValues } from "./schemas";
import { useStatesQuery } from "@/hooks/useLocationQuery";
import { zodResolver } from "@hookform/resolvers/zod";

import { ScrollArea } from "@/components/ui/scroll-area";

export default function CompanyDetailsForm({
    onSubmit,
    onClose,
    isSubmitting,
    data,
    onChange,
}: {
    onSubmit: (data: CompanyDetailsFormValues) => void;
    onClose: () => void;
    isSubmitting: boolean;
    data: CompanyDetailsFormValues;
    onChange?: (data: CompanyDetailsFormValues) => void;
}) {
    const form = useForm<CompanyDetailsFormValues>({
        resolver: zodResolver(companyDetailsSchema),
        defaultValues: {
            name: data?.name || "",
            phone: data?.phone || "",
            address1: data?.address1 || "",
            address2: data?.address2 || "",
            city: data?.city || "",
            state: data?.state || "",
            postalCode: data?.postalCode || "",
            country: data?.country || "",
        },
    });
    const { handleSubmit, reset, setValue, watch } = form;
    const [open, setOpen] = useState(false);
    const [selectedCountryName, setSelectedCountryName] = useState("");
    const selectedCountry = watch("country");

    const { data: cities = [], isLoading: loadingCities } =
        useStatesQuery(selectedCountryName);

    const regionNames = useMemo(
        () => new Intl.DisplayNames(["en"], { type: "region" }),
        []
    );

    const [countries, setCountries] = useState<
        { code: string; name: string }[]
    >([]);

    useEffect(() => {
        const countryList = RPNInput.getCountries().map((code) => ({
            code,
            name: regionNames.of(code) || code,
        }));
        setCountries(countryList);
    }, [regionNames]);

    const watchCountry = form.watch("country");

    useEffect(() => {
        if (watchCountry) {
            const found = countries.find((c) => c.code === watchCountry);
            if (found && selectedCountryName !== found.name) {
                setSelectedCountryName(found.name);
            }
        }
    }, [countries, watchCountry, selectedCountryName]);

    const initialDataRef = useRef<{ [k: string]: string }>({ ...data });

    const dataKeys = Object.keys(data).join(",");

    useEffect(() => {
        if (data) {
            reset({
                name: data.name || "",
                phone: data.phone || "",
                address1: data.address1 || "",
                address2: data.address2 || "",
                city: data.city || "",
                state: data.state || "",
                postalCode: data.postalCode || "",
                country: data.country || "",
            });
            initialDataRef.current = { ...data };
        }
    }, [data, reset, dataKeys]);
    const watchedValues = watch();
    const isChanged = !isEqual(watchedValues, initialDataRef.current);
    useEffect(() => {
        if (onChange && isChanged) {
            onChange(watchedValues);
        }
    }, [watchedValues, isChanged, onChange]);
    const onFormSubmit = (formData: CompanyDetailsFormValues) => {
        onSubmit(formData);
    };
    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AccountFormWrapper
                    onClose={onClose}
                    isSubmitting={isSubmitting}
                    isChanged={isChanged}
                >
                    <div className="grid grid-cols-2 !gap-x-2 gap-y-4 mb:grid-cols-1 mb:[&_div]:col-span-full">
                        <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <FormLabel htmlFor="name">
                                        Company Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            placeholder="Ex: Cask Exchange"
                                            autoComplete="organization"
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
                                    <FormLabel htmlFor="phone">Phone</FormLabel>
                                    <FormControl>
                                        <PhoneInput
                                            id="phone"
                                            type="text"
                                            required
                                            autoComplete="tel"
                                            defaultCountry="US"
                                            international={true}
                                            placeholder="e.g. +12012311231"
                                            className="shadow-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <FormField
                            name="taxId"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <FormLabel htmlFor="taxId">
                                        Company Tax ID (EIN)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="taxId"
                                            type="text"
                                            placeholder="Tax ID"
                                            autoComplete="off"
                                            spellCheck={false}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <FormField
                            name="address1"
                            control={form.control}
                            render={({ field }) => (
                                <div className="col-span-2 space-y-1.5">
                                    <FormLabel htmlFor="address1">
                                        Address 1
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="address1"
                                            type="text"
                                            required
                                            autoComplete="address-line1"
                                            placeholder="Ex: 123 Main St"
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
                                <div className="col-span-2 space-y-1.5">
                                    <FormLabel htmlFor="address2">
                                        Address 2
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="address2"
                                            type="text"
                                            autoComplete="address-line2"
                                            placeholder="Apt, suite, etc. (optional)"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
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
                                                setValue("city", "");
                                            }}
                                            items={countries}
                                            loading={false}
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
                                    <FormLabel htmlFor="state">
                                        State/Province
                                    </FormLabel>
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
                        <FormField
                            name="city"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <FormLabel htmlFor="city">City</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="city"
                                            type="text"
                                            autoComplete="address-level1"
                                            placeholder="Ex: Cleveland"
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
                                    <FormLabel htmlFor="postalCode">
                                        Postal Code
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="postalCode"
                                            type="text"
                                            required
                                            autoComplete="postal-code"
                                            placeholder="Ex: 44024"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                    </div>
                </AccountFormWrapper>
            </form>
        </Form>
    );
}

export type { CompanyDetailsFormValues } from "./schemas";
