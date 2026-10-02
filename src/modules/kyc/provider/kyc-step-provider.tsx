"use client";

import { createContext, useContext, useState } from "react";

type KycStepContextType = {
    currentStep: number;
    totalStep: number;
    isBackAction: boolean;
    formData: {
        identificationType: "id-card" | "passport" | "driver-license";
        identificationImages: {
            front?: File;
            back?: File;
        };
        avatarImages?: File;
        identificationNumber: string;
        nationality: string;
        phoneNumber: string;
        fullName: string;
        dateBirth: string;
        monthBirth: string;
        yearBirth: string;
        address: string;
        postalCode: string;
        city: string;
    };
    setFormData: (data: Partial<KycStepContextType["formData"]>) => void;
    setTotalStep: (step: number) => void;
    setCurrentStep: (step: number) => void;
    setIsBackAction: (isBackAction: boolean) => void;
    nextStep: () => void;
    prevStep: () => void;
};

const KycStepContext = createContext<KycStepContextType | undefined>(undefined);

export function KycStepProvider({ children }: { children: React.ReactNode }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [totalStep, setTotalStep] = useState(2);
    const [isBackAction, setIsBackAction] = useState(false);
    const [formData, setFormData] = useState<KycStepContextType["formData"]>({
        identificationType: "id-card",
        identificationImages: {
            front: undefined,
            back: undefined,
        },
        avatarImages: undefined,
        identificationNumber: "",
        nationality: "",
        phoneNumber: "",
        fullName: "",
        dateBirth: "",
        monthBirth: "",
        yearBirth: "",
        address: "",
        postalCode: "",
        city: "",
    });

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1);
        setIsBackAction(false);
        window.scrollTo({
            top: 0,
            behavior: "instant",
        });
    };

    const prevStep = () => {
        setIsBackAction(true);
        setCurrentStep((prev) => Math.max(1, prev - 1));
        window.scrollTo({
            top: 0,
            behavior: "instant",
        });
    };

    const setFormDataOverride = (
        data: Partial<KycStepContextType["formData"]>
    ) => {
        if (data) {
            setFormData((prev) => ({ ...prev, ...data }));
        }
    };

    return (
        <KycStepContext.Provider
            value={{
                formData,
                setFormData: setFormDataOverride,
                currentStep,
                totalStep,
                setTotalStep,
                setCurrentStep,
                isBackAction,
                setIsBackAction,
                nextStep,
                prevStep,
            }}
        >
            {children}
        </KycStepContext.Provider>
    );
}

export function useKycStep() {
    const context = useContext(KycStepContext);
    if (context === undefined) {
        throw new Error("useKycStep must be used within a KycStepProvider");
    }
    return context;
}
