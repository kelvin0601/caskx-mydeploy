"use client";

import { useTransactionBuyingStatusCounts } from "@/hooks/useTransactionStatusCounts";
import { KEY_BID } from "@/lib/constants";
import { isEmpty } from "@/lib/utils";
import { offerOrderAdapter } from "@/modules/market-orders/adapters/offer-order-adapter";
import { MarketOrderManagementProvider } from "@/modules/market-orders/management/provider";
import { caskBidService } from "@/services/cask-bid";
import { TTableRow } from "@/types";
import { caskAsk } from "@/types/cask-ask";
import BodyTable from "../body-table";
import BodyTableSkeleton from "../body-table/skeleton";
import EmptyData from "../empty-data";
import HeadingNav, { SubHeadingNav } from "../heading-nav";
import { useManageBuyingTable } from "./hooks/use-buying-table";

const BuyingContent = () => {
    const { renderCell, TABLE_CONFIG } = useManageBuyingTable();
    const { getMyBidsQuery, dataHeaderOrdered, isEmptyHeadingCount } =
        useTransactionBuyingStatusCounts();

    if (isEmptyHeadingCount && !getMyBidsQuery?.isLoading)
        return (
            <>
                <EmptyData
                    className="my-[15vh]"
                    title="Awaiting Your Bids"
                    description="You haven't placed any bids. Casks you've bid on will be listed here."
                />
            </>
        );

    return getMyBidsQuery?.isLoading ? (
        <>
            <HeadingNav title="Buying Activity">
                <SubHeadingNav />
            </HeadingNav>
            <BodyTableSkeleton TABLE_CONFIG={TABLE_CONFIG} />
        </>
    ) : (
        <>
            <HeadingNav
                subTitle="Buying"
                title="Buying Activity"
                description="Easily track and manage your cask bids."
            >
                <SubHeadingNav />
            </HeadingNav>
            <BodyTable
                contentError="bids"
                data={getMyBidsQuery?.data?.data || []}
                dataHeader={dataHeaderOrdered}
                renderCell={
                    renderCell as unknown as (
                        key: string,
                        row: TTableRow
                    ) => React.ReactNode
                }
                TABLE_CONFIG={TABLE_CONFIG}
                totalPages={getMyBidsQuery?.data?.totalPages || 0}
                totalRecords={getMyBidsQuery?.data?.total || 0}
                currentCount={getMyBidsQuery?.data?.data?.length || 0}
                prefetchFn={async (filters) => {
                    try {
                        const result = await caskBidService.getMyBids(
                            filters as Partial<caskAsk.TOrderListFilters>
                        );
                        return (
                            result || {
                                data: [],
                                total: 0,
                                totalPages: 0,
                            }
                        );
                    } catch (error) {
                        console.error("Error prefetching my bids:", error);
                        return {
                            data: [],
                            total: 0,
                            totalPages: 0,
                        };
                    }
                }}
                queryKey={KEY_BID.BID_MY_BIDS}
            />
        </>
    );
};

const BuyingModule = () => (
    <MarketOrderManagementProvider adapter={offerOrderAdapter}>
        <BuyingContent />
    </MarketOrderManagementProvider>
);

export default BuyingModule;
