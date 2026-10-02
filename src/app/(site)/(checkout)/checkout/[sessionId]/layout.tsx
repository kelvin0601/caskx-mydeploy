import { PAGE_METADATA } from "@/lib/constants/metadata";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { getCheckoutStatus } from "@/lib/server/get-checkout-status";
import CheckoutLayoutV2 from "@/modules/checkoutv2/checkout-layout-v2";
import { redirect } from "next/navigation";

export const metadata = PAGE_METADATA.CHECKOUT;

export default async function CheckoutV2RootLayout({
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
        <CheckoutLayoutV2 statusCheckout={statusCheckout} sessionId={sessionId}>
            {children}
        </CheckoutLayoutV2>
    );
}
