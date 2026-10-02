import RootLayout from "@/layouts/RootLayout";
import { AUTH_KEYS } from "@/lib/constants";
import { getQueryClient } from "@/lib/get-query-client";
import { authServerAction } from "@/services/server-action/auth";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Viewport } from "next";

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#110f0d" },
        { media: "(prefers-color-scheme: dark)", color: "#110f0d" },
    ],
};

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const queryClient = getQueryClient();

    try {
        await queryClient.prefetchQuery({
            queryKey: [AUTH_KEYS.WHOAMI],
            queryFn: () => authServerAction.whoami(true),
        });
    } catch (error) {
        console.error("Error prefetching whoami:", error);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RootLayout>{children}</RootLayout>
        </HydrationBoundary>
    );
}
