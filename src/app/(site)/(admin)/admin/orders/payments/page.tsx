import { PAGE_METADATA } from "@/lib/constants/metadata";
import PaymentsModule from "@/modules/dashboard/payments";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = PAGE_METADATA.ADMIN_ORDERS_PAYMENTS;

export default function PaymentsPage() {
    return (
        <Suspense>
            <PaymentsModule />
        </Suspense>
    );
}
