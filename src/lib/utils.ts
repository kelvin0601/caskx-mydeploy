import { CHECKOUT_STATUS } from "@/enum/checkout";
import { EBadgeVariant } from "@/enum/transaction";
import { PATH_API_FE_DOWNLOAD, PATH_API_FE_PROXY } from "@/lib/constants/path";
import { caskAsk } from "@/types/cask-ask";
import { stripe } from "@/types/stripe";
import { AxiosError, AxiosResponse, isAxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { getImageProps } from "next/image";
import qs from "query-string";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { DEFAULT_FALLBACK_TEXT } from "./constants";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Convert prisma object into a regular JS object
export function convertToPlainObject<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

// Format number with decimal place
export function formatNumberWithDecimal(num: number): string {
    const [int, decimal] = num.toString().split(".");
    return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

// Helper to handle pluralization
export function pluralize(count: number, singular: string) {
    if (count === 1) return singular;
    return `${singular}s`;
}

// Format error (server-side helpers)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
    if (error?.name === "ZodError") {
        // Handle Zod errors here
        const fieldErrors = Object.keys(error.errors || {}).map(
            (field) => error.errors[field].message
        );
        return fieldErrors.join(". ");
    } else if (
        error?.name === "PrismaClientKnownRequestError" &&
        error.code === "P2002"
    ) {
        // Handle Prisma errors here
        const field = error.meta?.target ? error.meta.target[0] : "Field";
        return `${
            (field as string).charAt(0).toUpperCase() +
            (field as string).slice(1)
        } already exists.`;
    } else {
        return getErrorMessage(error);
    }
}

// Unified error message extractor for client & server
export function getErrorMessage(
    error: unknown,
    fallback = "Something went wrong"
): string {
    if (!error) return fallback;

    // Helper to extract from a plain object / response body
    const extractFromObject = (src: unknown): string | null => {
        if (!src || typeof src !== "object") return null;

        const obj = src as {
            message?: unknown;
            error?: unknown;
            detail?: unknown;
        };

        // message: string[]
        if (Array.isArray(obj.message) && obj.message.length > 0) {
            const first = obj.message[0];
            if (typeof first === "string" && first.trim()) {
                return first;
            }
        }

        // message: string
        if (typeof obj.message === "string" && obj.message.trim()) {
            return obj.message;
        }
        if (
            typeof obj.error == "object" &&
            (obj.error as { message?: string })?.message
        ) {
            return (obj.error as { message?: string })?.message || null;
        }

        // error: string
        if (typeof obj.error === "string" && obj.error.trim()) {
            return obj.error;
        }

        // detail: string
        if (typeof obj.detail === "string" && obj.detail.trim()) {
            return obj.detail;
        }

        return null;
    };

    // AxiosError with common API error shapes
    if (isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const fromData = extractFromObject(axiosError.response?.data);
        if (fromData) return fromData;

        if (axiosError.message) {
            return axiosError.message;
        }
    }

    // Native Error
    if (error instanceof Error) {
        if (error.message) return error.message;
    }

    // Direct API-style object (non-Axios)
    const fromObject = extractFromObject(error);
    if (fromObject) return fromObject;

    // String message
    if (typeof error === "string") {
        return error || fallback;
    }

    try {
        return JSON.stringify(error) || fallback;
    } catch {
        return fallback;
    }
}

// Round number to 2 number places
export function round2(value: number | string): number {
    if (typeof value === "number") {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    } else if (typeof value === "string") {
        return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
    } else {
        throw new Error("Value's type is not string or number.");
    }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    style: "currency",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const CURRENCY_FORMATTER_NO_DECIMALS = new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    style: "currency",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

// Format currency using the formater above
export function formatCurrency(amount: number | string | null | undefined) {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
        return "NaN";
    }
    if (typeof amount === "number") {
        // Get the decimal part of the number
        const decimalPart = amount % 1;

        // If decimal part is greater than 0.1, show with decimals
        if (decimalPart > 0.1) {
            return CURRENCY_FORMATTER.format(amount);
        } else {
            // Otherwise, show without decimals (rounded)
            return CURRENCY_FORMATTER_NO_DECIMALS.format(Math.round(amount));
        }
    } else if (typeof amount === "string") {
        const numAmount = Number(amount);

        const decimalPart = numAmount % 1;

        if (decimalPart > 0.1) {
            return CURRENCY_FORMATTER.format(numAmount);
        } else {
            return CURRENCY_FORMATTER_NO_DECIMALS.format(Math.round(numAmount));
        }
    } else {
        return "NaN";
    }
}

// Format Number
const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

export function formatNumber(number: number) {
    return NUMBER_FORMATTER.format(number);
}
export const formatNumberToDecimal = (
    value = "",
    isDisableDecimal = false,
    isDisableCommon = false
) => {
    // Handle disabled decimal and comma cases
    if (isDisableDecimal && isDisableCommon) {
        return value.replace(/[,\.]/g, "");
    }
    if (isDisableDecimal) {
        return value.replace(/[,]/g, "");
    }
    if (isDisableCommon) {
        return value.replace(/[.]/g, "");
    }

    // Clean and format the number
    const cleanValue = value.replace(/,/g, "").replace(/(\..*?)\./g, "$1");

    if (cleanValue === "") return "";

    // Split number by decimal point
    const [integerPart, decimalPart] = cleanValue.split(".");
    if (
        decimalPart !== "0" &&
        decimalPart !== "00" &&
        decimalPart?.length > 0 &&
        decimalPart?.endsWith("0")
    ) {
        return `${integerPart}.${decimalPart.slice(0, -1)}`;
    }
    // Format integer part with commas
    const formattedInteger = !isNaN(Number(integerPart))
        ? Number(integerPart).toLocaleString("en-US")
        : "";

    // Return formatted number with decimal if exists
    return decimalPart !== undefined && decimalPart !== "0"
        ? `${formattedInteger}.${decimalPart}`
        : formattedInteger;
};
export const formatNumberToNumber = (value = "") => {
    return Number(value.replace(/,/g, "").replace(/(\..*?)\./g, "$1"));
};

// Format Date -> YYYY-MM-DD (used by cask forms)
export function formatDateYYYYMMDD(date?: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Parse YYYY-MM-DD -> Date (used by cask forms)
export function parseDateYYYYMMDD(dateString?: string): Date | undefined {
    if (!dateString) return undefined;
    const [year, month, day] = dateString.split("-").map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
    return new Date(year, month - 1, day);
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function getExpirationDays(
    createdAt?: Date | string,
    expirationDate?: Date | string
): number | undefined {
    if (!createdAt || !expirationDate) return undefined;

    const createdTime = new Date(createdAt).getTime();
    const expirationTime = new Date(expirationDate).getTime();
    if (
        Number.isNaN(createdTime) ||
        Number.isNaN(expirationTime) ||
        expirationTime <= createdTime
    ) {
        return undefined;
    }

    return Math.max(
        1,
        Math.round((expirationTime - createdTime) / MILLISECONDS_PER_DAY)
    );
}

// Shorten UUID
export function formatId(id?: string | null) {
    if (!id) {
        return "";
    }

    const value = id.trim();

    if (value.length <= 6) {
        return value;
    }

    return `..${value.substring(value.length - 6)}`;
}

export const formatDateTime = (dateString?: Date | string) => {
    if (!dateString)
        return {
            dateTime: "-",
            dateOnly: "-",
            timeOnly: "-",
            dataOnlyNumber: "-",
            daysTime: "-",
        };
    const dateTimeOptions: Intl.DateTimeFormatOptions = {
        month: "short", // abbreviated month name (e.g., 'Oct')
        year: "numeric", // abbreviated month name (e.g., 'Oct')
        day: "numeric", // numeric day of the month (e.g., '25')
        hour: "numeric", // numeric hour (e.g., '8')
        minute: "numeric", // numeric minute (e.g., '30')
        hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    };
    const dateOptions: Intl.DateTimeFormatOptions = {
        month: "short", // abbreviated month name (e.g., 'Oct')
        year: "numeric", // numeric year (e.g., '2023')
        day: "numeric", // numeric day of the month (e.g., '25')
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric", // numeric hour (e.g., '8')
        minute: "numeric", // numeric minute (e.g., '30')
        hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    };
    const timeOptions24: Intl.DateTimeFormatOptions = {
        hour: "numeric", // numeric hour (e.g., '8')
        minute: "numeric", // numeric minute (e.g., '30')
        hourCycle: "h24", // 24-hour clock
        hour12: false,
    };

    const formattedDateTime: string = new Date(dateString).toLocaleString(
        "en-US",
        dateTimeOptions
    );
    const formattedDate: string = new Date(dateString).toLocaleString(
        "en-US",
        dateOptions
    );
    const formattedTime: string = new Date(dateString).toLocaleString(
        "en-US",
        timeOptions
    );
    const formattedTime24: string = new Date(dateString).toLocaleString(
        "en-US",
        timeOptions24
    );
    const formattedDayWithTime = new Date(dateString).toLocaleDateString(
        "en-US",
        {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }
    );
    const formattedDateNumber = new Date(dateString).toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }
    );
    const formatTimeOnly = new Date(dateString).toLocaleTimeString(
        "en-US",
        timeOptions
    );

    const formatDateYYYYMMDD = (date?: Date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime()))
            return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    return {
        dateTime: formattedDateTime, //May 23, 2025 10:30 AM
        dateOnly: formattedDate, //May 23, 2025
        timeOnly: formattedTime, //10:30 AM
        timeOnly24: formattedTime24,
        dataOnlyNumber: formattedDateNumber, //23/05/2025
        daysTime: formattedDayWithTime, //May 23, 2025 10:30 AM
        formatDateYYYYMMDD: formatDateYYYYMMDD(dateString as Date), //2025-05-23
        formatTimeOnly: formatTimeOnly,
    };
};

