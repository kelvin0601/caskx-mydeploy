"use client";

import IconCheck from "@/components/shared/icons/icon-check";
import {
    MobileOrderCard,
    MobileOrderCardDetail,
    MobileOrderCardExpandedSkeleton,
    MobileOrderCardSkeleton,
} from "@/components/shared/mobile-order-card";
import { type TRowActionsDropdownItem } from "@/components/shared/row-actions-dropdown";
import {
    formatCurrency,
    formatDateTime,
    handleRenderFallbackText,
} from "@/lib/utils";
import { type TTableRow } from "@/types";
import { type ReactNode } from "react";

const PARTIAL_EXECUTION_POLICIES = new Set([
    "partial_fill",
    "PARTIAL_FILL",
    "partial_allowed",
]);

type TMobileListingCardProps = {
    listing: TTableRow;
    actions: TRowActionsDropdownItem[];
    statusBadge: ReactNode;
};

export function MobileListingCard({
    listing,
    actions,
    statusBadge,
}: TMobileListingCardProps) {
    const caskName = handleRenderFallbackText(
        listing.master?.name ?? listing.caskName ?? listing.cask?.name
    );
    const vintage = handleRenderFallbackText(
        listing.vintageYear ?? listing.cask?.vintageYear
    );
    const quantity = Number(listing.quantity ?? 0);
    const remaining = Number(listing.remainingQuantity ?? 0);
    const matched = quantity - remaining;
    const isPartialFillAllowed = PARTIAL_EXECUTION_POLICIES.has(
        listing.executionPolicy ?? ""
    );
    const expiration = formatDateTime(listing.expirationDate ?? "");

    return (
        <MobileOrderCard
            value={listing.id}
            title={caskName}
            vintage={vintage}
            actions={actions}
            status={statusBadge}
        >
            <MobileOrderCardDetail label="Partial fill allowed?">
                {isPartialFillAllowed ? (
                    <span className="flex size-4 items-center justify-center text-typo-primary">
                        <IconCheck />
                    </span>
                ) : (
                    "-"
                )}
            </MobileOrderCardDetail>
            <MobileOrderCardDetail label="Listed">
                {quantity}
            </MobileOrderCardDetail>
            <MobileOrderCardDetail label="Matched">
                {handleRenderFallbackText(matched > 0 ? matched : undefined)}
            </MobileOrderCardDetail>
            <MobileOrderCardDetail label="Sold">
                {handleRenderFallbackText(listing.filledQuantity)}
            </MobileOrderCardDetail>
            <MobileOrderCardDetail label="Available">
                {remaining}
            </MobileOrderCardDetail>
            <MobileOrderCardDetail label="Sell price">
                <span className="font-semibold">
                    {formatCurrency(listing.askPrice ?? listing.price ?? 0)}
                </span>
            </MobileOrderCardDetail>
            <MobileOrderCardDetail label="Expires">
                {listing.expirationDate ? (
                    <span className="whitespace-nowrap tabular-nums">
                        {expiration.dataOnlyNumber}{" "}
                        <span className="text-typo-soft">
                            {expiration.timeOnly24}
                        </span>
                    </span>
                ) : (
                    "-"
                )}
            </MobileOrderCardDetail>
        </MobileOrderCard>
    );
}

export function MobileListingCardSkeleton({
    expanded = false,
}: {
    expanded?: boolean;
}) {
    return (
        <MobileOrderCardSkeleton>
            {expanded ? <MobileOrderCardExpandedSkeleton /> : null}
        </MobileOrderCardSkeleton>
    );
}
