"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type TMarketplaceContextType = {
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
};

export const MarketplaceContext = createContext<
    TMarketplaceContextType | undefined
>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };

    return (
        <MarketplaceContext.Provider
            value={{ isSidebarCollapsed, toggleSidebar }}
        >
            {children}
        </MarketplaceContext.Provider>
    );
}

export function useMarketplace() {
    const context = useContext(MarketplaceContext);
    if (context === undefined) {
        throw new Error(
            "useMarketplace must be used within a MarketplaceProvider"
        );
    }
    return context;
}
