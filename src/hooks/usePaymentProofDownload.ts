import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { checkoutServices } from "@/services/checkout";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { downloadFile, getErrorMessage } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

type PaymentProofResponse = {
    manualPaymentEvidenceUrl?: string;
    downloadUrl?: string;
    url?: string;
};

export function usePaymentProofDownload(
    checkoutSessionId: string,
    options?: Omit<
        UseMutationOptions<PaymentProofResponse, unknown, void, unknown>,
        "mutationFn" | "mutationKey"
    >
) {
    const [isLoading, setIsLoading] = useState(false);
    const mutation = useMutation({
        mutationFn: () =>
            checkoutServices.getPaymentProofDownloadUrl(checkoutSessionId),
        mutationKey: [
            CHECKOUT_KEYS.GET_PAYMENT_PROOF_DOWNLOAD_URL,
            checkoutSessionId,
        ],
        ...options,
    });

    const downloadPaymentProof = async () => {
        try {
            setIsLoading(true);
            const res = (await mutation.mutateAsync()) as PaymentProofResponse;
            const targetUrl =
                res?.manualPaymentEvidenceUrl ||
                res?.downloadUrl ||
                res?.url ||
                (typeof res === "string" ? res : undefined);
            if (targetUrl) {
                const cleanUrl = targetUrl.split("?")[0];
                const fileExtension = cleanUrl.split(".").pop() || "png";
                await downloadFile(targetUrl, `Payment Proof.${fileExtension}`);
            }
            toast.success("Document opened in a new tab");
            return res;
        } catch (error) {
            toast.error(
                getErrorMessage(error, "Failed to download payment proof")
            );
        } finally {
            setIsLoading(false);
        }
    };

    return {
        ...mutation,
        isLoading,
        downloadPaymentProof,
    };
}
