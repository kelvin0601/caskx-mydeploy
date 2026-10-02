"use client";

import AuthStatus from "@/components/shared/auth/popup-status";
import { useRefreshCurrentUser } from "@/hooks/useRefreshCurrentUser";
import { AUTH_KEYS } from "@/lib/constants/key";
import { ROUTE_AUTH, ROUTE_PUBLIC } from "@/lib/constants/route";
import authService from "@/services/auth";
import { auth } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function VerifyModule({ token }: { token: string }) {
    const [isSuccessResend, setIsLoadedResend] = useState<boolean>(false);
    const session = useSession();
    const router = useRouter();
    const refreshCurrentUser = useRefreshCurrentUser();
    const hasRedirectedRef = useRef(false);

    // Data Fetching
    const verifyUser = useQuery({
        queryKey: [AUTH_KEYS.VERIFY],
        queryFn: () =>
            authService.verifyUser({ token: token } as auth.TVerifyUser),
        retry: false,
        enabled: !!token,
    });

    const resendEmailMutation = useMutation({
        mutationFn: authService.resendEmailVerification,
        gcTime: Infinity,
        mutationKey: [AUTH_KEYS.RESEND_EMAIL],
    });

    // Schema Configuration
    const schema = {
        pending: {
            title: "Account Verifying",
            description:
                "We are confirming your details. This might take a moment.",
        },
        error: {
            title: "Link Expired",
            buttonText: resendEmailMutation.isPending
                ? "Resending..."
                : "Resend Email",
            buttonVariant: "primary" as const,
            action: () =>
                resendEmailMutation.mutate(verifyUser.error?.data?.email),
            isDisableButton: resendEmailMutation.isPending,
            messageError: resendEmailMutation.error?.message || "",
            secondaryLinkText: "Log In",
            secondaryLinkAction: () => router.push(ROUTE_AUTH.LOGIN),
            description:
                "Your verification link has expired. Get a new link sent to your email.",
        },
        resend: {
            title: "Check Your Mailbox",
            buttonText: resendEmailMutation.isPending
                ? "Resending..."
                : "Resend Email",
            buttonVariant: "primary" as const,
            action: () =>
                resendEmailMutation.mutate(verifyUser.error?.data?.email),
            isDisableButton: resendEmailMutation.isPending,
            messageError: resendEmailMutation.error?.message || "",
            secondaryLinkText: "Log In",
            secondaryLinkAction: () => router.push(ROUTE_AUTH.LOGIN),
            description: (
                <>
                    {resendEmailMutation.isSuccess ? (
                        <span className="mb-2 block font-medium text-[#058134] duration-300 animate-in fade-in">
                            Verification email resent successfully!
                        </span>
                    ) : null}
                    Please follow the instructions in your mailbox to verify
                    your account. If you don’t see it, check your spam folder or
                    your credentials.
                </>
            ),
        },
    };

    // Status Handling
    const isVerified = verifyUser.error?.message === "User is already verified";
    const isSuccess = verifyUser.status === "success" || isVerified;

    useEffect(() => {
        if (
            !isSuccess ||
            hasRedirectedRef.current ||
            session.status === "loading"
        ) {
            return;
        }

        hasRedirectedRef.current = true;

        const syncUserAndRedirect = async () => {
            if (session.data?.user) {
                toast.success("Email verified successfully!", {
                    closeButton: false,
                });

                try {
                    await refreshCurrentUser();
                } catch (error) {
                    console.error(
                        "[verify] Failed to refresh verified user",
                        error
                    );
                }

                router.replace(ROUTE_PUBLIC.HOME);
                return;
            }

            toast.success("Email verified successfully!", {
                description: "Please log in to continue",
                closeButton: false,
            });
            router.replace(ROUTE_AUTH.LOGIN);
        };

        void syncUserAndRedirect();
    }, [
        isSuccess,
        session.status,
        session.data?.user,
        router,
        refreshCurrentUser,
    ]);

    const getSchemaStatus = (status: "pending" | "error" | "resend") => ({
        status,
        data: schema[status],
    });

    const determineRenderStatus = () => {
        if (isSuccessResend || resendEmailMutation.isSuccess) {
            return getSchemaStatus("resend");
        }
        if (isSuccess) {
            return getSchemaStatus("pending");
        }
        if (verifyUser.status === "error") {
            return getSchemaStatus("error");
        }
        return getSchemaStatus("pending");
    };

    const { status, data } = determineRenderStatus();

    useEffect(() => {
        if (resendEmailMutation?.status === "success") {
            setIsLoadedResend(true);
        }
    }, [resendEmailMutation?.status]);

    return (
        <div className="flex flex-col">
            <AuthStatus {...data} status={status}>
                {data.description}
            </AuthStatus>
        </div>
    );
}
