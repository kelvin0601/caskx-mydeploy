// Mock query-string to avoid ESM issues
jest.mock("query-string", () => ({
    stringify: jest.fn((obj) =>
        Object.entries(obj)
            .map(([k, v]) => `${k}=${v}`)
            .join("&")
    ),
    parse: jest.fn((str) => Object.fromEntries(new URLSearchParams(str))),
}));

// Mock next/image
jest.mock("next/image", () => ({
    getImageProps: jest.fn(() => ({
        props: { src: "/test.jpg", srcSet: "/test.jpg 1x" },
    })),
}));

import {
    cn,
    convertToPlainObject,
    formatNumberWithDecimal,
    formatError,
    getErrorMessage,
    round2,
    formatCurrency,
    formatNumber,
    formatNumberToDecimal,
    formatNumberToNumber,
    formatDateYYYYMMDD,
    parseDateYYYYMMDD,
    getExpirationDays,
    formatId,
    formatDateTime,
    convertStringToLabel,
    formatPaymentMethod,
    getCheckoutStatusLabel,
    getCheckoutStatusBadgeVariant,
    isCheckoutStatusExpired,
    isCheckoutStatusTerminal,
    isEmpty,
    convertTextHidden,
    convertSpaceBetweenWords,
    handleCheckIsCurrentAuth,
    detectCardType,
    renderImagePlaceholder,
    isEqual,
    convertDateFormat,
    cleanString,
    cleanEmptyPayload,
    handleRenderFallbackText,
    formatBytes,
    isValidDecimal,
    handleSnakeCaseToSimpleText,
    handleStatusVariant,
    formatTimeAgo,
    parseDate,
} from "@/lib/utils";

describe("getExpirationDays()", () => {
    it("calculates the original expiration duration from the order timestamps", () => {
        expect(
            getExpirationDays(
                "2026-08-04T02:52:00.434Z",
                "2026-09-03T02:52:00.433Z"
            )
        ).toBe(30);
    });

    it("returns undefined when either timestamp is missing or invalid", () => {
        expect(getExpirationDays(undefined, "2026-09-03T02:52:00.433Z")).toBe(
            undefined
        );
        expect(getExpirationDays("invalid", "2026-09-03T02:52:00.433Z")).toBe(
            undefined
        );
    });

    it("returns undefined when expiration is not after creation", () => {
        expect(
            getExpirationDays(
                "2026-09-03T02:52:00.433Z",
                "2026-08-04T02:52:00.434Z"
            )
        ).toBe(undefined);
    });
});

// ============================================
// cn()
// ============================================
describe("cn()", () => {
    it("merges class names", () => {
        expect(cn("text-red-500", "bg-blue-500")).toBe(
            "text-red-500 bg-blue-500"
        );
    });

    it("handles conditional classes", () => {
        expect(cn("base", true && "conditional", false && "hidden")).toBe(
            "base conditional"
        );
    });

    it("deduplicates tailwind classes", () => {
        expect(cn("text-red-500 text-blue-500")).toBe("text-blue-500");
    });

    it("handles undefined and null", () => {
        expect(cn("base", undefined, null, "end")).toBe("base end");
    });

    it("handles empty input", () => {
        expect(cn()).toBe("");
    });
});

// ============================================
// convertToPlainObject()
// ============================================
describe("convertToPlainObject()", () => {
    it("converts object to plain JS object", () => {
        const obj = { a: 1, b: { c: 2 } };
        const result = convertToPlainObject(obj);
        expect(result).toEqual({ a: 1, b: { c: 2 } });
    });

    it("handles arrays", () => {
        const arr = [1, 2, 3];
        expect(convertToPlainObject(arr)).toEqual([1, 2, 3]);
    });

    it("handles nested objects", () => {
        const nested = { a: { b: { c: 1 } } };
        expect(convertToPlainObject(nested)).toEqual({ a: { b: { c: 1 } } });
    });
});

