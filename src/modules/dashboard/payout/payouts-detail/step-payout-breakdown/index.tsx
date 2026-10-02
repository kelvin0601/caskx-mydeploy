"use client";

import InfoField from "@/components/shared/info-field";
import StepRowAccordion from "@/components/shared/step-row-accordion";
import { Button } from "@/components/ui/button";
import { ROUTE_DASHBOARD } from "@/lib/constants";
import { useRouter } from "next/navigation";
import React from "react";
import {
    formatCurrency,
    formatDateTime,
    handleRenderFallbackText,
} from "@/lib/utils";
import { payout } from "@/types";
import { AdminPayoutStatus } from "@/enum/payout";

type StepPayoutBreakdownProps = {
    caskValue: number;
    processingFee: number;
    processingFeePercentage?: number;
    payoutAmount: number;
    payoutStatus: payout.TAdminPayoutStatus;
    payoutAt?: string | null;
    linkedPaymentId?: string | null;
    status: payout.TAdminPayoutStatus;
    isActive?: boolean;
    isAccordion?: boolean;
};

export default function StepPayoutBreakdown({
    caskValue,
    processingFee,
    processingFeePercentage = 5,
    payoutAmount,
    payoutStatus,
    payoutAt,
    linkedPaymentId,
    status,
    isActive = true,
    isAccordion = false,
}: StepPayoutBreakdownProps) {
    const router = useRouter();

    const getStatusClassName = (status: string) => {
        switch (status) {
            case AdminPayoutStatus.COMPLETED:
                return "text-success";
            case AdminPayoutStatus.READY:
                return "text-warn";
            case AdminPayoutStatus.PROCESSING:
                return "text-info";
            case AdminPayoutStatus.FAILED:
                return "text-error";
            case AdminPayoutStatus.NOT_READY:
                return "text-typo-disable";
            default:
                return "";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case AdminPayoutStatus.COMPLETED:
                return "Completed";
            case AdminPayoutStatus.READY:
                return "Pending";
            case AdminPayoutStatus.PROCESSING:
                return "Processing";
            case AdminPayoutStatus.FAILED:
                return "Failed";
            case AdminPayoutStatus.NOT_READY:
                return "Not Ready";
            default:
                return status;
        }
    };

    return (
        <StepRowAccordion
            title="Payout Breakdown"
            value="payout-breakdown"
            status={status}
            isActive={isActive}
            isAccordion={isAccordion}
        >
            <div className="border-bd-main pt-6">
                <div className="grid grid-cols-2 !gap-4">
                    <InfoField
                        label="Cask Value"
                        value={formatCurrency(caskValue)}
                    />
                    <InfoField
                        label={`Processing Fee (${processingFeePercentage}%)`}
                        value={formatCurrency(processingFee)}
                    />
                    <InfoField
                        label="Payout Amount"
                        value={formatCurrency(payoutAmount)}
                    />
                    <InfoField
                        label="Payout Status"
                        value={getStatusText(payoutStatus)}
                        valueClassName={getStatusClassName(payoutStatus)}
                    />
                    {payoutAt && (
                        <InfoField
                            label="Payout At"
                            value={formatDateTime(payoutAt).dateTime}
                        />
                    )}
                    {/* {linkedPaymentId ? (
                        <div className="flex flex-col gap-1">
                            <div className="text-sm text-typo-note">
                                Linked Payment
                            </div>
                            <Button
                                variant="link"
                                className="h-auto w-fit p-0 text-sm font-medium text-typo-primary"
                                onClick={() =>
                                    router.push(
                                        `${ROUTE_DASHBOARD.PAYMENTS}/${linkedPaymentId}`
                                    )
                                }
                            >
                                {handleRenderFallbackText(linkedPaymentId)}
                            </Button>
                        </div>
                    ) : (
                        <InfoField label="Linked Payment" value="-" />
                    )} */}
                </div>
            </div>
        </StepRowAccordion>
    );
}
