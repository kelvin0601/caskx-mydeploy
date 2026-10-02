import { formatCurrency } from "@/lib/utils";
import { checkout } from "@/types/checkout";
import React from "react";

export default function StatusWPrice({
    statusTransaction,
    growthPercentage,
}: {
    statusTransaction: checkout.TTransactionStatus;
    growthPercentage: number;
}) {
    return (
        <div className="flex flex-row gap-4 rounded-md bg-bg-main p-4">
            <div className="flex flex-col gap-1">
                <div className="text-sm text-typo-soft">Now</div>
                <div className="text-2xl font-medium text-typo-primary">
                    {formatCurrency(statusTransaction?.totalAmount || 0)}
                </div>
            </div>
            <div
                className={`flex h-max flex-row items-center gap-1 rounded-[1rem] border py-1 pl-3 pr-2.5 ${
                    growthPercentage > 0
                        ? "border-success-lighter bg-success-50 text-success"
                        : growthPercentage < 0
                          ? "bg-destructive-50 border-error-lighter text-error"
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
                                    growthPercentage > 0 ? "#17B26A" : "#EF4444"
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
    );
}
