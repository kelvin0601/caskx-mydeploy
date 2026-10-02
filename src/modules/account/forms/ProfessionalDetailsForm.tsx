import {
    Form,
    FormControl,
    FormField,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { isEqual } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { AccountFormWrapper } from "./account-form-wrapper";
import {
    professionalDetailsSchema,
    type ProfessionalDetailsFormValues,
} from "./schemas";

export default function ProfessionalDetailsForm({
    onSubmit,
    onClose,
    isSubmitting,
    data,
    onChange,
}: {
    onSubmit: (data: ProfessionalDetailsFormValues) => void;
    onClose: () => void;
    isSubmitting: boolean;
    data: ProfessionalDetailsFormValues;
    onChange?: (data: ProfessionalDetailsFormValues) => void;
}) {
    const form = useForm<ProfessionalDetailsFormValues>({
        resolver: zodResolver(professionalDetailsSchema),
        defaultValues: {
            name: data?.name || "",
            website: data?.website || "",
            mcc: data?.mcc || "",
            supportPhone: data?.supportPhone || "",
            supportEmail: data?.supportEmail || "",
        },
    });
    const { handleSubmit, reset, control, watch } = form;
    const initialDataRef = useRef<ProfessionalDetailsFormValues>({ ...data });
    const dataKeys = Object.keys(data).join(",");

    useEffect(() => {
        if (data) {
            reset({
                name: data.name || "",
                website: data.website || "",
                mcc: data.mcc || "",
                supportPhone: data.supportPhone || "",
                supportEmail: data.supportEmail || "",
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AccountFormWrapper
                    onClose={onClose}
                    isSubmitting={isSubmitting}
                    isChanged={isChanged}
                >
                    <div className="grid grid-cols-2 !gap-x-2">
                        <FormField
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label>Name</Label>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            required
                                            placeholder="Enter your name"
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
                                    <Label>Website</Label>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="url"
                                            placeholder="Enter your website URL"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 !gap-x-2">
                        <FormField
                            name="mcc"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label>MCC Code</Label>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter your MCC code"
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
                                    <Label>Support Phone</Label>
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
                    <FormField
                        name="supportEmail"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <Label>Support Email</Label>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Enter your support email address"
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

export type { ProfessionalDetailsFormValues } from "./schemas";