/**
 * Safely parses a date input into a Date object, handling UTC ISO strings without trailing 'Z'.
 */
export function parseDate(dateInput?: Date | string | null): Date | null {
    if (!dateInput) return null;
    if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? null : dateInput;
    }
    if (typeof dateInput !== "string") return null;
    const trimmed = dateInput.trim();
    if (!trimmed) return null;

    // If date string has time component but no timezone indicator (no 'Z' and no [+-]HH:mm), treat as UTC
    const hasTimezone = /Z|[+-]\d{2}(?::?\d{2})?$/i.test(trimmed);
    const isoString =
        !hasTimezone && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(trimmed)
            ? trimmed.replace(" ", "T") + "Z"
            : trimmed;

    const parsed = new Date(isoString);
    return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats a date into a human-readable relative time string (e.g., "Just now", "5m ago", "2h ago", "3d ago", "2w ago").
 * Older dates fall back to the machine/browser's locale.
 */
export function formatTimeAgo(
    dateInput?: Date | string | null,
    locale?: string
): string {
    if (!dateInput) return "";
    const date = parseDate(dateInput);
    if (!date) return "";
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const resolvedLocale =
        locale || Intl.DateTimeFormat().resolvedOptions().locale || "en";
    const isEnglish = resolvedLocale.toLowerCase().startsWith("en");

    if (!isEnglish) {
        const formatter = new Intl.RelativeTimeFormat(resolvedLocale, {
            numeric: "auto",
            style: "short",
        });

        if (diffInSeconds < 60) return formatter.format(0, "second");
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60)
            return formatter.format(-diffInMinutes, "minute");
        const diffInHours = Math.floor(diffInSeconds / 3600);
        if (diffInHours < 24) return formatter.format(-diffInHours, "hour");
        const diffInDays = Math.floor(diffInSeconds / 86400);
        if (diffInDays < 7) return formatter.format(-diffInDays, "day");
        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) return formatter.format(-diffInWeeks, "week");
    }

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInSeconds / 3600);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

    const options: Intl.DateTimeFormatOptions =
        date.getFullYear() !== now.getFullYear()
            ? { month: "short", day: "numeric", year: "numeric" }
            : { month: "short", day: "numeric" };

    return date.toLocaleDateString(locale, options);
}

