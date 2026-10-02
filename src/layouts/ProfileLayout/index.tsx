"use client";

import React from "react";
import MenuProfile from "./menu-profile";
import BaseSidebarLayout from "../SidebarLayout";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { usePathname } from "next/navigation";

export default function ProfileLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isOfferDetail = pathname.startsWith(`${ROUTE_PUBLIC.OFFER_DETAIL}/`);
    const isListingDetail = pathname.startsWith(
        `${ROUTE_PUBLIC.LISTING_DETAIL}/`
    );
    const isListings = pathname === ROUTE_PUBLIC.PROFILE_LISTINGS;

    if (isOfferDetail || isListingDetail) return <>{children}</>;

    return (
        <BaseSidebarLayout
            sidebar={<MenuProfile />}
            containerClassName={
                isListings
                    ? "dk:[&>div]:pb-3 tb:[&>div]:min-h-0 j-tb:[&>div]:pb-0"
                    : undefined
            }
            contentContainerClassName={
                isListings
                    ? "!p-0 dk:-ml-4 dk:-mr-[var(--padding-container)] tb:min-h-[calc(100vh-var(--height-header)-9.25rem)] j-tb:ml-0 j-tb:mr-0"
                    : undefined
            }
        >
            {children}
        </BaseSidebarLayout>
    );
}
