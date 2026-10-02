import { store } from "@/types/store";
import { StateCreator } from "zustand";

const initValue = {
    user: null,
    isLogin: false,
    currentStep: 1,
    totalStep: 3,
    isBackAction: false,
};

export const createAuthSlice: StateCreator<store.TAuth, []> = (set) => ({
    ...initValue,
    setMyUser: (user) => {
        set({ user, isLogin: !!user });
    },
    reset() {
        set(initValue);
    },
    setCurrentStepLogin: (step: number, isBackAction?: boolean) => {
        set({ currentStep: step, isBackAction });
    },
    setTotalStep: (step: number) => {
        set({ totalStep: step });
    },

    nextStep: () => {
        set((state) => ({
            currentStep: state.currentStep + 1,
            isBackAction: false,
        }));
        if (typeof window === "undefined") return;

        window.scrollTo({
            top: 0,
            behavior: "instant",
        });
    },
    prevStep: () => {
        set((state) => ({
            currentStep: Math.max(1, state.currentStep - 1),
            isBackAction: true,
        }));
        if (typeof window === "undefined") return;

        window.scrollTo({
            top: 0,
            behavior: "instant",
        });
    },
});
// {
//     name: "auth",
//     merge: (persistedState, currentState) => {
//         return {
//             ...currentState,
//             ...(persistedState as store.TAuth),
//         };
//     },
//     partialize: (state) => {
//         return {
//             user: state.user,
//             isLogin: state.isLogin,
//         };
//     },
// }
