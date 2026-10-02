"use client";

import { env } from "@/config/env";
import { STRIPE_KEYS } from "@/lib/constants/key";
import { STRIPE_APPEARANCE } from "@/lib/constants/stripe";
import { isEmpty } from "@/lib/utils";
import stripeService from "@/services/stripe";
import { useBoundStore } from "@/store";
import {
    loadConnectAndInitialize,
    type StripeConnectInstance,
} from "@stripe/connect-js";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export const useConnect = () => {
    const [stripeConnectInstance, setStripeConnectInstance] =
        useState<StripeConnectInstance | null>(null);
    const { user } = useBoundStore();

    const stripeAccountId = user?.stripeAccount?.id;

    const createAccountStripeQuery = useMutation({
        mutationKey: [STRIPE_KEYS.CREATE_ACCOUNT],
        mutationFn: ({
            sellerId,
            userId,
            email,
            country,
        }: {
            sellerId: string;
            userId: string;
            email: string;
            country?: string;
        }) => {
            return stripeService.createAccount({
                sellerId,
                userId,
                email,
                country: country || "US",
            });
        },
        retry: false,
    });

    const getClientSecret = useMutation({
        mutationKey: ["getClientSecret"],
        mutationFn: (id: string) => {
            return stripeService.createNewSessionAccountOnboarding({
                accountId: id,
                refreshUrl:
                    typeof window === "undefined"
                        ? ""
                        : `${window.location.origin}/settings/onboarding`,
                returnUrl:
                    typeof window === "undefined"
                        ? ""
                        : `${window.location.origin}/settings/onboarding`,
            });
        },
    });

    const handleInitStripeConnect = useCallback(async () => {
        if (isEmpty(user)) return;
        let accountId: string;

        if (!stripeAccountId) {
            const res = await createAccountStripeQuery.mutateAsync({
                sellerId: user?.id || "",
                userId: user?.id || "",
                email: user?.email || "",
                country: "US",
            });
            accountId = res?.accountId || "";
        }

        return loadConnectAndInitialize({
            publishableKey: env.stripePublicKey,
            appearance: STRIPE_APPEARANCE,
            fetchClientSecret: async () => {
                const res = await getClientSecret.mutateAsync(
                    stripeAccountId || accountId
                );
                return res?.clientSecret || "";
            },
            locale: "en",
            fonts: [
                {
                    family: "Inter",
                    cssSrc: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
                },
            ],
        });
    }, [stripeAccountId, createAccountStripeQuery, getClientSecret, user]);

    useEffect(() => {
        if (stripeConnectInstance) {
            stripeConnectInstance.update({
                appearance: STRIPE_APPEARANCE,
                locale: "en",
            });
        } else {
            handleInitStripeConnect().then((instance) => {
                if (instance) {
                    setStripeConnectInstance(instance);
                }
            });
        }
    }, [
        stripeConnectInstance,
        stripeAccountId,
        createAccountStripeQuery?.data,
        user,
    ]);

    return {
        hasError: getClientSecret?.error,
        stripeConnectInstance,
    };
};
