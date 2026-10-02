import {
    FormControl,
    FormField,
    FormLabel,
    FormMessage,
    Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DATA_BUSINESS_TYPE,
    handleGetDataWithCountry,
} from "@/lib/constants/stripe";
import { isEqual } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AccountFormWrapper } from "./account-form-wrapper";
import { businessInfoSchema, type BusinessInfoFormValues } from "./schemas";
import { CountrySelect } from "./utils";
import * as RPNInput from "react-phone-number-input";

export default function BusinessInfoForm({
    onSubmit,
    onClose,
    isSubmitting,
    data,
    onChange,
}: {
    onSubmit: (data: BusinessInfoFormValues) => void;
    onClose: () => void;
    isSubmitting: boolean;
    data: BusinessInfoFormValues;
    onChange?: (data: BusinessInfoFormValues) => void;
}) {
    const form = useForm<BusinessInfoFormValues>({
        resolver: zodResolver(businessInfoSchema),
        defaultValues: {
            name: data?.name || "",
            email: data?.email || "",
            website: data?.website || "",
            mcc: data?.mcc || "",
            phone: data?.phone || "",
            businessStructure: data?.businessStructure || "",
            businessType: data?.businessType || "individual",
            country: data?.country || "US",
        },
    });
    const { handleSubmit, reset, control, watch, setValue } = form;
    const initialDataRef = useRef<BusinessInfoFormValues>({ ...data });
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
                name: data.name || "",
                email: data.email || "",
                website: data.website || "",
                mcc: data.mcc || "",
                phone: data.phone || "",
                businessType: data.businessType || "individual",
                country: data.country || "VN",
                businessStructure: data.businessStructure || "",
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

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AccountFormWrapper
                    onClose={onClose}
                    isSubmitting={isSubmitting}
                    isChanged={isChanged}
                >
                    <FormField
                        name="businessType"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <FormLabel>Business Type</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue
                                                placeholder="Select business type"
                                                defaultValue={field.value}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DATA_BUSINESS_TYPE.map((item) => (
                                                <SelectItem
                                                    key={item.value}
                                                    value={item.value}
                                                >
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />
                    <FormField
                        name="country"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                    <CountrySelect
                                        value={field.value}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setValue("businessStructure", "");
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
                    {form.watch("businessType") === "company" &&
                        handleGetDataWithCountry(form.watch("country")).length >
                            0 && (
                            <FormField
                                name="businessStructure"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <FormLabel>
                                            Business Structure
                                        </FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value || ""}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select business structure" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {handleGetDataWithCountry(
                                                        form.watch("country")
                                                    ).map((item) => (
                                                        <SelectItem
                                                            key={item.value}
                                                            value={item.value}
                                                        >
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                        )}
                    <div className="grid grid-cols-2 !gap-x-2 mb:gap-y-4">
                        <FormField
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            required
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <FormField
                            name="website"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="text" />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                    </div>
                    <FormField
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <FormLabel>Business Name</FormLabel>
                                <FormControl>
                                    <Input {...field} required />
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />
                    <div className="grid grid-cols-2 !gap-x-2 mb:gap-y-4">
                        <FormField
                            name="mcc"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <FormLabel>MCC Code</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <FormField
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <FormLabel>Support Phone</FormLabel>
                                    <FormControl>
                                        <PhoneInput
                                            {...field}
                                            defaultCountry="US"
                                            international={true}
                                            placeholder="e.g. +12051221332"
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

export type { BusinessInfoFormValues } from "./schemas";
