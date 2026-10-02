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
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { CHECKOUT_PAYMENT_METHOD, CHECKOUT_STATUS } from "@/enum/checkout";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { STRIPE_APPEARANCE } from "@/lib/constants/stripe";
import {
    cn,
    formatCurrency,
    formatDateTime,
    formatDueDate,
    getErrorMessage,
} from "@/lib/utils";
import { checkoutServices } from "@/services/checkout";
import { useBoundStore } from "@/store";
import { useCheckout } from "@/store/checkout";
import { useAgreementDownload } from "@/hooks/useAgreementDownload";
import { useInvoiceDownload } from "@/hooks/useInvoiceDownload";
import { TransactionInvoiceType } from "@/modules/_checkout/table-info-transaction";
import { ManualPaymentProofForm } from "../payment-manual";
import CheckoutStatusPanel from "@/components/shared/checkout-status-panel";
import IconSwitchHrz from "@/components/shared/icons/icon-switch";
import GridDetailItem from "../grid-detail-item";
import OrderDocuments from "../order-documents";
import StripeSecurityNotice from "../stripe-security-notice";

const PAYMENT_COMPLETION_STRIPE_APPEARANCE = {
    ...STRIPE_APPEARANCE,
    variables: {
        ...STRIPE_APPEARANCE.variables,
        labelMdFontSize: "0.75rem",
        labelSmFontSize: "0.75rem",
        labelMdFontWeight: "400",
        labelSmFontWeight: "400",
    },
};

type TPaymentMethod = "card" | "bank";

type TPaymentMethodOptionProps = {
    label: string;
    value: TPaymentMethod;
    selectedValue: TPaymentMethod;
    onSelect: (value: TPaymentMethod) => void;
};

function PaymentMethodOption({
    label,
    value,
    selectedValue,
    onSelect,
}: TPaymentMethodOptionProps) {
    const isSelected = selectedValue === value;

    return (
        <button
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(value)}
            className="flex w-fit cursor-pointer select-none items-center gap-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-bd-brown"
        >
            <span
                className={cn(
                    "flex size-4 items-center justify-center rounded-full border transition-colors tb:size-[0.875rem]",
                    isSelected ? "border-typo-primary" : "border-bd-main"
                )}
            >
                {isSelected && (
                    <span className="size-2 rounded-full bg-typo-primary tb:size-2.5" />
                )}
            </span>
            <span className="text-sm font-medium text-typo-primary tb:font-normal">
                {label}
            </span>
        </button>
    );
}

const CardPaymentForm = ({
    clientSecret,
    amount,
    paymentIntentId,
    confirmInvoicePayment,
    handlePayLater,
    mobileAlternativePaymentOption,
}: {
    clientSecret: string;
    amount: number;
    paymentIntentId?: string;
    confirmInvoicePayment: UseMutationResult<unknown, unknown, string, unknown>;
    handlePayLater: () => void;
    mobileAlternativePaymentOption: React.ReactNode;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useBoundStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const { sessionId } = useCheckout();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements || !paymentIntentId || isSubmitting) return;

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
                                email: user?.email || "",
                                phone: user?.phoneNumber || "",
                                address: { country: "US" },
                            },
                        },
                    },
                    redirect: "if_required",
                });

            if (stripeError) {
                toast.error(getErrorMessage(stripeError, "Payment failed"));
                return;
            }

            if (paymentIntent) {
                await confirmInvoicePayment.mutateAsync(paymentIntent.id);
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
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-0 tb:gap-4 tb:bg-bg-sf4 tb:p-4 mb:gap-2 mb:bg-transparent mb:p-0"
        >
            <div className="flex flex-col gap-4 rounded-none p-4 tb:p-0 mb:bg-bg-sf4 mb:p-4">
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

                <div className="hidden mb:block">
                    <StripeSecurityNotice />
                </div>
            </div>

            <div className="hidden mb:block">
                {mobileAlternativePaymentOption}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 bg-bg-sf4 px-4 pb-4 tb:bg-transparent tb:p-0 mb:mt-2 mb:bg-transparent">
                <div className="mb:hidden">
                    <StripeSecurityNotice />
                </div>
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
                            : `Pay ${formatCurrency(amount)}`}
                    </Button>
                </div>
            </div>
        </form>
    );
};

