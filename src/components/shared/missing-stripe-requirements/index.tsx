"use client";

import { Button } from "@/components/ui/button";
import { STRIPE_REQUIREMENT_LABELS } from "@/lib/constants/stripe";
import { InfoRow } from "../info-row";

export type TMissingStripeRequirementsData = {
    pastDue: string[];
    currentlyDue: string[];
    pendingVerification: string[];
};

export default function MissingStripeRequirements({
    data,
    onCompleteInStripe,
    isLoading = false,
    errors = [],
}: {
    data: TMissingStripeRequirementsData;
    onCompleteInStripe: () => void;
    isLoading?: boolean;
    errors?: Array<{ requirement: string; reason: string }>;
}) {
    const hasAny =
        data.pastDue.length > 0 ||
        data.currentlyDue.length > 0 ||
        data.pendingVerification.length > 0;

    if (!hasAny) return null;

    const uniqueFields = Array.from(
        new Set([...data.pastDue, ...data.currentlyDue])
    );

    const renderField = (field: string) => {
        const label =
            STRIPE_REQUIREMENT_LABELS[field] ||
            field.split(".").pop()?.replace(/_/g, " ") ||
            field;
        const errorDetail = errors.find((e) => e.requirement === field);

        return (
            <div key={field} className="flex flex-col gap-1">
                <InfoRow label={label} value="-" orientation="vertical" />
                {errorDetail && (
                    <p className="text-[10px] leading-tight text-error opacity-80">
                        {errorDetail.reason}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4 bg-error/10 p-4">
            <div className="flex flex-row items-center justify-between">
                <h4 className="text-sm font-semibold text-typo-primary">
                    Missing required information
                </h4>
                <Button
                    variant="link"
                    className="h-auto p-0 font-medium text-typo-primary"
                    onClick={onCompleteInStripe}
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : "Complete setup"}
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 tb:grid-cols-1 tb:gap-4">
                {uniqueFields.map(renderField)}
            </div>
        </div>
    );
}
