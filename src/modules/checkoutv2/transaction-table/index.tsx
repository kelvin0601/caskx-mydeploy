"use client";

import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CHECKOUT_STEP } from "@/enum/checkout";
import {
    formatCurrency,
    formatDateTime,
    getCheckoutStatusBadgeVariant,
    handleSnakeCaseToSimpleText,
} from "@/lib/utils";
import { checkout } from "@/types/checkout";
import MobileTransactionCards from "../mobile-transaction-cards";

type TTransactionTableProps = {
    statusCheckout: checkout.TTransactionStatus | null | undefined;
    stepCurrent?: CHECKOUT_STEP;
};

export default function TransactionTable({
    statusCheckout,
    stepCurrent,
}: TTransactionTableProps) {
    if (!statusCheckout?.transactions?.length) return null;

    const keyOfValueSelectByStep = (stepCurrent: CHECKOUT_STEP) => {
        //Check step deposit in agreement checkout to checking...
        if (stepCurrent === CHECKOUT_STEP.SELLER_CONFIRMATION) {
            return "sellerAgreementStatus";
        } else {
            return "buyerAgreementStatus";
        }
    };
    const mobileItems = statusCheckout.transactions.map((tx, idx) => {
        const price = Number(tx.transactionPrice || 0);
        const subtotal = tx.quantity * price;
        const statusKey = keyOfValueSelectByStep(stepCurrent as CHECKOUT_STEP);
        const statusValue = tx[statusKey];
        const isPending = String(statusValue).toLowerCase().includes("pending");
        const lastUpdated =
            !isPending && tx.updatedAt
                ? formatDateTime(tx.updatedAt).dateOnly
                : "-";

        return {
            id: tx.id,
            number: idx + 1,
            quantity: tx.quantity,
            price: formatCurrency(price),
            subtotal: formatCurrency(subtotal),
            lastUpdated,
            statusLabel: handleSnakeCaseToSimpleText(statusValue),
            statusVariant: getCheckoutStatusBadgeVariant(statusValue),
        };
    });

    return (
        <div className="mt-8 w-full tb:mt-6">
            <div className="overflow-x-auto mb:hidden">
                <Table className="w-full border-collapse text-left text-xs">
                    <TableHeader className="[&_tr]:border-b [&_tr]:border-bd-main">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12 py-3 pr-4 text-xs font-medium text-typo-soft tb:font-normal">
                                No.
                            </TableHead>
                            <TableHead className="py-3 pr-4 text-xs font-medium text-typo-soft tb:font-normal">
                                Quantity
                            </TableHead>
                            <TableHead className="py-3 pr-4 text-xs font-medium text-typo-soft tb:font-normal">
                                <span className="tb:hidden">
                                    Price per cask
                                </span>
                                <span className="hidden tb:inline">Price</span>
                            </TableHead>
                            <TableHead className="py-3 pr-4 text-xs font-medium text-typo-soft tb:font-normal">
                                Cask subtotal
                            </TableHead>
                            <TableHead className="py-3 pr-4 text-xs font-medium text-typo-soft tb:font-normal">
                                Agreement status
                            </TableHead>
                            <TableHead className="py-3 pr-4 text-right text-xs font-medium text-typo-soft tb:font-normal">
                                Last updated
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y border-b">
                        {statusCheckout.transactions.map((tx, idx) => {
                            const price = Number(tx.transactionPrice || 0);
                            const subtotal = tx.quantity * price;

                            return (
                                <TableRow
                                    key={tx.id}
                                    className="border-b-0 text-sm transition-colors"
                                >
                                    <TableCell className="whitespace-nowrap py-4 pr-4 font-medium text-typo-primary">
                                        {idx + 1}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4 pr-4 font-medium text-typo-primary">
                                        {tx.quantity}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4 pr-4 font-medium text-typo-primary">
                                        {formatCurrency(price)}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4 pr-4 font-medium text-typo-primary">
                                        {formatCurrency(subtotal)}
                                    </TableCell>
                                    <TableCell className="py-4 pr-4">
                                        <Badge
                                            variant={getCheckoutStatusBadgeVariant?.(
                                                tx[
                                                    keyOfValueSelectByStep?.(
                                                        stepCurrent as CHECKOUT_STEP
                                                    )
                                                ]
                                            )}
                                            size="sm"
                                            className="text-xs font-medium tb:font-semibold"
                                        >
                                            {handleSnakeCaseToSimpleText(
                                                tx?.[
                                                    keyOfValueSelectByStep?.(
                                                        stepCurrent as CHECKOUT_STEP
                                                    )
                                                ]
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 pr-4 text-right text-typo-soft tb:font-medium tb:text-typo-primary">
                                        {tx.updatedAt
                                            ? formatDateTime(tx.updatedAt)
                                                  .dateOnly
                                            : "-"}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <MobileTransactionCards
                items={mobileItems}
                defaultOpenItemId={statusCheckout.transactions[0].id}
            />
        </div>
    );
}
