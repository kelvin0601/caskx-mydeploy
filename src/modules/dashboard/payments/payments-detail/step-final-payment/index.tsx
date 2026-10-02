"use client";

import PaymentStepCard, {
    ActionButtons,
} from "@/components/shared/payment-step-card";
import StepRowAccordion from "@/components/shared/step-row-accordion";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CHECKOUT_PAYMENT_METHOD, CHECKOUT_STATUS } from "@/enum/checkout";
import { useInvoiceDownload } from "@/hooks/useInvoiceDownload";
import { usePaymentProofDownload } from "@/hooks/usePaymentProofDownload";
import {
    compareIndexCurrentStep,
    formatCurrency,
    formatPaymentMethod,
} from "@/lib/utils";
import { TransactionInvoiceType } from "@/modules/_checkout/table-info-transaction";
import { checkout } from "@/types/checkout";
import { useCallback, useState } from "react";
import DialogPayments from "../dialog-payments";
import { getPaymentStatusText } from "../payment-status";
import { useQueryClient } from "@tanstack/react-query";
import { CHECKOUT_KEYS } from "@/lib/constants";
import { global } from "@/types/global/global";

export default function StepFinalPayment({
    status,
    amount,
    transactionId,
    processedAt,
    isDisabled = false,
    checkoutSessionId,
    paymentMethod,
    paymentStatus,
    manualPaymentEvidenceUrl,
    manualPaymentStatus,
    manualPaymentRejectionReason,
}: {
    status: global.TParticipantStatus;
    amount: number;
    transactionId: string;
    processedAt: string;
    isDisabled?: boolean;
    checkoutSessionId: string;
    paymentMethod: CHECKOUT_PAYMENT_METHOD | string | null;
    paymentStatus: checkout.TStatusCheckout;
    manualPaymentEvidenceUrl: string | null;
    manualPaymentStatus?: string | null;
    manualPaymentRejectionReason?: string | null;
}) {
    const queryClient = useQueryClient();

    const [dialogMode, setDialogMode] = useState<"confirm" | "reject" | null>(
        null
    );

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const isRejected =
        manualPaymentStatus?.toLowerCase() === "rejected" ||
        (paymentStatus as string).toLowerCase() === "rejected";
    const isManualTransfer = Boolean(
        paymentMethod === CHECKOUT_PAYMENT_METHOD.MANUAL_TRANSFER ||
        manualPaymentEvidenceUrl
    );
    const canReviewPayment =
        paymentStatus === CHECKOUT_STATUS.INVOICE_SUBMITTED &&
        status === "pending" &&
        !isRejected &&
        isManualTransfer &&
        Boolean(manualPaymentEvidenceUrl);
    const isConfirmDialog = dialogMode === "confirm";

    const { downloadInvoice, isLoading: isDownloadingInvoice } =
        useInvoiceDownload(checkoutSessionId, TransactionInvoiceType.FINAL);

    const { downloadPaymentProof, isLoading: isDownloadingPaymentProof } =
        usePaymentProofDownload(checkoutSessionId);
    const { stepsBeforeCurrent } = compareIndexCurrentStep(
        paymentStatus,
        CHECKOUT_STATUS.INVOICE_SUBMITTED
    );

    const renderDialog = useCallback(() => {
        return (
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (open) {
                        setDialogMode(dialogMode);
                    } else {
                        setTimeout(() => {
                            setDialogMode(null);
                        }, 500);
                    }
                }}
            >
                <DialogPayments
                    title={
                        isConfirmDialog ? "Confirm Payment" : "Reject Payment"
                    }
                    amount={formatCurrency(amount)}
                    method={
                        manualPaymentEvidenceUrl
                            ? "Manual Transfer"
                            : formatPaymentMethod(paymentMethod)
                    }
                    checkoutSessionId={checkoutSessionId}
                    isConfirmDialog={isConfirmDialog}
                    onCancel={() => {
                        setIsDialogOpen(false);
                        queryClient.invalidateQueries({
                            queryKey: [
                                CHECKOUT_KEYS.GET_ADMIN_SESSIONS,
                                checkoutSessionId,
                            ],
                        });
                    }}
                    onSuccess={() => {
                        setIsDialogOpen(false);
                        queryClient.invalidateQueries({
                            queryKey: [
                                CHECKOUT_KEYS.GET_ADMIN_SESSIONS,
                                checkoutSessionId,
                            ],
                        });
                    }}
                />
            </Dialog>
        );
    }, [
        dialogMode,
        isConfirmDialog,
        amount,
        paymentMethod,
        manualPaymentEvidenceUrl,
        checkoutSessionId,
        isDialogOpen,
        queryClient,
    ]);
    return (
        <>
            {isManualTransfer && renderDialog()}
            <StepRowAccordion
                title="Step 3: Final Payment"
                value="step-3"
                status={status}
                isActive={!isDisabled}
                isDisabled={isDisabled}
            >
                <PaymentStepCard
                    fields={[
                        {
                            label: "Amount",
                            value: formatCurrency(amount),
                        },
                        {
                            label: "Transaction ID",
                            value: transactionId,
                        },
                        {
                            label: "Processed At",
                            value: processedAt,
                        },
                        ...(status === "completed"
                            ? [
                                  {
                                      label: "Invoice",
                                      value: (
                                          <Button
                                              onClick={downloadInvoice}
                                              variant={"link"}
                                              className="h-auto justify-start p-0 text-sm text-typo-note"
                                              disabled={isDownloadingInvoice}
                                          >
                                              Download
                                              {isDownloadingInvoice
                                                  ? "..."
                                                  : ""}
                                          </Button>
                                      ),
                                  },
                              ]
                            : []),
                        ...(paymentMethod ===
                            CHECKOUT_PAYMENT_METHOD.MANUAL_TRANSFER ||
                        Boolean(manualPaymentEvidenceUrl)
                            ? [
                                  {
                                      label: "Payment Proof",
                                      value: (
                                          <Button
                                              onClick={downloadPaymentProof}
                                              variant={"link"}
                                              disabled={
                                                  !downloadPaymentProof ||
                                                  stepsBeforeCurrent.includes(
                                                      paymentStatus
                                                  ) ||
                                                  isDownloadingPaymentProof
                                              }
                                              className="h-auto justify-start p-0 text-sm text-typo-note"
                                          >
                                              Download{" "}
                                              {isDownloadingPaymentProof
                                                  ? "ing..."
                                                  : ""}
                                          </Button>
                                      ),
                                  },
                              ]
                            : []),
                        {
                            label: "Payment Method",
                            value:
                                status === "completed"
                                    ? formatPaymentMethod(paymentMethod)
                                    : "-",
                        },
                    ]}
                    status={isRejected ? "expired" : status}
                    statusText={
                        isRejected
                            ? "Payment Proof Rejected"
                            : getPaymentStatusText(status)
                    }
                    note={
                        isRejected && manualPaymentRejectionReason
                            ? `Payment proof was rejected: ${manualPaymentRejectionReason}`
                            : undefined
                    }
                    onConfirmClick={
                        canReviewPayment
                            ? () => {
                                  setDialogMode("confirm");
                              }
                            : undefined
                    }
                    onRejectClick={
                        canReviewPayment
                            ? () => {
                                  setDialogMode("reject");
                              }
                            : undefined
                    }
                    rejectText={canReviewPayment ? "Reject Payment" : undefined}
                >
                    {/* Action buttons */}
                    {canReviewPayment && (
                        <ActionButtons
                            rejectText="Reject Payment"
                            onRejectClick={() => {
                                setIsDialogOpen(true);
                                setDialogMode("reject");
                            }}
                            onConfirmClick={() => {
                                setIsDialogOpen(true);
                                setDialogMode("confirm");
                            }}
                        />
                    )}
                </PaymentStepCard>
            </StepRowAccordion>
        </>
    );
}
