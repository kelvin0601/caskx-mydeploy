"use client";

import React from "react";
import CheckoutStatusPanel from "@/components/shared/checkout-status-panel";
import IconClose from "@/components/shared/icons/icon-close";

import { Button } from "@/components/ui/button";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import Link from "next/link";

type TOrderCancelledProps = {
    description?: string;
};

export default function OrderCancelled({ description }: TOrderCancelledProps) {
    return (
        <CheckoutStatusPanel
            icon={<IconClose />}
            title="Order cancelled"
            description={
                description ||
                "Your order has been cancelled because seller confirmation could not be completed."
            }
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
