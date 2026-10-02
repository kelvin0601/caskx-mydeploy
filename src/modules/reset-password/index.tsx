"use client";

import CredentialsHead from "@/components/shared/auth/credentials-head";
import CredentialsResetPasswordForm from "@/components/shared/auth/credentials-reset-password-form";
import AuthStatus from "@/components/shared/auth/popup-status";
import useGetMutationState from "@/hooks/useGetMutationState";
import { AUTH_KEYS } from "@/lib/constants/key";
import { ROUTE_AUTH } from "@/lib/constants/route";
import authService from "@/services/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ResetPasswordModule({ token }: { token: string }) {
    // State and Refs
    const [isSuccessResend, setIsLoadedResend] = useState<boolean>(false);

    // Data Fetching
    const resendForgotPassword = useMutation({
        mutationFn: authService.forgotPassword,
        mutationKey: [AUTH_KEYS.FORGOT_PASSWORD],
    });

    const resetPasswordMutation = useGetMutationState({
        key: [AUTH_KEYS.RESET_PASSWORD],
    });

    const validToken = useQuery({
        queryKey: [AUTH_KEYS.CHECK_RESET_PASSWORD],
        queryFn: () =>
            authService.verifyTokenResetPassword({ token: token as string }),
        retry: false,
        enabled: !!token,
    });

    // Schema Configuration
    const schema = {
        success: {
            title: "Password Reset Successfully",
            description: "Log in to your account with your new password.",
            buttonText: "Log in now",
            action: () => redirect(ROUTE_AUTH.LOGIN),
            isDisableButton: false,
            messageError: "",
        },
        pending: {
            title: "Account Verifying",
            description:
                "We\u2019re confirming your details. This might take a moment.",
        },
        error: {
            title: "Link Expired",
            description:
                "Your verification link has expired.\nGet a new link sent to your email.",
            buttonText: resendForgotPassword.isPending
                ? "Resending..."
                : "Resend Email",
            action: () =>
                resendForgotPassword.mutate({
                    email: validToken.error?.data?.email,
                }),
            isDisableButton: resendForgotPassword.isPending,
            messageError: resendForgotPassword.error?.message || "",
            secondaryLinkText: "Log In",
            secondaryLinkAction: () => redirect(ROUTE_AUTH.LOGIN),
        },
        resend: {
            title: "Check Your Mailbox",
            description:
                "Please follow the instructions in your mailbox to verify your account. If you don\u2019t see it, check your spam folder or your credentials.",
            buttonText: resendForgotPassword.isPending
                ? "Resending..."
                : "Resend Email",
            action: () => {
                resendForgotPassword.mutate({
                    email: validToken.error?.data?.email,
                });
            },
            isDisableButton: resendForgotPassword.isPending,
            secondaryLinkText: "Log In",
            secondaryLinkAction: () => redirect(ROUTE_AUTH.LOGIN),
        },
    };

    // Status Handling
    const getSchemaStatus = useCallback(
        (status: keyof typeof schema) => ({
            status,
            data: schema[status],
        }),
        [schema]
    );
    const determineRenderStatus = () => {
        // Otherwise, handle forgot password success or token validation status
        if (isSuccessResend || resendForgotPassword.isSuccess) {
            return getSchemaStatus("resend");
        }
        return getSchemaStatus(validToken.status);
    };

    const { status, data } = determineRenderStatus();

    useEffect(() => {
        if (resendForgotPassword?.status === "success") {
            setIsLoadedResend(true);
        }
    }, [resendForgotPassword?.status]);

    // Render Logic
    const shouldShowAuthStatus =
        validToken.status !== "success" ||
        resetPasswordMutation?.status === "success";

    // Render
    return (
        <div className="flex flex-col">
            {shouldShowAuthStatus ? (
                <AuthStatus status={status} {...data}>
                    {data.description}
                </AuthStatus>
            ) : (
                <>
                    <CredentialsHead title="Reset Password" />
                    <CredentialsResetPasswordForm />
                </>
            )}
        </div>
    );
}