// Form the pagination links

export function formUrlQuery({
    params,
    key,
    value,
}: {
    params: string;
    key: string;
    value: string | null;
}) {
    const query = qs.parse(params);

    query[key] = value;
    return qs.stringifyUrl(
        {
            url: typeof window !== "undefined" ? window.location.pathname : "",
            query,
        },
        {
            skipNull: true,
        }
    );
}

// Helper to standardize API call error handling

export const handleRequest = async <T>(
    promise: Promise<AxiosResponse<T>>
): Promise<T> => {
    try {
        const response = await promise;
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            const axiosError = error as AxiosError;
            throw (
                axiosError.response?.data || {
                    message: axiosError.message || "Request failed",
                    status: axiosError.response?.status,
                }
            );
        }
        throw new Error(getErrorMessage(error, "An unexpected error occurred"));
    }
};
export const convertStringToLabel = (input: string): string => {
    const words = input.toLocaleLowerCase().split(" ");
    return words.join("-");
};

/**
 * Convert payment method enum to display text
 */
export const formatPaymentMethod = (
    method: string | null | undefined
): string => {
    if (!method) return "N/A";
    switch (method) {
        case "stripe":
            return "Stripe";
        case "manual_transfer":
            return "Manual Transfer";
        case "pay_later":
            return "Pay Later";
        default:
            return method
                .split("_")
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join(" ");
    }
};

/**
 * Get display label for checkout status
 */
export function getCheckoutStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
        pending: "Pending",
        deposit_paid: "Deposit Paid",
        agreement_signed: "Agreement Signed",
        agreement_buyer_signed: "Agreement Buyer Signed",
        invoice_submitted: "Invoice Submitted",
        invoice_paid: "Invoice Paid",
        completed: "Completed",
        expired: "Expired",
        deposit_expired: "Deposit Expired",
        agreement_expired: "Agreement Expired",
        invoice_expired: "Invoice Expired",
        cancelled: "Cancelled",
    };
    return statusMap[status] || handleSnakeCaseToSimpleText(status);
}

