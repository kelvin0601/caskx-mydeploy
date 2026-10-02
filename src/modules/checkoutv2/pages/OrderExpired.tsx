"use client";

import React from "react";
import CheckoutStatusPanel from "@/components/shared/checkout-status-panel";
import IconHourglass from "@/components/shared/icons/icon-hourglass";
import { Button } from "@/components/ui/button";
import { CHECKOUT_STATUS } from "@/enum/checkout";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { formatDateTime } from "@/lib/utils";
import { checkout } from "@/types/checkout";
import Link from "next/link";

type TOrderExpiredProps = {
    status?: checkout.TTransactionStatus | null;
};

function getExpiryContent(status?: checkout.TTransactionStatus | null) {
    const expiryDate = status?.expiryDate;
    const formattedExpiry = expiryDate
        ? `${formatDateTime(expiryDate).dateOnly} at ${formatDateTime(expiryDate).timeOnly}`
        : null;

    const expiredAtText = formattedExpiry ? ` on ${formattedExpiry}` : "";

    switch (status?.status) {
        case CHECKOUT_STATUS.DEPOSIT_EXPIRED:
            return {
                title: "Deposit payment expired",
                description: `The payment window for the deposit expired${expiredAtText}. This order is closed and the cask has been released back to the marketplace.`,
            };
        case CHECKOUT_STATUS.AGREEMENT_EXPIRED:
            return {
                title: "Agreement signing expired",
                description: `The signing window for the purchase agreement expired${expiredAtText}. This order is closed and the cask has been released back to the marketplace.`,
            };
        case CHECKOUT_STATUS.INVOICE_EXPIRED:
            return {
                title: "Invoice payment expired",
                description: `The final payment window for this order expired${expiredAtText}. This order is closed and can no longer be processed.`,
            };
        case CHECKOUT_STATUS.EXPIRED:
        default:
            return {
                title: "Order expired",
                description: `This checkout session expired${expiredAtText}. This order is closed and can no longer be processed.`,
            };
    }
}

export default function OrderExpired({ status }: TOrderExpiredProps) {
    const { title, description } = getExpiryContent(status);

    return (
        <CheckoutStatusPanel
            icon={<IconHourglass />}
            title={title}
            description={description}
            action={
                <Button variant="outline" asChild>
                    <Link href={ROUTE_PUBLIC.CASK_DETAILS}>
                        Browse marketplace
                    </Link>
                </Button>
            }
        />
    );
}
