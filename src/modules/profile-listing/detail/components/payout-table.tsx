"use client";

import IconHelp from "@/components/shared/icons/icon-help";
import IconMinus from "@/components/shared/icons/icon-minus";
import IconPlus from "@/components/shared/icons/icon-plus";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge, type TBadgeVariant } from "@/components/ui/badge";
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
import { AdminPayoutStatus } from "@/enum/payout";
import { KEY_DOCUSIGN } from "@/lib/constants";
import {
    cn,
    downloadFile,
    formatCurrency,
    formatTabletDateTime,
    getErrorMessage,
} from "@/lib/utils";
import docusignServices from "@/services/docusign";
import type { payout } from "@/types/payout";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type TPayoutTransaction =
    payout.TAskTransactionPayoutResponse["transactions"][number];

const PAYOUT_GRID =
    "grid-cols-[minmax(0,40fr)_minmax(0,179fr)_minmax(0,100fr)_minmax(0,179fr)_minmax(0,179fr)_minmax(0,179fr)_minmax(0,179fr)_minmax(0,100fr)] tb:grid-cols-[20px_minmax(0,1fr)_50px_84px_84px_126px_126px_70px]";

const COLUMNS = [
    "No.",
    "Matching date",
    "Quantity",
    "Matched price",
    "Net payout",
    "Agreement status",
    "Payout status",
    "Action",
] as const;

function statusLabel(status?: string | null) {
    if (!status) return "-";
    const normalized = status.toLowerCase();
    if (
        normalized.includes("complete") ||
        normalized.includes("paid") ||
        normalized.includes("signed") ||
        normalized === EDocuSignStatus.SELLER_SIGNED ||
        normalized === EDocuSignStatus.ALL_SIGNED
    ) {
        return "Complete";
    }
    return normalized
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusVariant(status?: string | null): TBadgeVariant {
    const normalized = status?.toLowerCase() ?? "";
    if (normalized === AdminPayoutStatus.NOT_READY) {
        return "static";
    }
    if (
        normalized.includes("complete") ||
        normalized.includes("paid") ||
        normalized.includes("signed")
    ) {
        return "success";
    }
    if (
        normalized.includes("pending") ||
        normalized.includes("awaiting") ||
        normalized.includes("processing") ||
        normalized.includes("update_requested")
    ) {
        return "warning";
    }
    if (
        normalized.includes("failed") ||
        normalized.includes("reject") ||
        normalized.includes("declined") ||
        normalized.includes("expired") ||
        normalized.includes("voided")
    ) {
        return "destructive";
    }
    return "info";
}

function formatListingDateOnly(value?: Date | string | null) {
    return formatTabletDateTime(value ?? undefined).split(" ")[0];
}

function DetailRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-w-0 items-center justify-between gap-4 text-sm">
            <span className="shrink-0 text-typo-soft">{label}</span>
            <div className="min-w-0 truncate text-right font-medium text-typo-primary">
                {children}
            </div>
        </div>
    );
}

