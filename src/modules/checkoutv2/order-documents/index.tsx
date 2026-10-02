"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgreementDownload } from "@/hooks/useAgreementDownload";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { cn, downloadFile } from "@/lib/utils";
import { checkoutServices } from "@/services/checkout";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { CHECKOUT_DOCUMENT_TYPE } from "@/enum/checkout";

export type TDocumentItem = {
    id?: string;
    name: string;
    date: string | undefined;
    isDownloading: boolean;
    onDownload: () => unknown;
    type?: CHECKOUT_DOCUMENT_TYPE;
};

type TOrderDocumentsProps = {
    documents: TDocumentItem[];
    title?: string;
    className?: string;
    sessionId?: string;
};

export default function OrderDocuments({
    documents,
    title = "Order documents",
    className,
    sessionId,
}: TOrderDocumentsProps) {
    const [downloadingDocumentId, setDownloadingDocumentId] = useState<
        string | null
    >(null);
    const { downloadAgreement } = useAgreementDownload(sessionId);
    const documentsQuery = useQuery({
        queryKey: [CHECKOUT_KEYS.GET_SESSION_DOCUMENTS, sessionId],
        queryFn: () =>
            checkoutServices.getCheckoutSessionDocuments(sessionId as string),
        enabled: !!sessionId,
    });

    const hydratedDocuments = useMemo(() => {
        const apiDocuments = documentsQuery.data?.documents ?? [];
        if (apiDocuments.length === 0) return documents;

        const matchedApiDocumentIds = new Set<string>();
        const mergedDocuments = documents.map((fallbackDocument) => {
            const fallbackName = fallbackDocument.name.trim().toLowerCase();
            const apiDocument = apiDocuments.find((document) => {
                const documentId =
                    document.id || document.label || document.name || "";
                if (matchedApiDocumentIds.has(documentId)) return false;

                const documentName = (document.label || document.name || "")
                    .trim()
                    .toLowerCase();
                return (
                    documentName === fallbackName ||
                    (!!fallbackDocument.type &&
                        document.type === fallbackDocument.type)
                );
            });

            if (!apiDocument) return fallbackDocument;

            const documentId =
                apiDocument.id ||
                apiDocument.label ||
                apiDocument.name ||
                fallbackDocument.id ||
                fallbackDocument.name;
            matchedApiDocumentIds.add(documentId);

            const isAgreement =
                apiDocument.type === CHECKOUT_DOCUMENT_TYPE.BUYER_AGREEMENT ||
                apiDocument.type === CHECKOUT_DOCUMENT_TYPE.SELLER_AGREEMENT ||
                apiDocument.type === CHECKOUT_DOCUMENT_TYPE.AGREEMENT ||
                (apiDocument.label || apiDocument.name || "")
                    .toLowerCase()
                    .includes("agreement");

            return {
                ...fallbackDocument,
                id: documentId,
                name:
                    apiDocument.label ||
                    apiDocument.name ||
                    fallbackDocument.name,
                type: apiDocument.type || fallbackDocument.type,
                date:
                    apiDocument.signedAt ||
                    apiDocument.generatedAt ||
                    apiDocument.updatedAt ||
                    apiDocument.createdAt ||
                    fallbackDocument.date,
                isDownloading:
                    downloadingDocumentId === documentId ||
                    fallbackDocument.isDownloading,
                onDownload: async () => {
                    try {
                        setDownloadingDocumentId(documentId);
                        if (isAgreement && apiDocument.envelopeId) {
                            await downloadAgreement(apiDocument.envelopeId);
                            return;
                        }

                        const downloadUrl =
                            apiDocument.downloadUrl || apiDocument.url;
                        if (downloadUrl) {
                            await downloadFile(downloadUrl);
                            toast.success(
                                `${apiDocument.label || apiDocument.name || "Document"} opened successfully`
                            );
                            return;
                        }

                        await fallbackDocument.onDownload();
                    } finally {
                        setDownloadingDocumentId(null);
                    }
                },
            };
        });

        return mergedDocuments;
    }, [
        documents,
        documentsQuery.data?.documents,
        downloadAgreement,
        downloadingDocumentId,
    ]);

    const formatInvoiceDate = (
        dateString: string | undefined,
        type: CHECKOUT_DOCUMENT_TYPE | undefined,
        name: string | undefined
    ) => {
        const isAgreement =
            type === CHECKOUT_DOCUMENT_TYPE.BUYER_AGREEMENT ||
            type === CHECKOUT_DOCUMENT_TYPE.SELLER_AGREEMENT ||
            type === CHECKOUT_DOCUMENT_TYPE.AGREEMENT ||
            name?.toLowerCase()?.includes("agreement");
        const actionText = isAgreement ? "Signed" : "Generated";
        if (!dateString) return `PDF • ${actionText} --/--/---- --:--`;
        const d = new Date(dateString);
        const datePart = d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        const timePart = d.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
        });
        return `PDF • ${actionText} ${datePart} ${timePart}`;
    };

    if (documentsQuery.isPending && sessionId) {
        return (
            <OrderDocumentsSkeleton
                title={title}
                className={className}
                rowCount={Math.max(documents.length, 2)}
            />
        );
    }

    if (hydratedDocuments.length === 0) return null;

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <h3 className="font-inter text-lg font-semibold text-typo-primary tb:text-base mb:leading-[1.2]">
                {title}
            </h3>
            <div className="flex flex-col gap-2">
                {hydratedDocuments.map((doc) => (
                    <div
                        key={
                            doc.id ??
                            `${doc.type ?? "document"}-${doc.name}-${doc.date ?? "undated"}`
                        }
                        className="flex items-center justify-between gap-8 rounded-none bg-bg-sf4 p-4 mb:flex-nowrap"
                    >
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="truncate text-base font-semibold text-typo-primary mb:text-sm">
                                {doc.name}
                            </span>
                            <span className="truncate text-sm text-typo-note">
                                {formatInvoiceDate(
                                    doc.date,
                                    doc.type,
                                    doc.name
                                )}
                            </span>
                        </div>
                        <Button
                            variant="link"
                            disabled={doc.isDownloading}
                            className="disabled:text-typo-soft"
                            onClick={async () => {
                                if (doc.isDownloading) return;
                                await doc.onDownload();
                            }}
                        >
                            {doc.isDownloading ? "Downloading..." : "Download"}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function OrderDocumentsSkeleton({
    title,
    className,
    rowCount,
}: {
    title: string;
    className?: string;
    rowCount: number;
}) {
    return (
        <div
            className={cn("flex flex-col gap-4", className)}
            aria-label={`Loading ${title.toLowerCase()}`}
            aria-busy="true"
        >
            <h3 className="font-inter text-lg font-semibold text-typo-primary tb:text-base mb:leading-[1.2]">
                {title}
            </h3>
            <div className="flex flex-col gap-2">
                {Array.from({ length: rowCount }, (_, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between gap-8 bg-bg-sf4 p-4"
                    >
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <Skeleton className="h-6 w-2/5 max-w-48 mb:h-[1.3125rem]" />
                            <Skeleton className="h-[1.3125rem] w-3/5 max-w-64" />
                        </div>
                        <Skeleton className="h-4 w-20 shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}
