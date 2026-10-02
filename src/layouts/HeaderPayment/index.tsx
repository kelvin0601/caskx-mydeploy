"use client";

import React from "react";
import LinkCustom from "@/components/shared/link-custom";
import ImagePreload from "@/components/shared/image-preload";
import { useCheckout } from "@/store/checkout";
import Breadcrumb from "@/components/shared/breadcrumb";
import { ROUTE_PUBLIC } from "@/lib/constants";

export default function HeaderCheckoutV2() {
    const { statusTransaction } = useCheckout();
    const caskName =
        statusTransaction?.cask?.master?.name || "Aberlour Ex-Sherry Hogshead";

    const breadcrumbItems = [
        { label: "Home", href: ROUTE_PUBLIC.HOME },
        { label: "My Trading", href: ROUTE_PUBLIC.PROFILE },
        { label: "Payment", href: ROUTE_PUBLIC.PROFILE_OFFER },
        { label: caskName },
    ];

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-bd-brown/30 bg-bg-main tb:h-[var(--height-header)]">
            <div className="container relative mx-auto flex w-full items-center justify-between">
                {/* Left: Breadcrumbs */}
                <Breadcrumb
                    items={breadcrumbItems}
                    className="min-w-0 flex-1 overflow-hidden"
                />

                {/* Center: Main Logo (Centered on desktop, hidden on mobile/tablet) */}
                <div className="absolute left-1/2 -translate-x-1/2 tb:hidden">
                    <LinkCustom
                        href={ROUTE_PUBLIC.HOME}
                        className="block h-4 w-[11.0625rem] flex-none overflow-hidden"
                    >
                        <ImagePreload
                            alt="Cask Exchange Logo"
                            src="/images/logo_full_dark.png"
                            width={440}
                            height={40}
                            className="img-w"
                        />
                    </LinkCustom>
                </div>
            </div>
        </header>
    );
}
