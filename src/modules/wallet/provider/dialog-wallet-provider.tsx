import { createContext, useContext, useState } from "react";
import { TWalletItem } from "./wallet-provider";

// Define a generic type for the context
type DialogWrapContextType = {
    isOpen: boolean;
    sessionData?: TWalletItem;
    isLoading: boolean;
    setIsOpenDialog: (isOpen: boolean) => void;
    setSessionData: (data?: TWalletItem) => void;
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
    sessionData: undefined,
    isLoading: false,
    setIsOpenDialog: () => {},
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
    step: "chooseStep" as const,
    previousStep: "chooseStep" as const,
    isBackAction: false,
    sessionData: undefined,
    isLoading: false,
    setIsOpenDialog: () => {},
    setStep: () => {},
    setSessionData: () => {},
    setIsLoading: () => {},
};

// Provider component with generic type
export const DialogWrapProvider = ({ children }: TDialogWrapProviderProps) => {
    const [isOpen, setIsOpenDialog] = useState(defaultStoreDialogWrap.isOpen);

    const [sessionData, setSessionData] = useState<TWalletItem | undefined>(
        defaultStoreDialogWrap.sessionData
    );
    const [isLoading, setIsLoading] = useState(
        defaultStoreDialogWrap.isLoading
    );

    return (
        <ContextDialogWrap.Provider
            value={{
                isOpen,
                setIsOpenDialog,
                sessionData,
                isLoading,
                setIsLoading,
                setSessionData,
            }}
        >
            {children}
        </ContextDialogWrap.Provider>
    );
};
