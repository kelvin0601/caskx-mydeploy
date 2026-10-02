import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";
import { TTB_LICENSE_NUMBER, TTB_LICENSE_TYPE } from "./constants/text";
import { formatNumberToDecimal, refineSchema } from "./utils";
// import { formatNumberWithDecimal } from "./utils";
import { JSX } from "react";

// const currency = z
//   .string()
//   .refine(
//     (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
//     "Price must have exactly two decimal places"
//   ) ;

// Schema for signing users in
export const signInFormSchema = z.object({
    email: z
        .string()
        .nonempty("Email is required")
        .email("Please provide a properly formatted email address"),
    password: z.string().min(8, "Password must be at 8 characters long"),
    rememberMe: z.boolean().optional(),
});

// Schema for signing users in
export const signUpFormSchema = z
    .object({
        firstName: z
            .string()
            .nonempty({ message: "Please enter your first name" })
            .min(2, "First name must be at least 2 characters long"),
        lastName: z
            .string()
            .nonempty({ message: "Please enter your last name" })
            .min(2, "Last name must be at least 2 characters long"),
        email: z
            .string()
            .nonempty("Please enter your email")
            .email("Please provide a properly formatted email address"),
        inviteCode: z.string().optional(),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .regex(
                /[a-z]/,
                "Password must include at least one lowercase letter"
            )
            .regex(
                /[A-Z]/,
                "Password must include at least one uppercase letter"
            )
            .regex(
                /^(?=.*[0-9!@#$%^&*(),.?":{}|<>]).*$/,
                "Password must include at least one number or special character"
            ),
        phoneNumber: z
            .string()
            .nonempty("Please enter your phone number")
            .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
        consent: z.boolean().refine((val) => val === true, {
            message: "You must agree to the Privacy Policy to proceed.",
        }),
        [TTB_LICENSE_NUMBER]: z.string().optional(),
        [TTB_LICENSE_TYPE]: z.string().optional(),
    })
    .superRefine(({ ttbLicenseNumber, phoneNumber, ttbLicenseType }, ctx) => {
        // check if phone number is US and ttbLicenseNumber is not empty
        const isValidUs = isValidPhoneNumber(phoneNumber.slice(1), "US");
        if (isValidUs && !ttbLicenseNumber) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "This field is required for US",
                path: [TTB_LICENSE_NUMBER],
            });
        }
        if (isValidUs && !ttbLicenseType) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "This field is required for US",
                path: [TTB_LICENSE_TYPE],
            });
        }
        return true;
    });

export const resendVerifyUserSchema = z.object({
    email: z
        .string()
        .nonempty("Please enter your email")
        .email("Please provide a properly formatted email address"),
});

// Schema for payment method schema
export const paymentResultSchema = z.object({
    id: z.string(),
    status: z.string(),
    email_address: z.string(),
    pricePaid: z.string(),
});

// Schema for shipping address
export const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().min(2, "Email must be at least 2 characters long"),
});

// User schema based on the User interface
export const userSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .nonempty("Email is required"),
    firstName: z.string().nonempty("First name is required"),
    id: z.string(),
    lastName: z.string().nonempty("Last name is required"),
    phoneNumber: z.string().nonempty("Phone number is required"),
    createdDate: z.string().nonempty("Created date is required"),
});

export const forgotPasswordFormSchema = z.object({
    email: z
        .string()
        .nonempty("Email is required")
        .email("Please provide a properly formatted email address"),
});

