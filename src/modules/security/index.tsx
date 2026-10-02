"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { SECURITY_KEYS } from "@/lib/constants/key";
import { cn, convertTextHidden, formatDateTime, isEmpty } from "@/lib/utils";
import securityService from "@/services/security";
import { security } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import SecurityContentItem, {
    SecurityContentItemDialog,
} from "./security-content-item";
import SecurityItemResetDialog from "./security-item-reset-dialog";
import SessionSection from "./session-section";
import SectionTitle from "./section-title";
import PasswordForm from "./password-form";
import TwoFaForm from "./two-fa-form";
import AlertWrap from "./two-fa-form/alerts";
import { SecurityAlertProvider } from "./two-fa-form/provider/security-alert-provier";
import { DialogWrapProvider } from "./two-fa-form/provider/security-dialog-provider";
import HeadingSettings from "@/components/shared/heading-settings";

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
export default function SecurityModule() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Queries
    const sessionQuery = useQuery({
        queryKey: [SECURITY_KEYS.GET_SECURITY_SESSION],
        queryFn: securityService.getSecuritySession,
    });

    // Mutations
    const revokeAllMutation = useMutation({
        mutationFn: securityService.revokeAllSecuritySession,
        mutationKey: [SECURITY_KEYS.REVOKE_ALL_SESSION],
    });
    const revokeOneMutation = useMutation({
        mutationFn: securityService.revokeSecuritySession,
        mutationKey: [SECURITY_KEYS.REVOKE_SESSION],
        onMutate: async (id) => {
            await queryClient.cancelQueries({
                queryKey: [SECURITY_KEYS.GET_SECURITY_SESSION],
            });
            queryClient.setQueryData(
                [SECURITY_KEYS.GET_SECURITY_SESSION],
                (old: security.TSecuritySession) => ({
                    ...old,
                    otherSessions: old.otherSessions.filter((s) => s.id !== id),
                })
            );
            return { prev: sessionQuery.data };
        },
        onError: (_err, _id, ctx) => {
            queryClient.setQueryData(
                [SECURITY_KEYS.GET_SECURITY_SESSION],
                ctx?.prev
            );
        },
    });

    // Handlers
    const handleRevokeAll = async () => {
        await revokeAllMutation.mutateAsync();
        queryClient.invalidateQueries({
            queryKey: [SECURITY_KEYS.GET_SECURITY_SESSION],
        });
    };
    const handleRevokeOne = async (id: string) => {
        try {
            await revokeOneMutation.mutateAsync(id);
            queryClient.invalidateQueries({
                queryKey: [SECURITY_KEYS.GET_SECURITY_SESSION],
            });
        } catch (err) {
            console.error(err);
        }
    };

    // Derived state
    const { currentSession, otherSessions } = sessionQuery?.data ?? {};
    const hasCurrentSession = !isEmpty(currentSession) && currentSession;
    const hasOtherSessions = !isEmpty(otherSessions) && otherSessions;
    const isHasTwoFactor = user?.isGoogleAuth || user?.isSMSAuth;

    const lastPasswordUpdate = useMemo(
        () =>
            formatDateTime((user?.passwordUpdatedAt as Date) || user?.createdAt)
                .dateOnly,
        [user]
    );

    if (sessionQuery.isLoading) return <SecuritySkeleton />;

    return (
        <SecurityAlertProvider>
            <AlertWrap />

            <div className="flex w-full flex-col gap-8 mb:gap-6">
                <HeadingSettings
                    title="Security and Privacy"
                    description="Update your security settings, and monitor your overall account health."
                    size="3xl"
                    fontFamily="reckless"
                    titleClassName="tb:text-2xl mb:text-xl"
                />

                {/* ── Section 1: Login and Recovery ─────────── */}
                <section className="flex flex-col gap-4">
                    <SectionTitle
                        title="Login and Recovery"
                        className="border-t-0 pt-0 mb:pt-0"
                        description="Manage your passwords, login preferences and recovery methods."
                    />

                    {/* Items */}
                    <div className="flex flex-col gap-2">
                        {/* Email - read-only */}
                        <SecurityContentItem
                            title="Email address"
                            subtitle={user?.email || ""}
                            subtitleClassName="text-typo-note"
                        />

                        {/* Password */}
                        <DialogWrapProvider>
                            <SecurityContentItemDialog
                                title="Password"
                                subtitle={`Last updated on ${lastPasswordUpdate}`}
                                subtitleClassName="text-typo-note"
                                rightAction={
                                    <span className="cursor-pointer text-sm font-medium text-typo-primary">
                                        <Button variant={"link"}>Change</Button>
                                    </span>
                                }
                            >
                                <PasswordForm />
                            </SecurityContentItemDialog>
                        </DialogWrapProvider>

                        {/* Two-factor authentication */}
                        <DialogWrapProvider>
                            <SecurityItemResetDialog
                                title="Two-factor authentication"
                                subtitle={
                                    isHasTwoFactor ? "Enabled" : "Not enabled"
                                }
                                subtitleClassName="text-typo-note"
                                rightAction={
                                    <span className="cursor-pointer text-sm font-medium text-typo-primary">
                                        <Button variant={"link"}>
                                            {isHasTwoFactor
                                                ? "Manage"
                                                : "Enable"}
                                        </Button>
                                    </span>
                                }
                            >
                                <TwoFaForm />
                            </SecurityItemResetDialog>
                        </DialogWrapProvider>
                    </div>
                </section>

                {/* ── Section 2: Security Checks ─────────────── */}
                <section className="flex flex-col gap-4 mb:gap-5">
                    <SectionTitle
                        title="Security checks"
                        description="Manage devices that have login status, and view your device history."
                    />

                    {/* Session lists */}
                    <div className="flex flex-col gap-5 pt-1">
                        {hasCurrentSession && (
                            <SessionSection
                                title="Current session"
                                sessions={[currentSession]}
                                isCurrentSession={true}
                                onRevokeSession={handleRevokeOne}
                            />
                        )}

                        {hasOtherSessions && (
                            <SessionSection
                                title="Other active sessions"
                                sessions={otherSessions}
                                isCurrentSession={false}
                                onRevokeSession={handleRevokeOne}
                            />
                        )}
                    </div>

                    {/* "Log out all" button */}
                    {hasOtherSessions && (
                        <Button
                            variant="outline"
                            type="button"
                            className="h-10 w-fit px-8 text-sm font-medium mb:w-full"
                            onClick={handleRevokeAll}
                        >
                            Log out of all other sessions
                        </Button>
                    )}
                </section>
            </div>
        </SecurityAlertProvider>
    );
}

// ─────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────
export const SecuritySkeleton = () => (
    <div className="flex flex-col gap-8 tb:gap-6">
        {/* Page Heading */}
        <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64 tb:h-6" />
            <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        {/* Section 1 */}
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 border-b border-bd-main pb-4">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <div className="flex flex-col gap-2">
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
            </div>
        </div>

        {/* Section 2 */}
        <div className="flex flex-col gap-4 mb:gap-5">
            <div className="flex flex-col gap-1.5 border-b border-bd-main pb-4">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <div className="flex flex-col gap-5 pt-1">
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full rounded-md" />
                </div>
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-16 w-full rounded-md" />
                    <Skeleton className="h-16 w-full rounded-md" />
                </div>
            </div>
            <Skeleton className="h-10 w-64 rounded-md" />
        </div>
    </div>
);
