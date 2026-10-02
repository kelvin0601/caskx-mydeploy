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
import {
    cn,
    formatCurrency,
    formatDateTime,
    formatTabletDateTime,
} from "@/lib/utils";
import type { caskBid } from "@/types/cask-bid";
import type { CSSProperties } from "react";
import MobilePaymentCards, {
    type MobilePaymentCardItem,
} from "./mobile-payment-cards";
import { badgeVariant, labelize } from "../utils";

const PAYMENT_COLUMNS: Array<{
    key: string;
    label?: string;
    tabletLabel?: string;
}> = [
    { key: "index", label: "No." },
    { key: "createdAt", label: "Matching date" },
    { key: "quantity", label: "Quantity" },
    {
        key: "transactionPrice",
        label: "Price per cask",
        tabletLabel: "Price",
    },
    { key: "totalPrice", label: "Cask subtotal", tabletLabel: "Subtotal" },
    { key: "status", label: "Payment status", tabletLabel: "Stage" },
    { key: "action" },
];

type PaymentTableStyle = CSSProperties & {
    "--payment-table-min-width": string;
};

function paymentBadgeVariant(status = ""): TBadgeVariant {
    return status.toLowerCase().includes("pending")
        ? "warning"
        : badgeVariant(status);
}

function paymentStatusLabel(status: string) {
    return status.toLowerCase().includes("complete")
        ? "Complete"
        : labelize(status);
}

function getContentColumnWidth(
    values: string[],
    minimumWidthRem: number,
    horizontalPaddingRem = 1
) {
    return Math.max(
        minimumWidthRem,
        ...values.map((value) => value.length * 0.55 + horizontalPaddingRem)
    );
}

function getPaymentTableLayout(transactions: caskBid.TBidTransaction[]) {
    const priceWidth = getContentColumnWidth(
        [
            "Price",
            ...transactions.map((transaction) =>
                formatCurrency(transaction.transactionPrice)
            ),
        ],
        6.25
    );
    const subtotalWidth = getContentColumnWidth(
        [
            "Subtotal",
            ...transactions.map((transaction) =>
                formatCurrency(transaction.totalPrice)
            ),
        ],
        6.25
    );
    const stageWidth = getContentColumnWidth(
        [
            "Stage",
            ...transactions.map((transaction) =>
                paymentStatusLabel(transaction.status)
            ),
        ],
        6.25,
        1.5
    );
    const gridTemplateColumns = [
        "minmax(2.5rem, 40fr)",
        "minmax(9.875rem, 158fr)",
        "minmax(6.25rem, 100fr)",
        `minmax(${priceWidth}rem, 100fr)`,
        `minmax(${subtotalWidth}rem, 100fr)`,
        `minmax(${stageWidth}rem, 100fr)`,
        "minmax(6.25rem, 100fr)",
    ].join(" ");
    const minWidthRem =
        2.5 + 9.875 + 6.25 + priceWidth + subtotalWidth + stageWidth + 6.25 + 6;

    return { gridTemplateColumns, minWidthRem };
}

