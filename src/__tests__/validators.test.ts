// Mock query-string to avoid ESM issues
jest.mock("query-string", () => ({
    stringify: jest.fn((obj) =>
        Object.entries(obj)
            .map(([k, v]) => `${k}=${v}`)
            .join("&")
    ),
    parse: jest.fn((str) => Object.fromEntries(new URLSearchParams(str))),
}));

// Mock the utils module to avoid ESM issues with query-string
jest.mock("@/lib/utils", () => ({
    formatNumberToDecimal: jest.fn((num) => num.toString()),
    refineSchema: jest.fn((schema) => schema),
}));

// Mock react-phone-number-input
jest.mock("react-phone-number-input", () => ({
    isValidPhoneNumber: jest.fn((value: string, country?: string) => {
        // Keep it deterministic for tests:
        // - default behavior: accept E.164 +[10+ digits]
        // - US check in validators uses isValidPhoneNumber(phone.slice(1), "US")
        //   where value looks like "1XXXXXXXXXX"
        if (country === "US") return /^1\d{10}$/.test(value);
        return /^\+\d{10,}$/.test(value);
    }),
}));

import {
    notificationSchema,
    signInFormSchema,
    signUpFormSchema,
    forgotPasswordFormSchema,
    checkPasswordSchemaTwoFA,
    searchSchema,
    resendVerifyUserSchema,
    updateProfileSchema,
    userSchema,
    setupGoogleAuthSchema,
    setupSMSAuthSchema,
    filterSchemaCask,
    filterSchemaDistillery,
    imageSchema,
    updatePasswordFormSchema,
    updatePasswordWithCheckPasswordCurrentSchema,
    cardPaymentSchema,
    caskMasterFormSchema,
    caskChildFormSchema,
    distilleryFormSchema,
} from "@/lib/validators";

