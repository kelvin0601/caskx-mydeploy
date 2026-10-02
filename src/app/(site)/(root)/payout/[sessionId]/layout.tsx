import { PAGE_METADATA } from "@/lib/constants/metadata";
import { MarketOrderManagementProvider } from "@/modules/market-orders/management/provider";
import React from "react";

export const metadata = PAGE_METADATA.PAYOUT;

export default async function PayoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MarketOrderManagementProvider>
            {children}
        </MarketOrderManagementProvider>
    );
}
