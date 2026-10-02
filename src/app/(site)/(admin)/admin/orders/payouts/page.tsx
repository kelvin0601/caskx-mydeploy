import { PAGE_METADATA } from "@/lib/constants/metadata";
import PayoutModule from "@/modules/dashboard/payout";
import React, { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = PAGE_METADATA.ADMIN_ORDERS_PAYOUTS;

export default function PayoutsPage() {
    return (
        <Suspense>
            <PayoutModule />
        </Suspense>
    );
}