const stripePromise = loadStripe(env.stripePublicKey);

export default function PayInvoice() {
    const { setPopupCurrent, setIsOpenPopup, sessionId, statusTransaction } =
        useCheckout();
    const isManualPaymentRejected =
        statusTransaction?.manualPaymentStatus?.toLowerCase() === "rejected" ||
        statusTransaction?.paymentDetails?.manualPaymentStatus?.toLowerCase() ===
            "rejected";
    const manualPaymentRejectionReason =
        statusTransaction?.manualPaymentRejectionReason ||
        statusTransaction?.paymentDetails?.manualPaymentRejectionReason ||
        null;
    const [paymentMethod, setPaymentMethod] = useState<TPaymentMethod>(
        isManualPaymentRejected ||
            statusTransaction?.paymentMethod ===
                CHECKOUT_PAYMENT_METHOD.MANUAL_TRANSFER
            ? "bank"
            : "card"
    );
    const [downloadingDocId, setDownloadingDocId] = useState<string | null>(
        null
    );

    const status = statusTransaction?.status as CHECKOUT_STATUS;

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

    // Document download mutations
    const { downloadAgreement } = useAgreementDownload(sessionId);

    const { downloadInvoice: downloadFinalInvoice } = useInvoiceDownload(
        sessionId!,
        TransactionInvoiceType.FINAL,
        "invoice"
    );

    const { downloadInvoice: downloadDepositInvoice } = useInvoiceDownload(
        sessionId!,
        TransactionInvoiceType.DEPOSIT,
        "invoice"
    );

    const { downloadInvoice: handleDownloadReceipt } = useInvoiceDownload(
        sessionId!,
        TransactionInvoiceType.DEPOSIT,
        "receipt"
    );

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

    const clientSecret = invoiceSecretQuery.data?.clientSecret;

    // Assemble dynamic document list
    const documentList = useMemo(() => {
        const list = [];

        // Final Payment Invoice
        const finalInvoiceId = "final-invoice";
        list.push({
            name: "Final Payment Invoice",
            date:
                statusTransaction?.transactions?.[0]?.updatedAt ||
                statusTransaction?.transactions?.[0]?.createdAt,
            isDownloading: downloadingDocId === finalInvoiceId,
            onDownload: async () => {
                try {
                    setDownloadingDocId(finalInvoiceId);
                    await downloadFinalInvoice();
                } catch (e) {
                    console.error("Failed to download final invoice:", e);
                } finally {
                    setDownloadingDocId(null);
                }
            },
        });

        const numTransactions = statusTransaction?.transactions?.length || 0;

        if (numTransactions > 1) {
            // Transaction Agreements
            const agreements = statusTransaction?.transactions || [];
            agreements.forEach((ag, idx) => {
                const agName =
                    idx === 0
                        ? "Transaction Agreement"
                        : `Transaction Agreement #${idx + 1}`;
                const agId =
                    ag.buyerDocuSignEnvelopeId || `agreement-${ag.id || idx}`;
                list.push({
                    name: agName,
                    date:
                        ag.buyerAgreementSignedAt ||
                        ag.updatedAt ||
                        ag.createdAt,
                    isDownloading: downloadingDocId === agId,
                    onDownload: async () => {
                        const docusignId =
                            ag.agreementType === "direct"
                                ? ag.sellerAgreementDocuSignEnvelopeId
                                : ag.buyerDocuSignEnvelopeId;
                        if (!docusignId) {
                            toast.error("Envelope ID not found");
                            return;
                        }
                        try {
                            setDownloadingDocId(agId);
                            await downloadAgreement(docusignId);
                        } catch (e) {
                            console.error("Failed to download agreement:", e);
                        } finally {
                            setDownloadingDocId(null);
                        }
                    },
                });
            });
        } else if (numTransactions === 1) {
            const agId =
                statusTransaction?.buyerDocuSignEnvelopeId ||
                "agreement-single";
            list.push({
                name: `Transaction Agreement`,
                date: statusTransaction?.buyerDocuSignAdminSignedAt,
                isDownloading: downloadingDocId === agId,
                onDownload: async () => {
                    if (!statusTransaction?.buyerDocuSignEnvelopeId) {
                        toast.error("Envelope ID not found");
                        return;
                    }
                    try {
                        setDownloadingDocId(agId);
                        await downloadAgreement(
                            statusTransaction.buyerDocuSignEnvelopeId
                        );
                    } catch (e) {
                        console.error("Failed to download agreement:", e);
                    } finally {
                        setDownloadingDocId(null);
                    }
                },
            });
        }
        // Deposit Receipt
        const receiptId = "deposit-receipt";
        list.push({
            name: "Deposit Receipt",
            date:
                statusTransaction?.transactions?.[0]?.updatedAt ||
                statusTransaction?.transactions?.[0]?.createdAt,
            isDownloading: downloadingDocId === receiptId,
            onDownload: async () => {
                try {
                    setDownloadingDocId(receiptId);
                    await handleDownloadReceipt();
                } catch (e) {
                    console.error("Failed to download receipt:", e);
                } finally {
                    setDownloadingDocId(null);
                }
            },
        });

        // Deposit Invoice
        const depositInvoiceId = "deposit-invoice";
        list.push({
            name: "Deposit Invoice",
            date:
                statusTransaction?.transactions?.[0]?.updatedAt ||
                statusTransaction?.transactions?.[0]?.createdAt,
            isDownloading: downloadingDocId === depositInvoiceId,
            onDownload: async () => {
                try {
                    setDownloadingDocId(depositInvoiceId);
                    await downloadDepositInvoice();
                } catch (e) {
                    console.error("Failed to download deposit invoice:", e);
                } finally {
                    setDownloadingDocId(null);
                }
            },
        });

        return list;
    }, [
        statusTransaction,
        downloadingDocId,
        downloadFinalInvoice,
        downloadAgreement,
        handleDownloadReceipt,
        downloadDepositInvoice,
    ]);

    const remainingAmount = Number(statusTransaction?.remainingAmount || 0);

    if (
        status === CHECKOUT_STATUS.INVOICE_SUBMITTED &&
        !isManualPaymentRejected
    ) {
        return (
            <div className="flex flex-col gap-8 mb:gap-6">
                <CheckoutStatusPanel
                    icon={
                        <span className="block size-full">
                            <IconSwitchHrz />
                        </span>
                    }
                    title="Payment processing in progress"
                    description="We will notify you as soon as your payment is confirmed."
                />
                <OrderDocuments
                    sessionId={sessionId}
                    documents={documentList}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col pb-12 tb:pb-0">
            <div className="contents tb:flex tb:flex-col tb:border-b tb:border-bd-main tb:pb-6">
                {/* Payment completion section header */}
                <div className="flex flex-col gap-1">
                    <h3 className="font-inter text-lg font-semibold text-typo-primary tb:text-base mb:leading-[1.2]">
                        Payment completion
                    </h3>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb:flex-col mb:items-start mb:gap-1">
                        <p className="text-sm text-typo-soft">
                            Complete your payment to finalise the acquisition.
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

                {/* Payment Options Selector */}
                <div className="flex flex-col gap-2 pt-4">
                    {/* Payment Option: Credit Card */}
                    <div className="flex flex-col gap-2">
                        <PaymentMethodOption
                            label="Credit card"
                            value="card"
                            selectedValue={paymentMethod}
                            onSelect={setPaymentMethod}
                        />

                        {paymentMethod === "card" && (
                            <div>
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
                                            appearance:
                                                PAYMENT_COMPLETION_STRIPE_APPEARANCE,
                                        }}
                                    >
                                        <CardPaymentForm
                                            clientSecret={clientSecret}
                                            amount={remainingAmount}
                                            paymentIntentId={
                                                invoiceSecretQuery.data
                                                    ?.paymentIntentId
                                            }
                                            confirmInvoicePayment={
                                                confirmInvoicePayment
                                            }
                                            handlePayLater={handlePayLater}
                                            mobileAlternativePaymentOption={
                                                <PaymentMethodOption
                                                    label="Bank transfer"
                                                    value="bank"
                                                    selectedValue={
                                                        paymentMethod
                                                    }
                                                    onSelect={setPaymentMethod}
                                                />
                                            }
                                        />
                                    </Elements>
                                ) : (
                                    <div className="flex justify-center bg-bg-sf4 py-12">
                                        <span className="animate-pulse text-xs text-typo-note">
                                            Initializing secure payment
                                            elements...
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Payment Option: Bank Transfer */}
                    <div
                        className={cn(
                            "flex flex-col gap-2",
                            paymentMethod === "card" &&
                                clientSecret &&
                                "mb:hidden"
                        )}
                    >
                        <PaymentMethodOption
                            label="Bank transfer"
                            value="bank"
                            selectedValue={paymentMethod}
                            onSelect={setPaymentMethod}
                        />

                        {paymentMethod === "bank" && (
                            <div className="flex flex-col gap-6 rounded-none bg-bg-sf4 p-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1 tb:gap-0.5">
                                        <h4 className="text-base font-semibold text-typo-primary j-tb:leading-[1.5]">
                                            1. Complete your payment
                                        </h4>
                                        <p className="text-sm leading-normal text-typo-soft">
                                            Use the banking details below to
                                            complete your wire transfer. To
                                            ensure accurate processing, please
                                            include your invoice number in the
                                            payment reference.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 !gap-4">
                                        <GridDetailItem
                                            label="Bank Name"
                                            value="JPMorgan Chase"
                                        />
                                        <GridDetailItem
                                            label="Routing Number (U.S. Only)"
                                            value="021000021"
                                        />

                                        <GridDetailItem
                                            label="Account Number"
                                            value="660853279"
                                        />
                                        <GridDetailItem
                                            label="Account Name"
                                            value="CASKX LLC"
                                        />

                                        <GridDetailItem
                                            label="SWIFT Code (International Only)"
                                            value="CHASUS33"
                                        />
                                        <GridDetailItem
                                            label="Payment Reference Example"
                                            value={`Invoice ${statusTransaction?.id || ""}`}
                                        />
                                        <div className="col-span-2">
                                            <GridDetailItem
                                                label="Payment Amount"
                                                value={formatCurrency(
                                                    remainingAmount
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="mb-4 flex flex-col gap-1 tb:gap-0.5">
                                        <h4 className="text-base font-semibold text-typo-primary j-tb:leading-[1.5]">
                                            2. Upload payment proof{" "}
                                            <span className="text-brand j-tb:hidden">
                                                *
                                            </span>
                                        </h4>
                                        <p className="text-sm leading-normal text-typo-soft">
                                            Upload a screenshot or photo of your
                                            transfer confirmation.
                                        </p>
                                    </div>
                                    <ManualPaymentProofForm
                                        onPayLater={handlePayLater}
                                        isRejected={isManualPaymentRejected}
                                        rejectionReason={
                                            manualPaymentRejectionReason
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dynamic Order Documents Section */}
            <OrderDocuments
                sessionId={sessionId}
                documents={documentList}
                className="mt-8 border-t pt-8 tb:mt-0 tb:border-t-0 tb:pt-6"
            />
        </div>
    );
}
