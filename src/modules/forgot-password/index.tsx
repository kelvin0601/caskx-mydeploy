"use client";

import CredentialsForgotPasswordForm from "@/components/shared/auth/credentials-forgot-password-form";
import CredentialsHead from "@/components/shared/auth/credentials-head";
import PopupStatus from "@/components/shared/auth/popup-status";
import useGetMutationState from "@/hooks/useGetMutationState";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AUTH_KEYS } from "@/lib/constants/key";
import { ROUTE_AUTH } from "@/lib/constants/route";
import authService from "@/services/auth";
import { auth } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ForgotPasswordModule() {
    const { getValue } = useLocalStorage({
        key: "email_forgot_password",
        defaultValue: "",
    });
    const data = useGetMutationState<auth.TForgotPassword>({
        key: [AUTH_KEYS.FORGOT_PASSWORD],
    });

    const resendForgotPassword = useMutation({
        mutationFn: authService.forgotPassword,
        mutationKey: [AUTH_KEYS.FORGOT_PASSWORD, "resend", getValue()],
        gcTime: Infinity,
        onSuccess: () => {
            toast.success("Reset password email resent successfully!");
        },
    });

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (resendForgotPassword.isError) {
            timeoutId = setTimeout(() => {
                resendForgotPassword.reset();
            }, 60000);
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [resendForgotPassword.isError, resendForgotPassword]);

    return (
        <div className="flex flex-col">
            {data?.status === "success" || resendForgotPassword?.submittedAt ? (
                <PopupStatus
                    status="resend"
                    title="Check Your Mailbox"
                    buttonText={
                        resendForgotPassword.isPending
                            ? "Resending..."
                            : "Resend Email"
                    }
                    buttonVariant="primary"
                    action={() => {
                        const emailResend = getValue();
                        if (emailResend || data?.data?.email) {
                            resendForgotPassword.mutate({
                                email: emailResend || data?.data?.email,
                            });
                        }
                    }}
                    isDisableButton={resendForgotPassword.isPending}
                    messageError={resendForgotPassword.error?.message || ""}
                    secondaryLinkText="Log In"
                    secondaryLinkAction={() => redirect(ROUTE_AUTH.LOGIN)}
                >
                    Please follow the instructions in your mailbox to verify
                    your account. If you don&apos;t see it, check your spam
                    folder or your credentials.
                </PopupStatus>
            ) : (
                <>
                    <CredentialsHead title="Forgot Password" />
                    <CredentialsForgotPasswordForm />
                </>
            )}
        </div>
    );
}
