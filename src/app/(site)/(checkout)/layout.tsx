import React from "react";
import RootLayoutClient from "@/layouts/RootLayout/RootLayoutClient";
import { AUTH_KEYS } from "@/lib/constants";
import { getQueryClient } from "@/lib/get-query-client";
import { getCurrentUser } from "@/lib/server/get-current-user";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Viewport } from "next";
import HeaderCheckoutV2 from "@/layouts/HeaderPayment";
import FooterCheckoutV2 from "@/layouts/FooterPayment";

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#110f0d" },
        { media: "(prefers-color-scheme: dark)", color: "#110f0d" },
    ],
};

export default async function CheckoutV2LayoutGroup({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const queryClient = getQueryClient();

    try {
        await queryClient.prefetchQuery({
            queryKey: [AUTH_KEYS.WHOAMI],
            queryFn: getCurrentUser,
        });
    } catch (error) {
        console.error("Error prefetching whoami in checkoutv2 layout:", error);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RootLayoutClient
                header={<HeaderCheckoutV2 />}
                footer={<FooterCheckoutV2 />}
            >
                {children}
            </RootLayoutClient>
        </HydrationBoundary>
    );
}