// UpdatePasswordFormValue schema based on the UpdatePasswordFormValue type
export const updatePasswordFormSchema = refineSchema(
    z
        .object({
            newPassword: z
                .string()
                .min(8, "Password must be at least 8 characters long")
                .regex(
                    /[a-z]/,
                    "Password must include at least one lowercase letter"
                )
                .regex(
                    /[A-Z]/,
                    "Password must include at least one uppercase letter"
                )
                .regex(
                    /^(?=.*[0-9!@#$%^&*(),.?":{}|<>]).*$/,
                    "Password must include at least one number or special character"
                ),
            confirmPassword: z
                .string()
                .min(8, "Confirm Password must be at least 8 characters long")
                .regex(
                    /[a-z]/,
                    "Confirm Password must include at least one lowercase letter"
                )
                .regex(
                    /[A-Z]/,
                    "Confirm Password must include at least one uppercase letter"
                )
                .regex(
                    /^(?=.*[0-9!@#$%^&*(),.?":{}|<>]).*$/,
                    "Confirm Password must include at least one number or special character"
                ),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        })
);

export const updatePasswordWithCheckPasswordCurrentSchema = z
    .object({
        oldPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .regex(
                /[a-z]/,
                "Password must include at least one lowercase letter"
            )
            .regex(
                /[A-Z]/,
                "Password must include at least one uppercase letter"
            )
            .regex(
                /^(?=.*[0-9!@#$%^&*(),.?":{}|<>]).*$/,
                "Password must include at least one number or special character"
            ),
        confirmPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .regex(
                /[a-z]/,
                "Password must include at least one lowercase letter"
            )
            .regex(
                /[A-Z]/,
                "Password must include at least one uppercase letter"
            )
            .regex(
                /^(?=.*[0-9!@#$%^&*(),.?":{}|<>]).*$/,
                "Password must include at least one number or special character"
            ),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Passwords don’t match",
                path: ["confirmPassword"],
            });

            return false;
        }
        if (data.password === data.oldPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "New password must be different from current password.",
                path: ["password"],
            });

            return false;
        }
        return true;
    });

export const checkPasswordSchemaTwoFA = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .nonempty("Password is required"),
});

export const setupGoogleAuthSchema = z.object({
    pin: z
        .string()
        .min(6, "PIN must be 6 digits long")
        .nonempty("PIN is required"),
});

export const setupSMSAuthSchema = z.object({
    phoneNumber: z
        .string()
        .nonempty("Please enter your phone number")
        .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
});
export const searchSchema = z.object({
    search: z.string().optional(),
});

export const filterSchemaCask = z.object({
    distillery: z.array(z.string()).optional(),
    caskType: z.array(z.string()).optional(),
    region: z.array(z.string()).optional(),
    category: z.array(z.string()).optional(),
    year: z.array(z.string().optional()).optional(),
    abv: z.array(z.string().optional()).optional(),
    rla: z.array(z.string().optional()).optional(),
    ola: z.array(z.string().optional()).optional(),
    bottles: z.array(z.string().optional()).optional(),
    price: z.array(z.string().optional()).optional(),
});

export const filterSchemaDistillery = z.object({
    countries: z.array(z.string()).optional(),
    regions: z.array(z.string().optional()).optional(),
    statuses: z.array(z.string().optional()).optional(),
    companies: z.array(z.string().optional()).optional(),
});

export const notificationSchema = z.record(
    z.object({
        inapp: z.boolean().default(false),
        email: z.boolean().default(false),
        percent: z.number().min(0).max(100).optional(),
    })
);

export const cardPaymentSchema = z.object({
    cardNumber: z
        .string()
        .min(16, { message: "Card number is not valid" })
        .nonempty({ message: "Card number is required" }),

    cardExpirationDate: z
        .string()
        .min(1, { message: "Card expiration date is required" }),
    cardCvv: z
        .string()
        .nonempty({ message: "Card CVV is required" })
        .regex(/^\d{3,4}$/, { message: "Card CVV must be 3-4 digits" }),
    cardHolderName: z
        .string()
        .min(1, { message: "Card holder name is required" }),
    billingAddress: z.object({
        country: z.string().min(1, { message: "Country is required" }),
        address: z.string().min(1, {
            message: "Billing address is required",
        }),
    }),
    zipCode: z.string().min(1, { message: "Zip code is required" }),
});

// Cask Master + Cask Child (split schema)
export const caskMasterFormSchema = z.object({
    name: z
        .string({
            message: "Name is required",
        })
        .min(3, "Name is minimum 3 characters"),
    status: z.enum(["active", "inactive"]).optional(),
    distilleryId: z
        .string({ message: "Distillery is required" })
        .refine((val) => val !== "", { message: "Distillery is required" }),
    caskTypeId: z
        .string({
            message: "Cask type is required",
        })
        .refine((val) => val !== "", { message: "Cask type is required" }),
    regionId: z
        .string({
            message: "Region is required",
        })
        .min(1, "Region is required"),
    classification: z
        .string({
            message: "Category is required",
        })
        .min(1, "Category is required"),
    peatLevels: z.string().nullish(),
    imageUrl: z.string().refine(
        (val) => {
            if (val.startsWith("blob:") || val.startsWith("https://"))
                return true;
            return false;
        },
        {
            message: "Please upload a valid image",
        }
    ),
});

export const caskChildFormSchema = z.object({
    name: z.string().nullable().optional(),
    description: z
        .string({
            message: "Description is required",
        })
        .min(10, "Description is minimum 10 characters"),
    priceReference: z
        .array(
            z
                .union([z.string(), z.number()])
                .transform((val) => {
                    if (typeof val === "number") return val;
                    // Convert string to number, handling formatted strings with commas
                    const cleanValue = val
                        .replace(/,/g, "")
                        .replace(/(\..*?)\./g, "$1");
                    const numValue = Number(cleanValue);
                    return isNaN(numValue) ? 0 : numValue;
                })
                .refine((val) => val > 0, {
                    message: "Price reference must be greater than 0",
                })
        )
        .min(1, "Price reference is required")
        .max(2, "Price reference can have at most 2 values")
        .refine(
            (arr) => {
                // If array has 2 values, second value must be greater than first
                if (arr.length === 2) {
                    return arr[1] > arr[0];
                }
                return true;
            },
            {
                message:
                    "Reference price max must be greater than reference price min",
            }
        ),
    tastingNotes: z.string().nullish(),
    distillationDate: z.string().nullish(),
    vintageYear: z
        .number({
            message: "Vintage year is required",
        })
        .int()
        .min(1900, "Vintage year must be at least 1900")
        .max(
            new Date().getFullYear() + 10,
            "Vintage year cannot be in the future"
        ),
    bottleVolume: z
        .number({
            message: "Bottle volume must be a valid number",
        })
        .nonnegative("Bottle volume must be greater than or equal to 0")
        .nullish()
        .transform((val) => (val !== undefined ? Number(val) : undefined)),
    imageUrl: z.string().refine(
        (val) => {
            if (val.startsWith("blob:") || val.startsWith("https://"))
                return true;
            return false;
        },
        {
            message: "Please upload a valid image",
        }
    ),
    // expectedMaturityDate: z.string().optional().or(z.literal("")),
    estimatedBottleCount: z
        .number({
            message: "Estimated bottle count must be a valid number",
        })
        .nullish(),
    abv: z
        .string()
        .nullish()
        .refine((val) => (val ? Number(val) <= 100 : true), {
            message: "ABV must be less than or equal to 100",
        })
        .transform((val) => (val ? String(val) : undefined)),
    rla: z
        .string()
        .nullish()
        .transform((val) => (val ? String(val) : undefined)),
    isListed: z.boolean().default(true),
    readyToSell: z.boolean({
        required_error: "Ready to sell is required",
    }),
    ola: z
        .string()
        .nullish()
        .transform((val) => (val ? String(val) : undefined)),
});

// Backward-compatible combined schema (used by existing screens)
export const caskFormSchema = caskMasterFormSchema;

// Distillery Form Schema (shared for add & edit)
export const distilleryFormSchema = z.object({
    name: z
        .string({
            required_error: "Distillery name is required",
        })
        .min(3, "Distillery name is minimum 3 characters"),
    country: z.string().optional(),
    summary: z.string().min(10, "Summary is minimum 10 characters"),
    description: z.string().min(10, "Description is minimum 10 characters"),
    region: z.string().optional(),
    company: z.string().optional(),
    establishedYear: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val) return true;
                const n = parseInt(val);
                return n >= 1000 && n <= new Date().getFullYear();
            },
            { message: "Invalid year" }
        ),
    website: z.string().url("Invalid website URL").optional(),
    image: z
        .string()
        .refine(
            (val) => val.startsWith("blob:") || val.startsWith("https://"),
            { message: "Invalid image" }
        ),
    status: z.string().default("active"),
});

export const imageSchema = z
    .string()
    .refine((val) => val?.startsWith("blob:"), { message: "Invalid image" });
