"use client";

import React from "react";
import CheckoutStatusPanel from "@/components/shared/checkout-status-panel";
import { formatDateTime } from "@/lib/utils";
import { checkout } from "@/types/checkout";
import IconDotVrt from "@/components/shared/icons/icon-dot-vrt";
import TransactionTable from "../transaction-table";
import { CHECKOUT_STEP } from "@/enum/checkout";

type TSellerConfirmationProps = {
    statusCheckout?: checkout.TTransactionStatus | null;
};

export default function SellerConfirmation({
    statusCheckout,
}: TSellerConfirmationProps) {
    const expiryDate = statusCheckout?.expiryDate;
    const formattedExpiry = expiryDate
        ? `${formatDateTime(expiryDate).dateOnly}, ${formatDateTime(expiryDate).timeOnly}`
        : null;
    const formattedMobileExpiry = expiryDate
        ? `${new Date(expiryDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
          })}, ${formatDateTime(expiryDate).timeOnly24}`
        : null;

    return (
        <div className="flex flex-col">
            <CheckoutStatusPanel
                icon={<IconDotVrt />}
                title="Pending seller confirmation"
                description={
                    <>
                        Your order will only proceed if all sellers confirm.
                        Your order will be canceled if all sellers do not
                        confirm by{" "}
                        <span className="font-semibold text-typo-primary">
                            <span className="mb:hidden">{formattedExpiry}</span>
                            <span className="hidden mb:inline">
                                {formattedMobileExpiry}
                            </span>
                        </span>
                    </>
                }
            />
            <TransactionTable
                statusCheckout={statusCheckout}
                stepCurrent={CHECKOUT_STEP.SELLER_CONFIRMATION}
            />
        </div>
    );
}