// ============================================
// formatNumberWithDecimal()
// ============================================
describe("formatNumberWithDecimal()", () => {
    it("formats integer with .00", () => {
        expect(formatNumberWithDecimal(100)).toBe("100.00");
    });

    it("formats decimal correctly", () => {
        expect(formatNumberWithDecimal(100.5)).toBe("100.50");
    });

    it("handles single decimal", () => {
        expect(formatNumberWithDecimal(100.1)).toBe("100.10");
    });

    it("handles zero", () => {
        expect(formatNumberWithDecimal(0)).toBe("0.00");
    });

    it("handles negative numbers", () => {
        expect(formatNumberWithDecimal(-50.25)).toBe("-50.25");
    });
});

// ============================================
// formatError() / getErrorMessage()
// ============================================
describe("getErrorMessage()", () => {
    it("returns fallback for undefined", () => {
        expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
    });

    it("extracts first message from message array", () => {
        expect(getErrorMessage({ message: ["First", "Second"] })).toBe("First");
    });

    it("extracts message string", () => {
        expect(getErrorMessage({ message: "Hello" })).toBe("Hello");
    });

    it("extracts nested error.message", () => {
        expect(getErrorMessage({ error: { message: "Nested" } })).toBe(
            "Nested"
        );
    });

    it("extracts error string", () => {
        expect(getErrorMessage({ error: "Bad Request" })).toBe("Bad Request");
    });

    it("extracts detail string", () => {
        expect(getErrorMessage({ detail: "More details" })).toBe(
            "More details"
        );
    });

    it("handles native Error", () => {
        expect(getErrorMessage(new Error("Boom"))).toBe("Boom");
    });

    it("handles string input", () => {
        expect(getErrorMessage("just a string")).toBe("just a string");
    });
});

describe("formatError()", () => {
    it("handles ZodError-like shape", () => {
        const err = {
            name: "ZodError",
            errors: {
                email: { message: "Invalid email" },
                password: { message: "Too short" },
            },
        };
        expect(formatError(err as any)).toBe("Invalid email. Too short");
    });

    it("handles Prisma P2002 unique constraint shape", () => {
        const err = {
            name: "PrismaClientKnownRequestError",
            code: "P2002",
            meta: { target: ["email"] },
        };
        expect(formatError(err as any)).toBe("Email already exists.");
    });
});

// ============================================
// round2()
// ============================================
describe("round2()", () => {
    it("rounds number to 2 decimal places", () => {
        expect(round2(10.567)).toBe(10.57);
    });

    it("handles string input", () => {
        expect(round2("10.567")).toBe(10.57);
    });

    it("handles integer input", () => {
        expect(round2(10)).toBe(10);
    });

    it("throws for invalid type", () => {
        expect(() => round2(null as any)).toThrow(
            "Value's type is not string or number."
        );
    });

    it("handles floating point precision", () => {
        expect(round2(1.005)).toBe(1.01);
    });
});

// ============================================
// formatCurrency()
// ============================================
describe("formatCurrency()", () => {
    it("formats number with decimals", () => {
        const result = formatCurrency(1234.56);
        expect(result).toContain("1,234.56");
    });

    it("formats number without decimals", () => {
        const result = formatCurrency(1234);
        expect(result).toContain("1,234");
    });

    it("formats string number", () => {
        const result = formatCurrency("1234.56");
        expect(result).toContain("1,234.56");
    });

    it("handles null", () => {
        expect(formatCurrency(null)).toBe("NaN");
    });

    it("handles undefined", () => {
        expect(formatCurrency(undefined)).toBe("NaN");
    });

    it("handles NaN", () => {
        expect(formatCurrency("abc")).toBe("NaN");
    });

    it("handles zero", () => {
        const result = formatCurrency(0);
        expect(result).toContain("0");
    });
});

