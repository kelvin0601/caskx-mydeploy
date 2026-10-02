import { STRIPE_KEYS } from "@/lib/constants/key";
import { BusinessInfoFormValues } from "@/modules/account/forms/BusinessInfoForm";
import { CompanyDetailsFormValues } from "@/modules/account/forms/CompanyDetailsForm";
import { PersonalDetailsFormValues } from "@/modules/account/forms/PersonalDetailsForm";
import { ProfessionalDetailsFormValues } from "@/modules/account/forms/ProfessionalDetailsForm";
import { PublicDetailsFormValues } from "@/modules/account/forms/PublicDetailsForm";
import { CreatePersonFormValues } from "@/modules/account/forms/schemas";
import { stripe } from "@/types/stripe";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { convertDateFormat, getErrorMessage } from "@/lib/utils";
import { KEY_FORM_MAP, TFormType } from "@/store/account";

type TFormData =
    | BusinessInfoFormValues
    | ProfessionalDetailsFormValues
    | PublicDetailsFormValues
    | PersonalDetailsFormValues
    | CompanyDetailsFormValues
    | CreatePersonFormValues;

type TSubmitFormParams = {
    formData: TFormData;
    formType?: TFormType;
};

// Transform form data based on form type
export const transformFormData = <T>(
    formData: T,
    formType: TSubmitFormParams["formType"]
): T => {
    let updateData = {};

    switch (formType) {
        case KEY_FORM_MAP.BUSINESS_INFO: {
            const businessProfile: Partial<stripe.TBusinessProfile> = {};
            const company: Partial<stripe.TCompany> = {};
            const f = formData as BusinessInfoFormValues;

            if (f.name) businessProfile.name = f.name;
            if (f.email) businessProfile.supportEmail = f.email;
            if (f.website) businessProfile.url = f.website;
            if (f.phone) businessProfile.supportPhone = f.phone;
            if (f.businessType) businessProfile.businessType = f.businessType;
            if (f.mcc) businessProfile.mcc = f.mcc;

            if (f.businessType === "company") {
                if (f.country) company.country = f.country;
                if (f.name) company.name = f.name;
                if (f.businessStructure)
                    company.structure = f.businessStructure;
            }

            updateData = {
                ...(Object.keys(businessProfile).length > 0
                    ? { businessProfile }
                    : {}),
                ...(Object.keys(company).length > 0 ? { company } : {}),
            };
            break;
        }

        case KEY_FORM_MAP.PROFESSIONAL_DETAILS: {
            const businessProfile: Partial<stripe.TBusinessProfile> = {};
            const f = formData as ProfessionalDetailsFormValues;

            if (f.name) businessProfile.name = f.name;
            if (f.website) businessProfile.url = f.website;
            if (f.supportPhone) businessProfile.supportPhone = f.supportPhone;
            if (f.supportEmail) businessProfile.supportEmail = f.supportEmail;

            updateData = {
                ...(Object.keys(businessProfile).length > 0
                    ? { businessProfile }
                    : {}),
            };
            break;
        }

        case KEY_FORM_MAP.PUBLIC_DETAILS: {
            const businessProfile: Partial<stripe.TBusinessProfile> = {};
            const company: Partial<stripe.TCompany> = {};
            const f = formData as PublicDetailsFormValues;

            if (f.supportPhone) businessProfile.supportPhone = f.supportPhone;

            const address: Partial<stripe.TCompany["address"]> = {};
            if (f.supportAddress1) address.line1 = f.supportAddress1;
            if (f.supportAddress2) address.line2 = f.supportAddress2;
            if (f.supportCountry) address.country = f.supportCountry;
            if (Object.keys(address).length > 0) company.address = address;

            updateData = {
                ...(Object.keys(businessProfile).length > 0
                    ? { businessProfile }
                    : {}),
                ...(Object.keys(company).length > 0 ? { company } : {}),
            };
            break;
        }

        case KEY_FORM_MAP.INDIVIDUAL_DETAILS: {
            type Individual = {
                firstName?: string;
                lastName?: string;
                email?: string;
                dateOfBirth?:
                    | { day: number; month: number; year: number }
                    | string;
                phone?: string;
                ssnLast4?: string;
                address?: {
                    line1?: string;
                    line2?: string;
                    city?: string;
                    state?: string;
                    postalCode?: string;
                    country?: string;
                };
            };

            const f = formData as PersonalDetailsFormValues;
            const individual: Individual = {};

            if (f.firstName) individual.firstName = f.firstName;
            if (f.lastName) individual.lastName = f.lastName;
            if (f.email) individual.email = f.email;
            if (f.dob) {
                if (typeof f.dob === "string" && f.dob.includes("-")) {
                    const [year, month, day] = f.dob.split("-").map(Number);
                    individual.dateOfBirth = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
                } else {
                    individual.dateOfBirth = f.dob;
                }
            }
            if (f.phone) individual.phone = f.phone;
            if (f.ssnLast4) individual.ssnLast4 = f.ssnLast4;

            // Address
            const address: Individual["address"] = {};
            if (f.address1) address.line1 = f.address1;
            if (f.address2) address.line2 = f.address2;
            if (f.city) address.city = f.city;
            if (f.state) address.state = f.state;
            if (f.postalCode) address.postalCode = f.postalCode;
            if (f.country) address.country = f.country;
            if (Object.keys(address).length > 0) individual.address = address;

            updateData = {
                ...(Object.keys(individual).length > 0 ? { individual } : {}),
            };
            break;
        }

        case KEY_FORM_MAP.COMPANY_DETAILS: {
            const company: Partial<stripe.TCompany> = {};
            const f = formData as CompanyDetailsFormValues;

            if (f.name) company.name = f.name;
            if (f.phone) company.phone = f.phone;

            // Update address object
            const address: Partial<stripe.TCompany["address"]> = {};
            if (f.address1) address.line1 = f.address1;
            if (f.address2) address.line2 = f.address2;
            if (f.city) address.city = f.city;
            if (f.state) address.state = f.state;
            if (f.postalCode) address.postalCode = f.postalCode;
            if (f.country) address.country = f.country;
            if (Object.keys(address).length > 0) company.address = address;

            updateData = {
                ...(Object.keys(company).length > 0 ? { company } : {}),
            };
            break;
        }

        case KEY_FORM_MAP.MANAGEMENT_DETAILS: {
            const f = formData as PersonalDetailsFormValues;
            const transformed: {
                firstName?: string;
                lastName?: string;
                email?: string;
                phone?: string;
                dateOfBirth?: string;
                ssnLast4?: string;
                address?: {
                    line1?: string;
                    line2?: string;
                };
            } = {} as stripe.TPerson;

            if (f.firstName) transformed.firstName = f.firstName;
            if (f.lastName) transformed.lastName = f.lastName;
            if (f.email) transformed.email = f.email;
            if (f.phone) transformed.phone = f.phone;
            if (f.ssnLast4) transformed.ssnLast4 = f.ssnLast4;

            // Handle DOB - convert from dd-mm-yyyy to yyyy-mm-dd format
            if (f.dob) {
                transformed.dateOfBirth = convertDateFormat(f.dob);
            }
            // Handle address
            const address: Partial<stripe.TPersonAddress> = {};
            if (f.address1) address.line1 = f.address1;
            if (f.address2) address.line2 = f.address2;
            if (f.city) address.city = f.city;
            if (f.state) address.state = f.state;
            if (f.postalCode) address.postalCode = f.postalCode;
            if (f.country) address.country = f.country;

            if (Object.keys(address).length > 0) {
                transformed.address = address;
            }

            updateData = {
                ...(Object.keys(transformed).length > 0
                    ? { ...transformed }
                    : {}),
            };
            break;
        }

        default:
            return {} as T;
    }

    return updateData as T;
};

/**
 * Hook to handle form submission with Tanstack Query mutation
 */
export function useSubmitAccountForm<T>(
    handler: (
        ...data: T[]
    ) => Promise<void | { success?: boolean; error?: string }>,
    queryKey: string[],
    options?: {
        onSuccessMessage?: string | null;
    }
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: queryKey,
        mutationFn: async ({
            formData,
            formType,
        }: {
            formData: T;
            formType?: TFormType;
        }) => {
            const dataToSubmit = formType
                ? (transformFormData<T>(formData, formType) as T)
                : (formData as T);

            return await handler(dataToSubmit);
        },
        onSuccess: () => {
            if (options?.onSuccessMessage !== null) {
                toast.success(
                    options?.onSuccessMessage ||
                        "Account information updated successfully!"
                );
            }
            // Invalidate and refetch profile data
            queryClient.invalidateQueries({ queryKey: [STRIPE_KEYS.PROFILE] });
            queryClient.invalidateQueries({
                queryKey: [STRIPE_KEYS.GET_PERSON],
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to submit form"));
        },
    });
}
