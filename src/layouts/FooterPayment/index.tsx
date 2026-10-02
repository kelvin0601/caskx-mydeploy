"use client";

import React from "react";
import LinkCustom from "@/components/shared/link-custom";

export default function FooterCheckoutV2() {
    return (
        <footer className="w-full border-t bg-bg-main py-6 text-xs text-typo-soft tb:text-sm mb:py-0">
            <div className="container mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between tb:flex-col tb:items-center tb:gap-3 mb:hidden">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 tb:justify-center tb:gap-x-4 tb:leading-none">
                    <LinkCustom
                        href="/privacy-policy"
                        className="transition-colors hover:text-typo-primary"
                    >
                        Privacy Policy
                    </LinkCustom>
                    <span className="text-bd-brown/40">|</span>
                    <LinkCustom
                        href="/buyer-terms"
                        className="transition-colors hover:text-typo-primary"
                    >
                        Buyer Terms of Use
                    </LinkCustom>
                    <span className="text-bd-brown/40">|</span>
                    <LinkCustom
                        href="/seller-terms"
                        className="transition-colors hover:text-typo-primary"
                    >
                        Seller Terms of Use
                    </LinkCustom>
                    <span className="text-bd-brown/40">|</span>
                    <LinkCustom
                        href="/trading-fee"
                        className="transition-colors hover:text-typo-primary"
                    >
                        Trading Fee Announcement
                    </LinkCustom>
                </div>
                <div className="font-medium tb:font-normal">
                    © 2026 Cask Exchange. All rights reserved.
                </div>
            </div>
            <div className="hidden w-full flex-col text-xs font-normal leading-[1.2] mb:flex">
                <div className="border-b border-bd-main py-3 text-center">
                    © 2026 Cask Exchange. All rights reserved.
                </div>
                <div className="grid grid-cols-2 bg-bg-sf2">
                    <LinkCustom
                        href="/privacy-policy"
                        className="border-b border-r border-bd-main py-2.5 text-center"
                    >
                        Privacy Policy
                    </LinkCustom>
                    <LinkCustom
                        href="/buyer-terms"
                        className="border-b border-bd-main py-2.5 text-center"
                    >
                        Buyer Terms of Use
                    </LinkCustom>
                    <LinkCustom
                        href="/seller-terms"
                        className="border-r border-bd-main py-2.5 text-center"
                    >
                        Seller Terms of Use
                    </LinkCustom>
                    <LinkCustom
                        href="/trading-fee"
                        className="py-2.5 text-center"
                    >
                        Trading Fee Announcement
                    </LinkCustom>
                </div>
            </div>
        </footer>
    );
}
