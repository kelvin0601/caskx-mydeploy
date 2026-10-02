import {
    getStripeMissingFieldsForCard,
    handleGetCardStatusStripePerson,
    isEmpty,
} from "@/lib/utils";
import { useAccount } from "./AccountProvider";
import { handleGetCardStatusStripe } from "@/lib/utils";
import { useMemo } from "react";

// Main hook to access account store
export { useAccount } from "./AccountProvider";

// Hook for account data
export function useAccountData() {
    const store = useAccount();
    return {
        profile: store.profile,
        persons: store.persons,
        isLoading: store.isLoading,
        isLoadingPersons: store.isLoadingPersons,
        error: store.error,
    };
}

// Hook for account actions
export function useAccountActions() {
    const store = useAccount();

    return {
        fetchProfile: store.fetchProfile,
        fetchPersons: store.fetchPersons,
        openModal: store.openModal,
        closeModal: store.closeModal,
        submitForm: store.submitForm,
        reset: store.reset,
    };
}

// Hook for modal state
export function useAccountModal() {
    const store = useAccount();

    return {
        isOpen: store.isModalOpen,
        editModal: store.editModal,
        isSubmitting: store.isSubmitting,
        open: store.openModal,
        close: store.closeModal,
    };
}

// Hook for computed values
export function useAccountComputed() {
    const { profile, persons } = useAccountData();
    const isBusinessAccount = useMemo(
        () => profile?.businessType === "company",
        [profile?.businessType]
    );

    const cardStatuses = useMemo(() => {
        if (!profile) {
            return {
                business: "Pending",
                public: "Pending",
                personal: "Pending",
                professional: "Pending",
                management: "Pending",
            };
        }

        const requirements = profile.requirements || {};

        const managementStatus = (() => {
            if (persons.length === 0) return "Pending";

            const statuses = persons.map(handleGetCardStatusStripePerson);
            if (statuses.some((s) => s === "Invalid")) return "Invalid";
            if (statuses.some((s) => s === "Pending")) return "Pending";
            return "Complete";
        })();

        return {
            business: handleGetCardStatusStripe(requirements, "business"),
            public: handleGetCardStatusStripe(requirements, "public"),
            personal: handleGetCardStatusStripe(requirements, "personal"),
            professional: handleGetCardStatusStripe(
                requirements,
                "professional"
            ),
            management: managementStatus,
        };
    }, [profile, persons]);

    const missingFields = useMemo(() => {
        if (!profile) {
            return {
                business: {
                    pastDue: [],
                    currentlyDue: [],
                    pendingVerification: [],
                },
                public: {
                    pastDue: [],
                    currentlyDue: [],
                    pendingVerification: [],
                },
                personal: {
                    pastDue: [],
                    currentlyDue: [],
                    pendingVerification: [],
                },
                professional: {
                    pastDue: [],
                    currentlyDue: [],
                    pendingVerification: [],
                },
                management: {
                    pastDue: [],
                    currentlyDue: [],
                    pendingVerification: [],
                },
            };
        }
        const requirements = profile.requirements || {};
        return {
            business: getStripeMissingFieldsForCard(requirements, "business"),
            public: getStripeMissingFieldsForCard(requirements, "public"),
            personal: getStripeMissingFieldsForCard(requirements, "personal"),
            professional: getStripeMissingFieldsForCard(
                requirements,
                "professional"
            ),
            management: getStripeMissingFieldsForCard(
                requirements,
                "management"
            ),
        };
    }, [profile]);

    const hasCompany = useMemo(
        () => !isEmpty(profile?.company),
        [profile?.company]
    );

    const hasIndividual = useMemo(
        () => !isEmpty(profile?.individual),
        [profile?.individual]
    );

    return {
        cardStatuses,
        missingFields,
        hasCompany,
        hasIndividual,
        isBusinessAccount,
    };
}
