"use client";

import React, { createContext, useContext, useState } from "react";

type TWallet = "chooseStep" | "addBanking";

type SessionData = {
    id?: string;
    data?: unknown;
};
export type TWalletItem = {
    id: string;
    name: string;
    number: string;
    images?: string;
    isDefault: boolean;
};

type WalletContextType = {
    isOpen: boolean;
    step: TWallet;
    previousStep: TWallet;
    wallet: TWalletItem[];
    isBackAction: boolean;
    sessionData?: SessionData;
    isLoading: boolean;
    setWallet: (wallet: TWalletItem[]) => void;
    setIsOpenDialog: (isOpen: boolean) => void;
    setStep: (step: TWallet, action?: boolean) => void;
    setSessionData: (data?: SessionData) => void;
    setIsLoading: (isLoading: boolean) => void;
};

type TWalletProviderProps = {
    children: React.ReactNode;
};

const defaultStore = {
    isOpen: false,
    step: "chooseStep" as const,
    previousStep: "chooseStep" as const,
    isBackAction: false,
    sessionData: undefined,
    isLoading: false,
    wallet: [],
    setWallet: () => {},
    setIsOpenDialog: () => {},
    setStep: () => {},
    setSessionData: () => {},
    setIsLoading: () => {},
};

export const WalletContext = createContext<WalletContextType>(defaultStore);

export const useWalletContext = () => {
    return useContext(WalletContext);
};

export const WalletProvider = ({ children }: TWalletProviderProps) => {
    const [isOpen, setIsOpenDialog] = useState(defaultStore.isOpen);
    const [step, setStep] = useState<TWallet>(defaultStore.step);
    const [previousStep, setPreviousStep] = useState<TWallet>(
        defaultStore.previousStep
    );
    const [wallet, setWallet] = useState<TWalletItem[]>(defaultStore.wallet);

    const [isBackAction, setIsBackAction] = useState(defaultStore.isBackAction);
    const [sessionData, setSessionData] = useState<SessionData | undefined>(
        defaultStore.sessionData
    );
    const [isLoading, setIsLoading] = useState(defaultStore.isLoading);

    const setStepAction = (stepNew: TWallet, action?: boolean) => {
        setPreviousStep(step);
        setStep(stepNew);
        setIsBackAction(!!action);
    };

    return (
        <WalletContext.Provider
            value={{
                isOpen,
                previousStep,
                setIsOpenDialog,
                step,
                isBackAction,
                sessionData,
                isLoading,
                setIsLoading,
                setStep: setStepAction,
                setSessionData,
                wallet,
                setWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};
