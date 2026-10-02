"use client";

import { useSubmitAccountForm } from "@/hooks/useAccountMutations";
import { STRIPE_KEYS } from "@/lib/constants/key";
import { cleanEmptyPayload } from "@/lib/utils";
import stripeService from "@/services/stripe";
import { store } from "@/types";
import { stripe } from "@/types/stripe";
import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext } from "react";
import { useAccountStore } from "./accountStore";
import { KEY_FORM_MAP, TFormType } from "./index";

const AccountContext = createContext<store.TAccountContext | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
    const store = useAccountStore();

    const getProfileQuery = useQuery({
        queryKey: [STRIPE_KEYS.PROFILE],
        queryFn: stripeService.getAccountStripe,
    });
    const getPersonsQuery = useQuery({
        queryKey: [STRIPE_KEYS.GET_PERSON],
        queryFn: stripeService.getPersonOfAccount,
        enabled: getProfileQuery.data?.profile?.businessType === "company",
    });

    // Mutation for updating account
    const submitAccountFormMutation =
        useSubmitAccountForm<store.TAccountFormData>(
            (formData) =>
                stripeService.updateAccountStripe(
                    formData as Partial<stripe.TAccountProfile>
                ),
            [STRIPE_KEYS.PROFILE]
        );

    const submitFormAction = async (formData: store.TAccountFormData) => {
        const { editModal, closeModal } = store;

        if (!editModal) {
            throw new Error("No form selected");
        }

        // Validate that editModal is a valid form type
        if (!Object.values(KEY_FORM_MAP).includes(editModal as TFormType)) {
            throw new Error(`Unknown form type: ${editModal}`);
        }

        const formType = editModal;
        const cleanedData = cleanEmptyPayload(formData);

        try {
            const result = await submitAccountFormMutation.mutateAsync({
                formData: cleanedData,
                formType,
            });

            // Close modal on success
            closeModal();

            return result;
        } catch (error) {
            // Error handling is already done in the mutation
            throw error;
        }
    };

    const fetchProfile = async () => {
        await getProfileQuery.refetch();
    };

    const fetchPersons = async () => {
        await getPersonsQuery.refetch();
    };

    return (
        <AccountContext.Provider
            value={{
                ...store,
                isLoading:
                    getProfileQuery.isLoading ||
                    getPersonsQuery.isLoading ||
                    submitAccountFormMutation.isPending,
                isLoadingPersons: getPersonsQuery.isLoading,
                isModalOpen: store.isModalOpen,
                editModal: store.editModal,
                isSubmitting: submitAccountFormMutation.isPending,
                error:
                    getProfileQuery.error?.message ||
                    getPersonsQuery.error?.message ||
                    submitAccountFormMutation.error?.message ||
                    null,
                profile: getProfileQuery.data?.profile || null,
                persons: getPersonsQuery.data || [],
                // Mutation actions
                submitForm: submitFormAction,
                submitFormMutation: submitAccountFormMutation,
                fetchProfile,
                fetchPersons,
            }}
        >
            {children}
        </AccountContext.Provider>
    );
}

export function useAccount() {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error("useAccount must be used within AccountProvider");
    }
    return context;
}
