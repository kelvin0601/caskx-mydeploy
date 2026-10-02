"use client";

import OrderDetailLayout, {
    OrderDetailSkeleton,
} from "@/components/shared/order-detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { ETransactionType } from "@/enum/transaction";
import { CASK_KEYS, KEY_TRANSACTIONS } from "@/lib/constants";
import { getErrorMessage, getExpirationDuration } from "@/lib/utils";
import { MARKET_ORDER_KIND } from "@/modules/market-orders/constants";
import { useMarketOrderManagement } from "@/modules/market-orders/management/context";
import caskServices from "@/services/cask";
import caskTransactionsService from "@/services/cask-transactions";
import type { cask, TTableRow } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    ListingOverview,
    MatchProgress,
    PayoutSection,
} from "./components/listing-detail-sections";
import PayoutMethod from "./components/payout-method";
import {
    ListingSidebarPayoutSummary,
    TabletPayoutSummary,
} from "./components/payout-summary";
import TransactionDocuments from "./components/transaction-documents";
import { getListingStatus, listingStatusVariant } from "./utils";

type TProfileListingDetailProps = { askId: string };

export default function ProfileListingDetail({
    askId,
}: TProfileListingDetailProps) {
    const router = useRouter();
    const { openUpdate, openCancel } = useMarketOrderManagement();
    const listingQuery = useQuery({
        queryKey: [KEY_TRANSACTIONS.ASKS, askId],
        queryFn: () => caskTransactionsService.getTransactionPayout({ askId }),
        enabled: Boolean(askId),
    });
    const caskId = listingQuery.data?.ask?.caskId;
    const caskQuery = useQuery({
        queryKey: [CASK_KEYS.CASK_DETAIL, caskId],
        queryFn: () => caskServices.getDetailCask(caskId as string),
        enabled: Boolean(caskId),
    });

    if (listingQuery.isLoading) return <OrderDetailSkeleton />;

    if (listingQuery.isError || !listingQuery.data?.ask) {
        return (
            <div className="flex min-h-[32rem] flex-1 flex-col items-center justify-center gap-4 bg-bg-main px-4">
                <h1 className="font-reckless text-3xl text-typo-primary">
                    We couldn&apos;t load this listing
                </h1>
                <p className="max-w-md text-center text-sm text-typo-soft">
                    {getErrorMessage(
                        listingQuery.error,
                        "The listing may no longer be available."
                    )}
                </p>
                <Button variant="outline" onClick={() => router.back()}>
                    Back to listings
                </Button>
            </div>
        );
    }

    const data = listingQuery.data;
    const ask = data.ask;
    const caskDetail = (caskQuery.data ?? ask.cask) as cask.TCask;
    const caskName = caskDetail.master?.name || caskDetail.name || "Cask";
    const distilleryName =
        caskDetail.master?.distillery?.name ||
        caskDetail.distillery?.name ||
        "";
    const caskImage = caskDetail.imageUrl;
    const matchedQuantity = Math.max(
        0,
        Number(ask.quantity ?? 0) - Number(ask.remainingQuantity ?? 0)
    );
    const soldQuantity = Number(ask.filledQuantity ?? 0);
    const availableQuantity = Number(ask.remainingQuantity ?? 0);
    const expirationDate = String(ask.expirationDate ?? "");
    const expirationDuration = getExpirationDuration(
        String(ask.createdAt ?? ""),
        expirationDate
    );
    const bankAccount =
        data.sellerPaymentInformation?.bankAccounts.find(
            (account) => account.defaultForCurrency
        ) ?? data.sellerPaymentInformation?.bankAccounts[0];
    const statusLabel = getListingStatus(
        String(ask.status ?? ""),
        data.transactions?.[0]
    );
    const isListingCompleted = statusLabel.toLowerCase() === "complete";
    const isPartialAllowed =
        ask.executionPolicy === EBidExecutionPolicy.PARTIAL_ALLOWED;
    const vintageYear =
        ask.vintageYear ?? ask.cask?.vintageYear ?? caskDetail.vintageYear;
    const listingRow: TTableRow = {
        id: ask.id,
        bidId: "",
        caskId: ask.caskId,
        caskName,
        vintageYear,
        cask: { ...caskDetail, vintageYear },
        master: { ...caskDetail.master, vintageYear },
        caskImage,
        imageSrc: caskImage,
        distilleryName,
        feeRate: data.processingFeeRate,
        quantity: ask.quantity,
        remainingQuantity: ask.remainingQuantity,
        filledQuantity: ask.filledQuantity,
        askPrice: ask.askPrice,
        createdAt: ask.createdAt,
        updatedAt: ask.updatedAt,
        expirationDate,
        executionPolicy: ask.executionPolicy,
        status: ask.status,
        isHighest: false,
        isLowest: false,
        askType: ETransactionType.FULL,
    };

    return (
        <OrderDetailLayout
            breadcrumbType="listing"
            caskName={caskName}
            distilleryName={distilleryName}
            statusBadge={
                <Badge
                    variant={listingStatusVariant(statusLabel)}
                    size="xs"
                    className="shrink-0 border-transparent normal-case"
                >
                    {statusLabel}
                </Badge>
            }
            caskImage={caskImage}
            caskDetail={caskDetail}
            sidebarExtra={
                <ListingSidebarPayoutSummary
                    estimatedValue={data.estimatedSellerPayout ?? 0}
                    matchedValue={data.currentSellerPayout ?? 0}
                    totalPaid={data.totalPaidSeller ?? 0}
                    totalUnpaid={data.unpaidSellerPayout ?? 0}
                />
            }
            tabletBottom={
                <TabletPayoutSummary
                    estimatedValue={data.estimatedSellerPayout ?? 0}
                    matchedValue={data.currentSellerPayout ?? 0}
                    totalPaid={data.totalPaidSeller ?? 0}
                    totalUnpaid={data.unpaidSellerPayout ?? 0}
                />
            }
        >
            <ListingOverview
                quantity={Number(ask.quantity ?? 0)}
                askPrice={Number(ask.askPrice ?? 0)}
                isPartialAllowed={isPartialAllowed}
                expirationDuration={expirationDuration}
                expirationDate={expirationDate}
                updatedAt={ask.updatedAt}
            />

            <MatchProgress
                matchedQuantity={matchedQuantity}
                soldQuantity={soldQuantity}
                availableQuantity={availableQuantity}
                showActions={
                    isPartialAllowed &&
                    !isListingCompleted &&
                    availableQuantity > 0
                }
                onUpdate={() =>
                    openUpdate(listingRow, MARKET_ORDER_KIND.LISTING)
                }
                onCancel={() =>
                    openCancel(listingRow, MARKET_ORDER_KIND.LISTING)
                }
            />

            <PayoutSection transactions={data.transactions ?? []} />

            <PayoutMethod
                bankName={bankAccount?.bankName}
                last4={bankAccount?.last4}
                className="mb:mt-6"
            />

            <TransactionDocuments
                checkoutSessionId={
                    data.transactions?.[0]?.checkoutSessionId ?? ""
                }
                generatedAt={data.transactions?.[0]?.createdAt || ask.updatedAt}
            />
        </OrderDetailLayout>
    );
}
