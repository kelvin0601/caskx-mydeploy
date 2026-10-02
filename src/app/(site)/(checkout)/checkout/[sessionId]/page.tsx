import { CHECKOUT_STEP } from "@/enum/checkout";
import { EDocuSignStatus } from "@/enum/docusign";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { getCheckoutStatus } from "@/lib/server/get-checkout-status";
import { handleCamelCaseToSnakeCase } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function CheckoutV2SessionPage({
    params,
}: {
    params: Promise<{ sessionId: string }>;
}) {
    const { sessionId } = await params;
    const status = await getCheckoutStatus(sessionId);
    if (!status) {
        redirect(ROUTE_PUBLIC.HOME);
    }

    const isSellerAgreementSigned = status.transactions?.every(
        (transaction) => {
            return (
                (transaction.sellerAgreementStatus ===
                    EDocuSignStatus.ALL_SIGNED &&
                    transaction?.sellerAgreementAdminSignedAt !== null) ||
                transaction?.buyerAgreementStatus ===
                    EDocuSignStatus.BUYER_UPDATE_REQUESTED
            );
        }
    );

    if (!isSellerAgreementSigned) {
        redirect(
            `${ROUTE_PUBLIC.CHECKOUT}/${sessionId}/${CHECKOUT_STEP.SELLER_CONFIRMATION}`
        );
    }

    if (status.currentStep) {
        redirect(
            `${ROUTE_PUBLIC.CHECKOUT}/${sessionId}/${handleCamelCaseToSnakeCase(
                status.currentStep
            )}`
        );
    }

    redirect(ROUTE_PUBLIC.HOME);
}
