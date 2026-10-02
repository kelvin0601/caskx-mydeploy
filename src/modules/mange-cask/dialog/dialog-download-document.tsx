import IconDownload from "@/components/shared/icons/icon-download";
import IconFile from "@/components/shared/icons/icon-file";
import IconFileCheck from "@/components/shared/icons/icon-file-check";
import IconWallet2 from "@/components/shared/icons/icon-wallet-2";
import ActionOptionItem from "@/components/shared/item-action-w-ic";
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CHECKOUT_KEYS, KEY_TRANSACTIONS } from "@/lib/constants/key";
import { cn, getErrorMessage, downloadFile } from "@/lib/utils";
import { TransactionInvoiceType } from "@/modules/_checkout/table-info-transaction";
import { checkoutServices } from "@/services/checkout";
import caskTransactionsService from "@/services/cask-transactions";
import { transaction } from "@/types/transaction";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useManageCask } from "../provider";
import docusignServices from "@/services/docusign";

type InvoiceDownloadResponse = {
    downloadUrl: string;
};

const DOCUMENT_OPTIONS = [
    { id: "deposit_receipt", title: "Deposit Receipt", icon: <IconFile /> },
    {
        id: "final_payment_receipt",
        title: "Final Payment Receipt",
        icon: <IconWallet2 />,
    },
    {
        id: "purchasing_agreement",
        title: "Purchasing Agreement",
        icon: <IconFileCheck />,
    },
    { id: "ownership", title: "Ownership", icon: <IconFileCheck /> },
] as const;

type DocumentId = (typeof DOCUMENT_OPTIONS)[number]["id"];

const DOCUMENT_TYPE_MAP: Record<
    DocumentId,
    transaction.TCheckoutSessionDocumentType
> = {
    deposit_receipt: "deposit_receipt",
    final_payment_receipt: "final_receipt",
    purchasing_agreement: "seller_agreement",
    ownership: "ownership_transfer",
};

export default function DialogDownloadDocuments() {
    const { dialogData } = useManageCask();
    const sessionId = (dialogData as { paymentSessionId?: string })
        ?.paymentSessionId;

    const getDocumentsQuery = useQuery({
        queryKey: [
            KEY_TRANSACTIONS.CHECKOUT_SESSIONS,
            sessionId,
            KEY_TRANSACTIONS.DOCUMENTS,
        ],
        queryFn: () =>
            caskTransactionsService.getCheckoutSessionDocuments(
                sessionId as string
            ),
        enabled: !!sessionId,
    });

    const { mutate: downloadDoc, isPending } = useMutation<
        InvoiceDownloadResponse | string,
        unknown,
        DocumentId
    >({
        mutationKey: [
            CHECKOUT_KEYS.GET_INVOICE_DOWNLOAD_URL,
            "documents",
            sessionId,
        ],
        mutationFn: async (docId: DocumentId) => {
            if (!sessionId) throw new Error("Session not found");
            if (docId === "deposit_receipt")
                return checkoutServices.getInvoiceDownloadUrl(
                    sessionId,
                    TransactionInvoiceType.DEPOSIT
                );
            if (docId === "final_payment_receipt")
                return checkoutServices.getInvoiceDownloadUrl(
                    sessionId,
                    TransactionInvoiceType.FINAL
                );
            if (docId === "ownership") {
                const res =
                    await checkoutServices.getOwnershipTransferDocument(
                        sessionId
                    );
                return res.downloadUrl;
            }
            throw new Error(
                "Purchasing agreement download not implemented yet"
            );
        },
        onSuccess: (result) => {
            const url =
                typeof result === "string"
                    ? result
                    : (result?.downloadUrl ?? "");
            if (url) downloadFile(url);
            toast.success("Document opened in new tab");
        },
        onError: (e) =>
            toast.error(getErrorMessage(e, "Failed to open document")),
    });

    const documents = getDocumentsQuery.data?.documents ?? [];
    const documentByType = documents.reduce<
        Partial<
            Record<
                transaction.TCheckoutSessionDocumentType,
                transaction.TCheckoutSessionDocument
            >
        >
    >((acc, doc) => {
        acc[doc.type] = doc;
        return acc;
    }, {});

    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <DialogContent className="flex w-[32.5rem] flex-col gap-6 p-8">
                <DialogHeader className="pb-0">
                    <DialogTitle>
                        <h3>Download Documents</h3>
                    </DialogTitle>
                    {dialogData?.content && (
                        <DialogDescription className="!mt-6 text-center">
                            {dialogData.content}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <div className="flex flex-col justify-center gap-4">
                    {DOCUMENT_OPTIONS.map((item) =>
                        (() => {
                            const docType = DOCUMENT_TYPE_MAP[item.id];
                            const doc = documentByType[docType];
                            const disabled =
                                isPending ||
                                !sessionId ||
                                getDocumentsQuery.isLoading ||
                                !doc?.downloadUrl;

                            const envelopeId = (
                                doc as transaction.TCheckoutSessionDocuSignDocument
                            )?.envelopeId;
                            return (
                                <ActionOptionItem
                                    key={item.id}
                                    title={item.title}
                                    icon={item.icon}
                                    onClick={async () => {
                                        if (disabled) return;
                                        if (doc.type === "seller_agreement") {
                                            const response =
                                                await docusignServices.getDocuments(
                                                    envelopeId as string
                                                );
                                            downloadFile(response);
                                            return;
                                        }
                                        // Prefer backend-provided document link if available
                                        if (doc?.downloadUrl) {
                                            downloadFile(doc.downloadUrl);
                                            toast.success(
                                                "Document opened in new tab"
                                            );
                                            return;
                                        }

                                        // Fallback to legacy per-document download handlers
                                        downloadDoc(item.id);
                                    }}
                                    className={cn(
                                        "group",
                                        disabled &&
                                            "pointer-events-none opacity-60"
                                    )}
                                >
                                    <div className="h-5 w-5 text-typo-note transition-all group-hover:text-typo-primary">
                                        <IconDownload />
                                    </div>
                                </ActionOptionItem>
                            );
                        })()
                    )}
                </div>
            </DialogContent>
        </div>
    );
}
