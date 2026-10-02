import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { getErrorMessage, downloadFile } from "@/lib/utils";
import { TransactionInvoiceType } from "@/modules/_checkout/table-info-transaction";
import { checkoutServices } from "@/services/checkout";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type InvoiceDownloadResponse = {
    downloadUrl: string;
};

export function useInvoiceDownload(
    checkoutSessionId: string,
    type: TransactionInvoiceType = TransactionInvoiceType.DEPOSIT,
    doc: "invoice" | "receipt" = "invoice",
    options?: Omit<
        UseMutationOptions<InvoiceDownloadResponse, unknown, void, unknown>,
        "mutationFn" | "mutationKey"
    >
) {
    const [isLoading, setIsLoading] = useState(false);

    const mutation = useMutation<InvoiceDownloadResponse, unknown, void>({
        mutationFn: () =>
            checkoutServices.getInvoiceDownloadUrl(
                checkoutSessionId,
                type,
                doc
            ),
        mutationKey: [
            CHECKOUT_KEYS.GET_INVOICE_DOWNLOAD_URL,
            checkoutSessionId,
            type,
            doc,
        ],
        ...options,
    });

    const downloadInvoice = async () => {
        try {
            setIsLoading(true);
            const res = await mutation.mutateAsync();
            if (res.downloadUrl) {
                downloadFile(res.downloadUrl);
                toast.success(
                    `${doc === "receipt" ? "Receipt" : "Invoice"} opened successfully`
                );
            }
            return res;
        } catch (error) {
            toast.error(getErrorMessage(error, `Failed to download ${doc}`));
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        ...mutation,
        isLoading,
        downloadInvoice,
    };
}
