"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import CheckoutStatusPanel from "@/components/shared/checkout-status-panel";
import IconCheck from "@/components/shared/icons/icon-check";
import IconSwitchHrz from "@/components/shared/icons/icon-switch";
import { CHECKOUT_DOCUMENT_TYPE, CHECKOUT_STATUS } from "@/enum/checkout";
import { useAgreementDownload } from "@/hooks/useAgreementDownload";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { downloadFile } from "@/lib/utils";
import { checkoutServices } from "@/services/checkout";
import { useCheckout } from "@/store/checkout";
import OrderDocuments, { TDocumentItem } from "../order-documents";

const ORDER_DOCUMENT_PRIORITY: Partial<Record<CHECKOUT_DOCUMENT_TYPE, number>> =
    {
        [CHECKOUT_DOCUMENT_TYPE.FINAL_INVOICE]: 0,
        [CHECKOUT_DOCUMENT_TYPE.FINAL_RECEIPT]: 1,
        [CHECKOUT_DOCUMENT_TYPE.AGREEMENT]: 2,
        [CHECKOUT_DOCUMENT_TYPE.DEPOSIT_RECEIPT]: 3,
        [CHECKOUT_DOCUMENT_TYPE.DEPOSIT_INVOICE]: 4,
    };

export default function OwnershipTransfer() {
    const { sessionId, statusTransaction } = useCheckout();
    const [downloadingDocId, setDownloadingDocId] = useState<string | null>(
        null
    );

    const isCompleted = statusTransaction?.status === CHECKOUT_STATUS.COMPLETED;
    const title = isCompleted
        ? "Ownership transferred successfully"
        : "Ownership transfer in progress";
    const description = isCompleted
        ? "The asset is now officially registered under your ownership."
        : "Your casks are being transferred to your name. We will keep you updated throughout the process.";

    const { downloadAgreement } = useAgreementDownload(sessionId);

    // Unified documents query
    const documentsQuery = useQuery({
        queryKey: [CHECKOUT_KEYS.GET_SESSION_DOCUMENTS, sessionId],
        queryFn: () => checkoutServices.getCheckoutSessionDocuments(sessionId!),
        enabled: !!sessionId,
    });

    const mappedDocuments = useMemo(() => {
        const list = documentsQuery.data?.documents || [];
        return list.map((doc) => {
            const docId = doc.id || doc.label || doc.type || "";
            const item: TDocumentItem = {
                id: docId,
                name: doc.label || doc.name || "",
                type: doc.type,
                date:
                    doc.signedAt ||
                    doc.generatedAt ||
                    doc.updatedAt ||
                    doc.createdAt,
                isDownloading: downloadingDocId === docId,
                onDownload: async () => {
                    const isAgreement =
                        doc.type === CHECKOUT_DOCUMENT_TYPE.BUYER_AGREEMENT ||
                        doc.type === CHECKOUT_DOCUMENT_TYPE.SELLER_AGREEMENT ||
                        doc.type === CHECKOUT_DOCUMENT_TYPE.AGREEMENT;
                    if (isAgreement && doc.envelopeId) {
                        try {
                            setDownloadingDocId(docId);
                            await downloadAgreement(doc.envelopeId);
                        } catch (err) {
                            console.error(err);
                        } finally {
                            setDownloadingDocId(null);
                        }
                        return;
                    }

                    const downloadUrl = doc.downloadUrl || doc.url;
                    if (!downloadUrl) {
                        toast.error("Document URL not found");
                        return;
                    }
                    try {
                        setDownloadingDocId(docId);
                        await downloadFile(downloadUrl);
                        toast.success(
                            `${doc.label || doc.name || "Document"} opened successfully`
                        );
                    } catch (err) {
                        console.error(err);
                        toast.error("Failed to download document");
                    } finally {
                        setDownloadingDocId(null);
                    }
                },
            };
            return item;
        });
    }, [documentsQuery.data, downloadingDocId, downloadAgreement]);

    const ownershipDocuments = useMemo(() => {
        return mappedDocuments.filter(
            (doc: TDocumentItem) =>
                doc.type === CHECKOUT_DOCUMENT_TYPE.OWNERSHIP_TRANSFER
        );
    }, [mappedDocuments]);

    const orderDocuments = useMemo(() => {
        // Start with the API payment invoices/receipts (excluding ownership & agreements)
        const list = mappedDocuments.filter(
            (doc: TDocumentItem) =>
                doc.type !== CHECKOUT_DOCUMENT_TYPE.OWNERSHIP_TRANSFER &&
                doc.type !== CHECKOUT_DOCUMENT_TYPE.BUYER_AGREEMENT &&
                doc.type !== CHECKOUT_DOCUMENT_TYPE.SELLER_AGREEMENT
        );

        const transactions = statusTransaction?.transactions || [];
        const rootEnvelopeId = statusTransaction?.buyerDocuSignEnvelopeId;
        const rootSignDate = statusTransaction?.buyerDocuSignAdminSignedAt;
        const fallbackDate =
            transactions[0]?.updatedAt || transactions[0]?.createdAt;

        // Case 1: Exactly 1 transaction, and it does NOT have its own buyerDocuSignEnvelopeId, but root-level has one.
        if (
            transactions.length === 1 &&
            !transactions[0]?.buyerDocuSignEnvelopeId &&
            rootEnvelopeId
        ) {
            list.push({
                id: rootEnvelopeId,
                name: "Transaction Agreement",
                type: CHECKOUT_DOCUMENT_TYPE.AGREEMENT,
                date:
                    rootSignDate ||
                    transactions[0]?.buyerAgreementSignedAt ||
                    fallbackDate,
                isDownloading: downloadingDocId === rootEnvelopeId,
                onDownload: async () => {
                    try {
                        setDownloadingDocId(rootEnvelopeId);
                        await downloadAgreement(rootEnvelopeId);
                    } catch (err) {
                        console.error(err);
                    } finally {
                        setDownloadingDocId(null);
                    }
                },
            });
        } else if (transactions.length > 0) {
            // Case 2: Loop over all transactions and push their buyerDocuSignEnvelopeId directly.
            transactions.forEach((tx, idx) => {
                const envelopeId =
                    tx?.agreementType === "direct"
                        ? tx.sellerAgreementDocuSignEnvelopeId
                        : tx.buyerDocuSignEnvelopeId;
                if (!envelopeId) return;
                const agName =
                    idx === 0
                        ? "Transaction Agreement"
                        : `Transaction Agreement #${idx + 1}`;
                list.push({
                    id: envelopeId,
                    name: agName,
                    type: CHECKOUT_DOCUMENT_TYPE.AGREEMENT,
                    date:
                        tx.buyerAgreementSignedAt ||
                        tx.updatedAt ||
                        tx.createdAt,
                    isDownloading: downloadingDocId === envelopeId,
                    onDownload: async () => {
                        try {
                            setDownloadingDocId(envelopeId);
                            await downloadAgreement(envelopeId);
                        } catch (err) {
                            console.error(err);
                        } finally {
                            setDownloadingDocId(null);
                        }
                    },
                });
            });
        }

        return list.toSorted(
            (firstDocument, secondDocument) =>
                ((firstDocument.type
                    ? ORDER_DOCUMENT_PRIORITY[firstDocument.type]
                    : undefined) ?? 5) -
                ((secondDocument.type
                    ? ORDER_DOCUMENT_PRIORITY[secondDocument.type]
                    : undefined) ?? 5)
        );
    }, [
        mappedDocuments,
        statusTransaction?.transactions,
        statusTransaction?.buyerDocuSignEnvelopeId,
        statusTransaction?.buyerDocuSignAdminSignedAt,
        downloadingDocId,
        downloadAgreement,
    ]);

    return (
        <div className="flex flex-col gap-8 mb:gap-6">
            <CheckoutStatusPanel
                icon={
                    isCompleted ? (
                        <IconCheck />
                    ) : (
                        <span className="block size-full">
                            <IconSwitchHrz />
                        </span>
                    )
                }
                title={title}
                description={description}
            />

            {/* Ownership Documents */}
            {ownershipDocuments.length > 0 && (
                <OrderDocuments
                    sessionId={sessionId}
                    title="Ownership documents"
                    documents={ownershipDocuments}
                />
            )}

            {/* Order Documents */}
            <OrderDocuments
                sessionId={sessionId}
                title="Order documents"
                documents={orderDocuments}
            />
        </div>
    );
}