describe("notificationSchema", () => {
    it("should validate default settings correctly", () => {
        const defaultData = {
            newlowestlisting: { inapp: true, email: true, percent: 5 },
            newhighestoffer: { inapp: true, email: true },
        };

        const result = notificationSchema.safeParse(defaultData);
        expect(result.success).toBe(true);
    });

    it("should fail if percent is less than 0", () => {
        const invalidData = {
            newlowestlisting: { inapp: true, email: true, percent: -1 },
        };

        const result = notificationSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("should fail if percent is greater than 100", () => {
        const invalidData = {
            newlowestlisting: { inapp: true, email: true, percent: 101 },
        };

        const result = notificationSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("should pass if percent is exactly 0 or 100", () => {
        const edgeData = {
            low: { inapp: true, email: true, percent: 0 },
            high: { inapp: true, email: true, percent: 100 },
        };

        const result = notificationSchema.safeParse(edgeData);
        expect(result.success).toBe(true);
    });

    it("should allow missing percent field", () => {
        const validData = {
            itemWithoutPercent: { inapp: true, email: true },
        };

        const result = notificationSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });
});

describe("signInFormSchema", () => {
    it("should validate correct sign-in data", () => {
        const validData = {
            email: "test@example.com",
            password: "Password123!",
            rememberMe: true,
        };

        const result = signInFormSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it("should fail with invalid email", () => {
        const invalidData = {
            email: "invalid-email",
            password: "Password123!",
        };

        const result = signInFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("should fail with short password", () => {
        const invalidData = {
            email: "test@example.com",
            password: "short",
        };

        const result = signInFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("should fail with empty email", () => {
        const invalidData = {
            email: "",
            password: "Password123!",
        };

        const result = signInFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("should accept optional rememberMe", () => {
        const validData = {
            email: "test@example.com",
            password: "Password123!",
        };

        const result = signInFormSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });
});

describe("forgotPasswordFormSchema", () => {
    it("should validate correct email", () => {
        const validData = { email: "test@example.com" };
        const result = forgotPasswordFormSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it("should fail with invalid email", () => {
        const invalidData = { email: "invalid-email" };
        const result = forgotPasswordFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("should fail with empty email", () => {
        const invalidData = { email: "" };
        const result = forgotPasswordFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe("checkPasswordSchemaTwoFA", () => {
    it("should validate correct password", () => {
        const validData = { password: "Password123!" };
        const result = checkPasswordSchemaTwoFA.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it("should fail with short password", () => {
        const invalidData = { password: "short" };
        const result = checkPasswordSchemaTwoFA.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("should fail with empty password", () => {
        const invalidData = { password: "" };
        const result = checkPasswordSchemaTwoFA.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe("searchSchema", () => {
    it("should validate with search term", () => {
        const validData = { search: "test query" };
        const result = searchSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it("should validate without search term", () => {
        const validData = {};
        const result = searchSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it("should validate with empty search", () => {
        const validData = { search: "" };
        const result = searchSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });
});

describe("resendVerifyUserSchema", () => {
    it("should validate correct email", () => {
        const result = resendVerifyUserSchema.safeParse({
            email: "test@example.com",
        });
        expect(result.success).toBe(true);
    });

    it("should fail with invalid email", () => {
        const result = resendVerifyUserSchema.safeParse({
            email: "invalid",
        });
        expect(result.success).toBe(false);
    });

    it("should fail with empty email", () => {
        const result = resendVerifyUserSchema.safeParse({ email: "" });
        expect(result.success).toBe(false);
    });
});

describe("updateProfileSchema", () => {
    it("should validate correct data", () => {
        const result = updateProfileSchema.safeParse({
            name: "John Doe",
            email: "john@example.com",
        });
        expect(result.success).toBe(true);
    });

    it("should fail with short name", () => {
        const result = updateProfileSchema.safeParse({
            name: "J",
            email: "john@example.com",
        });
        expect(result.success).toBe(false);
    });

    it("should fail with short email", () => {
        const result = updateProfileSchema.safeParse({
            name: "John Doe",
            email: "j",
        });
        expect(result.success).toBe(false);
    });
});

describe("userSchema", () => {
    it("should validate correct user data", () => {
        const result = userSchema.safeParse({
            email: "test@example.com",
            firstName: "John",
            id: "123",
            lastName: "Doe",
            phoneNumber: "+1234567890",
            createdDate: "2023-01-01",
        });
        expect(result.success).toBe(true);
    });

    it("should fail with missing fields", () => {
        const result = userSchema.safeParse({
            email: "test@example.com",
        });
        expect(result.success).toBe(false);
    });

    it("should fail with invalid email", () => {
        const result = userSchema.safeParse({
            email: "invalid",
            firstName: "John",
            id: "123",
            lastName: "Doe",
            phoneNumber: "+1234567890",
            createdDate: "2023-01-01",
        });
        expect(result.success).toBe(false);
    });
});

describe("setupGoogleAuthSchema", () => {
    it("should validate correct PIN", () => {
        const result = setupGoogleAuthSchema.safeParse({ pin: "123456" });
        expect(result.success).toBe(true);
    });

    it("should fail with short PIN", () => {
        const result = setupGoogleAuthSchema.safeParse({ pin: "12345" });
        expect(result.success).toBe(false);
    });

    it("should fail with empty PIN", () => {
        const result = setupGoogleAuthSchema.safeParse({ pin: "" });
        expect(result.success).toBe(false);
    });
});

describe("setupSMSAuthSchema", () => {
    it("should validate valid E.164 phone number", () => {
        const result = setupSMSAuthSchema.safeParse({
            phoneNumber: "+12345678901",
        });
        expect(result.success).toBe(true);
    });

    it("should fail invalid phone number", () => {
        const result = setupSMSAuthSchema.safeParse({ phoneNumber: "123" });
        expect(result.success).toBe(false);
    });
});

describe("signUpFormSchema (US license superRefine)", () => {
    const base = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "Password123!",
        consent: true,
    };

    it("should require TTB fields when phone is US", () => {
        const result = signUpFormSchema.safeParse({
            ...base,
            phoneNumber: "+14155552671",
        } as any);
        expect(result.success).toBe(false);
    });

    it("should pass when TTB fields are present for US phone", () => {
        const result = signUpFormSchema.safeParse({
            ...base,
            phoneNumber: "+14155552671",
            ttbLicenseNumber: "ABC123",
            ttbLicenseType: "type",
        } as any);
        expect(result.success).toBe(true);
    });

    it("should not require TTB fields for non-US phone", () => {
        const result = signUpFormSchema.safeParse({
            ...base,
            phoneNumber: "+84987654321",
        } as any);
        expect(result.success).toBe(true);
    });
});

describe("updatePasswordFormSchema", () => {
    it("should fail when confirmPassword mismatches newPassword", () => {
        const result = updatePasswordFormSchema.safeParse({
            newPassword: "Password123!",
            confirmPassword: "Password999!",
        });
        expect(result.success).toBe(false);
    });

    it("should pass when passwords match and meet rules", () => {
        const result = updatePasswordFormSchema.safeParse({
            newPassword: "Password123!",
            confirmPassword: "Password123!",
        });
        expect(result.success).toBe(true);
    });
});

describe("updatePasswordWithCheckPasswordCurrentSchema", () => {
    it("should fail when confirmPassword mismatches password", () => {
        const result = updatePasswordWithCheckPasswordCurrentSchema.safeParse({
            oldPassword: "OldPassword123!",
            password: "Password123!",
            confirmPassword: "Password999!",
        });
        expect(result.success).toBe(false);
    });

    it("should fail when new password equals old password", () => {
        const result = updatePasswordWithCheckPasswordCurrentSchema.safeParse({
            oldPassword: "Password123!",
            password: "Password123!",
            confirmPassword: "Password123!",
        });
        expect(result.success).toBe(false);
    });

    it("should pass when passwords valid, match, and differ from old password", () => {
        const result = updatePasswordWithCheckPasswordCurrentSchema.safeParse({
            oldPassword: "OldPassword123!",
            password: "Password123!",
            confirmPassword: "Password123!",
        });
        expect(result.success).toBe(true);
    });
});

describe("cardPaymentSchema", () => {
    it("should fail invalid cvv", () => {
        const result = cardPaymentSchema.safeParse({
            cardNumber: "1234567812345678",
            cardExpirationDate: "12/30",
            cardCvv: "12",
            cardHolderName: "John Doe",
            billingAddress: { country: "UK", address: "1 Test St" },
            zipCode: "12345",
        });
        expect(result.success).toBe(false);
    });

    it("should pass with 3-digit cvv", () => {
        const result = cardPaymentSchema.safeParse({
            cardNumber: "1234567812345678",
            cardExpirationDate: "12/30",
            cardCvv: "123",
            cardHolderName: "John Doe",
            billingAddress: { country: "UK", address: "1 Test St" },
            zipCode: "12345",
        });
        expect(result.success).toBe(true);
    });
});

describe("caskMasterFormSchema imageUrl", () => {
    it("should accept blob: and https:// imageUrl", () => {
        expect(
            caskMasterFormSchema.safeParse({
                name: "Cask Name",
                distilleryId: "d1",
                caskTypeId: "c1",
                regionId: "r1",
                classification: "cat",
                imageUrl: "blob:http://localhost:3000/abc",
            }).success
        ).toBe(true);

        expect(
            caskMasterFormSchema.safeParse({
                name: "Cask Name",
                distilleryId: "d1",
                caskTypeId: "c1",
                regionId: "r1",
                classification: "cat",
                imageUrl: "https://example.com/image.jpg",
            }).success
        ).toBe(true);
    });

    it("should reject non-blob/non-https imageUrl", () => {
        const result = caskMasterFormSchema.safeParse({
            name: "Cask Name",
            distilleryId: "d1",
            caskTypeId: "c1",
            regionId: "r1",
            classification: "cat",
            imageUrl: "/relative.png",
        });
        expect(result.success).toBe(false);
    });
});

describe("caskChildFormSchema priceReference", () => {
    it("should transform formatted strings to numbers", () => {
        const result = caskChildFormSchema.safeParse({
            description: "This is a long enough description.",
            priceReference: ["1,234.56", "2,000.00"],
            vintageYear: 2020,
            imageUrl: "https://example.com/image.jpg",
            readyToSell: true,
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.priceReference).toEqual([1234.56, 2000]);
        }
    });

    it("should fail when max <= min", () => {
        const result = caskChildFormSchema.safeParse({
            description: "This is a long enough description.",
            priceReference: ["2,000", "1,000"],
            vintageYear: 2020,
            imageUrl: "https://example.com/image.jpg",
            readyToSell: true,
        });
        expect(result.success).toBe(false);
    });
});

describe("distilleryFormSchema establishedYear", () => {
    it("should accept empty establishedYear", () => {
        const result = distilleryFormSchema.safeParse({
            name: "Distillery",
            summary: "This is a summary.",
            description: "This is a longer description.",
            image: "https://example.com/image.jpg",
        });
        expect(result.success).toBe(true);
    });

    it("should reject invalid establishedYear", () => {
        const result = distilleryFormSchema.safeParse({
            name: "Distillery",
            summary: "This is a summary.",
            description: "This is a longer description.",
            establishedYear: "12",
            image: "https://example.com/image.jpg",
        });
        expect(result.success).toBe(false);
    });

    it("should accept establishedYear within range", () => {
        const result = distilleryFormSchema.safeParse({
            name: "Distillery",
            summary: "This is a summary.",
            description: "This is a longer description.",
            establishedYear: "2000",
            image: "https://example.com/image.jpg",
        });
        expect(result.success).toBe(true);
    });
});

describe("filterSchemaCask", () => {
    it("should validate with all optional fields", () => {
        const result = filterSchemaCask.safeParse({
            distillery: ["d1", "d2"],
            caskType: ["type1"],
            year: ["2020", "2021"],
            abv: ["40", "50"],
            rla: ["100", "200"],
            bottles: ["10", "20"],
            price: ["1000", "5000"],
        });
        expect(result.success).toBe(true);
    });

    it("should validate with empty object", () => {
        const result = filterSchemaCask.safeParse({});
        expect(result.success).toBe(true);
    });

    it("should validate with partial fields", () => {
        const result = filterSchemaCask.safeParse({
            distillery: ["d1"],
        });
        expect(result.success).toBe(true);
    });
});

describe("filterSchemaDistillery", () => {
    it("should validate with all fields", () => {
        const result = filterSchemaDistillery.safeParse({
            countries: ["US", "UK"],
            regions: ["region1"],
            statuses: ["active"],
            companies: ["company1"],
        });
        expect(result.success).toBe(true);
    });

    it("should validate with empty object", () => {
        const result = filterSchemaDistillery.safeParse({});
        expect(result.success).toBe(true);
    });
});

describe("imageSchema", () => {
    it("should validate blob URL", () => {
        const result = imageSchema.safeParse("blob:http://localhost:3000/abc");
        expect(result.success).toBe(true);
    });

    it("should fail with non-blob URL", () => {
        const result = imageSchema.safeParse("https://example.com/image.jpg");
        expect(result.success).toBe(false);
    });

    it("should fail with empty string", () => {
        const result = imageSchema.safeParse("");
        expect(result.success).toBe(false);
    });
});