/**
 * Get badge variant for checkout status
 */
export function getCheckoutStatusBadgeVariant(status: string): EBadgeVariant {
    const badgeVariantMap: Record<string, EBadgeVariant> = {
        pending: EBadgeVariant.WARNING,
        deposit_paid: EBadgeVariant.COMPLETE,
        agreement_signed: EBadgeVariant.COMPLETE,
        invoice_submitted: EBadgeVariant.COMPLETE,
        invoice_paid: EBadgeVariant.COMPLETE,
        completed: EBadgeVariant.SUCCESS,
        expired: EBadgeVariant.STATIC,
        deposit_expired: EBadgeVariant.STATIC,
        agreement_expired: EBadgeVariant.STATIC,
        invoice_expired: EBadgeVariant.STATIC,
        cancelled: EBadgeVariant.STATIC,
        agreement_buyer_signed: EBadgeVariant.COMPLETE,
        awaiting_signature: EBadgeVariant.WARNING,
        seller_signed: EBadgeVariant.COMPLETE,
        buyer_signed: EBadgeVariant.COMPLETE,
        sent: EBadgeVariant.TRANSACTION,
    };
    return badgeVariantMap[status] || EBadgeVariant.STATIC;
}

/**
 * Check if a checkout status indicates that the session has expired
 */
export function isCheckoutStatusExpired(status?: string | null): boolean {
    if (!status) return false;
    return (
        status === CHECKOUT_STATUS.EXPIRED ||
        status === CHECKOUT_STATUS.DEPOSIT_EXPIRED ||
        status === CHECKOUT_STATUS.AGREEMENT_EXPIRED ||
        status === CHECKOUT_STATUS.INVOICE_EXPIRED
    );
}

/**
 * Check if a checkout status is in a terminal state (cancelled or expired)
 */
export function isCheckoutStatusTerminal(status?: string | null): boolean {
    if (!status) return false;
    return (
        status === CHECKOUT_STATUS.CANCELLED || isCheckoutStatusExpired(status)
    );
}
export const isEmpty = <T>(value: T, deep = false): boolean => {
    if (value === undefined || value === null) return true;
    const map = new Map<string, boolean>();

    if (typeof value === "string") return value === "";

    if (Array.isArray(value)) {
        return value.every((item) => isEmpty(item, true));
    }

    if (typeof value === "object") {
        const keys = Object.keys(value as object);
        if (keys.length === 0) return true;
        if (deep)
            return keys.every((key) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                isEmpty((value as any)[key as keyof typeof value], true)
            );
        return false;
    }

    return false;
};
export const convertRemToPx = (px: number) => {
    if (typeof window === "undefined") {
        return px * 16;
    }

    const rootFontSize = parseFloat(
        window.getComputedStyle(document.documentElement).fontSize
    );
    return px * rootFontSize;
};
export const convertPxToRem = (px: number) => {
    if (typeof window === "undefined") {
        return px / 16;
    }

    const rootFontSize = parseFloat(
        typeof window !== "undefined"
            ? window.getComputedStyle(document.documentElement).fontSize
            : "16px"
    );
    return px / rootFontSize;
};
export const convertTextHidden = (text: string, repeat?: number): string => {
    if (!text || repeat === undefined || repeat < 0) return "";

    if (!text.includes("@")) {
        const textClone = "*".repeat(repeat || 1);
        return textClone + text.slice(-3);
    }

    const [username, domain] = text.split("@");
    if (!username) return text;

    const hiddenUsername =
        username.length <= 2
            ? username
            : `${username.slice(0, 2)}${"*".repeat(username.length - 2)}${username.slice(-1)}`;

    return `${hiddenUsername}@${domain}`;
};
export function refineSchema<
    T extends z.Schema,
    R extends ReturnType<T["refine"]>,
>(schema: T): R {
    return schema.refine((values) => {
        return values;
    }) as R;
}

export const convertSpaceBetweenWords = ({
    text,
    wordCount,
}: {
    text: string;
    wordCount: number;
}) => {
    const words = text.split("");
    const result = words.map((word, index) => {
        if (index > 0) {
            if (index === wordCount - 1) {
                return word + " ";
            }
            if (
                index - (wordCount - 1) > 0 &&
                (index - (wordCount - 1)) % wordCount === 0
            ) {
                return word + " ";
            }
        }
        return word;
    });
    return result.join("");
};

