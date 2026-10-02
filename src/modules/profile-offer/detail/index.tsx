"use client";

import OrderDetailLayout, {
    OrderDetailSkeleton,
} from "@/components/shared/order-detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ETransactionType } from "@/enum/transaction";
import { CASK_KEYS, KEY_BID, ROUTE_PUBLIC } from "@/lib/constants";
import {
    formatCurrency,
    getErrorMessage,
    getExpirationDuration,
} from "@/lib/utils";
import { MARKET_ORDER_KIND } from "@/modules/market-orders/constants";
import { useMarketOrderManagement } from "@/modules/market-orders/management/context";
import caskServices from "@/services/cask";
import { caskBidService } from "@/services/cask-bid";
import type { TTableRow, cask } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    MatchProgress,
    OfferOverview,
} from "./components/offer-detail-sections";
import PaymentSection from "./components/payment-section";
import { badgeVariant, getOfferStatus, mergeTransactions } from "./utils";

type OfferDetailProps = { bidId: string };

function ProfileOfferDetailContent({ bidId }: OfferDetailProps) {
    const router = useRouter();
    const { openUpdate, openCancel } = useMarketOrderManagement();
    const bidQuery = useQuery({
        queryKey: [KEY_BID.BID_DETAIL, bidId],
        queryFn: () => caskBidService.getBidDetail(bidId),
        enabled: Boolean(bidId),
    });
    const bidData = bidQuery.data?.data;
    const bidCaskId = bidData?.bid.cask.id;
    const caskQuery = useQuery({
        queryKey: [CASK_KEYS.CASK_DETAIL, bidCaskId],
        queryFn: () => caskServices.getDetailCask(bidCaskId as string),
        enabled: Boolean(bidCaskId),
    });

    if (bidQuery.isLoading) return <OrderDetailSkeleton />;

    if (bidQuery.isError || !bidData) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-main">
                <h1 className="font-reckless text-3xl text-typo-primary">
                    We couldn&apos;t load this offer
                </h1>
                <p className="max-w-md text-center text-sm text-typo-soft">
                    {getErrorMessage(
                        bidQuery.error,
                        "The offer may no longer be available."
                    )}
                </p>
                <Button variant="outline" onClick={() => router.back()}>
                    Back to offers
                </Button>
            </div>
        );
    }

    const { bid, transactions: rawTransactions } = bidData;
    const caskId = bid.cask.id;
    const transactions = mergeTransactions(rawTransactions);
    const caskDetail = caskQuery.data as cask.TCask | undefined;
    const caskImage = caskDetail?.imageUrl || bid.cask.image;
    const caskName = caskDetail?.master?.name || bid.cask.name;
    const distilleryName =
        caskDetail?.distillery?.name || bid.cask.distilleryName;
    const expirationDuration = getExpirationDuration(
        bid.createdAt,
        bid.expirationDate
    );
    const matchedQuantity = Math.max(
        bid.initialQuantity - bid.remainingQuantity,
        0
    );
    const acquiredQuantity = transactions.reduce(
        (total, item) => total + item.quantity,
        0
    );
    const offerStatus = getOfferStatus(
        bid.status,
        transactions[0]?.status,
        transactions[0]?.payoutStatus
    );
    const offerRow: TTableRow = {
        id: bid.id,
        bidId: bid.id,
        caskId,
        caskName: bid.cask.name,
        cask: caskDetail,
        master: caskDetail?.master,
        caskImage,
        imageSrc: caskImage,
        distilleryName,
        feeRate: 0,
        quantity: bid.initialQuantity,
        remainingQuantity: bid.remainingQuantity,
        createdAt: bid.createdAt,
        updatedAt: bid.updatedAt,
        expirationDate: bid.expirationDate,
        bidPrice: bid.bidPrice,
        executionPolicy: bid.executionPolicy,
        status: bid.status as TTableRow["status"],
        isHighest: false,
        isLowest: false,
        askType: ETransactionType.FULL,
    };

    const handleUpdateBid = () => {
        if (!bid.bidPrice || !caskId) return;
        openUpdate(offerRow, MARKET_ORDER_KIND.OFFER);
    };
    const handleCancelBid = () => {
        openCancel(offerRow, MARKET_ORDER_KIND.OFFER);
    };
    const handleViewPayment = (checkoutSessionId: string) => {
        router.push(`${ROUTE_PUBLIC.CHECKOUT}/${checkoutSessionId}`);
    };

    const isOfferActive =
        offerStatus.toLowerCase().includes("active") ||
        offerStatus.toLowerCase().includes("partially");
    const showActions =
        bid.executionPolicy === "partial_allowed" &&
        isOfferActive &&
        bid.remainingQuantity > 0;

    return (
        <OrderDetailLayout
            breadcrumbType="offer"
            caskName={caskName}
            distilleryName={distilleryName}
            statusBadge={
                <Badge
                    variant={badgeVariant(offerStatus)}
                    size="xs"
                    className="shrink-0 bg-bg-sf3 font-semibold j-tb:h-5 mb:h-5"
                >
                    {offerStatus}
                </Badge>
            }
            caskImage={caskImage}
            caskDetail={caskDetail}
        >
            <OfferOverview
                quantity={bid.initialQuantity}
                bidPrice={bid.bidPrice}
                isPartialAllowed={bid.executionPolicy === "partial_allowed"}
                expirationDuration={expirationDuration}
                expirationDate={bid.expirationDate}
                updatedAt={bid.updatedAt}
            />

            <MatchProgress
                matchedQuantity={matchedQuantity}
                acquiredQuantity={acquiredQuantity}
                remainingQuantity={bid.remainingQuantity}
                showActions={showActions}
                onUpdate={handleUpdateBid}
                onCancel={handleCancelBid}
            />

            <PaymentSection
                transactions={transactions}
                onViewPayment={handleViewPayment}
            />
        </OrderDetailLayout>
    );
}

export default function ProfileOfferDetail(props: OfferDetailProps) {
    return <ProfileOfferDetailContent {...props} />;
}
