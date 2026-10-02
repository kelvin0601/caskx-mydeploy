"use client";

import IconCreditCard from "@/components/shared/icons/icon-credit-card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { formatCurrency, formatDateTime, getErrorMessage } from "@/lib/utils";
import { useBoundStore } from "@/store";
import { useCheckout } from "@/store/checkout";
import {
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type TCardPaymentProps = {
    paymentIntentId?: string;
    clientSecret: string;
    onSubmit?: (paymentIntentId: string) => void;
    amount?: number;
    isDeposit?: boolean;
    isShowPayLater?: boolean;
};

export default function PaymentElementComp({
    paymentIntentId,
    clientSecret,
    amount,
    isDeposit = false,
    onSubmit,
    isShowPayLater,
}: TCardPaymentProps) {
    const { sessionId } = useCheckout();
    const stripe = useStripe();
    const { user } = useBoundStore();
    const elements = useElements();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { setPopupCurrent, setIsOpenPopup, statusTransaction } =
        useCheckout();

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

    const handleSubmit = async () => {
        if (!paymentIntentId || !stripe || !elements || isSubmitting) return;

        const cardElement = elements.getElement(PaymentElement);
        if (!cardElement) {
            toast.error("Card element not found", {
                description: "Please try again",
            });
            return;
        }
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
                    confirmParams: {
                        payment_method_data: {
                            billing_details: {
                                name: `${user?.firstName} ${user?.lastName}`,
                                email: user!.email! || "",
                                phone: user!.phoneNumber! || "",
                                address: {
                                    country: "US",
                                },
                            },
                        },
                    },
                    redirect: "if_required",
                });

            if (stripeError) {
                toast.error(getErrorMessage(stripeError, "Payment failed"));
                return;
            }
            console.log("paymentIntent", paymentIntent);
            if (paymentIntent) {
                onSubmit?.(paymentIntent.id);
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
        <Accordion
            type="single"
            collapsible
            defaultValue="card-payment"
            className="w-full overflow-hidden rounded-lg bg-bg-main"
        >
            <AccordionItem value="card-payment" className="border-none">
                <AccordionTrigger
                    className="[&>svg]:text-slate-500 mb-4 border-b px-4 pb-4 text-left text-base font-medium text-typo-primary data-[state=closed]:mb-0 data-[state=closed]:border-none data-[state=closed]:pb-6 tb:px-4"
                    classNameChevron="h-5 w-5 text-slate-500"
                >
                    <div className="flex flex-row items-center gap-2">
                        <div className="size-5 text-typo-note [&_path]:stroke-current">
                            <IconCreditCard />
                        </div>
                        Card
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <div className="mt-2 rounded-md bg-bg-main p-4">
                                    <PaymentElement
                                        id="payment-element"
                                        options={{
                                            wallets: {
                                                applePay: "never",
                                                googlePay: "never",
                                                link: "never",
                                            },

                                            fields: {
                                                billingDetails: {
                                                    address: {
                                                        country: "auto",
                                                        postalCode: "auto",
                                                        line1: "auto",
                                                        line2: "auto",
                                                        city: "auto",
                                                        state: "auto",
                                                    },
                                                    email: "auto",
                                                    phone: "auto",
                                                    name: "auto",
                                                },
                                            },
                                            layout: "tabs",
                                            business: {
                                                name: "Cask Exchange",
                                            },
                                            paymentMethodOrder: ["card"],
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row items-center justify-end px-4">
                            <div className="flex flex-row gap-3">
                                {isShowPayLater && (
                                    <Button
                                        onClick={handleOpenPopup}
                                        variant="outline"
                                        className="bg-bg-main"
                                    >
                                        Pay later
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSubmit}
                                    className="disabled:bg-bg-sf2"
                                    disabled={isSubmitting}
                                    variant="secondary"
                                >
                                    {isSubmitting
                                        ? "Processing..."
                                        : isDeposit
                                          ? `Deposit ${formatCurrency(
                                                amount || 0
                                            )}`
                                          : `Pay ${formatCurrency(
                                                amount || 0
                                            )}`}
                                </Button>
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
