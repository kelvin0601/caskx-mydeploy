"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EDocuSignStatus } from "@/enum/docusign";
import { useAgreementDownload } from "@/hooks/useAgreementDownload";
import { useInvoiceDownload } from "@/hooks/useInvoiceDownload";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import {
    formatCurrency,
    formatDueDate,
    getCheckoutStatusBadgeVariant,
    handleSnakeCaseToSimpleText,
} from "@/lib/utils";
import { TransactionInvoiceType } from "@/modules/_checkout/table-info-transaction";
import { checkoutServices } from "@/services/checkout";
import { useBoundStore } from "@/store";
import { useCheckout } from "@/store/checkout";
import MobileTransactionCards from "../mobile-transaction-cards";
import OrderDocuments from "../order-documents";
import { CHECKOUT_STATUS } from "@/enum/checkout";

export default function SignAgreement() {
    const { statusTransaction, sessionId } = useCheckout();
    const { user } = useBoundStore();
    const [downloadingDocId, setDownloadingDocId] = useState<string | null>(
        null
    );

    // Fetch DocuSign agreement info
    const signAgreementQuery = useQuery({
        queryKey: [CHECKOUT_KEYS.SIGN_AGREEMENT, sessionId],
        queryFn: () =>
            checkoutServices.signAgreement({
                checkoutSessionId: sessionId!,
                signature: user
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : "",
                agreementAccepted: true,
            }),
        enabled:
            !!sessionId &&
            !!user &&
            statusTransaction?.buyerDocuSignStatus !==
                EDocuSignStatus.BUYER_SIGNED,
    });

    // Agreement PDF downloader
    const { downloadAgreement } = useAgreementDownload(sessionId);

    // Invoice PDF downloader
    const { downloadInvoice } = useInvoiceDownload(
        sessionId!,
        TransactionInvoiceType.DEPOSIT,
        "invoice"
    );

    // Receipt PDF downloader
    const { downloadInvoice: handleDownloadReceipt } = useInvoiceDownload(
        sessionId!,
        TransactionInvoiceType.DEPOSIT,
        "receipt"
    );

    const handleSignAgreement = (url?: string) => {
        if (!url) {
            toast.error("Signing URL not found");
            return;
        }
        window.open(url, "_blank");
    };

    return (
        <div className="flex flex-col gap-8 tb:gap-0">
            {/* Agreement to sign section */}
            <div className="flex flex-col tb:border-y tb:border-bd-main tb:py-6 mb:border-b mb:border-t-0 mb:pb-6 mb:pt-0">
                {/* Agreement to sign section header */}
                <div className="flex flex-col gap-1 pb-4">
                    <h3 className="font-inter text-lg font-semibold text-typo-primary tb:text-base mb:leading-[1.2]">
                        <span>Agreement to sign</span>
                    </h3>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb:flex-col mb:items-start mb:gap-1">
                        <p className="text-sm text-typo-soft">
                            <span>
                                All agreements must be signed by the due date or
                                your deposit will be forfeited.
                            </span>
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

                {/* List of agreements to sign */}
                <div className="w-full overflow-x-auto mb:hidden">
                    <Table className="w-full border-collapse text-left text-xs tb:table-fixed mb:table-auto">
                        <TableHeader className="[&_tr]:border-b [&_tr]:border-bd-main">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12 py-3 text-xs font-medium text-typo-soft tb:w-1/6 tb:font-normal tb:leading-none mb:w-12 mb:font-medium mb:leading-[1.2]">
                                    No.
                                </TableHead>
                                <TableHead className="py-3 text-xs font-medium text-typo-soft tb:font-normal tb:leading-none mb:font-medium mb:leading-[1.2]">
                                    Quantity
                                </TableHead>
                                <TableHead className="py-3 text-xs font-medium text-typo-soft tb:font-normal tb:leading-none mb:font-medium mb:leading-[1.2]">
                                    <span className="j-tb:hidden">
                                        Price per cask
                                    </span>
                                    <span className="hidden j-tb:inline">
                                        Price
                                    </span>
                                </TableHead>
                                <TableHead className="py-3 text-xs font-medium text-typo-soft tb:font-normal tb:leading-none mb:font-medium mb:leading-[1.2]">
                                    <span className="j-tb:hidden">
                                        Cask subtotal
                                    </span>
                                    <span className="hidden j-tb:inline">
                                        Subtotal
                                    </span>
                                </TableHead>
                                <TableHead className="py-3 text-xs font-medium text-typo-soft tb:font-normal tb:leading-none mb:font-medium mb:leading-[1.2]">
                                    Status
                                </TableHead>
                                <TableHead className="py-3 text-right text-xs font-medium text-typo-soft tb:font-normal tb:leading-none mb:font-medium mb:leading-[1.2]">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y border-b">
                            {statusTransaction?.transactions?.map((tx, idx) => {
                                const isSigned = !!(
                                    (tx.buyerAgreementStatus ===
                                        EDocuSignStatus.BUYER_SIGNED &&
                                        (tx?.buyerDocuSignEnvelopeId ||
                                            tx.sellerAgreementDocuSignEnvelopeId)) ||
                                    ((statusTransaction?.buyerDocuSignStatus ===
                                        EDocuSignStatus.BUYER_SIGNED ||
                                        statusTransaction?.status ===
                                            CHECKOUT_STATUS.AGREEMENT_BUYER_SIGNED) &&
                                        statusTransaction?.transactions
                                            ?.length === 1 &&
                                        statusTransaction?.buyerDocuSignEnvelopeId)
                                );
                                const typeContract = tx.agreementType;

                                const isExpired =
                                    tx?.buyerAgreementStatus ===
                                        EDocuSignStatus.AGREEMENT_EXPIRE ||
                                    tx?.sellerAgreementStatus ===
                                        EDocuSignStatus.AGREEMENT_EXPIRE ||
                                    statusTransaction?.buyerDocuSignStatus ===
                                        EDocuSignStatus.AGREEMENT_EXPIRE;

                                const price = Number(tx.transactionPrice || 0);
                                const subtotal = tx.quantity * price;

                                // Match the transaction in signAgreementQuery to find Docusign link & details
                                const agreement =
                                    signAgreementQuery.data?.agreements?.find(
                                        (ag) => ag.transactionId === tx.id
                                    );

                                const isThisDownloading =
                                    downloadingDocId === tx.id;

                                return (
                                    <TableRow
                                        key={tx.id}
                                        className="border-b-0 text-sm transition-colors"
                                    >
                                        <TableCell className="py-4 font-medium text-typo-primary">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell className="py-4 font-medium text-typo-primary">
                                            {tx.quantity}
                                        </TableCell>
                                        <TableCell className="py-4 font-medium text-typo-primary">
                                            {formatCurrency(price)}
                                        </TableCell>
                                        <TableCell className="py-4 font-medium text-typo-primary">
                                            {formatCurrency(subtotal)}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge
                                                variant={getCheckoutStatusBadgeVariant(
                                                    tx?.buyerAgreementStatus ||
                                                        statusTransaction?.buyerDocuSignStatus ||
                                                        ""
                                                )}
                                                size="sm"
                                                className="text-xs font-medium tb:h-5 tb:py-0 tb:font-semibold tb:leading-[1.2] mb:h-auto mb:py-0.5 mb:font-medium"
                                            >
                                                {isSigned ? (
                                                    <>
                                                        <span className="j-tb:hidden">
                                                            {handleSnakeCaseToSimpleText(
                                                                tx?.buyerAgreementStatus ||
                                                                    statusTransaction?.buyerDocuSignStatus ||
                                                                    ""
                                                            )}
                                                        </span>
                                                        <span className="hidden j-tb:inline">
                                                            Complete
                                                        </span>
                                                    </>
                                                ) : (
                                                    handleSnakeCaseToSimpleText(
                                                        tx?.buyerAgreementStatus ||
                                                            statusTransaction?.buyerDocuSignStatus ||
                                                            ""
                                                    )
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            {!isExpired &&
                                                (isSigned ? (
                                                    <Button
                                                        variant="link"
                                                        disabled={
                                                            downloadingDocId !==
                                                            null
                                                        }
                                                        onClick={async () => {
                                                            try {
                                                                const docusignId =
                                                                    typeContract ===
                                                                    "direct"
                                                                        ? tx?.sellerAgreementDocuSignEnvelopeId
                                                                        : tx.buyerDocuSignEnvelopeId ||
                                                                          statusTransaction?.buyerDocuSignEnvelopeId;

                                                                if (
                                                                    !docusignId
                                                                ) {
                                                                    toast.error(
                                                                        "Agreement document ID not found"
                                                                    );
                                                                    return;
                                                                }
                                                                setDownloadingDocId(
                                                                    tx.id
                                                                );
                                                                await downloadAgreement(
                                                                    docusignId
                                                                );
                                                            } catch (e) {
                                                                console.error(
                                                                    "Failed to download agreement:",
                                                                    e
                                                                );
                                                            } finally {
                                                                setDownloadingDocId(
                                                                    null
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {isThisDownloading
                                                            ? "Downloading..."
                                                            : "Download"}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="link"
                                                        disabled={
                                                            signAgreementQuery.isLoading
                                                        }
                                                        onClick={() => {
                                                            const url =
                                                                agreement?.signingUrl ||
                                                                signAgreementQuery
                                                                    .data
                                                                    ?.signingUrl;
                                                            handleSignAgreement(
                                                                url
                                                            );
                                                        }}
                                                    >
                                                        {signAgreementQuery.isLoading
                                                            ? "Loading..."
                                                            : "Sign"}
                                                    </Button>
                                                ))}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <MobileTransactionCards
                    defaultOpenItemId={statusTransaction?.transactions?.[0]?.id}
                    items={
                        statusTransaction?.transactions?.map((tx, idx) => {
                            const isSigned = !!(
                                (tx.buyerAgreementStatus ===
                                    EDocuSignStatus.BUYER_SIGNED &&
                                    (tx.buyerDocuSignEnvelopeId ||
                                        tx.sellerAgreementDocuSignEnvelopeId)) ||
                                ((statusTransaction.buyerDocuSignStatus ===
                                    EDocuSignStatus.BUYER_SIGNED ||
                                    statusTransaction.status ===
                                        CHECKOUT_STATUS.AGREEMENT_BUYER_SIGNED) &&
                                    statusTransaction.transactions.length ===
                                        1 &&
                                    statusTransaction.buyerDocuSignEnvelopeId)
                            );
                            const isExpired =
                                tx.buyerAgreementStatus ===
                                    EDocuSignStatus.AGREEMENT_EXPIRE ||
                                tx.sellerAgreementStatus ===
                                    EDocuSignStatus.AGREEMENT_EXPIRE ||
                                statusTransaction.buyerDocuSignStatus ===
                                    EDocuSignStatus.AGREEMENT_EXPIRE;
                            const price = Number(tx.transactionPrice || 0);
                            const subtotal = tx.quantity * price;
                            const agreement =
                                signAgreementQuery.data?.agreements?.find(
                                    (item) => item.transactionId === tx.id
                                );
                            const statusValue =
                                tx.buyerAgreementStatus ||
                                statusTransaction.buyerDocuSignStatus ||
                                "";
                            const isThisDownloading =
                                downloadingDocId === tx.id;

                            return {
                                id: tx.id,
                                number: idx + 1,
                                quantity: tx.quantity,
                                price: formatCurrency(price),
                                subtotal: formatCurrency(subtotal),
                                statusLabel: isSigned
                                    ? "Complete"
                                    : handleSnakeCaseToSimpleText(statusValue),
                                statusVariant:
                                    getCheckoutStatusBadgeVariant(statusValue),
                                action: !isExpired ? (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        disabled={
                                            isSigned
                                                ? downloadingDocId !== null
                                                : signAgreementQuery.isLoading
                                        }
                                        onClick={async () => {
                                            if (!isSigned) {
                                                handleSignAgreement(
                                                    agreement?.signingUrl ||
                                                        signAgreementQuery.data
                                                            ?.signingUrl
                                                );
                                                return;
                                            }

                                            const docusignId =
                                                tx.agreementType === "direct"
                                                    ? tx.sellerAgreementDocuSignEnvelopeId
                                                    : tx.buyerDocuSignEnvelopeId ||
                                                      statusTransaction.buyerDocuSignEnvelopeId;
                                            if (!docusignId) {
                                                toast.error(
                                                    "Agreement document ID not found"
                                                );
                                                return;
                                            }

                                            try {
                                                setDownloadingDocId(tx.id);
                                                await downloadAgreement(
                                                    docusignId
                                                );
                                            } catch (error) {
                                                console.error(
                                                    "Failed to download agreement:",
                                                    error
                                                );
                                            } finally {
                                                setDownloadingDocId(null);
                                            }
                                        }}
                                    >
                                        {isSigned
                                            ? isThisDownloading
                                                ? "Downloading..."
                                                : "Download"
                                            : signAgreementQuery.isLoading
                                              ? "Loading..."
                                              : "Sign"}
                                    </Button>
                                ) : undefined,
                            };
                        }) ?? []
                    }
                />

                {/* DocuSign disclaimer text */}
                <div className="mt-4 text-sm text-typo-sub">
                    Cask Exchange uses Docusign for document processing and
                    e-signatures.
                </div>
            </div>

            {/* Order documents section */}
            <OrderDocuments
                sessionId={sessionId}
                className="tb:pt-6"
                documents={[
                    {
                        name: "Deposit Receipt",
                        date:
                            statusTransaction?.transactions?.[0]?.updatedAt ||
                            statusTransaction?.transactions?.[0]?.createdAt,
                        isDownloading: downloadingDocId === "deposit-receipt",
                        onDownload: async () => {
                            try {
                                setDownloadingDocId("deposit-receipt");
                                await handleDownloadReceipt();
                            } catch (e) {
                                console.error("Failed to download receipt:", e);
                            } finally {
                                setDownloadingDocId(null);
                            }
                        },
                    },
                    {
                        name: "Deposit Invoice",
                        date:
                            statusTransaction?.transactions?.[0]?.updatedAt ||
                            statusTransaction?.transactions?.[0]?.createdAt,
                        isDownloading: downloadingDocId === "deposit-invoice",
                        onDownload: async () => {
                            try {
                                setDownloadingDocId("deposit-invoice");
                                await downloadInvoice();
                            } catch (e) {
                                console.error("Failed to download invoice:", e);
                            } finally {
                                setDownloadingDocId(null);
                            }
                        },
                    },
                ]}
            />
        </div>
    );
}
