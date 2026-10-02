"use client";

import { useTransactionSellingStatusCounts } from "@/hooks/useTransactionStatusCounts";
import { KEY_ASK } from "@/lib/constants";
import { listingOrderAdapter } from "@/modules/market-orders/adapters/listing-order-adapter";
import { MarketOrderManagementProvider } from "@/modules/market-orders/management/provider";
import caskAskService from "@/services/cask-ask";
import { caskAsk } from "@/types/cask-ask";
import BodyTable from "../body-table";
import BodyTableSkeleton from "../body-table/skeleton";
import EmptyData from "../empty-data";
import HeadingNav from "../heading-nav";
import { useManageSellingTable } from "./hooks/use-selling-table";

export default function SellingModule() {
    return (
        <MarketOrderManagementProvider adapter={listingOrderAdapter}>
            <SellingContent />
        </MarketOrderManagementProvider>
    );
}

function SellingContent() {
    const { renderCell, TABLE_CONFIG } = useManageSellingTable();
    const { getMyAsksQuery, dataHeaderOrdered, isEmptyHeadingCount } =
        useTransactionSellingStatusCounts();

    if (getMyAsksQuery?.isLoading || getMyAsksQuery.isLoading)
        return (
            <>
                <HeadingNav title="Selling Activity" />
                <BodyTableSkeleton TABLE_CONFIG={TABLE_CONFIG} />
            </>
        );

    if (isEmptyHeadingCount && !getMyAsksQuery?.isLoading)
        return (
            <>
                <EmptyData
                    className="my-[15vh]"
                    title="Awaiting Your Asks"
                    description="You haven’t placed any asks. Casks you're selling will be listed here."
                />
            </>
        );
    return (
        <>
            <HeadingNav
                title="Selling Activity"
                description="Easily track and manage your cask asks."
                subTitle="Asks"
            />
            <BodyTable
                contentError="asks"
                data={getMyAsksQuery?.data?.data || []}
                dataHeader={dataHeaderOrdered}
                totalRecords={getMyAsksQuery?.data?.total || 0}
                renderCell={renderCell}
                TABLE_CONFIG={TABLE_CONFIG}
                totalPages={getMyAsksQuery?.data?.totalPages || 0}
                currentCount={getMyAsksQuery?.data?.data?.length || 0}
                prefetchFn={async (filters) => {
                    try {
                        const result = await caskAskService.getMyAsks(
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
                        console.error("Error prefetching my asks:", error);
                        return {
                            data: [],
                            total: 0,
                            totalPages: 0,
                        };
                    }
                }}
                queryKey={KEY_ASK.ASK_MY_ASKS}
            />
        </>
    );
}