// ============================================
// formatNumber()
// ============================================
describe("formatNumber()", () => {
    it("formats number with commas", () => {
        expect(formatNumber(1234567)).toBe("1,234,567");
    });

    it("formats small number", () => {
        expect(formatNumber(100)).toBe("100");
    });

    it("handles zero", () => {
        expect(formatNumber(0)).toBe("0");
    });
});

// ============================================
// formatNumberToDecimal()
// ============================================
describe("formatNumberToDecimal()", () => {
    it("formats number with commas", () => {
        expect(formatNumberToDecimal("1234567")).toBe("1,234,567");
    });

    it("formats decimal number", () => {
        expect(formatNumberToDecimal("1234.56")).toBe("1,234.56");
    });

    it("handles empty string", () => {
        expect(formatNumberToDecimal("")).toBe("");
    });

    it("disables decimal", () => {
        // isDisableDecimal removes commas, not decimal points
        expect(formatNumberToDecimal("1234.56", true)).toBe("1234.56");
    });

    it("disables comma", () => {
        // isDisableCommon removes decimal points, not commas
        expect(formatNumberToDecimal("1,234.56", false, true)).toBe("1,23456");
    });

    it("disables both decimal and comma", () => {
        expect(formatNumberToDecimal("1,234.56", true, true)).toBe("123456");
    });

    it("handles multiple decimal points", () => {
        expect(formatNumberToDecimal("1.2.3")).toBe("1.23");
    });
});

// ============================================
// formatNumberToNumber()
// ============================================
describe("formatNumberToNumber()", () => {
    it("converts formatted string to number", () => {
        expect(formatNumberToNumber("1,234.56")).toBe(1234.56);
    });

    it("handles plain number string", () => {
        expect(formatNumberToNumber("1234")).toBe(1234);
    });

    it("handles empty string", () => {
        expect(formatNumberToNumber("")).toBe(0);
    });
});

// ============================================
// formatDateYYYYMMDD()
// ============================================
describe("formatDateYYYYMMDD()", () => {
    it("formats date correctly", () => {
        const date = new Date(2023, 9, 25); // Oct 25, 2023
        expect(formatDateYYYYMMDD(date)).toBe("2023-10-25");
    });

    it("handles undefined", () => {
        expect(formatDateYYYYMMDD(undefined)).toBe("");
    });

    it("handles invalid date", () => {
        expect(formatDateYYYYMMDD(new Date("invalid"))).toBe("");
    });
});

// ============================================
// parseDateYYYYMMDD()
// ============================================
describe("parseDateYYYYMMDD()", () => {
    it("parses date string correctly", () => {
        const result = parseDateYYYYMMDD("2023-10-25");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getFullYear()).toBe(2023);
        expect(result?.getMonth()).toBe(9); // October is 9
        expect(result?.getDate()).toBe(25);
    });

    it("handles undefined", () => {
        expect(parseDateYYYYMMDD(undefined)).toBeUndefined();
    });

    it("handles invalid format", () => {
        expect(parseDateYYYYMMDD("invalid")).toBeUndefined();
    });
});

// ============================================
// formatId()
// ============================================
describe("formatId()", () => {
    it("shortens long ID", () => {
        expect(formatId("abc123def456")).toBe("..def456");
    });

    it("keeps short ID as is", () => {
        expect(formatId("abc123")).toBe("abc123");
    });

    it("handles undefined", () => {
        expect(formatId(undefined)).toBe("");
    });

    it("handles null", () => {
        expect(formatId(null)).toBe("");
    });

    it("handles empty string", () => {
        expect(formatId("")).toBe("");
    });

    it("trims whitespace", () => {
        expect(formatId("  abc123def456  ")).toBe("..def456");
    });
});