export default function PayoutTable({
    transactions,
}: {
    transactions: TPayoutTransaction[];
}) {
    const [pendingActionId, setPendingActionId] = useState<string>();
    const signingMutation = useMutation({
        mutationKey: [KEY_DOCUSIGN.GET_SELLER_AGREEMENT_LINK],
        mutationFn: docusignServices.getSellerAgreementLink,
    });
    const downloadMutation = useMutation({
        mutationKey: [KEY_DOCUSIGN.GET_DOCUMENTS],
        mutationFn: docusignServices.getDocuments,
    });

    const handleAgreementAction = async (transaction: TPayoutTransaction) => {
        const agreementStatus = transaction.sellerAgreementStatus;
        const shouldSign =
            agreementStatus === EDocuSignStatus.AWAITING_SIGNATURE ||
            agreementStatus === EDocuSignStatus.SELLER_UPDATE_REQUESTED;

        try {
            setPendingActionId(transaction.id);
            if (shouldSign) {
                const result = await signingMutation.mutateAsync(
                    transaction.id
                );
                downloadFile(result.signingUrl);
                return;
            }

            const envelopeId = transaction.sellerAgreementDocuSignEnvelopeId;
            if (!envelopeId) {
                toast.error("Agreement document is not available yet");
                return;
            }
            const document = await downloadMutation.mutateAsync(envelopeId);
            downloadFile(document, "Seller Agreement.pdf");
        } catch (error) {
            toast.error(
                getErrorMessage(error, "Unable to open seller agreement")
            );
        } finally {
            setPendingActionId(undefined);
        }
    };

    if (transactions.length === 0) {
        return (
            <div className="border-b border-bd-main py-8 text-center text-sm text-typo-soft">
                No payouts have been created yet.
            </div>
        );
    }

    return (
        <>
            <div className="no-scrollbar overflow-x-auto mb:hidden">
                <Table className="min-w-[70rem] table-fixed text-left text-typo-primary tb:min-w-0">
                    <TableHeader className="block">
                        <TableRow
                            className={cn(
                                "relative grid h-9 items-center !gap-x-4 after:pointer-events-none hover:bg-transparent",
                                PAYOUT_GRID
                            )}
                        >
                            {COLUMNS.map((column) => (
                                <TableHead
                                    key={column}
                                    className={cn(
                                        "min-w-0 p-0 text-xs font-normal leading-none text-typo-soft",
                                        column === "Action" && "text-right"
                                    )}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        {column}
                                    </span>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="block">
                        {transactions.map((transaction, index) => {
                            const shouldSign =
                                transaction.sellerAgreementStatus ===
                                    EDocuSignStatus.AWAITING_SIGNATURE ||
                                transaction.sellerAgreementStatus ===
                                    EDocuSignStatus.SELLER_UPDATE_REQUESTED;
                            const hasAction =
                                shouldSign ||
                                Boolean(
                                    transaction.sellerAgreementDocuSignEnvelopeId
                                );

                            return (
                                <TableRow
                                    key={transaction.id}
                                    className={cn(
                                        "relative grid h-[3.3125rem] items-center !gap-x-4 border-0 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-bd-main hover:bg-transparent",
                                        PAYOUT_GRID
                                    )}
                                >
                                    <TableCell className="min-w-0 p-0 text-sm font-medium">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="min-w-0 p-0 text-sm font-medium">
                                        {formatTabletDateTime(
                                            transaction.createdAt
                                        )}
                                    </TableCell>
                                    <TableCell className="min-w-0 p-0 text-sm font-medium">
                                        {transaction.quantity}
                                    </TableCell>
                                    <TableCell className="min-w-0 p-0 text-sm font-medium">
                                        {formatCurrency(
                                            transaction.transactionPrice
                                        )}
                                    </TableCell>
                                    <TableCell className="min-w-0 p-0 text-sm font-medium">
                                        {formatCurrency(
                                            transaction.netPayoutAmount ?? 0
                                        )}
                                    </TableCell>
                                    <TableCell className="flex min-w-0 items-center p-0">
                                        <Badge
                                            variant={statusVariant(
                                                transaction.sellerAgreementStatus
                                            )}
                                            size="xs"
                                            className="max-w-full border-transparent"
                                        >
                                            <span className="truncate">
                                                {statusLabel(
                                                    transaction.sellerAgreementStatus
                                                )}
                                            </span>
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="flex min-w-0 items-center p-0">
                                        <Badge
                                            variant={statusVariant(
                                                transaction.payoutStatus
                                            )}
                                            size="xs"
                                            className="max-w-full border-transparent"
                                        >
                                            <span className="truncate">
                                                {statusLabel(
                                                    transaction.payoutStatus
                                                )}
                                            </span>
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="flex min-w-0 items-center justify-end p-0 text-right">
                                        {hasAction ? (
                                            <Button
                                                type="button"
                                                variant="link"
                                                disabled={
                                                    pendingActionId ===
                                                    transaction.id
                                                }
                                                className="ml-auto h-3.5 gap-1 p-0 text-sm font-medium !leading-none underline"
                                                onClick={() =>
                                                    handleAgreementAction(
                                                        transaction
                                                    )
                                                }
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    {shouldSign ? (
                                                        <span
                                                            className="block h-3.5 w-3.5 shrink-0 [&>svg]:h-full [&>svg]:w-full"
                                                            aria-hidden="true"
                                                        >
                                                            <IconHelp />
                                                        </span>
                                                    ) : null}
                                                    <span>
                                                        {shouldSign
                                                            ? "Sign"
                                                            : "Download"}
                                                    </span>
                                                </span>
                                            </Button>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <Accordion
                type="single"
                collapsible
                defaultValue={transactions[0]?.id}
                className="hidden w-full flex-col gap-2 mb:flex"
            >
                {transactions.map((transaction, index) => {
                    const shouldSign =
                        transaction.sellerAgreementStatus ===
                            EDocuSignStatus.AWAITING_SIGNATURE ||
                        transaction.sellerAgreementStatus ===
                            EDocuSignStatus.SELLER_UPDATE_REQUESTED;
                    const hasAction =
                        shouldSign ||
                        Boolean(transaction.sellerAgreementDocuSignEnvelopeId);

                    return (
                        <AccordionItem
                            key={transaction.id}
                            value={transaction.id}
                            className="border border-bd-main p-4"
                        >
                            <AccordionTrigger
                                className="group h-6 p-0 text-sm font-medium"
                                classNameChevron="hidden"
                            >
                                <span className="text-typo-primary">
                                    {index + 1}
                                </span>
                                <span
                                    className="size-4 pt-1 text-icon-main group-data-[state=open]:hidden"
                                    aria-hidden="true"
                                >
                                    <IconPlus />
                                </span>
                                <span
                                    className="hidden size-4 pt-1 text-icon-main group-data-[state=open]:block"
                                    aria-hidden="true"
                                >
                                    <IconMinus />
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-0 pt-3">
                                <div className="flex flex-col gap-1.5">
                                    <DetailRow label="Matching date">
                                        {formatTabletDateTime(
                                            transaction.createdAt
                                        )}
                                    </DetailRow>
                                    <DetailRow label="Quantity">
                                        {transaction.quantity}
                                    </DetailRow>
                                    <DetailRow label="Matched price">
                                        {formatCurrency(
                                            transaction.transactionPrice
                                        )}
                                    </DetailRow>
                                    <DetailRow label="Net payout">
                                        {formatCurrency(
                                            transaction.netPayoutAmount ?? 0
                                        )}
                                    </DetailRow>
                                    <p className="text-xs leading-[1.2] text-typo-soft">
                                        5% processing fee deducted
                                    </p>
                                </div>
                                {hasAction ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={
                                            pendingActionId === transaction.id
                                        }
                                        className="mt-3 h-10 w-full"
                                        onClick={() =>
                                            handleAgreementAction(transaction)
                                        }
                                    >
                                        {shouldSign ? "Sign" : "Download"}
                                    </Button>
                                ) : null}
                                {shouldSign ? (
                                    <p className="mt-3 text-xs leading-[1.2] text-typo-soft">
                                        Sign by{" "}
                                        {formatListingDateOnly(
                                            transaction.sellerAgreementSignatureDueAt
                                        )}
                                    </p>
                                ) : null}
                            </AccordionContent>
                            <div className="mt-3 flex flex-col gap-1.5 border-t border-bd-main pt-3 text-sm">
                                <DetailRow label="Agreement status">
                                    <Badge
                                        variant={statusVariant(
                                            transaction.sellerAgreementStatus
                                        )}
                                        size="xs"
                                    >
                                        {statusLabel(
                                            transaction.sellerAgreementStatus
                                        )}
                                    </Badge>
                                </DetailRow>
                                <DetailRow label="Payout status">
                                    <Badge
                                        variant={statusVariant(
                                            transaction.payoutStatus
                                        )}
                                        size="xs"
                                    >
                                        {statusLabel(transaction.payoutStatus)}
                                    </Badge>
                                </DetailRow>
                            </div>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </>
    );
}
