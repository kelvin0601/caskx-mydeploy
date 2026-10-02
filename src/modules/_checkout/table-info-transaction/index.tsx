import IconDownload from "@/components/shared/icons/icon-download";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import CustomTooltip from "@/components/shared/tooltips-custom";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useInvoiceDownload } from "@/hooks/useInvoiceDownload";
import useResponsive from "@/hooks/useResponsive";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { useCheckout } from "@/store/checkout";

export enum TransactionInvoiceType {
    DEPOSIT = "deposit",
    FINAL = "final",
}

export default function TableInfoTransaction({
    isDeposited = false,
    children,
    title = "Confirm and Pay",
    type,
    isDownload = false,
    className,
}: {
    isDeposited?: boolean;
    children?: React.ReactNode;
    title?: string;
    type?: TransactionInvoiceType;
    isDownload?: boolean;
    className?: string;
}) {
    const { statusTransaction } = useCheckout();
    const {
        id,
        processingFeePercent,
        processingFeeAmount,
        quantity,
        expiryDate,
        totalAmount,
        originalAmount,
        depositAmount,
        remainingAmount,
        cask,
    } = statusTransaction || {};
    const { downloadInvoice, isLoading: isDownloading } = useInvoiceDownload(
        id || "",
        type
    );
    const { isMobile } = useResponsive();
    const tableSummary: {
        label: () => string | React.ReactNode;
        value: string | number;
    }[] = [
        {
            label: () => "Subtotal",
            value: formatCurrency(originalAmount || 0),
        },
        {
            label: () => `Processing fee (${processingFeePercent || 0}%)`,
            value: formatCurrency(processingFeeAmount || 0),
        },
        // {
        //     label: () => "Discounts",
        //     value: formatCurrency(0), // No discounts for now
        // },
        {
            label: () => "Total",
            value: formatCurrency(totalAmount || 0),
        },
        {
            label: () => (
                <div className="flex flex-row items-center gap-2">
                    {isDeposited ? (
                        <>
                            Deposit amount (10%)
                            <Badge
                                isHaveDot
                                variant="outline"
                                className="bg-bg-main text-sm"
                            >
                                Paid
                            </Badge>
                        </>
                    ) : (
                        "Deposit amount (10%)"
                    )}
                </div>
            ),
            value: `${isDeposited ? "-" : ""}${formatCurrency(depositAmount || 0)}`,
        },
    ];
    if (isDeposited) {
        tableSummary.push({
            label: () => "Remaining balance",
            value: formatCurrency(remainingAmount || 0),
        });
    }

    return (
        <div
            className={cn(
                "flex flex-col gap-8 tb:gap-6 tb:py-8 mb:gap-5 mb:py-6",
                className
            )}
        >
            <div className="flex w-full flex-row items-center justify-between">
                <h1 className="text-2xl font-semibold text-typo-primary tb:text-xl">
                    {title}
                </h1>
                {isDownload && (
                    <CustomTooltip
                        className="w-max"
                        isHide={isMobile}
                        content={
                            isDownloading
                                ? "Downloading..."
                                : "Download invoice"
                        }
                    >
                        <button
                            type="button"
                            className="h-6 w-6 text-typo-soft disabled:cursor-not-allowed disabled:opacity-60"
                            aria-busy={isDownloading}
                            disabled={isDownloading}
                            onClick={async () => {
                                if (isDownloading) return;
                                await downloadInvoice();
                            }}
                        >
                            <span
                                className={
                                    isDownloading ? "block animate-pulse" : ""
                                }
                            >
                                <IconDownload />
                            </span>
                        </button>
                    </CustomTooltip>
                )}
            </div>
            <Table>
                <TableBody className="block overflow-hidden rounded-md border">
                    <TableRow className="grid grid-cols-4 !gap-x-0 mb:grid-cols-1">
                        <TableCell className="overflow-hidden border-r mb:border-none">
                            <div className="flex-center flex flex-col px-4 mb:flex-row mb:gap-4">
                                <div className="aspect-[104/80] h-20 overflow-hidden rounded-[0.3125rem]">
                                    <ImagePlaceholder
                                        src={cask?.imageUrl || ""}
                                        alt={cask?.name || ""}
                                        width={104}
                                        height={80}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="hidden mb:flex mb:flex-col mb:justify-start mb:text-start">
                                    <div className="break-all text-base font-semibold text-typo-soft">
                                        {cask?.master?.name} - {cask?.name}
                                    </div>
                                    <div className="break-all text-sm text-typo-soft">
                                        Quantity: {quantity || 1}
                                    </div>
                                    <div className="break-all text-sm text-typo-soft">
                                        Due date:{" "}
                                        {
                                            formatDateTime(expiryDate || "-")
                                                .dateOnly
                                        }
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="h-full border-r mb:hidden">
                            <div className="flex-center flex h-full flex-col gap-0.5 px-4">
                                <div className="text-base font-medium text-typo-primary">
                                    Cask name
                                </div>
                                <div className="break-words text-center text-sm text-typo-soft">
                                    {cask?.master?.name} - {cask?.name}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="h-full border-r mb:hidden">
                            <div className="flex-center flex h-full flex-col gap-0.5 px-4">
                                <div className="text-base font-medium text-typo-primary">
                                    Quantity
                                </div>
                                <div className="text-sm text-typo-soft">
                                    {quantity || 1}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="h-full mb:hidden">
                            <div className="flex-center flex h-full flex-col gap-0.5 px-4">
                                <div className="text-base font-medium text-typo-primary">
                                    Due date
                                </div>
                                <div className="text-sm text-typo-soft">
                                    {formatDateTime(expiryDate || "-").dateOnly}
                                </div>
                            </div>
                        </TableCell>
                        {/* <TableCell className="h-full">
                            <div className="flex-center flex h-full flex-col gap-0.5 px-4">
                                <div className="text-base font-medium text-typo-primary">
                                    Invoice number
                                </div>
                                <div className="text-sm text-typo-soft">-</div>
                            </div>
                        </TableCell> */}
                    </TableRow>
                </TableBody>
            </Table>

            <div className="flex flex-col gap-4 mb:gap-3">
                <h3 className="text-base font-medium text-typo-primary">
                    Summary
                </h3>
                <Table>
                    <TableBody>
                        {tableSummary.map((item, index) => (
                            <TableRow
                                key={index}
                                className={cn(
                                    "grid grid-cols-2 border-b-0 border-t px-4 last:rounded-[0.3125rem] last:bg-bg-sf2 last:hover:bg-bg-sf2 mb:grid-cols-[1fr_auto]"
                                )}
                            >
                                <TableCell className="text-base font-medium text-typo-primary">
                                    {item.label?.()}
                                </TableCell>
                                <TableCell className="text-right text-base text-typo-soft">
                                    {item?.value}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {children}
        </div>
    );
}