// ============================================
// formatDateTime()
// ============================================
describe("formatDateTime()", () => {
    it("returns dashes for undefined", () => {
        const result = formatDateTime(undefined);
        expect(result.dateTime).toBe("-");
        expect(result.dateOnly).toBe("-");
        expect(result.timeOnly).toBe("-");
    });

    it("returns dashes for null", () => {
        const result = formatDateTime(null as any);
        expect(result.dateTime).toBe("-");
    });

    it("formats date string correctly", () => {
        const result = formatDateTime("2023-10-25T10:30:00");
        expect(result.dateTime).toBeDefined();
        expect(result.dateOnly).toBeDefined();
        expect(result.timeOnly).toBeDefined();
    });

    it("returns all expected fields", () => {
        const result = formatDateTime("2023-10-25T10:30:00");
        expect(result).toHaveProperty("dateTime");
        expect(result).toHaveProperty("dateOnly");
        expect(result).toHaveProperty("timeOnly");
        expect(result).toHaveProperty("dataOnlyNumber");
        expect(result).toHaveProperty("daysTime");
        expect(result).toHaveProperty("formatDateYYYYMMDD");
    });
});

// ============================================
// convertStringToLabel()
// ============================================
describe("convertStringToLabel()", () => {
    it("converts space-separated words to hyphenated", () => {
        expect(convertStringToLabel("Hello World")).toBe("hello-world");
    });

    it("handles single word", () => {
        expect(convertStringToLabel("Hello")).toBe("hello");
    });

    it("handles multiple spaces", () => {
        expect(convertStringToLabel("Hello World Test")).toBe(
            "hello-world-test"
        );
    });
});

// ============================================
// formatPaymentMethod()
// ============================================
describe("formatPaymentMethod()", () => {
    it("formats stripe", () => {
        expect(formatPaymentMethod("stripe")).toBe("Stripe");
    });

    it("formats manual_transfer", () => {
        expect(formatPaymentMethod("manual_transfer")).toBe("Manual Transfer");
    });

    it("formats pay_later", () => {
        expect(formatPaymentMethod("pay_later")).toBe("Pay Later");
    });

    it("handles null", () => {
        expect(formatPaymentMethod(null)).toBe("N/A");
    });

    it("handles undefined", () => {
        expect(formatPaymentMethod(undefined)).toBe("N/A");
    });

    it("formats unknown method", () => {
        expect(formatPaymentMethod("bank_transfer")).toBe("Bank Transfer");
    });
});

// ============================================
// getCheckoutStatusLabel()
// ============================================
describe("getCheckoutStatusLabel()", () => {
    it("returns correct label for pending", () => {
        expect(getCheckoutStatusLabel("pending")).toBe("Pending");
    });

    it("returns correct label for deposit_paid", () => {
        expect(getCheckoutStatusLabel("deposit_paid")).toBe("Deposit Paid");
    });

    it("returns correct label for completed", () => {
        expect(getCheckoutStatusLabel("completed")).toBe("Completed");
    });

    it("returns correct label for expired", () => {
        expect(getCheckoutStatusLabel("expired")).toBe("Expired");
    });

    it("returns correct label for deposit_expired", () => {
        expect(getCheckoutStatusLabel("deposit_expired")).toBe(
            "Deposit Expired"
        );
    });

    it("returns correct label for agreement_expired", () => {
        expect(getCheckoutStatusLabel("agreement_expired")).toBe(
            "Agreement Expired"
        );
    });

    it("returns correct label for invoice_expired", () => {
        expect(getCheckoutStatusLabel("invoice_expired")).toBe(
            "Invoice Expired"
        );
    });

    it("returns correct label for cancelled", () => {
        expect(getCheckoutStatusLabel("cancelled")).toBe("Cancelled");
    });

    it("falls back to snake case conversion for unknown", () => {
        expect(getCheckoutStatusLabel("new_status")).toBeDefined();
    });
});

