"use client";

import React from "react";
import { checkout } from "@/types/checkout";
import CaskSummarySidebar from "../cask-summary-sidebar";
import CheckoutProgressContent from "../checkout-progress-content";

type TCheckoutWorkspaceProps = {
    children: React.ReactNode;
    statusCheckout: checkout.TTransactionStatus;
};

export default function CheckoutWorkspace({
    children,
    statusCheckout,
}: TCheckoutWorkspaceProps) {
    return (
        <div className="container grid flex-1 grid-cols-16 tb:flex tb:max-w-none tb:flex-col tb:px-0">
            <div className="relative col-span-4 border-r border-bd-main tb:sticky tb:bottom-0 tb:z-20 tb:order-2 tb:w-full tb:border-r-0">
                <CaskSummarySidebar status={statusCheckout} />
            </div>

            <CheckoutProgressContent statusCheckout={statusCheckout}>
                {children}
            </CheckoutProgressContent>
        </div>
    );
}
