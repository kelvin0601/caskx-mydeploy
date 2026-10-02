import { PAGE_METADATA } from "@/lib/constants/metadata";
import PayoutsDetailModule from "@/modules/dashboard/payout/payouts-detail";
import React from "react";

export const metadata = PAGE_METADATA.ADMIN_ORDERS_PAYOUT_DETAIL;

export default async function PayoutsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <PayoutsDetailModule transactionId={id} />;
}