// ============================================
// isCheckoutStatusExpired() & isCheckoutStatusTerminal()
// ============================================
describe("isCheckoutStatusExpired()", () => {
    it("returns true for expired checkout statuses", () => {
        expect(isCheckoutStatusExpired("expired")).toBe(true);
        expect(isCheckoutStatusExpired("deposit_expired")).toBe(true);
        expect(isCheckoutStatusExpired("agreement_expired")).toBe(true);
        expect(isCheckoutStatusExpired("invoice_expired")).toBe(true);
    });

    it("returns false for non-expired checkout statuses", () => {
        expect(isCheckoutStatusExpired("pending")).toBe(false);
        expect(isCheckoutStatusExpired("deposit_paid")).toBe(false);
        expect(isCheckoutStatusExpired("agreement_signed")).toBe(false);
        expect(isCheckoutStatusExpired("invoice_paid")).toBe(false);
        expect(isCheckoutStatusExpired("completed")).toBe(false);
        expect(isCheckoutStatusExpired("cancelled")).toBe(false);
        expect(isCheckoutStatusExpired(null)).toBe(false);
        expect(isCheckoutStatusExpired(undefined)).toBe(false);
    });
});

describe("isCheckoutStatusTerminal()", () => {
    it("returns true for cancelled and expired checkout statuses", () => {
        expect(isCheckoutStatusTerminal("cancelled")).toBe(true);
        expect(isCheckoutStatusTerminal("expired")).toBe(true);
        expect(isCheckoutStatusTerminal("deposit_expired")).toBe(true);
        expect(isCheckoutStatusTerminal("agreement_expired")).toBe(true);
        expect(isCheckoutStatusTerminal("invoice_expired")).toBe(true);
    });

    it("returns false for active checkout statuses", () => {
        expect(isCheckoutStatusTerminal("pending")).toBe(false);
        expect(isCheckoutStatusTerminal("deposit_paid")).toBe(false);
        expect(isCheckoutStatusTerminal("completed")).toBe(false);
        expect(isCheckoutStatusTerminal(null)).toBe(false);
        expect(isCheckoutStatusTerminal(undefined)).toBe(false);
    });
});

// ============================================
// isEmpty()
// ============================================
describe("isEmpty()", () => {
    it("returns true for undefined", () => {
        expect(isEmpty(undefined)).toBe(true);
    });

    it("returns true for null", () => {
        expect(isEmpty(null)).toBe(true);
    });

    it("returns true for empty string", () => {
        expect(isEmpty("")).toBe(true);
    });

    it("returns false for non-empty string", () => {
        expect(isEmpty("hello")).toBe(false);
    });

    it("returns true for empty array", () => {
        expect(isEmpty([])).toBe(true);
    });

    it("returns false for non-empty array", () => {
        expect(isEmpty([1, 2])).toBe(false);
    });

    it("returns true for empty object", () => {
        expect(isEmpty({})).toBe(true);
    });

    it("returns false for non-empty object", () => {
        expect(isEmpty({ a: 1 })).toBe(false);
    });

    it("deep checks nested empty objects", () => {
        expect(isEmpty({ a: {}, b: {} }, true)).toBe(true);
    });

    it("deep checks nested non-empty objects", () => {
        expect(isEmpty({ a: { b: 1 } }, true)).toBe(false);
    });

    it("deep checks arrays with empty items", () => {
        expect(isEmpty([{}, ""], true)).toBe(true);
    });

    it("returns false for number", () => {
        expect(isEmpty(0)).toBe(false);
    });

    it("returns false for boolean", () => {
        expect(isEmpty(false)).toBe(false);
    });
});

// ============================================
// convertTextHidden()
// ============================================
describe("convertTextHidden()", () => {
    it("masks non-email text", () => {
        expect(convertTextHidden("12345", 3)).toBe("***345");
    });

    it("masks email username with repeat param", () => {
        expect(convertTextHidden("john@example.com", 2)).toBe(
            "jo**n@example.com"
        );
    });

    it("handles short email username with repeat param", () => {
        expect(convertTextHidden("ab@example.com", 2)).toBe("ab@example.com");
    });

    it("returns empty for undefined repeat", () => {
        expect(convertTextHidden("test")).toBe("");
    });

    it("returns empty for negative repeat", () => {
        expect(convertTextHidden("test", -1)).toBe("");
    });

    it("returns empty for empty text", () => {
        expect(convertTextHidden("", 3)).toBe("");
    });
});

