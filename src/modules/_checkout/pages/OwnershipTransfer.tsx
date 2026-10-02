"use client";

import IconDownload from "@/components/shared/icons/icon-download";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import CustomTooltip from "@/components/shared/tooltips-custom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CHECKOUT_STATUS } from "@/enum/checkout";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import {
    downloadFile,
    formatCurrency,
    formatDateTime,
    formatAgeFromDate,
    getErrorMessage,
    formatNumber,
} from "@/lib/utils";
import { checkout } from "@/types/checkout";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function OwnershipTransfer({
    status,
}: {
    status: checkout.TTransactionStatus;
}) {
    const router = useRouter();
    const caskData = status?.cask;
    const isPendingTransfer = status?.status === CHECKOUT_STATUS.INVOICE_PAID;

    const dataMapping = {
        distillery: {
            label: "Distillery",
            value: caskData?.master?.distillery?.name || "N/A",
        },
        region: {
            label: "Region",
            value: caskData?.master?.region?.name || "N/A",
        },
        distillationDate: {
            label: "Distillation date (AYS)",
            value: caskData?.distillationDate
                ? formatAgeFromDate(caskData?.distillationDate)
                : "N/A",
        },
        classification: {
            label: "Classification",
            value: (
                <span className="capitalize">
                    {caskData?.master?.classification?.split("_")?.join(" ") ||
                        "N/A"}
                </span>
            ),
        },
        caskType: {
            label: "Cask Type",
            value: caskData?.master?.caskType?.name || "N/A",
        },
        currentAge: {
            label: "Current age",
            value: formatAgeFromDate(caskData?.distillationDate),
        },
        abv: {
            label: "Alcohol by volume (ABV)",
            value: caskData?.abv
                ? `${formatNumber(Number(caskData.abv))}%`
                : "N/A",
        },
        rla: {
            label: "Regauge litres alcohol (RLA)",
            value: caskData?.rla
                ? `${formatNumber(Number(caskData.rla))} litres`
                : "N/A",
        },
        estimatedBottles: {
            label: "Volume in bottles",
            value: `${caskData?.estimatedBottleCount} bottles` || "N/A",
        },
    };

    const growthPercentage = useMemo(() => {
        const reference = Number(caskData?.priceReference || 0);
        const current = Number(status?.totalAmount || 0);
        if (!reference || !current) return 0;
        const growth = ((current - reference) / reference) * 100;
        return Math.round(growth * 100) / 100;
    }, [caskData?.priceReference, status?.totalAmount]);

    const MAP_TITLE = {
        [CHECKOUT_STATUS.INVOICE_PAID]: "Waiting for ownership transfer",
        [CHECKOUT_STATUS.COMPLETED]: "Ownership Transferred Successfully!",
    };
    const MAP_DESCRIPTION = {
        [CHECKOUT_STATUS.INVOICE_PAID]:
            "Discover the details of your cask investment below.",
        [CHECKOUT_STATUS.COMPLETED]:
            "Discover the details of your cask investment below.",
    };
    const title = MAP_TITLE[status?.status as keyof typeof MAP_TITLE] || "";
    const description =
        MAP_DESCRIPTION[status?.status as keyof typeof MAP_DESCRIPTION] || "";
    const [isDownloading, setIsDownloading] = useState(false);
    const handleDownloadInvoice = async () => {
        if (!status?.ownershipTransferDocumentUrl) return;
        try {
            setIsDownloading(true);
            await downloadFile(status.ownershipTransferDocumentUrl);
        } catch (error) {
            console.error(error);
            getErrorMessage(error, "Download failed");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleBackHome = () => {
        router.push(ROUTE_PUBLIC.HOME);
    };

    const transactionDetails = [
        {
            label: "Total amount",
            value: formatCurrency(status?.totalAmount || 0),
        },
        {
            label: "Deposit amount",
            value: formatCurrency(status?.depositAmount || 0),
        },
        {
            label: "Remaining amount",
            value: formatCurrency(status?.remainingAmount || 0),
        },
        {
            label: "Expiry date",
            value: status?.expiryDate
                ? formatDateTime(status.expiryDate).dateTime
                : "N/A",
        },
    ];
    return (
        <div className="mb-12 flex flex-col gap-12 tb:gap-4">
            <div className="flex flex-col items-center gap-2 text-center tb:items-start tb:gap-1 tb:border-b tb:pb-4 tb:text-start">
                <h2 className="text-xl font-semibold text-typo-primary tb:text-lg">
                    {title}
                </h2>

                <p className="text-sm text-typo-soft">{description}</p>
            </div>
            <div className="rounded-md bg-bg-sf1 p-6 mb:p-4">
                <div className="grid grid-cols-2 !gap-x-6 mb:grid-cols-1">
                    <div className="flex flex-col gap-6 mb:gap-4">
                        <div className="aspect-[424/326] w-full overflow-hidden rounded-[0.3125rem]">
                            <ImagePlaceholder
                                src={caskData?.imageUrl}
                                alt={caskData?.name || "cask"}
                                width={600}
                                height={400}
                            />
                        </div>
                        <Separator />
                        <div className="flex flex-col gap-4">
                            <div className="text-sm font-medium text-typo-soft">
                                Since your investment, your cask&apos;s value
                                has{" "}
                                <span className="font-semibold text-typo-primary">
                                    {growthPercentage > 0
                                        ? `grown by ${growthPercentage}%!`
                                        : growthPercentage < 0
                                          ? `decreased by ${Math.abs(growthPercentage)}%`
                                          : "remained stable"}
                                </span>
                            </div>
                            <div className="flex flex-row gap-4 rounded-md bg-bg-main p-4 mb:mb-4">
                                <div className="flex flex-col gap-1">
                                    <div className="text-sm text-typo-soft">
                                        Now
                                    </div>
                                    <div className="text-2xl font-medium text-typo-primary tb:text-xl">
                                        {formatCurrency(
                                            status?.totalAmount || 0
                                        )}
                                    </div>
                                    <div className="text-sm text-typo-soft">
                                        Smart moves lead to fine rewards-cheers
                                        to your success! 🎉
                                    </div>
                                </div>
                                <div
                                    className={`flex h-max flex-row items-center gap-1 rounded-[1rem] border py-1 pl-3 pr-2.5 tb:text-sm ${
                                        growthPercentage > 0
                                            ? "border-success-lighter bg-success-50 text-success"
                                            : growthPercentage < 0
                                              ? "border-destructive-lighter bg-destructive-50 text-destructive"
                                              : "border-muted bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {growthPercentage > 0 ? "+" : ""}
                                    {growthPercentage}%
                                    {growthPercentage !== 0 && (
                                        <div className="h-3 w-3">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="100%"
                                                viewBox="0 0 13 13"
                                                fill="none"
                                            >
                                                <path
                                                    d={
                                                        growthPercentage > 0
                                                            ? "M3.61523 9.03857L8.61523 4.03857M8.61523 4.03857H3.61523M8.61523 4.03857V9.03857"
                                                            : "M3.61523 4.03857L8.61523 9.03857M8.61523 9.03857H3.61523M8.61523 9.03857V4.03857"
                                                    }
                                                    stroke={
                                                        growthPercentage > 0
                                                            ? "#17B26A"
                                                            : "#EF4444"
                                                    }
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ml-4 flex flex-col gap-4 tb:gap-0">
                        <div className="flex flex-row items-center justify-between">
                            <h1 className="text-2xl font-medium text-typo-primary tb:text-xl">
                                {caskData?.master?.name} -{" "}
                                {caskData?.name || "Cask Name"}
                            </h1>
                            {!isPendingTransfer &&
                                status?.ownershipTransferDocumentUrl && (
                                    <CustomTooltip
                                        className="w-max"
                                        content={
                                            isDownloading
                                                ? "Downloading..."
                                                : "Download documents"
                                        }
                                        isDisabled={isDownloading}
                                    >
                                        <div
                                            className="h-6 w-6 text-typo-soft"
                                            onClick={() =>
                                                handleDownloadInvoice()
                                            }
                                        >
                                            <IconDownload />
                                        </div>
                                    </CustomTooltip>
                                )}
                        </div>
                        <div className="flex flex-col">
                            {Object.entries(dataMapping).map(([key, value]) => (
                                <div
                                    className="flex flex-row items-center justify-between gap-2 border-b py-4 last:border-none"
                                    key={key}
                                >
                                    <div className="text-base text-typo-soft">
                                        {value.label}
                                    </div>
                                    <div className="text-base font-medium text-typo-primary">
                                        {value.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row gap-3 self-end">
                <Button
                    variant="outline"
                    onClick={() =>
                        router.push(`${ROUTE_PUBLIC.MANAGE_PAYMENTS}`)
                    }
                >
                    View transaction details
                </Button>
                <Button variant="secondary" onClick={handleBackHome}>
                    Back to homepage
                </Button>
            </div>
        </div>
    );
}