export const handleCheckIsCurrentAuth = (methods: string[] = []) => {
    const isEnabled =
        methods.length > 0 &&
        (methods.includes("app") || methods.includes("sms"));
    return {
        isEnabled,
        isApp: isEnabled && methods.includes("app"),
        isSms: isEnabled && methods.includes("sms"),
    };
};

export const detectCardType = (number: string) => {
    const re: Record<string, RegExp> = {
        // electron: /^(4026|417500|4405|4508|4844|4913|4917)\d+$/,
        // maestro:
        //     /^(5018|5020|5038|5612|5893|6304|6759|6761|6762|6763|0604|6390)\d+$/,
        // dankort: /^(5019)\d+$/,
        // interpayment: /^(636)\d+$/,
        unionpay: /^(62|88)\d+$/, //880
        visa: /^4[0-9]{0,}$/, //4000
        mastercard: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)[0-9]{0,}$/, //5000
        amex: /^3[47][0-9]{0,}$/, //3000
        diners_club: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/, //3000
        discover:
            /^(6011|65|64[4-9]|62212[6-9]|6221[3-9]|622[2-8]|6229[01]|62292[0-5])[0-9]{0,}$/, //6000
        jcb: /^(?:2131|1800|35)[0-9]{0,}$/, //3000
    };

    for (const key in re) {
        if (re[key].test(number)) {
            return key;
        }
    }
};

export const getImageSource = ({
    url,
    width,
    height,
    alt,
}: {
    url: string;
    width: number;
    height: number;
    alt: string;
}) => {
    const {
        props: { src, srcSet },
    } = getImageProps({
        src: url,
        alt: alt,
        width,
        height,
    });
    return { src, srcSet };
};

export const renderImagePlaceholder = (
    type?: "image" | "cask" | "user" | "classification"
) => {
    if (!type) return "/images/placeholder_img.jpg";
    const image = {
        image: "/images/placeholder_img.jpg",
        cask: "/images/placeholder_cask.jpg",
        user: "/images/placeholder_user.jpg",
        classification: "/images/placeholder_classification.png",
    };
    return image[type];
};

// Deep equality check for objects, arrays, and primitives
export function isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;

    if (typeof a !== typeof b) return false;

    if (a && b && typeof a === "object") {
        if (Array.isArray(a)) {
            if (!Array.isArray(b) || a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!isEqual(a[i], b[i])) return false;
            }
            return true;
        }
        // Both are objects
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) return false;
        for (const key of aKeys) {
            if (
                !b.hasOwnProperty(key) ||
                !isEqual(a[key as keyof typeof a], b[key as keyof typeof b])
            )
                return false;
        }
        return true;
    }
    // Fallback for functions, symbols, etc.
    return false;
}

/**
 * Convert date from dd-mm-yyyy format to yyyy-mm-dd format
 * @param dateString - Date string in dd-mm-yyyy format
 * @returns Date string in yyyy-mm-dd format
 */
export const convertDateFormat = (dateString: string): string => {
    if (!dateString) return dateString;

    // Check if it's already in yyyy-mm-dd format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }

    // Handle dd-mm-yyyy format
    if (dateString.includes("-")) {
        const parts = dateString.split("-");
        if (parts.length === 3) {
            const [day, month, year] = parts;

            // If year is 2 digits, assume it's 20xx
            const fullYear = year.length === 2 ? `20${year}` : year;

            // Ensure proper padding
            const paddedMonth = month.padStart(2, "0");
            const paddedDay = day.padStart(2, "0");

            return `${fullYear}-${paddedMonth}-${paddedDay}`;
        }
    }

    return dateString;
};

export function handleGetCardStatusStripe(
    requirements: stripe.TRequirements,
    type: "business" | "public" | "personal" | "professional" | "management"
) {
    const {
        currentlyDue = [],
        pastDue = [],
        pendingVerification = [],
    } = requirements || {};

    const fieldMap = {
        business: [
            "business_profile.mcc",
            "business_profile.url",
            "business_type",
            "company.tax_id",
            "external_account",
            "tos_acceptance.date",
            "tos_acceptance.ip",
        ],
        personal: [
            "representative.dob.day",
            "representative.dob.month",
            "representative.dob.year",
            "representative.email",
            "representative.first_name",
            "representative.last_name",
            "individual.dob.day",
            "individual.dob.month",
            "individual.dob.year",
            "individual.email",
            "individual.first_name",
            "individual.last_name",
            "individual.verification.document",
            "individual.verification.additional_document",
        ],
        public: [
            "settings.payments.statement_descriptor",
            "business_profile.url",
        ],
        professional: ["business_profile.mcc", "business_profile.url"],
        management: [
            "id_number",
            "relationship.title",
            "representative.address.city",
            "representative.address.line1",
            "representative.address.postal_code",
            "representative.address.state",
            "representative.phone",
            "individual.id_number",
            "individual.address.city",
            "individual.address.line1",
            "individual.address.postal_code",
            "individual.address.state",
            "individual.phone",
        ],
    };

    const isRelevant = (f: string) => fieldMap[type].some((key) => f === key);

    if ((pastDue as string[]).some(isRelevant)) return "Invalid";
    if ((currentlyDue as string[]).some(isRelevant)) return "Pending";
    if (
        pendingVerification &&
        (pendingVerification as string[]).some(isRelevant)
    )
        return "Pending";
    return "Complete";
}

