import { KEY_DOCUSIGN } from "@/lib/constants";
import { getErrorMessage, downloadFile } from "@/lib/utils";
import docusignServices from "@/services/docusign";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function useAgreementDownload(
    agreementId?: string,
    options?: Omit<
        UseMutationOptions<Blob | string, unknown, string, unknown>,
        "mutationFn" | "mutationKey"
    >,
    name?: string
) {
    const [isLoading, setIsLoading] = useState(false);

    const mutation = useMutation<Blob | string, unknown, string>({
        mutationFn: (envelopeId: string) =>
            docusignServices.getDocuments(envelopeId),
        mutationKey: [KEY_DOCUSIGN.GET_DOCUMENTS, agreementId],
        ...options,
    });

    const downloadAgreement = async (id: string) => {
        try {
            setIsLoading(true);
            const documents = await mutation.mutateAsync(id);
            if (documents) {
                downloadFile(documents);
                toast.success("Agreement opened successfully");
            }
            return documents;
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to open agreement"));
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        ...mutation,
        isLoading,
        downloadAgreement,
    };
}
