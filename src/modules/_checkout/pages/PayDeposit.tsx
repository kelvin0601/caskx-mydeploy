"use client";

import CheckoutStatusPanel from "@/components/shared/checkout-status-panel";
import IconHistory from "@/components/shared/icons/icon-history";
import HeadingSettings from "@/components/shared/heading-settings";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { STRIPE_APPEARANCE } from "@/lib/constants/stripe";
import { checkoutServices } from "@/services/checkout";
import { useCheckout } from "@/store/checkout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import PaymentElementComp from "../forms/payment-element";
import TableInfoTransaction, {
    TransactionInvoiceType,
} from "../table-info-transaction";
import { useEffect } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import Link from "next/link";

const stripePromise = loadStripe(env.stripePublicKey);

export default function PayDeposit() {
    const { sessionId } = useCheckout();

    const createDepositSecret = useQuery({
        queryKey: [CHECKOUT_KEYS.CREATE_DEPOSIT_SECRET, sessionId],
        queryFn: () => checkoutServices.createDepositSecret(sessionId!),
        enabled: !!sessionId,
        retry: false,
    });
    const confirmDepositPayment = useMutation({
        mutationFn: (paymentIntentId: string) =>
            checkoutServices.confirmDepositPayment(paymentIntentId),
    });
    const clientSecret = createDepositSecret?.data?.clientSecret;

    useEffect(() => {
        if (createDepositSecret?.isError) {
            console.log("createDepositSecret.error", createDepositSecret.error);
            toast.error(
                getErrorMessage(
                    createDepositSecret.error,
                    "Failed to create deposit secret"
                )
            );
        }
    }, [createDepositSecret?.error, createDepositSecret?.isError]);
    if (confirmDepositPayment?.isSuccess) {
        return (
            <CheckoutStatusPanel
                icon={<IconHistory />}
                title="Deposit processing in progress"
                description={
                    <>
                        The transfers typically take{" "}
                        <strong className="font-semibold text-typo-primary">
                            3 days
                        </strong>{" "}
                        to complete. We will notify you as soon as it&apos;s
                        confirmed, and provide instructions on the next steps.
                    </>
                }
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
                className="mb-12 border-b-[1px] border-bd-brown pb-5 tb:mb-6 mb:mb-4"
                title="Deposit payment"
                description="Your funds will be securely held in escrow until the cask is officially allocated and all necessary documentation is completed."
            />
            <div className="rounded-md bg-bg-sf1 px-6 py-12 tb:py-8 mb:px-4 mb:py-6">
                <div className="flex flex-col gap-8 tb:gap-6 mb:gap-5">
                    <TableInfoTransaction
                        isDeposited={false}
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
                                    {" "}
                                    <PaymentElementComp
                                        amount={
                                            createDepositSecret?.data?.amount ||
                                            0
                                        }
                                        isDeposit={true}
                                        onSubmit={() => {
                                            if (
                                                !createDepositSecret?.data
                                                    ?.paymentIntentId
                                            )
                                                return;
                                            confirmDepositPayment.mutateAsync(
                                                createDepositSecret?.data
                                                    ?.paymentIntentId
                                            );
                                            window.scrollTo({
                                                top: 0,
                                                behavior: "auto",
                                            });
                                        }}
                                        clientSecret={clientSecret}
                                        paymentIntentId={
                                            createDepositSecret?.data
                                                ?.paymentIntentId
                                        }
                                    />
                                    {/* <CardPayment
                                        onSubmit={async (paymentIntentId) => {
                                            await confirmDepositPayment.mutateAsync(
                                                paymentIntentId
                                            );
                                            if (
                                                confirmDepositPayment.isSuccess
                                            ) {
                                                window.scrollTo({
                                                    top: 0,
                                                    behavior: "auto",
                                                });
                                            }
                                        }}
                                        clientSecret={clientSecret}
                                        paymentIntentId={
                                            createDepositSecret?.data
                                                ?.paymentIntentId
                                        }
                                        amount={
                                            createDepositSecret?.data?.amount ||
                                            0
                                        }
                                    /> */}
                                </Elements>
                            )}
                        </div>
                    </TableInfoTransaction>
                </div>
            </div>
        </div>
    );
}
