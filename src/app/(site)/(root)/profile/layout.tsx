import ProfileLayout from "@/layouts/ProfileLayout";
import { MarketOrderManagementProvider } from "@/modules/market-orders/management/provider";
import React from "react";

export default function ProfileRouteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MarketOrderManagementProvider>
            <ProfileLayout>{children}</ProfileLayout>
        </MarketOrderManagementProvider>
    );
}