export default function PaymentSection({
    transactions,
    onViewPayment,
}: {
    transactions: caskBid.TBidTransaction[];
    onViewPayment: (checkoutSessionId: string) => void;
}) {
    const paymentTableLayout = getPaymentTableLayout(transactions);
    const paymentTableStyle: PaymentTableStyle = {
        "--payment-table-min-width": `${paymentTableLayout.minWidthRem}rem`,
    };
    const paymentRowStyle: CSSProperties = {
        gridTemplateColumns: paymentTableLayout.gridTemplateColumns,
    };
    const mobilePaymentItems: MobilePaymentCardItem[] = transactions.map(
        (transaction, index) => ({
            id: transaction.checkoutSessionId || transaction.caskTransactionId,
            number: index + 1,
            matchingDate: formatTabletDateTime(transaction.createdAt),
            quantity: transaction.quantity,
            price: formatCurrency(transaction.transactionPrice),
            subtotal: formatCurrency(transaction.totalPrice),
            stage: paymentStatusLabel(transaction.status),
            stageVariant: paymentBadgeVariant(transaction.status),
            onView: () => onViewPayment(transaction.checkoutSessionId),
        })
    );

    return (
        <section className="pb-0 pt-8 j-tb:pb-0 j-tb:pt-6 mb:pb-0 mb:pt-6">
            <div className="mb-7 flex flex-col gap-1 j-tb:mb-4 j-tb:gap-1 mb:mb-[0.9375rem] mb:gap-1">
                <h2 className="text-lg font-semibold text-typo-primary tb:text-base">
                    Payment
                </h2>
                <p className="text-sm text-typo-soft">
                    Payments are created when your offer matches with one or
                    more listings.
                </p>
            </div>

            {transactions.length === 0 ? (
                <div className="border-b border-bd-main py-8 text-center text-sm text-typo-soft">
                    No payments have been created yet.
                </div>
            ) : (
                <>
                    <div className="no-scrollbar overflow-x-auto mb:hidden">
                        <Table
                            style={paymentTableStyle}
                            className="min-w-[54rem] border-collapse text-left text-typo-primary j-tb:block j-tb:min-w-[var(--payment-table-min-width)]"
                        >
                            <TableHeader className="j-tb:block">
                                <TableRow
                                    style={paymentRowStyle}
                                    className="border-b border-bd-main text-xs text-typo-soft hover:bg-transparent j-tb:grid j-tb:h-9 j-tb:items-center j-tb:!gap-x-4"
                                >
                                    {PAYMENT_COLUMNS.map((column) => (
                                        <TableHead
                                            key={column.key}
                                            className={cn(
                                                "pb-2 text-xs font-normal",
                                                "j-tb:min-w-0 j-tb:p-0 j-tb:leading-none",
                                                column.key === "action" &&
                                                    "text-right"
                                            )}
                                        >
                                            {column.label ? (
                                                <>
                                                    <span
                                                        className={cn(
                                                            "truncate",
                                                            column.tabletLabel &&
                                                                "j-tb:hidden"
                                                        )}
                                                    >
                                                        {column.label}
                                                    </span>
                                                    {column.tabletLabel ? (
                                                        <span className="hidden truncate j-tb:inline">
                                                            {column.tabletLabel}
                                                        </span>
                                                    ) : null}
                                                </>
                                            ) : null}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody className="j-tb:block j-tb:[&_tr:last-child]:border-b">
                                {transactions.map((transaction, index) => (
                                    <TableRow
                                        key={transaction.caskTransactionId}
                                        style={paymentRowStyle}
                                        className="border-b border-bd-main hover:bg-transparent j-tb:grid j-tb:min-h-[3.3125rem] j-tb:items-center j-tb:!gap-x-4"
                                    >
                                        <TableCell className="py-4 text-sm font-medium j-tb:min-w-0 j-tb:p-0">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="py-4 text-sm font-medium j-tb:min-w-0 j-tb:p-0">
                                            <span className="block truncate j-tb:hidden">
                                                {
                                                    formatDateTime(
                                                        transaction.createdAt
                                                    ).dateTime
                                                }
                                            </span>
                                            <span className="hidden truncate j-tb:block">
                                                {formatTabletDateTime(
                                                    transaction.createdAt
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 text-sm font-medium j-tb:min-w-0 j-tb:p-0">
                                            {transaction.quantity}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap py-4 text-sm font-medium j-tb:min-w-0 j-tb:p-0">
                                            {formatCurrency(
                                                transaction.transactionPrice
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap py-4 text-sm font-medium j-tb:min-w-0 j-tb:p-0">
                                            {formatCurrency(
                                                transaction.totalPrice
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap py-4 j-tb:min-w-0 j-tb:p-0">
                                            <Badge
                                                variant={paymentBadgeVariant(
                                                    transaction.status
                                                )}
                                                size="sm"
                                                className="max-w-full bg-bg-sf3 font-semibold"
                                            >
                                                <span className="truncate">
                                                    {paymentStatusLabel(
                                                        transaction.status
                                                    )}
                                                </span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 text-right j-tb:min-w-0 j-tb:p-0">
                                            <Button
                                                variant="link"
                                                className="ml-auto text-sm"
                                                onClick={() =>
                                                    onViewPayment(
                                                        transaction.checkoutSessionId
                                                    )
                                                }
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <MobilePaymentCards items={mobilePaymentItems} />
                </>
            )}
        </section>
    );
}
