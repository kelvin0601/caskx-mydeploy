import {
    DataCell,
    DetailSection,
} from "@/components/shared/order-detail-layout";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatTabletDateTime } from "@/lib/utils";
import type { payout } from "@/types/payout";
import PayoutTable from "./payout-table";

export function ListingOverview({
    quantity,
    askPrice,
    isPartialAllowed,
    expirationDuration,
    expirationDate,
    updatedAt,
}: {
    quantity: number;
    askPrice: number;
    isPartialAllowed: boolean;
    expirationDuration: string;
    expirationDate: string;
    updatedAt?: Date | string | null;
}) {
    return (
        <DetailSection
            title="Listing overview"
            className="tb:h-auto j-tb:mb-6 mb:mb-6"
        >
            <div className="grid grid-cols-3 !gap-2 mb:grid-cols-2">
                <DataCell label="Listed quantity" value={quantity} />
                <DataCell
                    label="Current sell price"
                    value={
                        <>
                            {formatCurrency(askPrice)}
                            <span className="font-normal text-typo-soft">
                                /cask
                            </span>
                        </>
                    }
                />
                <DataCell
                    label="Partial sales?"
                    value={isPartialAllowed ? "Yes" : "No"}
                />
                <DataCell
                    label="Listing expiration"
                    value={expirationDuration}
                />
                <DataCell
                    label="Expired"
                    value={formatTabletDateTime(expirationDate)}
                />
                <DataCell
                    label="Last update"
                    value={formatTabletDateTime(updatedAt ?? undefined)}
                />
            </div>
        </DetailSection>
    );
}

export function MatchProgress({
    matchedQuantity,
    soldQuantity,
    availableQuantity,
    showActions,
    onUpdate,
    onCancel,
}: {
    matchedQuantity: number;
    soldQuantity: number;
    availableQuantity: number;
    showActions: boolean;
    onUpdate: () => void;
    onCancel: () => void;
}) {
    return (
        <DetailSection
            title="Match progress"
            className="h-[13.6875rem] pt-8 tb:h-auto j-tb:mb-6 j-tb:pt-0 mb:mb-6 mb:pt-0"
        >
            <div className="grid grid-cols-3 !gap-2 mb:grid-cols-2">
                <DataCell label="Matched" value={matchedQuantity} />
                <DataCell label="Sold" value={soldQuantity} />
                <DataCell
                    label="Available"
                    value={availableQuantity > 0 ? availableQuantity : "-"}
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

export function PayoutSection({
    transactions,
}: {
    transactions: payout.TAskTransactionPayoutResponse["transactions"];
}) {
    return (
        <section className="pb-8 pt-8 tb:h-auto j-tb:pb-6 j-tb:pt-0 mb:pb-0 mb:pt-0">
            <div className="mb-4 flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-typo-primary tb:text-base tb:leading-[1.2]">
                    Payout
                </h2>
                <p className="text-sm text-typo-soft">
                    Payouts are created when your listing matches with one or
                    more offers.
                </p>
            </div>
            <PayoutTable transactions={transactions} />
            <p className="mt-4 text-sm text-typo-sub mb:hidden">
                Cask Exchange uses Docusign for document processing and
                e-signatures.
            </p>
        </section>
    );
}
