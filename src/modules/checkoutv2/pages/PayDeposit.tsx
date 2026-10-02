"use client";

import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
    useMutation,
    UseMutationResult,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import CheckoutStatusPanel from "@/components/shared/checkout-status-panel";
import IconHistory from "@/components/shared/icons/icon-history";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { useInvoiceDownload } from "@/hooks/useInvoiceDownload";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { STRIPE_APPEARANCE } from "@/lib/constants/stripe";
import {
    formatCurrency,
    formatDateTime,
    getErrorMessage,
    formatDueDate,
} from "@/lib/utils";
import { TransactionInvoiceType } from "@/modules/_checkout/table-info-transaction";
import { checkoutServices } from "@/services/checkout";
import { useCheckout } from "@/store/checkout";
import { checkout } from "@/types/checkout";
import Link from "next/link";

import OrderDocuments from "../order-documents";
import StripeSecurityNotice from "../stripe-security-notice";

function DepositStripeForm({
    clientSecret,
    amount,
    paymentIntentId,
    confirmDepositPayment,
}: {
    clientSecret: string;
    amount: number;
    paymentIntentId?: string;
    confirmDepositPayment: UseMutationResult<
        {
            success: boolean;
            nextStep: Omit<checkout.TStep, "deposit_payment">;
            sessionId: string;
        },
        {
            status: number;
            statusCode: number;
            message: string;
            data: unknown;
        },
        string,
        unknown
    >;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const queryClient = useQueryClient();
    const { sessionId, setPopupCurrent, setIsOpenPopup, statusTransaction } =
        useCheckout();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePayLater = () => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentIntentId || !stripe || !elements || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const { error: submitError } = await elements.submit();
            if (submitError) {
                toast.error(
                    getErrorMessage(
                        submitError,
                        "Please check your payment details"
                    )
                );
                return;
            }

            const { error: stripeError, paymentIntent } =
                await stripe.confirmPayment({
                    clientSecret,
                    elements,
                    confirmParams: {},
                    redirect: "if_required",
                });

            if (stripeError) {
                toast.error(getErrorMessage(stripeError, "Payment failed"));
                return;
            }

            if (paymentIntent) {
                await confirmDepositPayment.mutateAsync(paymentIntent.id);
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
            queryClient.invalidateQueries({
                queryKey: [CHECKOUT_KEYS.GET_STATUS_SESSION, sessionId],
            });
        } catch (err) {
            toast.error(
                getErrorMessage(err, "An error occurred with the payment")
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-0 tb:gap-4">
            <div className="flex flex-col gap-4 rounded-none bg-bg-sf4 p-4">
                <h4 className="text-base font-semibold text-typo-primary tb:leading-[1.5] mb:leading-[1.2]">
                    Card detail
                </h4>

                <div className="w-full">
                    <PaymentElement
                        id="payment-element"
                        options={{
                            wallets: {
                                applePay: "never",
                                googlePay: "never",
                                link: "never",
                            },
                            layout: "tabs",
                        }}
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 bg-bg-sf4 px-4 pb-4 pt-2 tb:bg-transparent tb:p-0 mb:bg-transparent">
                <StripeSecurityNotice />
                <div className="flex items-center gap-1 mb:w-full">
                    <Button
                        onClick={handlePayLater}
                        variant="outline"
                        type="button"
                        className="mb:flex-1"
                    >
                        Pay later
                    </Button>
                    <Button
                        type="submit"
                        variant="action"
                        disabled={isSubmitting || !stripe || !elements}
                        className="mb:!w-auto mb:flex-1"
                    >
                        {isSubmitting
                            ? "Processing..."
                            : `Deposit ${formatCurrency(amount)}`}
                    </Button>
                </div>
            </div>
        </form>
    );
}

const stripePromise = loadStripe(env.stripePublicKey);

export default function PayDeposit() {
    const { sessionId, statusTransaction } = useCheckout();

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

    const { downloadInvoice, isLoading: isDownloading } = useInvoiceDownload(
        sessionId || "",
        TransactionInvoiceType.DEPOSIT
    );

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
                        The transfers typically take 3 days to complete.
                        <br />
                        We will notify you as soon as it&apos;s confirmed, and
                        provide instructions on the next steps.
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
        <div className="flex flex-col gap-8 tb:gap-0">
            <div className="flex flex-col gap-4 tb:border-b tb:border-bd-main tb:pb-6">
                <div className="flex flex-col gap-1">
                    <h3 className="font-inter text-lg font-semibold text-typo-primary tb:text-base mb:leading-[1.2]">
                        Deposit payment
                    </h3>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb:flex-col mb:items-start mb:gap-1">
                        <p className="text-sm text-typo-soft">
                            Secure your casks with a 10% deposit to proceed.
                        </p>
                        {statusTransaction?.expiryDate && (
                            <p className="text-sm text-typo-soft">
                                Due date:{" "}
                                <span className="font-semibold text-typo-primary">
                                    {formatDueDate(
                                        statusTransaction.expiryDate
                                    )}
                                </span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Card detail / Stripe form */}
                {clientSecret ? (
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
                            appearance: STRIPE_APPEARANCE,
                        }}
                    >
                        <DepositStripeForm
                            clientSecret={clientSecret}
                            amount={
                                createDepositSecret?.data?.amount ||
                                Number(statusTransaction?.depositAmount) ||
                                0
                            }
                            paymentIntentId={
                                createDepositSecret?.data?.paymentIntentId
                            }
                            confirmDepositPayment={confirmDepositPayment}
                        />
                    </Elements>
                ) : (
                    <div className="flex justify-center py-12">
                        <span className="animate-pulse text-sm text-typo-soft">
                            Initializing secure payment elements...
                        </span>
                    </div>
                )}
            </div>

            {/* Order documents section */}
            <OrderDocuments
                sessionId={sessionId}
                className="tb:pt-6"
                documents={[
                    {
                        name: "Deposit Invoice",
                        date:
                            statusTransaction?.transactions?.[0]?.updatedAt ||
                            statusTransaction?.transactions?.[0]?.createdAt,
                        isDownloading: isDownloading,
                        onDownload: downloadInvoice,
                    },
                ]}
            />
        </div>
    );
}
