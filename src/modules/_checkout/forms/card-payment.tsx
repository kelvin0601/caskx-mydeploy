"use client";

import IconStripe from "@/components/shared/icons/icon-stripe";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { LabelWithOutForm } from "@/components/ui/label";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import {
    convertRemToPx,
    formatCurrency,
    formatDateTime,
    getErrorMessage,
} from "@/lib/utils";
import { checkoutServices } from "@/services/checkout";
import { useBoundStore } from "@/store";
import { useCheckout } from "@/store/checkout";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type TCardPaymentProps = {
    paymentIntentId?: string;
    clientSecret: string;
    onSubmit?: (paymentIntentId: string) => void;
    amount?: number;
    isDeposit?: boolean;
};

export default function CardPayment({
    paymentIntentId,
    clientSecret,
    amount,
    isDeposit = false,
    onSubmit,
}: TCardPaymentProps) {
    const stripe = useStripe();

    const { user } = useBoundStore();
    const elements = useElements();

    // State to track if CardElement is ready
    const [isCardElementReady, setIsCardElementReady] = useState(false);

    // Check if Stripe is ready
    const isStripeReady = stripe && elements;
    const { setPopupCurrent, setIsOpenPopup, sessionId, statusTransaction } =
        useCheckout();
    const queryClient = useQueryClient();
    const confirmDepositPayment = useMutation({
        mutationFn: (paymentIntentId: string) =>
            checkoutServices.confirmDepositPayment(paymentIntentId),
    });

    const schemaPayment = z.object({
        saveInformation: z.boolean().refine((val) => val === true, {
            message: "Please check the box",
        }),
    });
    const form = useForm<z.infer<typeof schemaPayment>>({
        resolver: zodResolver(schemaPayment),
        defaultValues: {
            saveInformation: false,
        },
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
    const handleSubmit = async (data: z.infer<typeof schemaPayment>) => {
        console.log(data, paymentIntentId);
        if (!paymentIntentId || !stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            form.setError("saveInformation", {
                message: "Card element not found",
            });
            return;
        }

        try {
            const { error: stripeError, paymentIntent } =
                await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            address: {
                                country: "US",
                            },
                            email: user?.email,
                            phone: user?.phoneNumber,
                        },
                    },
                });

            console.log("paymentIntent", paymentIntent);
            if (stripeError || !paymentIntent?.id) {
                toast.error(getErrorMessage(stripeError, "Payment failed"));
                return;
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                toast.success("Payment successful");
            }

            onSubmit?.(paymentIntent.id);
            queryClient.invalidateQueries({
                queryKey: [CHECKOUT_KEYS.GET_STATUS_SESSION, sessionId],
            });
            queryClient.invalidateQueries({
                queryKey: [CHECKOUT_KEYS.GET_STATUS_SESSION, sessionId],
            });
        } catch (err) {
            form.setError("saveInformation", {
                message:
                    (err as Error)?.message || "An unexpected error occurred",
            });
        }
    };
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
            >
                <div className="space-y-4">
                    <div>
                        <div className="relative mt-2 rounded-md bg-bg-main p-4">
                            <CardElement
                                options={{
                                    disableLink: true,

                                    hidePostalCode: true,
                                    style: {
                                        base: {
                                            fontSize: `${convertRemToPx(1)}px`,
                                            color: "#424770",
                                            fontFamily: "Inter",
                                        },
                                    },
                                }}
                                onChange={(e) => {
                                    console.log(e);
                                }}
                                onEscape={() => {
                                    console.log("escape");
                                }}
                                onBlur={() => {
                                    console.log("blur");
                                }}
                                onFocus={() => {
                                    console.log("focus");
                                }}
                                onReady={() => {
                                    console.log("CardElement is ready");
                                    setIsCardElementReady(true);
                                }}
                            />

                            {!isCardElementReady && (
                                <div className="absolute left-0 right-0 top-0 rounded-md bg-bg-main">
                                    <div className="flex flex-col gap-2 p-2">
                                        <Skeleton className="h-4 w-full bg-bg-sf2" />
                                        <Skeleton className="h-4 w-full bg-bg-sf2" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-row rounded-md bg-bg-main p-4">
                    <div className="flex content-start items-start space-x-2">
                        <FormField
                            name="saveInformation"
                            control={form.control}
                            render={({ field }) => (
                                <div className="flex flex-col">
                                    <div className="flex flex-row items-start gap-2">
                                        <Checkbox
                                            id="saveInformation"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                        <LabelWithOutForm htmlFor="payment">
                                            <div className="text-sm font-medium text-typo-primary">
                                                Save my information for faster
                                                checkout
                                            </div>
                                            <div className="text-xs text-typo-soft">
                                                Pay faster on Cask Exchange and
                                                everywhere Link is accepted.
                                            </div>
                                        </LabelWithOutForm>
                                    </div>
                                    <FormMessage />
                                </div>
                            )}
                        />
                    </div>
                </div>
                <div className="flex flex-row items-center justify-between mb:flex-col">
                    <div className="flex flex-row items-center gap-2">
                        <div className="rounded-[0.3125rem] bg-bg-main p-2">
                            <div className="w-8 [&_path]:fill-[#635BFF]">
                                <IconStripe />
                            </div>
                        </div>
                        <div className="text-sm text-typo-soft">
                            Cask Exchange uses Stripe for processing payments.
                        </div>
                    </div>

                    <div className="flex flex-row gap-3">
                        <Button
                            onClick={handleOpenPopup}
                            variant="outline"
                            className="bg-bg-main"
                        >
                            Pay later
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                !form.formState.isValid ||
                                form.formState.isSubmitting ||
                                !isStripeReady ||
                                !isCardElementReady
                            }
                            className="disabled:bg-bg-sf2"
                            variant="secondary"
                        >
                            {confirmDepositPayment.isPending
                                ? "Processing..."
                                : isDeposit
                                  ? `Deposit ${formatCurrency(amount || 0)}`
                                  : `Pay ${formatCurrency(amount || 0)}`}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
