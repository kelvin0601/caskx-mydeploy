import { store } from "@/types";
import { stripe } from "@/types/stripe";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const initialState = {
    // Data state
    profile: null,
    persons: [],
    personCurrentId: null,

    // Loading states
    isLoading: false,
    isLoadingPersons: false,
    isSubmitting: false,

    // Modal state
    isModalOpen: false,
    editModal: null,

    // Error state
    error: null,
};

// Store timeout outside of the store to persist across calls
let closeModalTimeout: NodeJS.Timeout | null = null;
let openModalTimeout: NodeJS.Timeout | null = null;

export const useAccountStore = create<store.TAccountStore>()(
    devtools(
        (set, get) => ({
            ...initialState,
            // Loading actions
            setSubmitting: (isSubmitting) =>
                set({ isSubmitting }, false, "setSubmitting"),
            setPersonCurrentId: (personCurrentId) => {
                set({ personCurrentId }, false, "setPersonCurrentId");
            },
            // Modal actions
            openModal: (modalType: stripe.TEditMode, personId?: string) => {
                // Clear any pending timeouts
                if (closeModalTimeout) {
                    clearTimeout(closeModalTimeout);
                    closeModalTimeout = null;
                }
                if (openModalTimeout) {
                    clearTimeout(openModalTimeout);
                    openModalTimeout = null;
                }

                const currentModal = get().editModal;

                if (!currentModal) {
                    // No modal open, open immediately
                    set(
                        {
                            isModalOpen: true,
                            editModal: modalType,
                            ...(personId !== undefined
                                ? { personCurrentId: personId }
                                : {}),
                        },
                        false,
                        "openModal"
                    );
                } else {
                    // Modal already open, close current and open new one
                    set(
                        {
                            isModalOpen: false,
                        },
                        false,
                        "openModal_step1"
                    );

                    openModalTimeout = setTimeout(() => {
                        set(
                            {
                                isModalOpen: true,
                                editModal: modalType,
                                ...(personId !== undefined
                                    ? { personCurrentId: personId }
                                    : {}),
                            },
                            false,
                            "openModal_step2"
                        );
                        openModalTimeout = null;
                    }, 500);
                }
            },
            closeModal: () => {
                // Clear any pending timeouts
                if (closeModalTimeout) {
                    clearTimeout(closeModalTimeout);
                    closeModalTimeout = null;
                }
                if (openModalTimeout) {
                    clearTimeout(openModalTimeout);
                    openModalTimeout = null;
                }

                // Close modal immediately
                set(
                    {
                        isModalOpen: false,
                    },
                    false,
                    "closeModal_step1"
                );

                // Clear editModal after delay
                closeModalTimeout = setTimeout(() => {
                    set(
                        {
                            editModal: null,
                        },
                        false,
                        "closeModal_step2"
                    );
                    closeModalTimeout = null;
                }, 500);
            },
            // Reset
            reset: () => {
                // Clear any pending timeouts
                if (closeModalTimeout) {
                    clearTimeout(closeModalTimeout);
                    closeModalTimeout = null;
                }
                if (openModalTimeout) {
                    clearTimeout(openModalTimeout);
                    openModalTimeout = null;
                }

                set(initialState, false, "reset");
            },
        }),
        {
            name: "account-store",
        }
    )
);
