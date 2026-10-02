import React from "react";
import { Card } from "@/components/ui/card";
import IconVisa from "@/components/shared/icons/icon-visa";
import IconEdit from "@/components/shared/icons/icon-edit";
import { cn } from "@/lib/utils";

type TPayoutDetailsCardProps = {
    bankName?: string;
    cardNumber?: string;
    onEdit?: () => void;
    className?: string;
};

export default function PayoutDetailsCard({
    bankName,
    cardNumber,
    onEdit,
    className,
}: TPayoutDetailsCardProps) {
    return (
        <Card
            className={cn(
                "flex items-center justify-between bg-bg-main p-4",
                className
            )}
        >
            {/* Left Section - Visa Logo */}
            <div className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-md p-2">
                    <div className="bg-[#E7EBFA] px-3 py-3">
                        <div className="h-3 w-10">
                            <IconVisa />
                        </div>
                    </div>
                </div>

                {/* Bank Details */}
                <div className="flex flex-col">
                    <h3 className="text-base font-semibold text-typo-primary">
                        Payout Details
                    </h3>
                    <p className="text-sm text-typo-soft">
                        {bankName} {cardNumber}
                    </p>
                </div>
            </div>

            {/* Right Section - Edit Icon */}
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                    aria-label="Edit payout details"
                >
                    <div className="h-4 w-4 text-typo-soft">
                        <IconEdit />
                    </div>
                </button>
            )}
        </Card>
    );
}
