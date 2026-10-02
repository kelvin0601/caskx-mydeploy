"use client";

import CredentialsHead from "@/components/shared/auth/credentials-head";
import CredentialsSignUpForm from "@/components/shared/auth/credentials-signup-form";
import PopupStatus from "@/components/shared/auth/popup-status";
import useGetMutationState from "@/hooks/useGetMutationState";
import { AUTH_KEYS } from "@/lib/constants/key";
import { ROUTE_AUTH } from "@/lib/constants/route";
import authService from "@/services/auth";
import { auth } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { redirect } from "next/navigation";

export default function SignUpModule() {
    const data = useGetMutationState<auth.TRegisterUser>({
        key: [AUTH_KEYS.SIGNUP],
    });

    const resendEmailMutation = useMutation({
        mutationFn: authService.resendEmailVerification,
        gcTime: Infinity,
        mutationKey: [AUTH_KEYS.RESEND_EMAIL],
    });

    if (data?.status === "success") {
        return (
            <PopupStatus
                status="resend"
                title="Check Your Mailbox"
                buttonText={
                    resendEmailMutation.isPending
                        ? "Resending..."
                        : "Resend Email"
                }
                buttonVariant="primary"
                action={() => {
                    if (data?.data?.email) {
                        resendEmailMutation.mutate(data.data.email);
                    }
                }}
                isDisableButton={resendEmailMutation.isPending}
                messageError={resendEmailMutation.error?.message || ""}
                secondaryLinkText="Log In"
                secondaryLinkAction={() => redirect(ROUTE_AUTH.LOGIN)}
            >
                {resendEmailMutation.isSuccess ? (
                    <span className="mb-2 block font-medium text-[#058134] duration-300 animate-in fade-in">
                        Verification email resent successfully!
                    </span>
                ) : null}
                Please follow the instructions in your mailbox to verify your
                account. If you don’t see it, check your spam folder or your
                credentials.
            </PopupStatus>
        );
    }

    return (
        <div className="flex flex-col">
            <CredentialsHead title="Create new account" />
            <CredentialsSignUpForm />
        </div>
    );
}
