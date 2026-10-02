import {
    CASK_KEYS,
    CASK_MASTER_KEYS,
    KEY_BID,
    KEY_MARKET_DATA,
} from "@/lib/constants/key";
import { PAGE_METADATA } from "@/lib/constants/metadata";
import { getQueryClient } from "@/lib/get-query-client";
import CaskMasterDetailModule from "@/modules/cask-master-detail";
import { caskServerAction } from "@/services/server-action/cask";
import { caskBidServerAction } from "@/services/server-action/cask-bid";
import { caskMasterServerAction } from "@/services/server-action/cask-master";
import { marketDataViewServerAction } from "@/services/server-action/market-data-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { cache } from "react";

export const dynamic = "force-dynamic";

const getCaskMasterDetail = cache((id: string) =>
    caskMasterServerAction.getDetailCaskMaster(id)
);

export default async function CaskListingDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { id } = await params;
    const resolvedSearchParams = await searchParams;
    const queryClient = getQueryClient();

    // 1. Prefetch cask master details on the server
    const caskMasterDetail = await queryClient.fetchQuery({
        queryKey: [CASK_MASTER_KEYS.CASK_MASTER_DETAIL, id],
        queryFn: () => getCaskMasterDetail(id),
    });

    const activeId =
        (resolvedSearchParams.active as string) ||
        caskMasterDetail?.children?.[0]?.id;
    if (activeId) {
        await Promise.all([
            queryClient.prefetchQuery({
                queryKey: [CASK_MASTER_KEYS.SIMILAR_CASKS, id],
                queryFn: () =>
                    caskMasterServerAction.getSimilarCaskMasters(id, 4),
            }),
            queryClient.prefetchQuery({
                queryKey: [CASK_KEYS.CASK_DETAIL, activeId],
                queryFn: () => caskServerAction.getDetailCask(activeId),
            }),
            queryClient.prefetchQuery({
                queryKey: [KEY_BID.BID_MARKET_DATA, activeId],
                queryFn: () =>
                    caskBidServerAction.getCaskBidMarketData(activeId),
            }),
            queryClient.prefetchQuery({
                queryKey: [KEY_MARKET_DATA.MARKET_DATA, activeId],
                queryFn: () =>
                    marketDataViewServerAction.getCaskMarketDataView(activeId),
            }),
        ]);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CaskMasterDetailModule id={id} activeId={activeId} />
        </HydrationBoundary>
    );
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    try {
        const queryClient = getQueryClient();
        const caskMasterDetail = await queryClient.fetchQuery({
            queryKey: [CASK_MASTER_KEYS.CASK_MASTER_DETAIL, id],
            queryFn: () => getCaskMasterDetail(id),
        });

        if (!caskMasterDetail) return PAGE_METADATA.CASK_DETAIL;

        return {
            title: `${caskMasterDetail.name} | Cask Exchange`,
            description: PAGE_METADATA.CASK_DETAIL.description,
        };
    } catch {
        return PAGE_METADATA.CASK_DETAIL;
    }
}
