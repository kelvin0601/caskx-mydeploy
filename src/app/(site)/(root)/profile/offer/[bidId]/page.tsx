import type { Metadata } from "next";
import { PAGE_METADATA } from "@/lib/constants/metadata";
import { CASK_KEYS, KEY_BID } from "@/lib/constants/key";
import { getQueryClient } from "@/lib/get-query-client";
import ProfileOfferDetail from "@/modules/profile-offer/detail";
import { caskBidServerAction } from "@/services/server-action/cask-bid";
import { caskServerAction } from "@/services/server-action/cask";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const dynamic = "force-dynamic";

export const metadata: Metadata = PAGE_METADATA.OFFER_DETAIL;

export default async function ProfileOfferDetailPage({
    params,
}: {
    params: Promise<{ bidId: string }>;
}) {
    const { bidId } = await params;
    const queryClient = getQueryClient();

    const bidDetail = await queryClient
        .fetchQuery({
            queryKey: [KEY_BID.BID_DETAIL, bidId],
            queryFn: () => caskBidServerAction.getBidDetail(bidId, true),
        })
        .catch(() => undefined);

    const caskId = bidDetail?.data?.bid?.cask?.id;
    if (caskId) {
        await queryClient
            .prefetchQuery({
                queryKey: [CASK_KEYS.CASK_DETAIL, caskId],
                queryFn: () => caskServerAction.getDetailCask(caskId),
            })
            .catch(() => undefined);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProfileOfferDetail bidId={bidId} />
        </HydrationBoundary>
    );
}