export function getStripeMissingFieldsForCard(
    requirements: stripe.TRequirements,
    type: "business" | "public" | "personal" | "professional" | "management"
) {
    const {
        currentlyDue = [],
        pastDue = [],
        pendingVerification = [],
    } = requirements || {};

    const fieldMap: Record<typeof type, string[]> = {
        business: [
            "business_profile.mcc",
            "business_profile.url",
            "business_type",
            "company.tax_id",
            "external_account",
            "tos_acceptance.date",
            "tos_acceptance.ip",
        ],
        personal: [
            "representative.dob.day",
            "representative.dob.month",
            "representative.dob.year",
            "representative.email",
            "representative.first_name",
            "representative.last_name",
            "individual.dob.day",
            "individual.dob.month",
            "individual.dob.year",
            "individual.email",
            "individual.first_name",
            "individual.last_name",
            "individual.verification.document",
            "individual.verification.additional_document",
        ],
        public: [
            "settings.payments.statement_descriptor",
            "business_profile.url",
        ],
        professional: ["business_profile.mcc", "business_profile.url"],
        management: [
            "id_number",
            "relationship.title",
            "representative.address.city",
            "representative.address.line1",
            "representative.address.postal_code",
            "representative.address.state",
            "representative.phone",
            "individual.id_number",
            "individual.address.city",
            "individual.address.line1",
            "individual.address.postal_code",
            "individual.address.state",
            "individual.phone",
        ],
    };

    const labelMap: Record<string, string> = {
        "business_profile.mcc": "MCC",
        "business_profile.url": "Business website",
        business_type: "Business type",
        "company.tax_id": "Company tax ID (EIN)",
        external_account: "Bank account",
        "tos_acceptance.date": "Accept Terms of Service (date)",
        "tos_acceptance.ip": "Accept Terms of Service (IP)",
        "settings.payments.statement_descriptor": "Statement descriptor",
        "representative.dob.day": "Representative date of birth (day)",
        "representative.dob.month": "Representative date of birth (month)",
        "representative.dob.year": "Representative date of birth (year)",
        "representative.email": "Representative email",
        "representative.first_name": "Representative first name",
        "representative.last_name": "Representative last name",
        id_number: "ID number",
        "relationship.title": "Job title",
        "representative.address.city": "Representative address city",
        "representative.address.line1": "Representative address line 1",
        "representative.address.postal_code": "Representative postal code",
        "representative.address.state": "Representative state",
        "representative.phone": "Representative phone",
    };

    const relevant = new Set(fieldMap[type]);
    const pick = (arr: unknown) =>
        (Array.isArray(arr) ? (arr as string[]) : [])
            .filter((f) => relevant.has(f))
            .map((f) => labelMap[f] || f);

    return {
        pastDue: pick(pastDue),
        currentlyDue: pick(currentlyDue),
        pendingVerification: pick(pendingVerification),
    };
}

// Convert camelCase to snake_case
export const handleCamelCaseToSnakeCase = (str: string) => {
    return str?.replace(/_/g, "-").toLowerCase();
};

// Helper function to get status for person requirements
export function handleGetCardStatusStripePerson(person: stripe.TPerson) {
    const {
        currently_due = [],
        past_due = [],
        pending_verification = [],
    } = person.requirements || {};

    if (past_due.length > 0) return "Invalid";
    if (currently_due.length > 0) return "Pending";
    if (pending_verification.length > 0) return "Pending";
    return "Complete";
}

export const cleanString = (str: string) => {
    return str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
};

export const cleanEmptyPayload = <T>(obj: T): T => {
    if (obj === null || obj === undefined || typeof obj !== "object") {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj
            .map((item) => cleanEmptyPayload(item))
            .filter(
                (val) => val !== "" && val !== null && val !== undefined
            ) as unknown as T;
    }

    const record = obj as Record<string, unknown>;
    return Object.entries(record).reduce(
        (acc, [key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                if (typeof value === "object") {
                    const cleaned = cleanEmptyPayload(value);
                    if (
                        Array.isArray(cleaned) ||
                        (cleaned !== null &&
                            Object.keys(cleaned as Record<string, unknown>)
                                .length > 0)
                    ) {
                        acc[key] = cleaned;
                    }
                } else {
                    acc[key] = value;
                }
            }
            return acc;
        },
        {} as Record<string, unknown>
    ) as T;
};

