"use client";

import HeadingSettings from "@/components/shared/heading-settings";
import MissingStripeRequirements from "@/components/shared/missing-stripe-requirements";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { STRIPE_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import stripeService from "@/services/stripe";
import { useBoundStore } from "@/store";
import {
    AccountProvider,
    KEY_FORM_MAP,
    useAccount,
    useAccountComputed,
} from "@/store/account";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
    BusinessTypeCard,
    ManagementOwnershipCard,
    PersonalDetailsCard,
    ProfessionalDetailsCard,
    PublicDetailsCard,
} from "./cards";
import FormDialog from "./forms/FormDialog";

export function AccountSub() {
    const router = useRouter();
    const { user } = useBoundStore();
    const [isConnecting, setIsConnecting] = useState(false);
    const [isAcceptingTos, setIsAcceptingTos] = useState(false);

    // Context hooks
    const { profile, persons, openModal } = useAccount();
    const {
        cardStatuses,
        missingFields,
        hasCompany,
        hasIndividual,
        isBusinessAccount,
    } = useAccountComputed();

    const profileLoading = useGetStateQuery({
        key: [STRIPE_KEYS.PROFILE],
        fetchFn: stripeService.getAccountStripe,
    });

    const handleStripeUpdate = async () => {
        if (isConnecting) return;
        setIsConnecting(true);
        try {
            let accountId = user?.stripeAccount?.id;

            // 1. Create account if missing
            if (!accountId && user) {
                const res = await stripeService.createAccount({
                    sellerId: user.id,
                    userId: user.id,
                    email: user.email,
                    country: profile?.country || "US",
                });
                accountId = res?.accountId;
            }

            if (!accountId) {
                throw new Error("Could not identify Stripe Account ID");
            }

            // 2. Redirect to the onboarding page which uses useConnect
            router.push(ROUTE_PUBLIC.STRIPE_ONBOARDING);
        } catch (error) {
            console.error("[StripeOnboarding] Error:", error);
            toast.error(
                (error as Error)?.message || "Failed to connect to Stripe"
            );
            setIsConnecting(false);
        }
    };

    // Loading state
    if (profileLoading.status === "pending") {
        return (
            <div className="flex w-full flex-col tb:px-5 mb:px-4">
                <div className="flex flex-col gap-2 pb-8 tb:pb-6">
                    <Skeleton className="h-8 w-48 tb:h-6" />
                    <Skeleton className="h-4 w-96 max-w-full" />
                </div>
                {/* Update Information Banner Skeleton */}
                <Skeleton className="h-24 w-full bg-bg-sf4" />

                <div className="mt-10 flex flex-col gap-10">
                    <AccountCardSkeleton rows={4} />
                    <AccountCardSkeleton rows={3} />
                    <AccountCardSkeleton rows={5} />
                </div>
            </div>
        );
    }

    const hasMissingRequirements =
        missingFields.business.pastDue.length > 0 ||
        missingFields.public.pastDue.length > 0 ||
        missingFields.personal.pastDue.length > 0 ||
        missingFields.management.pastDue.length > 0;

    const stripeErrors = profile?.requirements?.errors || [];

    const handleAcceptTos = async () => {
        if (isAcceptingTos) return;
        setIsAcceptingTos(true);
        try {
            // Get user's IP (simplified for this example, usually handled by server)
            const ipResponse = await fetch("https://api.ipify.org?format=json");
            const { ip } = await ipResponse.json();

            await stripeService.updateAccountStripe({
                tos_acceptance: {
                    date: Math.floor(Date.now() / 1000),
                    ip: ip,
                },
            });
            toast.success("Terms of Service accepted successfully");
            profileLoading.refetch();
        } catch (error) {
            console.error("[StripeTOS] Error:", error);
            toast.error("Failed to accept Terms of Service");
        } finally {
            setIsAcceptingTos(false);
        }
    };

    return (
        <div className="flex w-full flex-col">
            <HeadingSettings
                title="Personal Information"
                description="Manage your passwords, login preferences and recovery methods."
                className="mb-8 tb:mb-6 mb:hidden"
                size="3xl"
                fontFamily="reckless"
                titleClassName="tb:text-2xl mb:text-xl"
                showBorder={false}
            />

            <div className="flex flex-col gap-8 tb:gap-6">
                <div className="flex flex-row items-center justify-between gap-8 bg-bg-sf4 p-4 tb:gap-8 mb:flex-col mb:items-start mb:gap-4">
                    <div className="flex flex-1 flex-row items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-semibold text-typo-primary">
                                {!profile
                                    ? "Start selling on Cask Exchange Platform"
                                    : "Manage your information"}
                            </h3>
                            <p className="text-sm font-normal text-typo-soft">
                                {!profile
                                    ? "Connect your Stripe account to verify your identity and receive payouts. Setup takes about 3–5 minutes, and your information will sync automatically here."
                                    : "Update your identity, payout, and compliance information in Stripe."}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleStripeUpdate}
                        variant="action"
                        className="w-auto py-3 mb:w-auto mb:min-w-0 mb:px-4 mb:py-2"
                        disabled={isConnecting}
                    >
                        {!profile
                            ? "Connect to Stripe"
                            : isConnecting
                              ? "Connecting..."
                              : "Continue in Stripe"}
                    </Button>
                </div>

                {profile && (
                    <>
                        {/* Account Cards */}
                        <div className="flex flex-col gap-8 tb:gap-6">
                            {/* Business Details Card */}
                            {isBusinessAccount && hasCompany && (
                                <div className="flex flex-col gap-2">
                                    <BusinessTypeCard
                                        mappedProfile={profile}
                                        onEdit={() =>
                                            openModal(
                                                KEY_FORM_MAP.BUSINESS_INFO
                                            )
                                        }
                                        status={cardStatuses.business}
                                    />
                                    <MissingStripeRequirements
                                        data={missingFields.business}
                                        onCompleteInStripe={
                                            missingFields.business.pastDue.some(
                                                (f) =>
                                                    f.includes("tos_acceptance")
                                            )
                                                ? handleAcceptTos
                                                : handleStripeUpdate
                                        }
                                        isLoading={
                                            isConnecting || isAcceptingTos
                                        }
                                        errors={stripeErrors}
                                    />
                                </div>
                            )}

                            {/* Public Details Card */}
                            {hasCompany && (
                                <div className="flex flex-col gap-2">
                                    <PublicDetailsCard
                                        mappedProfile={profile}
                                        onEdit={() =>
                                            openModal(
                                                KEY_FORM_MAP.PUBLIC_DETAILS
                                            )
                                        }
                                        status={cardStatuses.public}
                                    />
                                    <MissingStripeRequirements
                                        data={missingFields.public}
                                        onCompleteInStripe={handleStripeUpdate}
                                        isLoading={isConnecting}
                                        errors={stripeErrors}
                                    />
                                </div>
                            )}

                            {/* Professional Details Card */}
                            <div className="flex flex-col gap-2">
                                <ProfessionalDetailsCard
                                    mappedProfile={profile}
                                    onEdit={() =>
                                        openModal(
                                            KEY_FORM_MAP.PROFESSIONAL_DETAILS
                                        )
                                    }
                                    status={cardStatuses.professional}
                                />
                                <MissingStripeRequirements
                                    data={missingFields.professional}
                                    onCompleteInStripe={handleStripeUpdate}
                                    isLoading={isConnecting}
                                    errors={stripeErrors}
                                />
                            </div>

                            {/* Payout Methods Card */}
                            {/* <div className="flex flex-col gap-4">
                        <PayoutMethodsCard
                            mappedProfile={profile}
                            onEdit={handleStripeUpdate}
                            status={cardStatuses.professional}
                        />
                    </div> */}

                            {/* Personal Details Card */}
                            {hasIndividual && (
                                <div className="flex flex-col gap-2">
                                    <PersonalDetailsCard
                                        type="individual"
                                        mappedProfile={profile}
                                        onEdit={() =>
                                            openModal(
                                                KEY_FORM_MAP.INDIVIDUAL_DETAILS
                                            )
                                        }
                                        status={cardStatuses.personal}
                                    />
                                    <MissingStripeRequirements
                                        data={missingFields.personal}
                                        onCompleteInStripe={handleStripeUpdate}
                                        isLoading={isConnecting}
                                        errors={stripeErrors}
                                    />
                                </div>
                            )}

                            {/* Company Rep Details Card */}
                            {isBusinessAccount && hasCompany && (
                                <div className="flex flex-col gap-2">
                                    <PersonalDetailsCard
                                        type="company"
                                        mappedProfile={profile}
                                        onEdit={() =>
                                            openModal(
                                                KEY_FORM_MAP.COMPANY_DETAILS
                                            )
                                        }
                                        status={cardStatuses.personal}
                                    />
                                    <MissingStripeRequirements
                                        data={missingFields.personal}
                                        onCompleteInStripe={handleStripeUpdate}
                                        isLoading={isConnecting}
                                        errors={stripeErrors}
                                    />
                                </div>
                            )}

                            {/* Management and Ownership Card */}
                            {isBusinessAccount && hasCompany && (
                                <div className="flex flex-col gap-2">
                                    <ManagementOwnershipCard
                                        persons={persons}
                                        onEdit={() =>
                                            openModal(
                                                KEY_FORM_MAP.MANAGEMENT_DETAILS
                                            )
                                        }
                                        status={cardStatuses.management}
                                    />
                                    <MissingStripeRequirements
                                        data={missingFields.management}
                                        onCompleteInStripe={handleStripeUpdate}
                                        isLoading={isConnecting}
                                        errors={stripeErrors}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Form Dialog */}
                {profile && <FormDialog />}
            </div>
        </div>
    );
}

export default function Account() {
    return (
        <AccountProvider>
            <AccountSub />
        </AccountProvider>
    );
}

const AccountCardSkeleton = ({ rows = 4 }: { rows?: number }) => (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72 opacity-40" />
        </div>
        <div className="bg-bg-sf4 p-4">
            <div className="flex flex-col gap-4">
                <div className="mb-4 flex flex-row items-center justify-between">
                    <Skeleton className="h-5 w-48 bg-bg-main" />
                    <Skeleton className="h-4 w-12 bg-bg-main" />
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 tb:grid-cols-1">
                    {[...Array(rows)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <Skeleton className="h-3 w-20 bg-bg-main opacity-40" />
                            <Skeleton className="h-4 w-full bg-bg-main" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
