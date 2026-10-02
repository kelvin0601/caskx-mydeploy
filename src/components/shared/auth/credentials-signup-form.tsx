"use client";

import { env } from "@/config/env";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormMessage,
    FormRootError,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTriggerWithForm,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useDisableButtonForm } from "@/hooks/useDisableButtonForm";
import { DEFAULT_PERMISSION_TYPE, signUpDefaultValues } from "@/lib/constants";
import { AUTH_KEYS, LICENSE_KEYS } from "@/lib/constants/key";
import { ROUTE_AUTH, ROUTE_PUBLIC } from "@/lib/constants/route";
import { TTB_LICENSE_NUMBER, TTB_LICENSE_TYPE } from "@/lib/constants/text";
import { signUpFormSchema } from "@/lib/validators";
import authService from "@/services/auth";
import caskServices from "@/services/cask";
import { auth, cask } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    isValidPhoneNumber,
    parsePhoneNumberWithError,
} from "libphonenumber-js";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import LinkCustom from "../link-custom";
import PasswordStrength from "./password-strength";
const CredentialsSignUpForm = () => {
    const registrationMutation = useMutation({
        mutationKey: [AUTH_KEYS.SIGNUP],
        mutationFn: authService.registerUser,
        gcTime: Infinity,
    });
    const form = useForm({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: signUpDefaultValues,
    });
    const permissionCaskQuery = useQuery({
        queryKey: ["permission"],
        queryFn: caskServices.getListPermitter,
        gcTime: Infinity,
    });
    const licenseTypeQuery = useQuery({
        queryKey: [LICENSE_KEYS.TTB_LICENSE_TYPES],
        queryFn: authService.getLicenseType,
        gcTime: Infinity,
    });

    const convertValidDataPermission = (data?: cask.TCaskPermitter) => {
        if (!data) return;
        const result = data["Permit Data"].reduce(
            (
                acc: {
                    [key: string]: string[];
                },
                curr
            ) => {
                acc[TTB_LICENSE_NUMBER] = acc[TTB_LICENSE_NUMBER] || [];
                acc[TTB_LICENSE_NUMBER].push(curr[0]);

                acc[TTB_LICENSE_TYPE] = acc[TTB_LICENSE_TYPE] || [];
                if (!acc[TTB_LICENSE_TYPE].includes(curr[8])) {
                    acc[TTB_LICENSE_TYPE].push(curr[8]);
                }
                return acc;
            },
            {}
        );
        return result;
    };
    const isValidPermission = (ttbNumber: string) => {
        if (env.isDevelopment) return true;
        if (!validDataPermission) return false;
        // Convert to lowercase and remove whitespace
        const normalizedTtbNumber = ttbNumber?.toLowerCase()?.trim();
        // Check against normalized array of TTB numbers

        return validDataPermission.ttbLicenseNumber.some((num) => {
            return num?.toLowerCase()?.trim() === normalizedTtbNumber;
        });
    };
    const onSubmit = async (data: auth.TRegisterUser) => {
        const phoneNumber = parsePhoneNumberWithError(data.phoneNumber);
        const countryCode = phoneNumber?.country;

        if (
            !isValidPermission(data.ttbLicenseNumber as string) &&
            countryCode === "US"
        ) {
            form.setError(TTB_LICENSE_NUMBER, {
                type: "manual",
                message: "TTB license number is invalid. Please try another.",
            });
            return;
        }

        try {
            const regionNames = new Intl.DisplayNames(["en"], {
                type: "region",
            });
            const { ttbLicenseNumber, ttbLicenseType, ...rest } = data;
            const countryName = regionNames.of(countryCode!);
            await registrationMutation.mutateAsync({
                ...rest,
                country: countryName,
                ...(ttbLicenseNumber && { ttbLicenseNumber }),
                ...(ttbLicenseType && { ttbLicenseType }),
            });
        } catch (error) {
            form.setError("root", {
                type: "manual",
                message:
                    (error as { message?: string })?.message ||
                    "Something went wrong",
            });
        }
    };

    const validDataPermission = convertValidDataPermission(
        permissionCaskQuery.data
    );
    const isUSSelected = useMemo(() => {
        const phoneNumber = form.watch("phoneNumber");
        if (!phoneNumber) return false;
        try {
            const parsed = parsePhoneNumberWithError(phoneNumber);
            return parsed?.country === "US";
        } catch {
            return false;
        }
    }, [form.watch("phoneNumber")]);

    const optionalFields = useMemo(() => {
        const list = ["inviteCode"];
        if (!isUSSelected) {
            list.push(TTB_LICENSE_NUMBER);
            list.push(TTB_LICENSE_TYPE);
        }
        return list;
    }, [isUSSelected]);

    const isDisableButton = useDisableButtonForm(form, optionalFields);

    // const dataSelect = DEFAULT_PERMISSION_TYPE;
    // const dataSelect =
    //     validDataPermission?.[TTB_LICENSE_TYPE] ?? DEFAULT_PERMISSION_TYPE;
    const dataSelect =
        Object.values(licenseTypeQuery.data || {}) ?? DEFAULT_PERMISSION_TYPE;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                id="sign-up"
                className="w-full"
                onChange={() => form.clearErrors("root")}
            >
                <div className="space-y-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 !gap-x-2 gap-y-4 mb:grid-cols-1">
                            <FormField
                                name="firstName"
                                control={form.control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="firstName" required>
                                            First name
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="firstName"
                                                type="text"
                                                required
                                                autoComplete="given-name"
                                                placeholder="Ex: John"
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
                                        <Label htmlFor="lastName" required>
                                            Last name
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="lastName"
                                                type="text"
                                                required
                                                autoComplete="family-name"
                                                placeholder="Ex: Doe"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 !gap-x-2 gap-y-4 mb:grid-cols-1">
                            <FormField
                                name="phoneNumber"
                                control={form.control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="phoneNumber" required>
                                            Phone
                                        </Label>
                                        <FormControl>
                                            <PhoneInput
                                                id="phoneNumber"
                                                type="text"
                                                required
                                                autoComplete="tel"
                                                defaultCountry="US"
                                                international={true}
                                                placeholder="000-000-000"
                                                className="w-full shadow-sm [&>div]:flex-1"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                            <FormField
                                name="inviteCode"
                                control={form.control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="inviteCode">
                                            Invite code
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="inviteCode"
                                                type="text"
                                                autoComplete="off"
                                                placeholder="Invite code"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                        </div>
                        {isUSSelected && (
                            <div className="grid grid-cols-2 !gap-x-4 gap-y-4 mb:grid-cols-1">
                                <FormField
                                    name={TTB_LICENSE_NUMBER}
                                    control={form.control}
                                    render={({ field }) => (
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor={TTB_LICENSE_NUMBER}
                                                required
                                            >
                                                TTB license number
                                            </Label>
                                            <FormControl>
                                                <Input
                                                    id={TTB_LICENSE_NUMBER}
                                                    required
                                                    type="text"
                                                    autoComplete="off"
                                                    placeholder="Ex: AA-A-00000"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </div>
                                    )}
                                />

                                <FormField
                                    name={TTB_LICENSE_TYPE}
                                    control={form.control}
                                    render={({ field }) => (
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor={TTB_LICENSE_TYPE}
                                                required
                                            >
                                                TTB license type
                                            </Label>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                required
                                            >
                                                <FormControl>
                                                    <SelectTriggerWithForm>
                                                        <SelectValue placeholder="Select a license type" />
                                                    </SelectTriggerWithForm>
                                                </FormControl>
                                                <SelectContent>
                                                    {dataSelect.map(
                                                        (item, index) => {
                                                            return (
                                                                <SelectItem
                                                                    value={item}
                                                                    key={index}
                                                                >
                                                                    {item}
                                                                </SelectItem>
                                                            );
                                                        }
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </div>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" required>
                                        Email
                                    </Label>
                                    <FormControl>
                                        <Input
                                            id="email"
                                            type="text"
                                            required
                                            autoComplete="off"
                                            placeholder="Ex: johndoe@gmail.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" required>
                                        Password
                                    </Label>
                                    <FormControl>
                                        <Input
                                            id="password"
                                            type="password"
                                            variant="password"
                                            autoComplete="off"
                                            required
                                            placeholder="•••••••••"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <PasswordStrength password={field.value} />
                                </div>
                            )}
                        />
                    </div>
                    <FormField
                        name="consent"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <div className="flex content-start items-center space-x-2">
                                    <FormControl>
                                        <Checkbox
                                            id="consent"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <Label
                                        htmlFor="consent"
                                        className="cursor-pointer select-none font-normal text-typo-note transition-colors peer-data-[state=checked]:text-typo-primary"
                                    >
                                        I have read and agree to the{" "}
                                        <LinkCustom
                                            href={
                                                ROUTE_PUBLIC.TERMS_OF_USE_BUYER
                                            }
                                            target="_blank"
                                            className="hover-line-active !text-typo-primary"
                                        >
                                            Privacy Policy
                                        </LinkCustom>{" "}
                                    </Label>
                                </div>
                                <FormMessage />
                            </div>
                        )}
                    />
                    <FormRootError />
                    <div className="!mt-4 mb:!mt-5">
                        <Button
                            disabled={
                                isDisableButton || form.formState.isSubmitting
                            }
                            className="w-full capitalize"
                            variant="primary"
                            type="submit"
                            size={"xl"}
                        >
                            {form.formState.isSubmitting
                                ? "Submitting..."
                                : "Create new account"}
                        </Button>
                    </div>
                    <div className="!mt-4 flex items-center justify-center text-center text-sm text-typo-soft mb:!mt-5 mb:text-sm">
                        Already have an account?{" "}
                        <LinkCustom
                            href={ROUTE_AUTH.LOGIN}
                            target="_self"
                            className="hover-line-active ml-1 text-sm font-medium !leading-[1.2] !text-typo-primary"
                        >
                            Log In
                        </LinkCustom>
                    </div>
                </div>
            </form>
        </Form>
    );
};

export default CredentialsSignUpForm;
