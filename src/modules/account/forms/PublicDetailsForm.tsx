import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    Form,
} from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FlagComponent, PhoneInput } from "@/components/ui/phone-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { isEqual } from "@/lib/utils";
import * as RPNInput from "react-phone-number-input";
import { CountryCode } from "libphonenumber-js";
import { CountrySelect, VirtualizedCountrySelectContent } from "./utils";

import {
    publicDetailsSchema,
    type PublicDetailsFormValues,
} from "@/lib/constants/validate";
import { AccountFormWrapper } from "./account-form-wrapper";

export default function PublicDetailsForm({
    onSubmit,
    onClose,
    isSubmitting,
    data,
    onChange,
}: {
    onSubmit: (data: PublicDetailsFormValues) => void;
    onClose: () => void;
    isSubmitting: boolean;
    data: PublicDetailsFormValues;
    onChange?: (data: PublicDetailsFormValues) => void;
}) {
    const form = useForm<PublicDetailsFormValues>({
        resolver: zodResolver(publicDetailsSchema),
        defaultValues: {
            supportAddress1: data?.supportAddress1 || "",
            supportAddress2: data?.supportAddress2 || "",
            supportCountry: data?.supportCountry || "",
            supportPhone: data?.supportPhone || "",
            descriptor: data?.descriptor || "",
        },
    });
    const { handleSubmit, reset, control, watch } = form;
    const initialDataRef = useRef<PublicDetailsFormValues>({ ...data });
    const dataKeys = Object.keys(data).join(",");

    const [countries, setCountries] = useState<
        { code: string; name: string }[]
    >([]);
    const [loadingCountries, setLoadingCountries] = useState(true);

    const regionNames = useMemo(
        () => new Intl.DisplayNames(["en"], { type: "region" }),
        []
    );

    useEffect(() => {
        const countryList = RPNInput.getCountries().map((code) => ({
            code,
            name: regionNames.of(code) || code,
        }));
        setCountries(countryList);
        setLoadingCountries(false);
    }, [regionNames]);

    useEffect(() => {
        if (data) {
            reset({
                supportAddress1: data.supportAddress1 || "",
                supportAddress2: data.supportAddress2 || "",
                supportCountry: data.supportCountry || "",
                supportPhone: data.supportPhone || "",
                descriptor: data.descriptor || "",
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

    const onFormSubmit = (formData: PublicDetailsFormValues) => {
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
                    <FormField
                        name="supportAddress1"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="supportAddress1">
                                    Support address 1
                                </Label>
                                <FormControl>
                                    <Input
                                        id="supportAddress1"
                                        placeholder="Enter address 1"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />
                    <FormField
                        name="supportAddress2"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="supportAddress2">
                                    Support address 2
                                </Label>
                                <FormControl>
                                    <Input
                                        id="supportAddress2"
                                        placeholder="Enter address 2"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />
                    <div className="grid grid-cols-2 !gap-x-2 mb:gap-y-4">
                        <FormField
                            name="supportCountry"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="supportCountry">
                                        Support country
                                    </Label>
                                    <FormControl>
                                        <CountrySelect
                                            value={field.value}
                                            onValueChange={field.onChange}
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
                            name="supportPhone"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="supportPhone">
                                        Support phone
                                    </Label>
                                    <FormControl>
                                        <PhoneInput
                                            id="supportPhone"
                                            {...field}
                                            defaultCountry="US"
                                            international={true}
                                            placeholder="Enter phone number"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                    </div>
                    <FormField
                        name="descriptor"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="descriptor">
                                    Statement descriptor
                                </Label>
                                <FormControl>
                                    <Input
                                        id="descriptor"
                                        {...field}
                                        placeholder="Descriptor"
                                        readOnly
                                        className="cursor-not-allowed opacity-60"
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />
                </AccountFormWrapper>
            </form>
        </Form>
    );
}

export type { PublicDetailsFormValues } from "./schemas";
