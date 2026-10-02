"use client";

import BackTop from "@/components/shared/back-top";
import { Toaster } from "@/components/ui/sonner";
import { AUTH_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { cn } from "@/lib/utils";
import authService from "@/services/auth";
import { useBoundStore } from "@/store";
import { CheckoutProvider } from "@/store/checkout";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FooterV2 } from "../Footer";

export default function RootLayoutClient({
    children,
    header,
    footer,
}: Readonly<{
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}>) {
    const pathname = usePathname();
    const { setMyUser } = useBoundStore();
    const whoamiQuery = useQuery({
        queryKey: [AUTH_KEYS.WHOAMI],
        queryFn: authService.whoami,
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
        retry: false,
    });

    useEffect(() => {
        if (whoamiQuery.data) {
            const twoFactorMethods = whoamiQuery.data.twoFactorMethods;
            setMyUser({
                ...whoamiQuery.data,
                isGoogleAuth: twoFactorMethods?.includes("app"),
                isSMSAuth: twoFactorMethods?.includes("sms"),
            });
        }
    }, [setMyUser, whoamiQuery.data]);

    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }, 50);
    }, [pathname]);

    const isHideHeader = pathname.includes("/onboarding");
    const isHideFooter =
        pathname.includes("/onboarding") || pathname.includes("/checkout");
    const isOfferDetail = pathname.startsWith(`${ROUTE_PUBLIC.OFFER_DETAIL}/`);
    const isListingDetail = pathname.startsWith(
        `${ROUTE_PUBLIC.LISTING_DETAIL}/`
    );
    const isPayoutDetail =
        pathname.startsWith(`${ROUTE_PUBLIC.PAYOUT}/`) &&
        pathname.split("/").filter(Boolean).length === 2;
    const isTradingDetail = isOfferDetail || isListingDetail || isPayoutDetail;

    return (
        <CheckoutProvider>
            <div
                className={cn(
                    "flex min-h-screen flex-col"
                    // !isHideHeader && "pt-[var(--height-header)] tb:pt-[var(--height-header)] mb:pt-16"
                )}
            >
                {!isHideHeader && !isTradingDetail && header}
                <main className="flex flex-1 flex-col bg-bg-main">
                    {children}
                </main>
                <Toaster closeButton={false} />
                {footer || (!isHideFooter && <FooterV2 />)}
                <BackTop />
            </div>
        </CheckoutProvider>
    );
}
