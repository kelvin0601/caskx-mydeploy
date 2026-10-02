import {
    paymentResultSchema,
    signUpFormSchema,
    updatePasswordFormSchema,
    userSchema,
    signInFormSchema,
    forgotPasswordFormSchema,
} from "@/lib/validators";
import { z } from "zod";
import { stripe } from "./stripe";

declare namespace auth {
    export type TPaymentResult = z.infer<typeof paymentResultSchema>;
    export type TSalesDataType = {
        month: string;
        totalSales: number;
    }[];
    export type TDataCountryWithNumber = Record<string, string>;
    export type TToken = {
        refreshToken?: string;
        accessToken?: string;
    };
    export type TUserSchema = z.infer<typeof userSchema> & {
        role: TRole;
        isVerified?: boolean;
        avatar?: string;
        isGoogleAuth?: boolean;
        twoFactorEnabled?: boolean;
        isSMSAuth?: boolean;
        passwordUpdatedAt?: Date;
        createdAt?: Date;
        tempToken?: string;
        country?: string;
        twoFactorEnabled?: boolean;
        twoFactorMethods?: string[];
        autoInitiatedMethod?: string;
        availableMethods?: string[];
        stripeAccount: stripe.TStripeAccount;
    } & TToken;
    export type TRegisterUser = z.infer<typeof signUpFormSchema> & {
        country?: string;
        ttbLicenseNumber?: string;
        ttbLicenseType?: string;
    };

    export type TLoginUser = z.infer<typeof signInFormSchema>;
    export type TForgotPassword = z.infer<typeof forgotPasswordFormSchema>;
    export type TUpdatePassword = z.infer<typeof updatePasswordFormSchema>;
    export type TVerifyUser = { token?: string };
    export type TRole = "User" | "Admin";
    export type T2FaStatus = {
        isEnabled: boolean;
        enabledAt: string;
        deviceCount: number;
        activeDeviceCount: number;
    };

    export type T2FaDevice = {
        id: string;
        deviceName: string;
        registeredAt: string;
        lastUsedAt: string;
        isActive: boolean;
    };
    export type TInitSMS2Fa = {
        success: boolean;
        resendAfter: number;
        message: string;
    };
    export type TEnableGoogleAuth = {
        deviceId: string;
        deviceName: string;
        secret: string;
        otpauthUrl: string;
        qrCodeUrl: string;
    };
}