// ============================================
// convertSpaceBetweenWords()
// ============================================
describe("convertSpaceBetweenWords()", () => {
    it("adds space after every wordCount characters", () => {
        expect(
            convertSpaceBetweenWords({ text: "123456789", wordCount: 4 })
        ).toBe("1234 5678 9");
    });

    it("handles exact word count", () => {
        expect(convertSpaceBetweenWords({ text: "1234", wordCount: 4 })).toBe(
            "1234 "
        );
    });
});

// ============================================
// handleCheckIsCurrentAuth()
// ============================================
describe("handleCheckIsCurrentAuth()", () => {
    it("returns enabled for app method", () => {
        const result = handleCheckIsCurrentAuth(["app"]);
        expect(result.isEnabled).toBe(true);
        expect(result.isApp).toBe(true);
        expect(result.isSms).toBe(false);
    });

    it("returns enabled for sms method", () => {
        const result = handleCheckIsCurrentAuth(["sms"]);
        expect(result.isEnabled).toBe(true);
        expect(result.isApp).toBe(false);
        expect(result.isSms).toBe(true);
    });

    it("returns disabled for empty array", () => {
        const result = handleCheckIsCurrentAuth([]);
        expect(result.isEnabled).toBe(false);
    });

    it("returns disabled for no methods", () => {
        const result = handleCheckIsCurrentAuth();
        expect(result.isEnabled).toBe(false);
    });

    it("handles both app and sms", () => {
        const result = handleCheckIsCurrentAuth(["app", "sms"]);
        expect(result.isApp).toBe(true);
        expect(result.isSms).toBe(true);
    });
});

// ============================================
// detectCardType()
// ============================================
describe("detectCardType()", () => {
    it("detects visa", () => {
        expect(detectCardType("4111111111111111")).toBe("visa");
    });

    it("detects mastercard", () => {
        expect(detectCardType("5111111111111111")).toBe("mastercard");
    });

    it("detects amex", () => {
        expect(detectCardType("371111111111111")).toBe("amex");
    });

    it("returns undefined for unknown", () => {
        expect(detectCardType("1234567890123456")).toBeUndefined();
    });

    it("detects discover", () => {
        expect(detectCardType("6011111111111111")).toBe("discover");
    });
});

// ============================================
// renderImagePlaceholder()
// ============================================
describe("renderImagePlaceholder()", () => {
    it("returns default placeholder", () => {
        expect(renderImagePlaceholder()).toBe("/images/placeholder_img.jpg");
    });

    it("returns image placeholder", () => {
        expect(renderImagePlaceholder("image")).toBe(
            "/images/placeholder_img.jpg"
        );
    });

    it("returns cask placeholder", () => {
        expect(renderImagePlaceholder("cask")).toBe(
            "/images/placeholder_cask.jpg"
        );
    });

    it("returns user placeholder", () => {
        expect(renderImagePlaceholder("user")).toBe(
            "/images/placeholder_user.jpg"
        );
    });
});

