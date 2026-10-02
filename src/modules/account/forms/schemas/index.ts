import { z } from "zod";

export const businessInfoSchema = z
    .object({
        name: z.string().min(1, "Business name is required"),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email address"),
        website: z
            .string()
            .url("Invalid website URL")
            .optional()
            .or(z.literal("")),
        mcc: z.string().optional().or(z.literal("")),
        phone: z
            .string()
            .min(6, "Phone number is too short")
            .optional()
            .or(z.literal("")),
        businessStructure: z.string().optional(),
        businessType: z.enum(["individual", "company", "nonprofit"]),
        country: z.string().min(1, "Country is required"),
    })
    .refine(
        (data) => {
            if (data.businessType === "company") {
                return data.businessStructure !== "";
            }
            return true;
        },
        {
            message: "Business structure is required",
            path: ["businessStructure"],
        }
    );

export type BusinessInfoFormValues = z.infer<typeof businessInfoSchema>;

export const professionalDetailsSchema = z.object({
    name: z.string().min(1, "Name is required"),
    website: z.string().url("Invalid website URL").optional().or(z.literal("")),
    mcc: z.string().optional().or(z.literal("")),
    supportPhone: z
        .string()
        .min(6, "Phone number is too short")
        .optional()
        .or(z.literal("")),
    supportEmail: z
        .string()
        .email("Invalid email address")
        .optional()
        .or(z.literal("")),
});

export type ProfessionalDetailsFormValues = z.infer<
    typeof professionalDetailsSchema
>;

export const publicDetailsSchema = z.object({
    supportAddress1: z.string().optional().or(z.literal("")),
    supportAddress2: z.string().optional().or(z.literal("")),
    supportCountry: z
        .string()
        .min(1, "Country is required")
        .optional()
        .or(z.literal("")),
    supportPhone: z
        .string()
        .min(6, "Phone number is too short")
        .optional()
        .or(z.literal("")),
    descriptor: z.string().optional().or(z.literal("")),
});

export type PublicDetailsFormValues = z.infer<typeof publicDetailsSchema>;

export const personalDetailsSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
    ssnLast4: z
        .string()
        .regex(/^\d{4}$/, "Must be exactly 4 digits")
        .optional()
        .or(z.literal("")),
    ssnLast4Provided: z.boolean().optional(),
    address1: z.string().min(1, "Address is required"),
    address2: z.string().optional().or(z.literal("")),
    city: z.string().min(1, "City is required"),
    state: z.string().optional().or(z.literal("")),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    phone: z.string().min(6, "Phone number is too short"),
});

export type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;

export const companyDetailsSchema = z.object({
    name: z.string().min(1, "Company name is required"),
    phone: z.string().min(6, "Phone number is too short"),
    taxId: z.string().min(4, "Tax ID is required").optional().or(z.literal("")),
    address1: z.string().min(1, "Address is required"),
    address2: z.string().optional().or(z.literal("")),
    city: z.string().min(1, "City is required"),
    state: z.string().optional().or(z.literal("")),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
});

export type CompanyDetailsFormValues = z.infer<typeof companyDetailsSchema>;

export const createPersonSchema = z
    .object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email address"),
        phone: z.string().min(6, "Phone number is too short"),
        dateOfBirth: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
        ssnLast4: z
            .string()
            .regex(/^\d{4}$/, "Must be exactly 4 digits")
            .optional()
            .or(z.literal("")),
        addressLine1: z.string().min(1, "Address line 1 is required"),
        addressLine2: z.string().optional().or(z.literal("")),
        city: z.string().min(1, "City is required"),
        state: z.string().optional().or(z.literal("")),
        postalCode: z.string().min(1, "Postal code is required"),
        country: z.string().min(1, "Country is required"),

        relationshipRepresentative: z.boolean().default(true),
        relationshipExecutive: z.boolean().default(false),
        relationshipDirector: z.boolean().default(false),
        relationshipOwner: z.boolean().default(false),
        relationshipPercentOwnership: z
            .number({ invalid_type_error: "Must be a number" })
            .min(0, "Percent ownership must be between 0 and 100")
            .max(100, "Percent ownership must be between 0 and 100")
            .optional(),
        relationshipTitle: z.string().optional().or(z.literal("")),
    })
    .superRefine((val, ctx) => {
        if (val.relationshipOwner) {
            if (val.relationshipPercentOwnership == null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                        "Percent ownership is required when Owner is selected",
                    path: ["relationshipPercentOwnership"],
                });
            }
        }
    });

export type CreatePersonFormValues = z.infer<typeof createPersonSchema>;
