import IconHelp from "@/components/shared/icons/icon-help";
import CustomTooltip from "@/components/shared/tooltips-custom";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonProps } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EDocuSignStatus } from "@/enum/docusign";
import { KEY_DOCUSIGN } from "@/lib/constants";
import { payoutSummaryHelpers } from "@/lib/payout-summary-helpers";
import {
    downloadFile,
    formatCurrency,
    formatDateTime,
    getErrorMessage,
} from "@/lib/utils";
import docusignServices from "@/services/docusign";
import { payout } from "@/types";
import { SellerPayout } from "@/types/seller-payout";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PayoutSummary({
    transactions,
    setTransactionIdNotSigned,
    processingFeeRate,
}: {
    transactions: payout.TAskTransactionPayoutResponse["transactions"];
    setTransactionIdNotSigned: (id: string) => void;
    processingFeeRate: number;
}) {
    const [signingId, setSigningId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const getSellerAgreementLink = useMutation({
        mutationFn: docusignServices.getSellerAgreementLink,
        mutationKey: [KEY_DOCUSIGN.GET_SELLER_AGREEMENT_LINK],
    });

    const getDocuments = useMutation({
        mutationFn: docusignServices.getDocuments,
        mutationKey: [KEY_DOCUSIGN.GET_DOCUMENTS],
    });

    const handleSignForm = async (id: string, askId: string) => {
        try {
            setSigningId(id);
            const { signingUrl } = await getSellerAgreementLink.mutateAsync(id);
            downloadFile(signingUrl);
            setTransactionIdNotSigned(askId);
            // Update local state or refetch data
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to sign form"));
        } finally {
            setSigningId(null);
        }
    };

    const handleDownloadForm = async (id: string | null) => {
        if (!id) return toast.error("No envelope ID found");
        try {
            setDownloadingId(id);
            const documents = await getDocuments.mutateAsync(id);
            downloadFile(documents, "Seller Agreement.pdf");
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to download form"));
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div>
            <div className="mb-4 flex flex-row items-center gap-2">
                <div className="text-base font-semibold text-typo-primary">
                    Payout Summary
                </div>
                <CustomTooltip
                    content="Breakdown of each match for your ask"
                    childClass="group-hover:-translate-y-2"
                >
                    <div className="h-4 w-4">
                        <IconHelp />
                    </div>
                </CustomTooltip>
            </div>
            <div className="rounded-lg border mb:border-none">
                <ScrollArea className="relative z-10 max-h-[29rem] overflow-visible tb:max-h-none [&_>div]:!overflow-visible">
                    <Table className="mb:grid mb:grid-cols-2 mb:border-none [&_>tbody]:rounded-b-lg [&_>thead]:rounded-t-lg [&_tbody]:block [&_thead]:block">
                        <TableHeader className="sticky top-0 z-10 bg-bg-main mb:!hidden">
                            <TableRow className="grid grid-cols-6 !gap-x-0 !rounded-none mb:border-none">
                                <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                    Quantity
                                </TableHead>
                                <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                    Ask Price
                                </TableHead>
                                <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                    Matched Price
                                </TableHead>
                                <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                    <div className="flex flex-row items-center gap-1">
                                        <span>Matched Total Value</span>
                                        <CustomTooltip
                                            content={`${processingFeeRate * 100}% processing fee deducted`}
                                            childClass="group-hover:-translate-y-2"
                                        >
                                            <div className="h-4 w-4">
                                                <IconHelp />
                                            </div>
                                        </CustomTooltip>
                                    </div>
                                </TableHead>
                                <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                    Payout Status
                                </TableHead>
                                <TableHead className="p-3 text-right text-sm font-medium text-typo-soft">
                                    Seller Agreement
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-bg-main mb:relative mb:z-10 mb:col-span-2 mb:!grid mb:grid-cols-1 mb:gap-4 mb:border-none">
                            {transactions?.map((item) => {
                                const buttonProps =
                                    payoutSummaryHelpers.getReleaseFormButtonProps(
                                        item.sellerAgreementStatus,
                                        item.sellerAgreementDocuSignEnvelopeId
                                    );
                                const isSigningCurrent =
                                    signingId === item.id &&
                                    getSellerAgreementLink.isPending;
                                const isDownloadingCurrent =
                                    downloadingId ===
                                        item?.sellerAgreementDocuSignEnvelopeId &&
                                    getDocuments.isPending;
                                const isActionPending =
                                    isSigningCurrent || isDownloadingCurrent;
                                const handleAction = () => {
                                    if (buttonProps.variant === "empty") return;

                                    if (
                                        item.sellerAgreementStatus ===
                                            EDocuSignStatus.AWAITING_SIGNATURE ||
                                        item.sellerAgreementStatus ===
                                            EDocuSignStatus.SELLER_UPDATE_REQUESTED
                                    ) {
                                        handleSignForm(item.id, item.askId);
                                    } else {
                                        handleDownloadForm(
                                            item?.sellerAgreementDocuSignEnvelopeId
                                        );
                                    }
                                };

                                return (
                                    <tr
                                        key={item.id}
                                        className="contents mb:grid mb:grid-cols-2 mb:overflow-hidden mb:rounded-lg mb:border"
                                    >
                                        <TableRow className="hidden !gap-x-0 !rounded-none mb:col-span-1 mb:grid mb:h-max mb:grid-cols-1 mb:border-none mb:[&_th]:h-max">
                                            <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                                Quantity
                                            </TableHead>
                                            <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                                Ask Price
                                            </TableHead>
                                            <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                                Matched Price
                                            </TableHead>
                                            <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                                <div className="flex flex-row items-center gap-1">
                                                    <span className="whitespace-nowrap">
                                                        Matched Total Value
                                                    </span>
                                                    <CustomTooltip
                                                        content={`${processingFeeRate * 100}% processing fee deducted`}
                                                        childClass="group-hover:-translate-y-2"
                                                    >
                                                        <div className="h-4 w-4">
                                                            <IconHelp />
                                                        </div>
                                                    </CustomTooltip>
                                                </div>
                                            </TableHead>
                                            <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                                Payout Status
                                            </TableHead>
                                            <TableHead className="p-3 text-right text-sm font-medium text-typo-soft mb:hidden">
                                                Seller Agreement
                                            </TableHead>
                                        </TableRow>
                                        <TableRow className="grid min-h-[5.25rem] grid-cols-6 !gap-x-0 rounded-none hover:bg-transparent mb:col-span-1 mb:grid-cols-1 mb:border-none mb:text-right">
                                            <TableCell className="whitespace-nowrap p-3 text-sm font-medium text-typo-primary">
                                                {item.quantity}
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap p-3 text-sm text-typo-soft">
                                                {formatCurrency(
                                                    item.ask.askPrice
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap p-3 text-sm text-typo-soft">
                                                {formatCurrency(
                                                    item.bid.bidPrice
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap p-3 text-sm text-typo-soft">
                                                {formatCurrency(
                                                    item.netPayoutAmount ??
                                                        item.ask.askPrice *
                                                            item.quantity *
                                                            (1 -
                                                                processingFeeRate)
                                                )}
                                            </TableCell>

                                            <TableCell className="p-3 text-sm text-typo-soft">
                                                <Badge
                                                    variant={payoutSummaryHelpers.getPaymentStatusVariant(
                                                        item.seller?.status ||
                                                            "unknown"
                                                    )}
                                                >
                                                    {payoutSummaryHelpers.getPaymentStatusText(
                                                        item.seller?.status
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            {buttonProps && (
                                                <TableCell className="p-3 text-right text-sm text-typo-soft mb:relative mb:border-none mb:after:absolute mb:after:right-0 mb:after:top-0 mb:after:mx-4 mb:after:h-px mb:after:w-[calc(200%-2rem)] mb:after:bg-bd-brown">
                                                    <div className="flex flex-col items-end gap-2">
                                                        <Button
                                                            className={
                                                                buttonProps.variant ===
                                                                "empty"
                                                                    ? "cursor-auto"
                                                                    : ""
                                                            }
                                                            size="sm"
                                                            variant={
                                                                buttonProps.variant
                                                            }
                                                            disabled={
                                                                isActionPending
                                                            }
                                                            onClick={
                                                                handleAction
                                                            }
                                                        >
                                                            {buttonProps.text}
                                                            {isActionPending && (
                                                                <Loader className="ml-2 size-4 animate-spin" />
                                                            )}
                                                        </Button>
                                                        {buttonProps.showDate &&
                                                            item.sellerAgreementSignatureDueAt && (
                                                                <div className="text-xs text-typo-soft">
                                                                    Sign by{" "}
                                                                    {
                                                                        formatDateTime(
                                                                            item.sellerAgreementSignatureDueAt
                                                                        )
                                                                            .dateOnly
                                                                    }
                                                                </div>
                                                            )}
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    </tr>
                                );
                            })}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
    );
}
