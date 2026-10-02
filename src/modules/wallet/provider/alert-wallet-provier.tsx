import { createContext, useCallback, useContext, useState } from "react";

type TDataAlert = {
    content?: string;
    titleButtonPassed?: string;
    titleButtonCanceled?: string;
    actionPassed?: () => void;
};

type TAlertWrapContext = {
    isOpen: boolean;
    isPassed: boolean;
    data: TDataAlert;
    setDataAlert: (data?: TDataAlert) => void;
    setOpenAlert: (isOpen: boolean) => void;
    setIsPassed: (isPassed: boolean) => void;
};

export const AlertWalletProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isOpen, setOpenAlert] = useState(false);
    const [isPassed, setIsPassed] = useState(false);
    const [data, setDataAlert] = useState<{
        content?: string;
        titleButtonPassed?: string;
        titleButtonCanceled?: string;
        actionPassed?: () => void;
    }>({
        content: "",
        titleButtonPassed: "Turn off",
        titleButtonCanceled: "Cancel",
        actionPassed: () => { },
    });

    const setPassedData = useCallback(
        (data?: TDataAlert) => {
            return setDataAlert((prev) => {
                return {
                    ...prev,
                    ...data,
                };
            });
        },

        [data]
    );
    return (
        <ContextAlertWrap.Provider
            value={{
                isOpen,
                setOpenAlert,
                isPassed,
                setIsPassed,
                data,
                setDataAlert: setPassedData,
            }}
        >
            {children}
        </ContextAlertWrap.Provider>
    );
};

export const ContextAlertWrap = createContext<TAlertWrapContext>({
    isOpen: false,
    isPassed: false,
    data: {
        content: "",
        titleButtonPassed: "Turn off",
        titleButtonCanceled: "Cancel",
        actionPassed: () => { },
    },
    setDataAlert: () => { },
    setIsPassed: () => { },
    setOpenAlert: () => { },
});

export const useStoreAlertWrap = () => {
    return useContext(ContextAlertWrap);
};
