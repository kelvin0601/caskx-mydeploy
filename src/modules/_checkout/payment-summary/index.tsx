import IconHelp from "@/components/shared/icons/icon-help";
import CustomTooltip from "@/components/shared/tooltips-custom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
    formatCurrency,
    formatDateTime,
    getErrorMessage,
    handleSnakeCaseToSimpleText,
    downloadFile,
} from "@/lib/utils";
import { checkoutServices } from "@/services/checkout";
import docusignServices from "@/services/docusign";
import { transaction } from "@/types/transaction";
import { useMutation } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PaymentSummary({
    transactions,
    setTransactionIdNotSigned,
    processingFeePercent,
    isDirectSigned,
    buyerDocuSignStatus,
}: {
    transactions: (transaction.TTransaction & {
        agreementSignUrl: string | null;
    })[];
    setTransactionIdNotSigned: (id: string) => void;
    processingFeePercent: number;
    isDirectSigned: boolean;
    buyerDocuSignStatus?: EDocuSignStatus;
}) {
    const [signingId, setSigningId] = useState<string | null>(null);

    const getBuyerAgreementLink = useMutation({
        mutationFn: docusignServices.getAdminBuyerAgreementLink,
        mutationKey: [KEY_DOCUSIGN.GET_SELLER_AGREEMENT_LINK],
    });
    const handleSignForm = async (
        id: string,
        askId: string,
        agreementSignUrl: string | null
    ) => {
        if (!agreementSignUrl) return;
        try {
            setSigningId(id);
            downloadFile(agreementSignUrl);
            setTransactionIdNotSigned(askId);
            // Update local state or refetch data
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to sign form"));
        } finally {
            setSigningId(null);
        }
    };

    // Helper function to get agreement status variant for badge
    const getAgreementStatusVariant = (status: string) => {
        if (status === EDocuSignStatus.AWAITING_SIGNATURE) {
            return "pending"; // Pink badge
        }
        if (
            status === EDocuSignStatus.SELLER_DECLINED ||
            status === EDocuSignStatus.SELLER_VOIDED
        ) {
            return "static"; // Grey badge for Failed
        }
        if (
            status === EDocuSignStatus.SELLER_SIGNED ||
            status === EDocuSignStatus.ALL_SIGNED
        ) {
            return "success";
        }
        return "static";
    };

    // Helper function to get agreement status text
    const getAgreementStatusText = (status: string) => {
        if (status === EDocuSignStatus.AWAITING_SIGNATURE) {
            return "Awaiting Signature";
        }
        if (
            status === EDocuSignStatus.SELLER_DECLINED ||
            status === EDocuSignStatus.SELLER_VOIDED
        ) {
            return "Failed";
        }
        if (status === EDocuSignStatus.BUYER_SIGNED) {
            return "Signed";
        }
        return "Pending";
    };

    const getBuyerAgreementDisplay = (item: (typeof transactions)[0]) => {
        const status = item.sellerAgreementStatus;
        if (
            item.sellerAgreementAdminRejectedAt ||
            item.sellerAgreementRejectedAt ||
            status === EDocuSignStatus.SELLER_DECLINED ||
            status === EDocuSignStatus.SELLER_VOIDED
        ) {
            return {
                type: "text" as const,
                text: "Invalid Signature",
            };
        }

        if (!item.buyerAgreementRejectedAt && item.buyerAgreementSignedAt) {
            return {
                type: "text" as const,
                text: "In Review",
            };
        } else if (!item.buyerAgreementRejectedAt) {
            return {
                type: "button" as const,
                text: "Sign Form",
                variant: "secondary" as const,
            };
        }

        // If signed by admin, show completed state
        if (item.buyerAgreementSignedAt) {
            return {
                type: "text" as const,
                text: "Completed",
            };
        }

        return null;
    };

    return (
        <div>
            <div className="mb-4">
                <div className="mb-2 flex flex-row items-center gap-2">
                    <div className="text-base font-semibold text-typo-primary">
                        Bid Breakdown
                    </div>
                </div>
                <div className="text-sm text-typo-soft">
                    Please sign all agreements to proceed with the final
                    payment. Otherwise, the purchase will be cancelled.
                </div>
            </div>
            <div className="rounded-lg border mb:border-none">
                <ScrollArea className="relative z-10 max-h-[29rem] overflow-visible tb:max-h-none [&_>div]:!overflow-visible">
                    <Table className="mb:grid mb:grid-cols-2 mb:border-none [&_>tbody]:rounded-b-lg [&_>thead]:rounded-t-lg [&_tbody]:block [&_thead]:block">
                        <TableHeader className="sticky top-0 z-10 bg-bg-main mb:!hidden">
                            <TableRow className="grid grid-cols-[1fr_1fr_1.1fr_1.63fr_1.5fr_1.53fr] !gap-x-0 !rounded-none mb:grid-cols-1 mb:border-none">
                                <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                    Quantity
                                </TableHead>
                                <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                    Bid Price
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
                                            content={`${processingFeePercent}% processing fee deducted`}
                                            childClass="group-hover:-translate-y-2"
                                        >
                                            <div className="h-4 w-4">
                                                <IconHelp />
                                            </div>
                                        </CustomTooltip>
                                    </div>
                                </TableHead>
                                <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                    Agreement Status
                                </TableHead>
                                <TableHead className="p-3 text-right text-sm font-medium text-typo-soft mb:hidden">
                                    Buyer Agreement
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-bg-main mb:relative mb:z-10 mb:col-span-2 mb:!grid mb:grid-cols-1 mb:gap-4 mb:border-none">
                            {transactions?.map((item) => {
                                const buyerAgreementDisplay =
                                    getBuyerAgreementDisplay(item);
                                const isSigningCurrent =
                                    signingId === item.id &&
                                    getBuyerAgreementLink.isPending;
                                const isActionPending = isSigningCurrent;

                                const handleAction = () => {
                                    // if (
                                    //     item.sellerAgreementStatus ===
                                    //     EDocuSignStatus.AWAITING_SIGNATURE
                                    // ) {
                                    //     handleSignForm(item.id, item.bidId);
                                    // }
                                    handleSignForm(
                                        item.id,
                                        item.bidId,
                                        item.agreementSignUrl
                                    );
                                };

                                // Get bid price - use bid.bidPrice if available, otherwise use transactionPrice
                                const bidPrice =
                                    item.bid?.bidPrice ??
                                    (typeof item.transactionPrice === "number"
                                        ? item.transactionPrice
                                        : Number(item.transactionPrice) || 0);

                                // Matched price is the same as bid price (the matched price)
                                const matchedPrice = bidPrice;

                                // Matched total value (with processing fee deducted)
                                const matchedTotalValue =
                                    (item.totalAmount as number) *
                                    (1 + processingFeePercent / 100);

                                return (
                                    <tr
                                        key={item.id}
                                        className="contents mb:grid mb:grid-cols-2 mb:overflow-hidden mb:rounded-lg mb:border"
                                    >
                                        <TableRow className="hidden grid-cols-[1fr_1fr_1.1fr_1.63fr_1.5fr_1.53fr] !gap-x-0 !rounded-none mb:col-span-1 mb:grid mb:h-max mb:grid-cols-1 mb:border-none mb:[&_th]:h-max">
                                            <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                                Quantity
                                            </TableHead>
                                            <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                                Bid Price
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
                                                        content={`${processingFeePercent}% processing fee deducted`}
                                                        childClass="group-hover:-translate-y-2"
                                                    >
                                                        <div className="h-4 w-4">
                                                            <IconHelp />
                                                        </div>
                                                    </CustomTooltip>
                                                </div>
                                            </TableHead>
                                            <TableHead className="p-3 text-sm font-medium text-typo-soft">
                                                Agreement Status
                                            </TableHead>
                                            <TableHead className="p-3 text-right text-sm font-medium text-typo-soft mb:hidden">
                                                Buyer Agreement
                                            </TableHead>
                                        </TableRow>
                                        <TableRow
                                            key={item.id}
                                            className="grid min-h-[5.25rem] grid-cols-[1fr_1fr_1.1fr_1.63fr_1.5fr_1.53fr] !gap-x-0 rounded-none hover:bg-transparent mb:col-span-1 mb:grid-cols-1 mb:border-none mb:text-right"
                                        >
                                            <TableCell className="p-3 text-sm font-medium text-typo-primary">
                                                {item.quantity}
                                            </TableCell>

                                            <TableCell className="p-3 text-sm text-typo-soft">
                                                {formatCurrency(bidPrice)}
                                            </TableCell>
                                            <TableCell className="p-3 text-sm text-typo-soft">
                                                {formatCurrency(matchedPrice)}
                                            </TableCell>
                                            <TableCell className="p-3 text-sm text-typo-soft">
                                                {formatCurrency(
                                                    matchedTotalValue
                                                )}
                                            </TableCell>

                                            <TableCell className="p-3 text-sm text-typo-soft">
                                                <Badge
                                                    variant={getAgreementStatusVariant(
                                                        item?.sellerAgreementStatus
                                                    )}
                                                >
                                                    {handleSnakeCaseToSimpleText(
                                                        item?.buyerAgreementStatus ||
                                                            buyerDocuSignStatus ||
                                                            ""
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="p-3 text-right text-sm text-typo-soft mb:relative mb:border-none mb:after:absolute mb:after:right-0 mb:after:top-0 mb:after:mx-4 mb:after:h-px mb:after:w-[calc(200%-2rem)] mb:after:bg-bd-brown">
                                                {buyerAgreementDisplay?.type ===
                                                "button" ? (
                                                    <Button
                                                        size="sm"
                                                        variant={
                                                            buyerAgreementDisplay.variant
                                                        }
                                                        disabled={
                                                            isActionPending
                                                        }
                                                        onClick={handleAction}
                                                    >
                                                        {
                                                            buyerAgreementDisplay.text
                                                        }
                                                        {isActionPending && (
                                                            <Loader className="ml-2 size-4 animate-spin" />
                                                        )}
                                                    </Button>
                                                ) : buyerAgreementDisplay?.type ===
                                                  "text" ? (
                                                    <div className="text-sm text-typo-soft">
                                                        {
                                                            buyerAgreementDisplay.text
                                                        }
                                                    </div>
                                                ) : null}
                                                {item?.buyerAgreementSignatureDueAt &&
                                                    (item.buyerAgreementStatus ===
                                                        EDocuSignStatus.AWAITING_SIGNATURE ||
                                                        item.buyerAgreementStatus ===
                                                            EDocuSignStatus.BUYER_UPDATE_REQUESTED ||
                                                        item.buyerAgreementStatus ===
                                                            EDocuSignStatus.BUYER_SEND) && (
                                                        <div className="mt-1 text-sm text-typo-soft">
                                                            Sign by{" "}
                                                            {
                                                                formatDateTime(
                                                                    item.buyerAgreementSignatureDueAt
                                                                ).dateOnly
                                                            }
                                                        </div>
                                                    )}
                                            </TableCell>
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
