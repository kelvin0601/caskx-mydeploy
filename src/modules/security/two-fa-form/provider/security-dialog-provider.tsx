"use client";

import { createContext, useContext, useState } from "react";
import { TStepType } from "..";

type SessionData = {
    id?: string;
    name: string;
};

// Define a generic type for the context
type DialogWrapContextType = {
    step: TStepType;
    previousStep: TStepType;
    isBackAction: boolean;
    isOpen: boolean;
    sessionData?: SessionData;
    isLoading: boolean;
    setIsOpenDialog: (isOpen: boolean) => void;
    setStep: (step: TStepType, isBackAction?: boolean) => void;
    setSessionData: (data?: SessionData) => void;
    setIsLoading: (isLoading: boolean) => void;
};

// Props interface with generic type
type TDialogWrapProviderProps = {
    children: React.ReactNode;
    initialIsOpen?: boolean;
};

// Create context with generic type
export const ContextDialogWrap = createContext<DialogWrapContextType>({
    isOpen: false,
    step: "checkPassword",
    isBackAction: false,
    sessionData: undefined,
    isLoading: false,
    previousStep: "checkPassword",
    setIsOpenDialog: () => {},
    setStep: () => {},
    setSessionData: () => {},
    setIsLoading: () => {},
});

// Custom hook with generic type
export const useStoreDialogWrap = () => {
    return useContext(ContextDialogWrap) as DialogWrapContextType;
};

// Default store with generic type
export const defaultStoreDialogWrap = {
    isOpen: false,
    step: "checkPassword" as const,
    previousStep: "checkPassword" as const,
    isBackAction: false,
    sessionData: undefined,
    isLoading: false,
    setIsOpenDialog: () => {},
    setStep: () => {},
    setSessionData: () => {},
    setIsLoading: () => {},
    actionAfterClose: () => {},
    setActionAfterClose: () => {},
};

// Provider component with generic type
export const DialogWrapProvider = ({ children }: TDialogWrapProviderProps) => {
    const [isOpen, setIsOpenDialog] = useState(defaultStoreDialogWrap.isOpen);
    const [step, setStep] = useState<TStepType>(defaultStoreDialogWrap.step);
    const [previousStep, setPreviousStep] = useState<TStepType>(
        defaultStoreDialogWrap.previousStep
    );
    const [isBackAction, setIsBackAction] = useState(
        defaultStoreDialogWrap.isBackAction
    );
    const [sessionData, setSessionData] = useState<SessionData | undefined>(
        defaultStoreDialogWrap.sessionData
    );
    const [isLoading, setIsLoading] = useState(
        defaultStoreDialogWrap.isLoading
    );

    const setStepAction = (stepNew: TStepType, action?: boolean) => {
        setPreviousStep(step);
        setStep(stepNew);
        setIsBackAction(!!action);
    };

    return (
        <ContextDialogWrap.Provider
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
            }}
        >
            {children}
        </ContextDialogWrap.Provider>
    );
};
