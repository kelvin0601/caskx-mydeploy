"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { TAlertType } from "../alerts/index";

type TDataAlert = {
    content?: string;
    titleButtonPassed?: string;
    titleButtonCanceled?: string;
    title?: string;
    actionPassed?: () => void;
};

type TAlertWrapContext = {
    isOpen: boolean;
    isPassed: boolean;
    data: TDataAlert;
    type: TAlertType;
    setDataAlert: (data?: TDataAlert) => void;
    setOpenAlert: (isOpen: boolean) => void;
    setIsPassed: (isPassed: boolean) => void;
    setTypeAlert: (type: TAlertType) => void;
};

export const SecurityAlertProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isOpen, setOpenAlert] = useState(false);
    const [isPassed, setIsPassed] = useState(false);
    const [type, setTypeAlert] = useState<TAlertType>("confirm");
    const [data, setDataAlert] = useState<{
        content?: string;
        titleButtonPassed?: string;
        titleButtonCanceled?: string;
        actionPassed?: () => void;
    }>({
        content: "",
        titleButtonPassed: "Turn off",
        titleButtonCanceled: "Cancel",
        actionPassed: () => {},
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
                type,
                isOpen,
                setOpenAlert,
                isPassed,
                setIsPassed,
                setTypeAlert,
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
    type: "confirm",
    data: {
        content: "",
        titleButtonPassed: "Turn off",
        titleButtonCanceled: "Cancel",
        actionPassed: () => {},
    },
    setDataAlert: () => {},
    setIsPassed: () => {},
    setOpenAlert: () => {},
    setTypeAlert: () => {},
});

export const useStoreAlertWrap = () => {
    return useContext(ContextAlertWrap);
};
