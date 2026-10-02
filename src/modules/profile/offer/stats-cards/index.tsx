"use client";

import { TTableRow } from "@/types";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type TStatsCardsProps = {
    offers: TTableRow[];
    isLoading: boolean;
};

export default function StatsCards({ offers, isLoading }: TStatsCardsProps) {
    const stats = useMemo(() => {
        let matchedValue = 0;
        let unmatchedValue = 0;

        for (const offer of offers) {
            const quantity = Number(offer.quantity ?? 0);
            const remainingQuantity = Math.max(
                0,
                Number(offer.remainingQuantity ?? 0)
            );
            const matchedQuantity = Math.max(0, quantity - remainingQuantity);
            const unitPrice = Number(offer.bidPrice ?? offer.price ?? 0);

            matchedValue += unitPrice * matchedQuantity;
            unmatchedValue += unitPrice * remainingQuantity;
        }

        return {
            matchedValue: formatCurrency(matchedValue),
            unmatchedValue: formatCurrency(unmatchedValue),
        };
    }, [offers]);

    return (
        <div className="grid w-full grid-cols-2 !gap-2">
            <div className="flex flex-col justify-center gap-1 bg-bg-sf4 p-3">
                {isLoading ? (
                    <Skeleton className="h-6 w-20" />
                ) : (
                    <span className="text-base font-semibold text-typo-primary">
                        {offers.length === 0 ? "-" : stats.matchedValue}
                    </span>
                )}
                <span className="text-sm font-normal text-typo-note">
                    Matched this month
                </span>
            </div>
            <div className="flex flex-col justify-center gap-1 bg-bg-sf4 p-3">
                {isLoading ? (
                    <Skeleton className="h-6 w-20" />
                ) : (
                    <span className="text-base font-semibold text-typo-primary">
                        {offers.length === 0 ? "-" : stats.unmatchedValue}
                    </span>
                )}
                <span className="text-sm font-normal text-typo-note">
                    Unmatched value
                </span>
            </div>
        </div>
    );
}
