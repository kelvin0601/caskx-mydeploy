"use client";

import CheckoutStatusPanel from "@/components/shared/checkout-status-panel";
import IconHistory from "@/components/shared/icons/icon-history";
import HeadingSettings from "@/components/shared/heading-settings";
import { env } from "@/config/env";
import IconStripe from "@/components/shared/icons/icon-stripe";
import { Button } from "@/components/ui/button";
import { CHECKOUT_STATUS } from "@/enum/checkout";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { STRIPE_APPEARANCE } from "@/lib/constants/stripe";
import { formatDateTime } from "@/lib/utils";
import { checkoutServices } from "@/services/checkout";
import { useCheckout } from "@/store/checkout";
import { CardNumberElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PaymentManual } from "../../checkoutv2/payment-manual";
import TableInfoTransaction, {
    TransactionInvoiceType,
} from "../table-info-transaction";
import PaymentElementComp from "../forms/payment-element";
import Link from "next/link";

const stripePromise = loadStripe(env.stripePublicKey);

export default function PayInvoice({
    status,
    paymentStatus,
}: {
    status: CHECKOUT_STATUS;
    paymentStatus: string;
}) {
    const { setPopupCurrent, setIsOpenPopup, sessionId, statusTransaction } =
        useCheckout();
    const invoiceSecretQuery = useQuery({
        queryKey: [CHECKOUT_KEYS.CREATE_INVOICE_SECRET, sessionId],
        queryFn: () => checkoutServices.createInvoiceSecret(sessionId!),
        enabled: !!sessionId && status === CHECKOUT_STATUS.AGREEMENT_SIGNED,
    });
    const confirmInvoicePayment = useMutation({
        mutationFn: (paymentIntentId: string) =>
            checkoutServices.confirmInvoicePayment(paymentIntentId),
        mutationKey: [CHECKOUT_KEYS.CONFIRM_INVOICE_PAYMENT, sessionId],
    });
    const handleOpenPopup = () => {
        if (!statusTransaction?.expiryDate) return;
        setPopupCurrent({
            title: `Payment Due: ${
                formatDateTime(statusTransaction.expiryDate).dateOnly
            }`,
            description:
                "Please complete your payment by this date to secure your cask.",
            buttonText: "Pay now",
        });
        setIsOpenPopup(true);
    };
    const clientSecret = invoiceSecretQuery.data?.clientSecret;
    if (
        confirmInvoicePayment?.isSuccess ||
        (status === CHECKOUT_STATUS.INVOICE_SUBMITTED &&
            paymentStatus !== "rejected")
    ) {
        return (
            <CheckoutStatusPanel
                icon={<IconHistory />}
                title="Payment processing in progress..."
                description="We will notify you as soon as your payment confirmed."
                action={
                    <Button variant="link" asChild>
                        <Link href={ROUTE_PUBLIC.HOME}>Back to home</Link>
                    </Button>
                }
            />
        );
    }

    return (
        <div>
            <HeadingSettings
                className="mb-12 border-b-[1px] border-bd-brown pb-5"
                title="Final payment"
                description="Your funds will be securely held in escrow until the cask is officially allocated and all necessary documentation is completed."
            />
            <div className="rounded-md bg-bg-sf1 px-6 py-12 tb:py-8 mb:px-4 mb:py-6">
                <TableInfoTransaction
                    isDeposited={true}
                    isDownload={true}
                    type={TransactionInvoiceType.DEPOSIT}
                >
                    <div className="flex flex-col gap-2">
                        {clientSecret && (
                            <Elements
                                stripe={stripePromise}
                                options={{
                                    clientSecret: clientSecret,
                                    fonts: [
                                        {
                                            cssSrc: "https://fonts.googleapis.com/css?family=Inter",
                                        },
                                    ],
                                    loader: "always",
                                    locale: "en",
                                    appearance: {
                                        theme: "stripe",
                                        variables: {
                                            ...STRIPE_APPEARANCE.variables,
                                        },
                                    },
                                }}
                            >
                                <PaymentElementComp
                                    isShowPayLater={false}
                                    amount={Number(
                                        statusTransaction?.remainingAmount
                                    )}
                                    isDeposit={false}
                                    onSubmit={() => {
                                        if (
                                            !invoiceSecretQuery.data
                                                ?.paymentIntentId
                                        )
                                            return;
                                        confirmInvoicePayment.mutateAsync(
                                            invoiceSecretQuery.data
                                                ?.paymentIntentId
                                        );
                                        window.scrollTo({
                                            top: 0,
                                            behavior: "auto",
                                        });
                                    }}
                                    clientSecret={clientSecret}
                                    paymentIntentId={
                                        invoiceSecretQuery.data?.paymentIntentId
                                    }
                                />
                            </Elements>
                        )}
                        <PaymentManual />
                    </div>
                    <div className="flex flex-row items-center justify-between mb:flex-col mb:items-start mb:gap-3">
                        <div className="flex flex-row items-center gap-2">
                            <div className="rounded-[0.3125rem] bg-bg-main p-2">
                                <div className="w-8 [&_path]:fill-[#635BFF]">
                                    <IconStripe />
                                </div>
                            </div>
                            <div className="text-sm text-typo-soft">
                                Cask Exchange uses Stripe for processing
                                payments.
                            </div>
                        </div>
                        <Button
                            onClick={handleOpenPopup}
                            variant="outline"
                            type="button"
                            className="mb:w-full"
                        >
                            Pay later
                        </Button>
                    </div>
                </TableInfoTransaction>
            </div>
        </div>
    );
}