// ============================================
// isEqual()
// ============================================
describe("isEqual()", () => {
    it("returns true for equal primitives", () => {
        expect(isEqual(1, 1)).toBe(true);
        expect(isEqual("a", "a")).toBe(true);
        expect(isEqual(true, true)).toBe(true);
    });

    it("returns false for different primitives", () => {
        expect(isEqual(1, 2)).toBe(false);
        expect(isEqual("a", "b")).toBe(false);
    });

    it("returns true for equal objects", () => {
        expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it("returns false for different objects", () => {
        expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it("returns true for equal arrays", () => {
        expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it("returns false for different arrays", () => {
        expect(isEqual([1, 2], [1, 3])).toBe(false);
    });

    it("returns false for different lengths", () => {
        expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it("handles nested objects", () => {
        expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    });

    it("returns false for null vs object", () => {
        expect(isEqual(null, {})).toBe(false);
    });

    it("returns true for null === null", () => {
        expect(isEqual(null, null)).toBe(true);
    });
});

// ============================================
// convertDateFormat()
// ============================================
describe("convertDateFormat()", () => {
    it("converts dd-mm-yyyy to yyyy-mm-dd", () => {
        expect(convertDateFormat("25-10-2023")).toBe("2023-10-25");
    });

    it("keeps yyyy-mm-dd format", () => {
        expect(convertDateFormat("2023-10-25")).toBe("2023-10-25");
    });

    it("handles 2-digit year", () => {
        expect(convertDateFormat("25-10-23")).toBe("2023-10-25");
    });

    it("handles empty string", () => {
        expect(convertDateFormat("")).toBe("");
    });
});

// ============================================
// cleanString()
// ============================================
describe("cleanString()", () => {
    it("removes special characters", () => {
        expect(cleanString("Hello, World!")).toBe("helloworld");
    });

    it("converts to lowercase", () => {
        expect(cleanString("ABC")).toBe("abc");
    });

    it("keeps alphanumeric", () => {
        expect(cleanString("abc123")).toBe("abc123");
    });
});

// ============================================
// cleanEmptyPayload()
// ============================================
describe("cleanEmptyPayload()", () => {
    it("removes empty strings", () => {
        expect(cleanEmptyPayload({ a: "", b: "value" })).toEqual({
            b: "value",
        });
    });

    it("removes null values", () => {
        expect(cleanEmptyPayload({ a: null, b: "value" })).toEqual({
            b: "value",
        });
    });

    it("removes undefined values", () => {
        expect(cleanEmptyPayload({ a: undefined, b: "value" })).toEqual({
            b: "value",
        });
    });

    it("handles nested objects", () => {
        expect(
            cleanEmptyPayload({ a: { b: "", c: "value" }, d: "test" })
        ).toEqual({ a: { c: "value" }, d: "test" });
    });

    it("handles arrays", () => {
        expect(cleanEmptyPayload([1, "", null, 2])).toEqual([1, 2]);
    });

    it("keeps empty arrays in objects", () => {
        expect(cleanEmptyPayload({ a: [], b: "value" })).toEqual({
            a: [],
            b: "value",
        });
    });

    it("handles null input", () => {
        expect(cleanEmptyPayload(null)).toBeNull();
    });

    it("handles primitive input", () => {
        expect(cleanEmptyPayload("test")).toBe("test");
    });
});

// ============================================
// handleRenderFallbackText()
// ============================================
describe("handleRenderFallbackText()", () => {
    it("returns text when provided", () => {
        expect(handleRenderFallbackText("hello")).toBe("hello");
    });

    it("returns dash for undefined", () => {
        expect(handleRenderFallbackText(undefined)).toBe("-");
    });

    it("returns dash for empty string", () => {
        expect(handleRenderFallbackText("")).toBe("-");
    });
});

// ============================================
// formatBytes()
// ============================================
describe("formatBytes()", () => {
    it("formats bytes", () => {
        expect(formatBytes(0)).toBe("0 Byte");
    });

    it("formats KB", () => {
        expect(formatBytes(1024)).toBe("1 KB");
    });

    it("formats MB", () => {
        expect(formatBytes(1048576)).toBe("1 MB");
    });

    it("formats GB", () => {
        expect(formatBytes(1073741824)).toBe("1 GB");
    });
});

// ============================================
// isValidDecimal()
// ============================================
describe("isValidDecimal()", () => {
    it("validates decimal number", () => {
        expect(isValidDecimal("123.45")).toBeUndefined();
    });

    it("validates integer", () => {
        expect(isValidDecimal("123")).toBeUndefined();
    });

    it("validates with commas", () => {
        expect(isValidDecimal("1,234.56")).toBeUndefined();
    });

    it("returns true for invalid", () => {
        expect(isValidDecimal("abc")).toBe(true);
    });
});

// ============================================
// formatTimeAgo()
// ============================================
describe("formatTimeAgo()", () => {
    it("returns empty string when date is null, undefined, or empty", () => {
        expect(formatTimeAgo(null)).toBe("");
        expect(formatTimeAgo(undefined)).toBe("");
        expect(formatTimeAgo("")).toBe("");
    });

    it("returns empty string for invalid date string", () => {
        expect(formatTimeAgo("invalid-date")).toBe("");
    });

    it("returns 'Just now' for seconds difference", () => {
        const date = new Date(Date.now() - 30 * 1000);
        expect(formatTimeAgo(date)).toBe("Just now");
        expect(formatTimeAgo(date.toISOString())).toBe("Just now");
    });

    it("returns minutes ago", () => {
        const date = new Date(Date.now() - 5 * 60 * 1000);
        expect(formatTimeAgo(date)).toBe("5m ago");
    });

    it("returns hours ago", () => {
        const date = new Date(Date.now() - 3 * 3600 * 1000);
        expect(formatTimeAgo(date)).toBe("3h ago");
    });

    it("returns days ago", () => {
        const date = new Date(Date.now() - 4 * 86400 * 1000);
        expect(formatTimeAgo(date)).toBe("4d ago");
    });

    it("returns weeks ago", () => {
        const date = new Date(Date.now() - 14 * 86400 * 1000);
        expect(formatTimeAgo(date)).toBe("2w ago");
    });

    it("returns formatted month and day for dates 4+ weeks ago", () => {
        const fixedNow = new Date("2026-09-07T12:00:00Z");
        jest.useFakeTimers().setSystemTime(fixedNow);

        const pastDate = new Date("2026-01-15T12:00:00Z");
        expect(formatTimeAgo(pastDate)).toBe("Jan 15");

        jest.useRealTimers();
    });

    it("formats older dates using provided locale", () => {
        const fixedNow = new Date("2026-09-07T12:00:00Z");
        jest.useFakeTimers().setSystemTime(fixedNow);

        const pastDate = new Date("2026-01-15T12:00:00Z");
        const formattedEn = formatTimeAgo(pastDate, "en-US");
        expect(formattedEn).toBe("Jan 15");

        const formattedVi = formatTimeAgo(pastDate, "vi-VN");
        expect(formattedVi).toContain("15");

        jest.useRealTimers();
    });

    it("includes year for dates in different year", () => {
        const fixedNow = new Date("2026-09-07T12:00:00Z");
        jest.useFakeTimers().setSystemTime(fixedNow);

        const lastYearDate = new Date("2024-05-20T12:00:00Z");
        const formatted = formatTimeAgo(lastYearDate, "en-US");
        expect(formatted).toContain("2024");

        jest.useRealTimers();
    });
});

// ============================================
// parseDate()
// ============================================
describe("parseDate()", () => {
    it("returns null for null, undefined, empty string or whitespace", () => {
        expect(parseDate(null)).toBeNull();
        expect(parseDate(undefined)).toBeNull();
        expect(parseDate("")).toBeNull();
        expect(parseDate("   ")).toBeNull();
    });

    it("returns null for invalid date string", () => {
        expect(parseDate("invalid-date-string")).toBeNull();
    });

    it("returns existing Date instance or null if invalid Date", () => {
        const valid = new Date("2026-09-07T12:00:00Z");
        expect(parseDate(valid)).toBe(valid);

        const invalid = new Date("invalid");
        expect(parseDate(invalid)).toBeNull();
    });

    it("correctly parses UTC strings with Z", () => {
        const date = parseDate("2026-09-07T12:00:00Z");
        expect(date).not.toBeNull();
        expect(date?.toISOString()).toBe("2026-09-07T12:00:00.000Z");
    });

    it("treats ISO datetime strings without timezone as UTC", () => {
        const date = parseDate("2026-09-07T12:00:00");
        expect(date).not.toBeNull();
        expect(date?.toISOString()).toBe("2026-09-07T12:00:00.000Z");
    });
});