export const handleRenderFallbackText = (
    text?: string | number | null,
    fallback: string = DEFAULT_FALLBACK_TEXT
): string => {
    if (text === null || text === undefined) return fallback;
    const str = String(text).trim();
    if (
        str === "" ||
        str === "NaN" ||
        str === "undefined" ||
        str === "null" ||
        str === "—" ||
        str === "--"
    ) {
        return fallback;
    }
    return str;
};

export const handleConvertDataTableManage = ({
    data,
}: {
    data?: caskAsk.TCaskOrder[];
    key: string;
}) => {
    const res = data?.reduce(
        (
            acc: Record<
                string,
                {
                    label: string;
                    value: string;
                    count: number | null;
                    data: caskAsk.TCaskOrder[];
                }
            >,
            curr: caskAsk.TCaskOrder
        ) => {
            acc["all"] = {
                label: "All",
                value: "all",
                count: data?.length || 0,
                data: data || [],
            };

            if (acc[curr.status]) {
                acc[curr.status].count = (acc[curr.status].count || 0) + 1;
                acc[curr.status].data.push(curr);
            } else {
                acc[curr.status] = {
                    label:
                        curr.status.charAt(0).toUpperCase() +
                        curr.status.slice(1),
                    value: curr.status.toLowerCase(),
                    count: 1,
                    data: [curr],
                };
            }

            return acc;
        },
        {} as Record<
            string,
            {
                label: string;
                value: string;
                count: number | null;
                data: caskAsk.TCaskOrder[];
            }
        >
    );
    return Object.values(res || {});
};
export const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    const datePart = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return `${datePart}, ${timePart}`;
};

export const formatBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(0)} ${sizes[i]}`;
};

export const formatAgeFromDate = (
    dateInput: string | Date | null | undefined
) => {
    if (!dateInput) return "N/A";
    const distillation = new Date(dateInput);
    if (Number.isNaN(distillation.getTime())) return "N/A";

    const now = new Date();
    const diffMs = now.getTime() - distillation.getTime();
    if (diffMs < 0) return "N/A";

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days < 30) {
        const weeks = Math.max(1, Math.floor(days / 7));
        return `${weeks} ${pluralize(weeks, "week")}`;
    }

    const months =
        (now.getFullYear() - distillation.getFullYear()) * 12 +
        (now.getMonth() - distillation.getMonth());

    if (months < 12) {
        return `${months} ${pluralize(months, "month")}`;
    }

    const years = Math.floor(months / 12);
    return `${years} ${pluralize(years, "year")}`;
};

export const isValidDecimal = (value: string) => {
    if (!/^\d*(?:,\d*)*(?:\.\d{0,2})?$/.test(value)) return true;
};

export const openUrlInNewTabAfterAsync = async (
    getUrl: () => Promise<string | null | undefined>
) => {
    const newWindow = window.open("", "_blank");

    try {
        const url = await getUrl();

        if (url) {
            if (newWindow) {
                newWindow.location.href = url;
            } else {
                window.open(url, "_blank");
            }
            return true;
        }

        newWindow?.close();
        return false;
    } catch (error) {
        newWindow?.close();
        throw error;
    }
};

export async function downloadFile(
    source: Blob | string,
    filename?: string
): Promise<void> {
    try {
        if (source instanceof Blob) {
            // Open Blob in new tab
            const url = window.URL.createObjectURL(source);
            window.open(url, "_blank");
            // window.URL.revokeObjectURL(url);
        } else if (typeof source === "string") {
            const trimmedSource = source.trim();
            if (
                trimmedSource.startsWith("<") ||
                trimmedSource.includes("<!DOCTYPE")
            ) {
                // Open HTML content in new tab
                const blob = new Blob([source], {
                    type: "text/html; charset=utf-8",
                });
                const url = window.URL.createObjectURL(blob);
                window.open(url, "_blank");
                // window.URL.revokeObjectURL(url);
            } else if (
                trimmedSource.startsWith("http") ||
                trimmedSource.startsWith("/")
            ) {
                // Open direct URL in new tab
                window.open(trimmedSource, "_blank");
            } else {
                await downloadFileWithBlob(source, filename);
            }
        }
    } catch (error) {
        console.error("Failed to download file:", error);
        throw error;
    }
}
export const downloadFileWithBlob = async (
    source: string | Blob,
    filename?: string
) => {
    if (source instanceof Blob) {
        const url = window.URL.createObjectURL(source);
        window.open(url, "_blank");
        // window.URL.revokeObjectURL(url);
    } else {
        const response = await fetch(`${PATH_API_FE_DOWNLOAD}?url=${source}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        // window.URL.revokeObjectURL(url);
    }
};

