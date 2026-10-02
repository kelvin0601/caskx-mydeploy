"use client";

import IconCheck from "@/components/shared/icons/icon-check";
import {
    MobileOrderCard,
    MobileOrderCardDetail,
    MobileOrderCardSkeleton,
} from "@/components/shared/mobile-order-card";
import { type TRowActionsDropdownItem } from "@/components/shared/row-actions-dropdown";
import { handleRenderFallbackText } from "@/lib/utils";
import { type TTableRow } from "@/types";
import { type ReactNode } from "react";

type TMobileOfferCardProps = {
    offer: TTableRow;
    actions: TRowActionsDropdownItem[] | null;
    renderCell: (key: string, row: TTableRow) => ReactNode;
};

export function MobileOfferCard({
    offer,
    actions,
    renderCell,
}: TMobileOfferCardProps) {
    const caskName = handleRenderFallbackText(
        offer.master?.name || offer.caskName || offer.cask?.name
    );
    const vintage = handleRenderFallbackText(
        offer.vintageYear ?? offer.cask?.vintageYear
    );
    const isPartialFillAllowed =
        offer.executionPolicy === "partial_fill" ||
        offer.executionPolicy === "PARTIAL_FILL" ||
        offer.executionPolicy === "partial_allowed";

    return (
        <MobileOrderCard
            value={offer.id}
            title={caskName}
            vintage={vintage}
            actions={actions}
            status={renderCell("status", offer)}
        >
            <MobileOrderCardDetail label="Partial fill allowed?">
                {isPartialFillAllowed ? (
                    <span className="flex size-4 items-center justify-center text-typo-primary">
                        <IconCheck />
                    </span>
                ) : (
                    <span className="text-typo-primary">-</span>
                )}
            </MobileOrderCardDetail>
            <MobileOrderCardDetail label="Requested">
                {renderCell("requested", offer)}
            </MobileOrderCardDetail>
            <MobileOrderCardDetail label="Matched">
                {renderCell("matched", offer)}
            </MobileOrderCardDetail>
            <MobileOrderCardDetail label="Acquired">
                {renderCell("acquired", offer)}
            </MobileOrderCardDetail>
            <MobileOrderCardDetail label="Remaining">
                {renderCell("remaining", offer)}
            </MobileOrderCardDetail>
            <MobileOrderCardDetail label="Offer price">
                {renderCell("offerPrice", offer)}
            </MobileOrderCardDetail>
            <MobileOrderCardDetail label="Expires">
                {renderCell("expires", offer)}
            </MobileOrderCardDetail>
        </MobileOrderCard>
    );
}

export function MobileOfferCardSkeleton() {
    return <MobileOrderCardSkeleton />;
}
