"use client";

import HeadingSettings from "@/components/shared/heading-settings";
import IconDownload from "@/components/shared/icons/icon-download";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import StatusWPrice from "@/components/shared/status-w-price";
import CustomTooltip from "@/components/shared/tooltips-custom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CHECKOUT_STATUS } from "@/enum/checkout";
import useResponsive from "@/hooks/useResponsive";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { formatDateTime } from "@/lib/utils";
import { useCheckout } from "@/store/checkout";
import { checkout } from "@/types/checkout";
import { redirect } from "next/navigation";

export default function TransactionCompleted() {
    const { statusTransaction } = useCheckout();
    const caskData = statusTransaction?.cask;
    const { isMobile } = useResponsive();
    const isPendingTransfer =
        statusTransaction?.status === CHECKOUT_STATUS.INVOICE_PAID;

    const dataMapping = {
        distillery: {
            label: "Distillery",
            value: caskData?.distillery?.name || "N/A",
        },
        region: {
            label: "Region",
            value: caskData?.region?.name || "N/A",
        },
        distillationDate: {
            label: "Distillation date (AYS)",
            value: caskData?.distillationDate
                ? formatDateTime(caskData.distillationDate).dateTime || ""
                : "N/A",
        },
        classification: {
            label: "Classification",
            value: caskData?.classification || "N/A",
        },
        caskType: {
            label: "Cask Type",
            value: caskData?.caskType?.name || "N/A",
        },
        currentAge: {
            label: "Current age",
            value: (() => {
                if (!caskData?.distillationDate) return "N/A";
                const date = new Date(caskData.distillationDate);
                const currentYear = new Date().getFullYear();
                const age = currentYear - date.getFullYear();
                return `${age} years`;
            })(),
        },
        abv: {
            label: "Alcohol by volume (ABV)",
            value: caskData?.abv ? `${caskData.abv}%` : "N/A",
        },
        rla: {
            label: "Regauge litres alcohol (RLA)",
            value: caskData?.rla ? `${caskData.rla} litres` : "N/A",
        },
        estimatedBottles: {
            label: "Volume in bottles",
            value: `${caskData?.estimatedBottleCount} bottles` || "N/A",
        },
    };

    // Calculate growth percentage
    const calculateGrowthPercentage = () => {
        if (!caskData?.initialValuation || !caskData?.highestBid) return 0;
        const initial = parseFloat(caskData.initialValuation.toString());
        const current = parseFloat(caskData?.lowestAsk?.toString() || "0");
        const growth = ((current - initial) / initial) * 100;
        return Math.round(growth * 100) / 100; // Round to 2 decimal places
    };

    const growthPercentage = calculateGrowthPercentage();
    const MAP_TITLE = {
        [CHECKOUT_STATUS.INVOICE_PAID]: "Waiting for ownership transfer",
        [CHECKOUT_STATUS.AGREEMENT_SIGNED]:
            "Ownership Transferred Successfully!",
    };
    const MAP_DESCRIPTION = {
        [CHECKOUT_STATUS.INVOICE_PAID]:
            "Discover the details of your cask investment below.",
        [CHECKOUT_STATUS.AGREEMENT_SIGNED]:
            "Discover the details of your cask investment below.",
    };
    const title =
        MAP_TITLE[statusTransaction?.status as keyof typeof MAP_TITLE] || "";
    const description =
        MAP_DESCRIPTION[
            statusTransaction?.status as keyof typeof MAP_DESCRIPTION
        ] || "";
    return (
        <div>
            <HeadingSettings
                className="mb-12 border-b-[1px] border-bd-brown pb-5"
                title="Transaction Completed!"
                description="Take a look back at your cask investment – see how it’s matured and what it’s earned you."
            />
            <div className="mb-12 flex flex-col gap-12 tb:gap-4">
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
                                <div className="text-sm font-medium text-typo-primary">
                                    Good news! Your cask has increased in value
                                    by 5%
                                </div>
                                <div className="flex flex-row items-center gap-4 mb:flex-col [&>div]:flex-1 mb:[&>div]:w-full">
                                    <StatusWPrice
                                        statusTransaction={
                                            statusTransaction ||
                                            ({} as checkout.TTransactionStatus)
                                        }
                                        growthPercentage={growthPercentage}
                                    />
                                    <StatusWPrice
                                        statusTransaction={
                                            {
                                                ...statusTransaction,
                                                totalAmount: 900,
                                            } as checkout.TTransactionStatus
                                        }
                                        growthPercentage={-10}
                                    />
                                </div>
                            </div>
                            <div>
                                Smart moves lead to fine rewards-cheers to your
                                success! 🎉
                            </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-4 tb:gap-0">
                            <div className="flex flex-row items-center justify-between">
                                <h1 className="text-2xl font-medium text-typo-primary tb:text-xl">
                                    {caskData?.name || "Cask Name"}
                                </h1>
                                {!isPendingTransfer && (
                                    <CustomTooltip
                                        className="w-max"
                                        isHide={isMobile}
                                        content="Download invoice"
                                    >
                                        <div className="h-6 w-6 text-typo-soft">
                                            <IconDownload />
                                        </div>
                                    </CustomTooltip>
                                )}
                            </div>
                            <div className="flex flex-col">
                                {Object.entries(dataMapping).map(
                                    ([key, value]) => (
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
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row gap-3 self-end mb:w-full mb:flex-col mb:self-auto">
                    <Button variant="outline" className="mb:w-full">
                        View transaction details
                    </Button>
                    <Button
                        variant="secondary"
                        className="mb:w-full"
                        onClick={() => redirect(ROUTE_PUBLIC.HOME)}
                    >
                        Back to homepage
                    </Button>
                </div>
            </div>
        </div>
    );
}
