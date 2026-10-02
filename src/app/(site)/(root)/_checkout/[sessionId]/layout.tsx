import CheckoutLayout from "@/layouts/CheckoutLayout";
import { MENU_CHECKOUT } from "@/lib/constants";
import { PAGE_METADATA } from "@/lib/constants/metadata";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { getCheckoutStatus } from "@/lib/server/get-checkout-status";
import { redirect } from "next/navigation";

export const metadata = PAGE_METADATA.CHECKOUT;

export default async function CheckoutRootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{
        sessionId: string;
    }>;
}) {
    const { sessionId } = (await params) || {};
    if (!sessionId) {
        redirect(ROUTE_PUBLIC.HOME);
    }
    const statusCheckout = await getCheckoutStatus(sessionId);
    if (!statusCheckout) {
        redirect(ROUTE_PUBLIC.HOME);
    }
    return (
        <CheckoutLayout
            statusCheckout={statusCheckout}
            sessionId={sessionId}
            menus={MENU_CHECKOUT}
        >
            {children}
        </CheckoutLayout>
    );
}
