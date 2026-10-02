import { TTB_LICENSE_NUMBER, TTB_LICENSE_TYPE } from "./text";

// Authentication form default values
export const signInDefaultValues = {
    email: "",
    password: "",
    rememberMe: false,
};

export const resendVerifyUser = {
    email: "",
};

export const signUpDefaultValues = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    inviteCode: "",
    email: "",
    password: "",
    consent: false,
    [TTB_LICENSE_NUMBER]: undefined,
    [TTB_LICENSE_TYPE]: undefined,
};

export const ForgotPasswordDefaultValues = {
    email: "",
};

export const UpdatePasswordDefaultValues = {
    newPassword: "",
    confirmPassword: "",
};

export const UpdatePasswordWithCheckPasswordCurrentDefaultValues = {
    oldPassword: "",
    password: "",
    confirmPassword: "",
};

export const CheckPasswordDefaultValues = {
    password: "",
};

export const shippingAddressDefaultValues = {
    fullName: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    country: "",
};

// Password validation constants
export const pointSchema = {
    weak: {
        match: 1,
        minLength: 0,
        point: 1,
    },
    normal: {
        match: 2,
        minLength: 8,
        point: 2,
    },
    medium: {
        match: 3,
        minLength: 12,
        point: 3,
    },
    strong: {
        match: 4,
        minLength: 20,
        point: 4,
    },
};

export const passwordConstraintContent: {
    id: number;
    name: string;
    message: string;
    regex: RegExp;
}[] = [
    {
        id: 1,
        name: "minLength",
        message: "8 characters minimum",
        regex: /^.{8,}$/,
    },
    {
        id: 2,
        name: "uppercase",
        message: "1 uppercase letter",
        regex: /^(?=.*[A-Z]).*$/,
    },
    {
        id: 3,
        name: "lowercase",
        message: "1 lowercase letter",
        regex: /^(?=.*[a-z]).*$/,
    },
    {
        id: 4,
        name: "number",
        message: "1 number or special letter",
        regex: /^(?=.*[0-9!@#$%^&*(),.?":{}|<>]).*$/,
    },
];

// TTB License types
export const DEFAULT_PERMISSION_TYPE = Object.values({
    WHOLESALER: "Wholesaler's Basic Permit",
    IMPORTER: "Importer's Basic Permit",
    BREWER: "Brewer's Notice",
    DSP_PRODUCTION: "Distilled Spirits Plant - Production",
    DSP_STORAGE: "Distilled Spirits Plant - Storage",
    DSP_PROCESSING: "Distilled Spirits Plant - Processing",
    BONDED_WINERY: "Bonded Winery",
    BONDED_WINE_CELLAR: "Bonded Wine Cellar",
    TAXPAID_WINE_BOTTLING: "Taxpaid Wine Bottling House",
    EXPORTER: "Exporter's Permit",
    INDUSTRIAL: "Industrial Use Permit",
    ALCOHOL_DEALER: "Alcohol Dealer Registration",
});

// Auth messages
export const AUTH_MESSAGES_ALERT = {
    google: "Authenticator app has been turned off",
    sms: "SMS authentication is now disabled",
    default: "Two-factor authentication has been turned off",
} as const;

export const getSessionCookieName = () => {
    const url = process.env.NEXTAUTH_URL || "";
    return url.startsWith("https://")
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";
};
