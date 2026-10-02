"use client";

import PaymentStepCard, {
    createPaymentFields,
} from "@/components/shared/payment-step-card";
import StepRowAccordion from "@/components/shared/step-row-accordion";
import { Button } from "@/components/ui/button";
import { EDocuSignStatus } from "@/enum/docusign";
import { useInvoiceDownload } from "@/hooks/useInvoiceDownload";
import { TransactionInvoiceType } from "@/modules/_checkout/table-info-transaction";
import { global } from "@/types/global/global";
import { getPaymentStatusText } from "../payment-status";

// Helper to format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function StepDeposit({
    status,
    amount,
    transactionId,
    processedAt,
    isAccordion = true,
    isDisabled = false,
    checkoutSessionId,
}: {
    status: global.TParticipantStatus | EDocuSignStatus;
    amount: number;
    transactionId: string;
    processedAt: string;
    isAccordion?: boolean;
    isDisabled?: boolean;
    checkoutSessionId: string;
}) {
    const { downloadInvoice, isLoading } = useInvoiceDownload(
        checkoutSessionId,
        TransactionInvoiceType.DEPOSIT
    );

    return (
        <StepRowAccordion
            title="Step 1: Deposit"
            value="step-1"
            status={status}
            isActive={!isDisabled}
            isAccordion={isAccordion}
            isDisabled={isDisabled}
        >
            <PaymentStepCard
                fields={[
                    ...createPaymentFields({
                        amount: formatCurrency(amount),
                        transactionId: transactionId,
                        processedAt: processedAt,
                    }),
                    {
                        label: "Invoice",
                        value:
                            status === "completed" ? (
                                <Button
                                    variant={"link"}
                                    onClick={downloadInvoice}
                                    disabled={isLoading}
                                    className="h-auto justify-start p-0 text-sm text-typo-note"
                                >
                                    Download {isLoading ? "ing..." : ""}
                                </Button>
                            ) : (
                                "-"
                            ),
                    },
                ]}
                status={status as global.TParticipantStatus}
                statusText={getPaymentStatusText(
                    status as global.TParticipantStatus
                )}
            />
        </StepRowAccordion>
    );
}
