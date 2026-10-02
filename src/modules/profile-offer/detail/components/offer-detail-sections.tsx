import {
    DataCell,
    DetailSection,
} from "@/components/shared/order-detail-layout";
import { Button } from "@/components/ui/button";
import {
    formatCurrency,
    formatDateTime,
    formatTabletDateTime,
} from "@/lib/utils";

export function OfferOverview({
    quantity,
    bidPrice,
    isPartialAllowed,
    expirationDuration,
    expirationDate,
    updatedAt,
}: {
    quantity: number;
    bidPrice: number;
    isPartialAllowed: boolean;
    expirationDuration: string;
    expirationDate: string;
    updatedAt: string;
}) {
    return (
        <DetailSection title="Offer overview">
            <div className="grid grid-cols-3 !gap-2 mb:grid-cols-2">
                <DataCell label="Requested quantity" value={String(quantity)} />
                <DataCell
                    label="Current offer price"
                    value={
                        <>
                            {formatCurrency(bidPrice)}
                            <span className="font-normal text-typo-soft">
                                /cask
                            </span>
                        </>
                    }
                />
                <DataCell
                    label="Partial fill allowed?"
                    value={isPartialAllowed ? "Yes" : "No"}
                />
                <DataCell
                    label="Offer expiration"
                    value={expirationDuration}
                    tabletValue={expirationDuration}
                />
                <DataCell
                    label="Expired"
                    value={formatDateTime(expirationDate).dateTime}
                    tabletValue={formatTabletDateTime(expirationDate)}
                />
                <DataCell
                    label="Last update"
                    value={formatDateTime(updatedAt).dateTime}
                    tabletValue={formatTabletDateTime(updatedAt)}
                />
            </div>
        </DetailSection>
    );
}

export function MatchProgress({
    matchedQuantity,
    acquiredQuantity,
    remainingQuantity,
    showActions,
    onUpdate,
    onCancel,
}: {
    matchedQuantity: number;
    acquiredQuantity: number;
    remainingQuantity: number;
    showActions: boolean;
    onUpdate: () => void;
    onCancel: () => void;
}) {
    return (
        <DetailSection
            title="Match progress"
            className="pt-8 j-tb:pt-6 mb:pt-6"
        >
            <div className="grid grid-cols-3 !gap-2 mb:grid-cols-2">
                <DataCell label="Matched" value={String(matchedQuantity)} />
                <DataCell label="Acquired" value={String(acquiredQuantity)} />
                <DataCell
                    label="Remaining"
                    value={String(remainingQuantity)}
                    tabletLabel="Open"
                />
            </div>
            {showActions ? (
                <div className="mt-4 flex justify-end gap-1 mb:grid mb:grid-cols-2">
                    <Button
                        type="button"
                        variant="primary"
                        className="h-10 px-5 mb:w-full"
                        onClick={onUpdate}
                    >
                        Update Remaining
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-5 mb:w-full"
                        onClick={onCancel}
                    >
                        Cancel Remaining
                    </Button>
                </div>
            ) : null}
        </DetailSection>
    );
}
