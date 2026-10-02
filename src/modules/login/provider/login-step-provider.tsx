"use client";

import { createContext, useContext, useState } from "react";
import { useBoundStore } from "@/store";
import { auth } from "@/types";

type LoginStepContextType = {
    currentStep: number;
    totalStep: number;
    user: auth.TUserSchema | null;
    isBackAction: boolean;
    setTotalStep: (step: number) => void;
    setCurrentStep: (step: number, isBack?: boolean) => void;
    nextStep: () => void;
    prevStep: () => void;
};

const LoginStepContext = createContext<LoginStepContextType | undefined>(
    undefined
);

export function LoginStepProvider({ children }: { children: React.ReactNode }) {
    const { currentStep, setCurrentStepLogin, user, isBackAction } =
        useBoundStore();
    const [totalStep, setTotalStep] = useState(3);

    const nextStep = () => {
        setCurrentStepLogin(Math.min(totalStep, currentStep + 1));
        if (typeof window === "undefined") return;
        window.scrollTo({
            top: 0,
            behavior: "instant",
        });
    };

    const prevStep = () => {
        setCurrentStepLogin(Math.max(1, currentStep - 1));
        window.scrollTo({
            top: 0,
            behavior: "instant",
        });
    };

    const setStepCurrent = (step: number, isBack?: boolean) => {
        setCurrentStepLogin(step, isBack);
    };

    return (
        <LoginStepContext.Provider
            value={{
                currentStep,
                totalStep,
                setTotalStep,
                setCurrentStep: setStepCurrent,
                user,
                nextStep,
                prevStep,
                isBackAction,
            }}
        >
            {children}
        </LoginStepContext.Provider>
    );
}

export function useLoginStep() {
    const context = useContext(LoginStepContext);
    if (context === undefined) {
        throw new Error("useLoginStep must be used within a LoginStepProvider");
    }
    return context;
}
