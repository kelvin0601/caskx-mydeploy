"use client";

import IconCar from "@/components/shared/icons/icon-car";
import IconPassport from "@/components/shared/icons/icon-passport";
import IconZoomLoop from "@/components/shared/icons/icon-zoom-loop";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { RadioGroup } from "@/components/ui/radio-group";
import { useBoundStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CardVerification from "../card-verfication";
import HeadingKyc from "../heading";
import { SelectFlag } from "../select-flag";
import { useKycStep } from "../provider/kyc-step-provider";

export default function FormChooseCountry() {
    const { user } = useBoundStore();
    const { nextStep, setFormData } = useKycStep();
    const schemaForm = z.object({
        identificationType: z.enum(["id-card", "passport", "driver-license"]),
        nationality: z.string().min(1, { message: "Country is required" }),
    });
    const dataNumber = parsePhoneNumberWithError(user?.phoneNumber || "");
    type FormValues = z.infer<typeof schemaForm>;
    const form = useForm<FormValues>({
        defaultValues: {
            identificationType: "id-card",
            nationality: dataNumber.country,
        },
        resolver: zodResolver(schemaForm),
    });

    const handleSubmit = (data: FormValues) => {
        setFormData({
            identificationType: data.identificationType,
            nationality: data.nationality,
        });
        nextStep();
    };
    return (
        <div className="flex flex-col gap-4">
            <HeadingKyc
                title="Let's get you verified"
                description="Select your country/ region"
            />

            <div className="flex flex-col gap-4">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="nationality"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <SelectFlag<FormValues> field={field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="w-full text-base font-medium text-typo-primary">
                            Form of identification{" "}
                        </div>
                        <FormField
                            control={form.control}
                            name="identificationType"
                            render={({ field }) => (
                                <FormItem className="w-full space-y-3">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <CardVerification
                                                title="ID card"
                                                icon={<IconZoomLoop />}
                                                name="id-card"
                                                isRecommended
                                            />
                                            <CardVerification
                                                title="Passport"
                                                icon={<IconPassport />}
                                                name="passport"
                                            />
                                            <CardVerification
                                                title="Driver's license"
                                                icon={<IconCar />}
                                                name="driver-license"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="flex-center flex w-full">
                            <Button
                                className="mx-auto w-max"
                                variant={"secondary"}
                                type="submit"
                            >
                                Continue
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
