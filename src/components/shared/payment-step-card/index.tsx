"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, handleRenderFallbackText } from "@/lib/utils";
import IconDownload from "../icons/icon-download";
import { global } from "@/types/global/global";
import React from "react";

export type InfoFieldConfig = {
    label: string;
    value: string | React.ReactNode;
    valueClassName?: string;
};

type PaymentStatus = {
    status?: global.TParticipantStatus;
    statusText?: string;
};

type PaymentAgreement = {
    agreementId?: string;
    onAgreementClick?: () => void;
};

type PaymentActions = {
    rejectText?: string;
    onRejectClick?: () => void;
    onConfirmClick?: () => void;
};

type PaymentStepCardProps = {
    fields?: InfoFieldConfig[];
    children?: React.ReactNode;
} & PaymentStatus &
    PaymentAgreement &
    PaymentActions & {
        note?: string;
        buttonGroup?: React.ReactNode;
    };

const STATUS_STYLES: Record<global.TParticipantStatus, string> = {
    completed: "text-success",
    expired: "text-error",
    pending: "text-warn",
} as const;

const LABELS = {
    AMOUNT: "Deposit Amount",
    TRANSACTION_ID: "Transaction ID",
    PROCESSED_AT: "Processed At",
    STATUS: "Status",
    CONFIRM_PAYMENT: "Confirm Payment",
    FAILED_MESSAGE: "Failed due to step expiration",
} as const;

export function createFields(
    configs: Array<InfoFieldConfig>
): InfoFieldConfig[] {
    return configs;
}

/**
 * Helper to create common payment info fields
 */
export function createPaymentFields({
    amount,
    amountLabel = LABELS.AMOUNT,
    transactionId = "-",
    transactionIdLabel = LABELS.TRANSACTION_ID,
    processedAt = "-",
    processedAtLabel = LABELS.PROCESSED_AT,
    additionalFields = [],
}: {
    amount: string;
    amountLabel?: string;
    transactionId?: string;
    transactionIdLabel?: string;
    processedAt?: string;
    processedAtLabel?: string;
    additionalFields?: InfoFieldConfig[];
}): InfoFieldConfig[] {
    return [
        { label: amountLabel, value: amount },
        { label: transactionIdLabel, value: transactionId },
        { label: processedAtLabel, value: processedAt },
        ...additionalFields,
    ];
}

type InfoFieldProps = {
    label: string;
    value: string | React.ReactNode;
    valueClassName?: string;
};

function InfoField({ label, value, valueClassName }: InfoFieldProps) {
    const renderContent = () => {
        if (React.isValidElement(value)) {
            return value;
        }
        if (typeof value === "string" || typeof value === "number") {
            return handleRenderFallbackText(value);
        }
        if (value === null || value === undefined) {
            return handleRenderFallbackText(undefined);
        }
        if (typeof value === "object") {
            const maybeObj = value as unknown as Record<string, unknown>;
            if (typeof maybeObj.url === "string") {
                return maybeObj.url;
            }
            if (typeof maybeObj.name === "string") {
                return maybeObj.name;
            }
            return handleRenderFallbackText(undefined);
        }
        return value;
    };

    return (
        <div className="flex flex-col gap-1">
            {label && <div className="text-sm text-typo-note">{label}</div>}
            <div
                className={cn(
                    "text-sm font-medium text-typo-primary",
                    valueClassName
                )}
            >
                {renderContent()}
            </div>
        </div>
    );
}

type StatusFieldProps = {
    status: global.TParticipantStatus;
    statusText: string;
};

function StatusField({ status, statusText }: StatusFieldProps) {
    const statusColorClass = STATUS_STYLES[status];

    return (
        <div className="flex flex-col gap-1">
            <div className="text-sm text-typo-note">{LABELS.STATUS}</div>
            <div className={cn("text-sm font-medium", statusColorClass)}>
                {statusText}
            </div>
        </div>
    );
}
type NotificationCardProps = {
    variant: "error" | "warning";
    message: string;
};

function NotificationCard({ variant, message }: NotificationCardProps) {
    const isError = variant === "error";
    const dotColor = isError ? "bg-error" : "bg-warn";
    const bgColor = isError ? "bg-bg-sf1" : "bg-brand-50";

    return (
        <Card
            className={cn(
                "col-span-2 flex w-full flex-row items-center gap-2 rounded-lg p-3",
                bgColor
            )}
        >
            <div className={cn("h-2 w-2 rounded-full", dotColor)} />
            <div className="text-sm text-typo-primary">{message}</div>
        </Card>
    );
}

type ActionButtonsProps = Pick<
    PaymentActions,
    "rejectText" | "onRejectClick" | "onConfirmClick"
>;

export function ActionButtons({
    rejectText,
    onRejectClick,
    onConfirmClick,
}: ActionButtonsProps) {
    const hasActions = onConfirmClick || rejectText;

    if (!hasActions) return null;

    return (
        <div className="mt-4 flex flex-row gap-3">
            {onConfirmClick && (
                <Button
                    variant="secondary"
                    className="text-sm font-semibold"
                    onClick={onConfirmClick}
                >
                    {LABELS.CONFIRM_PAYMENT}
                </Button>
            )}
            {rejectText && (
                <Button
                    variant="outline"
                    className="text-gray-700 text-sm font-semibold"
                    onClick={onRejectClick}
                >
                    {rejectText}
                </Button>
            )}
        </div>
    );
}

export default function PaymentStepCard({
    fields,
    status,
    statusText,
    buttonGroup,
    note,
    children,
}: PaymentStepCardProps) {
    const showFailedMessage = status === "expired";

    return (
        <div className="border-bd-main">
            <div className="grid grid-cols-2 !gap-4 pt-6">
                {/* Status field */}
                {status && (
                    <StatusField
                        status={status}
                        statusText={statusText ?? ""}
                    />
                )}
                {buttonGroup !== undefined && buttonGroup}
                {/* Error notification */}
                {showFailedMessage && (
                    <NotificationCard
                        variant="error"
                        message={LABELS.FAILED_MESSAGE}
                    />
                )}
                {/* Render dynamic fields */}
                {fields?.map((field, index) => (
                    <InfoField
                        key={`${field.label}-${index}`}
                        label={field.label}
                        value={field.value}
                        valueClassName={field.valueClassName}
                    />
                ))}
            </div>

            {/* Warning notification */}
            {note && <NotificationCard variant="warning" message={note} />}
            {children}
        </div>
    );
}
