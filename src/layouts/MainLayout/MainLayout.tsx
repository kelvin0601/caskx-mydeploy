"use client";

import GridOverlay from "@/components/shared/grid-overlay";
import NoiseOverlay from "@/components/shared/noise-overlay";
import { ReactScan } from "@/components/shared/scan";
import { env } from "@/config/env";
import { getQueryClient } from "@/lib/get-query-client";
import { PATH_API_FE_AUTH } from "@/lib/constants/path";
import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";
import { LazyMotion } from "motion/react";

const loadFeatures = () => import("motion/react").then((res) => res.domMax);
const ReactQueryDevtools = dynamic(
    () =>
        import("@tanstack/react-query-devtools").then(
            (module) => module.ReactQueryDevtools
        ),
    { ssr: false }
);

// Realtime SSE notification stream subscriber (commented out for now; enable when realtime notifications stream is activated)
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStream } from "@/hooks/useNotificationStream";
function NotificationStreamSubscriber() {
    const { accessToken } = useAuth();
    useNotificationStream(accessToken);
    return null;
}

export default function MainLayout({ children }: PropsWithChildren) {
    const queryClient = getQueryClient();
    const pathname = usePathname();

    useEffect(() => {
        const timer = setTimeout(() => {
            const isLight =
                pathname.startsWith("/log-in") ||
                pathname.startsWith("/sign-up") ||
                pathname.startsWith("/verify-user") ||
                pathname.startsWith("/forgot-password") ||
                pathname.startsWith("/reset-password") ||
                pathname.startsWith("/log-out") ||
                pathname.startsWith("/admin") ||
                pathname.includes("/onboarding") ||
                pathname.includes("/docusign") ||
                pathname.includes("/_mobile-not-supported");
            const themeColor = isLight ? "#FFFCF6" : "#110f0d";
            document.body.style.setProperty("--body-bg", themeColor);

            const metaTags = document.querySelectorAll(
                'meta[name="theme-color"]'
            );
            if (metaTags.length === 0) {
                const meta = document.createElement("meta");
                meta.setAttribute("name", "theme-color");
                meta.setAttribute("content", themeColor);
                document.head.appendChild(meta);
            } else {
                metaTags.forEach((tag) => {
                    tag.setAttribute("content", themeColor);
                });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <SessionProvider basePath={PATH_API_FE_AUTH}>
            <QueryClientProvider client={queryClient}>
                {/* Realtime SSE notification stream subscriber (activate when SSE stream phase is enabled) */}
                <NotificationStreamSubscriber />
                {env.isDevelopment && env.enableReactQueryDevtools ? (
                    <ReactQueryDevtools initialIsOpen={false} />
                ) : null}
                <LazyMotion features={loadFeatures} strict>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        forcedTheme="light"
                        enableColorScheme={false}
                        disableTransitionOnChange
                    >
                        {children}
                        <NoiseOverlay />
                        {env.enableReactScan ? <ReactScan /> : null}
                        {(env.isDevelopment ||
                            (typeof window !== "undefined" &&
                                window.location.host.includes(
                                    "vercel.app"
                                ))) && <GridOverlay />}
                    </ThemeProvider>
                </LazyMotion>
            </QueryClientProvider>
        </SessionProvider>
    );
}
