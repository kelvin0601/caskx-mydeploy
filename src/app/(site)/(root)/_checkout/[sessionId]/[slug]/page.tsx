import CheckoutStatusPanel from "@/components/shared/checkout-status-panel";
import IconHistory from "@/components/shared/icons/icon-history";
import { Button } from "@/components/ui/button";
import { CHECKOUT_STATUS, CHECKOUT_STEP } from "@/enum/checkout";
import { EDocuSignStatus } from "@/enum/docusign";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { getCheckoutStatus } from "@/lib/server/get-checkout-status";
import { handleCamelCaseToSnakeCase } from "@/lib/utils";
import OwnershipTransfer from "@/modules/_checkout/pages/OwnershipTransfer";
import PayDeposit from "@/modules/_checkout/pages/PayDeposit";
import PayInvoice from "@/modules/_checkout/pages/PayInvoice";
import SignAgreement from "@/modules/_checkout/pages/SignAgreement";
import { checkout } from "@/types/checkout";
import Link from "next/link";
import { redirect } from "next/navigation";

const backToHomeAction = (
    <Button variant="link" asChild>
        <Link href={ROUTE_PUBLIC.HOME}>Back to home</Link>
    </Button>
);

export default async function CheckoutCatchAllPage({
    params,
}: {
    params: Promise<{ sessionId: string; slug: string }>;
}) {
    const { sessionId, slug } = (await params) || {};

    let status = null;
    let error = null;
    try {
        status = await getCheckoutStatus(sessionId);
    } catch (e) {
        error = e;
        console.log("error__________", error);
    } finally {
        if (
            (status as unknown as { statusCode?: number })?.statusCode === 403
        ) {
            redirect(ROUTE_PUBLIC.HOME);
        }
    }

    console.log("status__________________", JSON.stringify(status));

    const isSellerAgreementSigned = status?.transactions?.every(
        (transaction) => {
            return (
                (transaction.sellerAgreementStatus ===
                    EDocuSignStatus.ALL_SIGNED &&
                    transaction?.sellerAgreementAdminSignedAt !== null) ||
                transaction?.buyerAgreementStatus ===
                    EDocuSignStatus.BUYER_UPDATE_REQUESTED ||
                transaction.buyerAgreementStatus ===
                    EDocuSignStatus.BUYER_UPDATE_REQUESTED
            );
        }
    );
    const isBuyerAgreementSigned = status?.transactions?.every(
        (transaction) => {
            return (
                transaction.buyerAgreementStatus ===
                EDocuSignStatus.BUYER_SIGNED
            );
        }
    );

    if (!isSellerAgreementSigned) {
        return (
            <CheckoutStatusPanel
                icon={<IconHistory />}
                title="Your bid has been matched"
                description="We’re confirming the match with the seller. You’ll receive an email once it’s ready for purchase."
                action={backToHomeAction}
            />
        );
    }

    if (isBuyerAgreementSigned) {
        return (
            <CheckoutStatusPanel
                icon={<IconHistory />}
                title="Your purchasing agreement is in review..."
                description="We will notify you as soon as your agreement confirmed."
                action={backToHomeAction}
            />
        );
    }

    const convertStep = handleCamelCaseToSnakeCase(status?.currentStep || "");
    if (convertStep && convertStep !== slug) {
        redirect(`${ROUTE_PUBLIC.CHECKOUT}/${sessionId}/${convertStep}`);
    }
    // console.log("status", JSON.stringify(status));

    switch (slug) {
        case CHECKOUT_STEP.DEPOSIT_PAYMENT:
            return <PayDeposit />;
        case CHECKOUT_STEP.AGREEMENT_SIGNING:
            return <SignAgreement />;
        case CHECKOUT_STEP.INVOICE_PAYMENT:
            return (
                <PayInvoice
                    status={status?.status as CHECKOUT_STATUS}
                    paymentStatus={status?.manualPaymentStatus as string}
                />
            );
        case CHECKOUT_STEP.OWNERSHIP_TRANSFER:
            return (
                <OwnershipTransfer
                    status={status as checkout.TTransactionStatus}
                />
            );
        default:
            redirect(ROUTE_PUBLIC.HOME);
    }
}
