"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type TDistilleriesContextType = {
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
};

export const DistilleriesContext = createContext<
    TDistilleriesContextType | undefined
>(undefined);

export function DistilleriesProvider({ children }: { children: ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };

    return (
        <DistilleriesContext.Provider
            value={{ isSidebarCollapsed, toggleSidebar }}
        >
            {children}
        </DistilleriesContext.Provider>
    );
}

export function useDistilleriesContext() {
    const context = useContext(DistilleriesContext);
    if (context === undefined) {
        throw new Error(
            "useDistilleriesContext must be used within a DistilleriesProvider"
        );
    }
    return context;
}
