"use client";

import InfoField from "@/components/shared/info-field";
import { Button } from "@/components/ui/button";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { usePaymentProofDownload } from "@/hooks/usePaymentProofDownload";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { getErrorMessage } from "@/lib/utils";
import { checkoutServices } from "@/services/checkout";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { TextareaWOutForm } from "@/components/ui/textarea";

type DialogPaymentsProps = {
    amount: string;
    method: string;
    title?: string;
    checkoutSessionId: string;
    isConfirmDialog: boolean;
    onCancel: () => void;
    onSuccess: () => void;
};

export default function DialogPayments({
    title,
    amount,
    method,
    checkoutSessionId,
    isConfirmDialog,
    onCancel,
    onSuccess,
}: DialogPaymentsProps) {
    const { downloadPaymentProof, isLoading: isDownloadingPaymentProof } =
        usePaymentProofDownload(checkoutSessionId);

    const [isConfirming, setIsConfirming] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [reason, setReason] = useState("");

    const approveManualPayment = useMutation({
        mutationFn: () =>
            checkoutServices.approveManualPayment(checkoutSessionId),
        mutationKey: [
            CHECKOUT_KEYS.ADMIN_MANUAL_PAYMENT_APPROVE,
            checkoutSessionId,
        ],
    });
    const rejectManualPayment = useMutation({
        mutationFn: (rejectionReason: string) =>
            checkoutServices.rejectManualPayment(
                checkoutSessionId,
                rejectionReason
            ),
        mutationKey: [
            CHECKOUT_KEYS.ADMIN_MANUAL_PAYMENT_REJECT,
            checkoutSessionId,
        ],
    });

    const handleSubmit = async () => {
        if (isConfirmDialog) {
            setIsConfirming(true);
            try {
                await approveManualPayment.mutateAsync();
                onSuccess();
            } catch (error) {
                toast.error(
                    getErrorMessage(error, "Failed to confirm payment")
                );
            } finally {
                setIsConfirming(false);
            }
            return;
        }

        setIsRejecting(true);
        try {
            await rejectManualPayment.mutateAsync(reason.trim());
            onSuccess();
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to reject payment"));
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <DialogContent className="w-[37.5rem]" aria-describedby={undefined}>
            <div className="flex flex-col gap-6">
                <DialogHeader>
                    <DialogTitle>{title || "Confirm Payment"}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                    <InfoField label="Amount" value={amount} />
                    <InfoField label="Payment Method" value={method} />
                    <div className="flex flex-col gap-1">
                        <div className="text-sm text-typo-note">
                            Payment Proof
                        </div>
                        <Button
                            variant="link"
                            onClick={downloadPaymentProof}
                            disabled={isDownloadingPaymentProof}
                        >
                            Download {isDownloadingPaymentProof ? "ing..." : ""}
                        </Button>
                    </div>
                </div>
                {!isConfirmDialog && (
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="payment-rejection-reason"
                            className="text-sm font-medium text-typo-primary"
                        >
                            Rejection reason (optional)
                        </label>
                        <TextareaWOutForm
                            id="payment-rejection-reason"
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Explain why the payment proof was rejected"
                            className="min-h-[90px]"
                        />
                    </div>
                )}
                <div className="flex flex-row items-center justify-center gap-6">
                    <Button
                        variant="outline"
                        className="w-32"
                        onClick={onCancel}
                        disabled={isConfirming || isRejecting}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="w-32"
                        variant={"secondary"}
                        onClick={handleSubmit}
                        disabled={isConfirming || isRejecting}
                    >
                        {isConfirmDialog
                            ? isConfirming
                                ? "Confirming..."
                                : "Confirm"
                            : isRejecting
                              ? "Rejecting..."
                              : "Reject"}
                    </Button>
                </div>
            </div>
        </DialogContent>
    );
}