export const compareIndexCurrentStep = (
    step_wanna_compare: CHECKOUT_STATUS,
    stepCurrent: CHECKOUT_STATUS
) => {
    const isStepCurrent = step_wanna_compare === stepCurrent;
    const indexStepCurrent =
        Object.values(CHECKOUT_STATUS).indexOf(step_wanna_compare);
    const stepsBeforeCurrent = Object.values(CHECKOUT_STATUS).slice(
        0,
        indexStepCurrent
    );
    const stepsAfterCurrent = Object.values(CHECKOUT_STATUS).slice(
        indexStepCurrent + 1
    );

    return {
        stepsBeforeCurrent,
        stepsAfterCurrent,
        indexStepCurrent,
        isStepCurrent,
    };
};

// snake_case to simple text
export const handleSnakeCaseToSimpleText = (str: string) => {
    return (
        str?.replace(/_/g, " ").charAt(0)?.toUpperCase() +
        str?.replace(/_/g, " ").slice(1)
    );
};

export const handleStatusVariant = (status: string): EBadgeVariant => {
    const badgeVariantMap: Record<string, EBadgeVariant> = {
        awaiting_signature: EBadgeVariant.WARNING,
        seller_signed: EBadgeVariant.SUCCESS,
        update_requested: EBadgeVariant.COMPLETE,
        seller_declined: EBadgeVariant.DESTRUCTIVE,
        seller_voided: EBadgeVariant.COMPLETE,
        buyer_signed: EBadgeVariant.SUCCESS,
        buyer_declined: EBadgeVariant.DESTRUCTIVE,
        buyer_voided: EBadgeVariant.COMPLETE,
        all_signed: EBadgeVariant.SUCCESS,
        signed: EBadgeVariant.SUCCESS,
    };
    return badgeVariantMap[status] || EBadgeVariant.STATIC;
};

export async function urlToBlob(imageUrl: string) {
    try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error("Error converting URL to Blob:", error);
    }
}

export async function urlToFile(url: string, fileName = "image.webp") {
    try {
        const response = await fetch(`${PATH_API_FE_PROXY}?url=${url}`);
        if (!response.ok) {
            throw new Error(`Lỗi tải ảnh: ${response.status}`);
        }
        const blob = await response.blob();
        const file = new File([blob], fileName, {
            type: blob.type || "image/webp",
        });
        return file;
    } catch (error) {
        console.error("Error converting URL to File:", error);
        return null;
    }
}
export async function blobToFile(blob: Blob | string, fileName = "image.webp") {
    try {
        // If it's already a File, just return it.
        if (blob instanceof File) return blob;
        const file = new File([blob], fileName, {
            type: blob instanceof Blob ? blob.type : "image/webp",
            lastModified: Date.now(),
        });
        return file;
    } catch (error) {
        console.error("Error converting Blob to File:", error);
        return null;
    }
}

export const MathMap = (
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const formatTimeRemaining = (
    targetDateInput: string | Date | null | undefined
): string => {
    if (!targetDateInput) return "-";
    const targetDate = new Date(targetDateInput);
    if (Number.isNaN(targetDate.getTime())) return "-";

    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    if (diffMs <= 0) return "Expired";

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays >= 1) {
        return `${diffDays} ${pluralize(diffDays, "day")}`;
    }
    if (diffHours >= 1) {
        return `${diffHours} ${pluralize(diffHours, "hour")}`;
    }
    if (diffMins >= 1) {
        return `${diffMins} ${pluralize(diffMins, "minute")}`;
    }
    return "Less than a minute";
};

export function getExpirationDuration(
    createdAt?: string | Date | null,
    expirationDate?: string | Date | null
) {
    if (!createdAt || !expirationDate) return DEFAULT_FALLBACK_TEXT;
    const start = new Date(createdAt).getTime();
    const end = new Date(expirationDate).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        return DEFAULT_FALLBACK_TEXT;
    }

    const days = Math.max(1, Math.round((end - start) / 86_400_000));
    return `${days} ${days === 1 ? "day" : "days"}`;
}

export function formatTabletDateTime(value?: Date | string | null) {
    if (!value || Number.isNaN(new Date(value).getTime()))
        return DEFAULT_FALLBACK_TEXT;
    const formatted = formatDateTime(value);
    return `${formatted.dataOnlyNumber} ${formatted.timeOnly24}`;
}
