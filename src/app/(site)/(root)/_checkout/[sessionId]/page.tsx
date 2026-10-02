import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { getCheckoutStatus } from "@/lib/server/get-checkout-status";
import { handleCamelCaseToSnakeCase } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function CheckoutPage({
    params,
}: {
    params: Promise<{ sessionId: string }>;
}) {
    const { sessionId } = await params;
    const status = await getCheckoutStatus(sessionId);
    if (status?.currentStep) {
        redirect(
            `${ROUTE_PUBLIC.CHECKOUT}/${sessionId}/${handleCamelCaseToSnakeCase(
                status.currentStep
            )}`
        );
    }
}
