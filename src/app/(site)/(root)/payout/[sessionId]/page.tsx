import { OptionNextAuth } from "@/config/auth";
import { CASK_KEYS, KEY_TRANSACTIONS } from "@/lib/constants/key";
import { getQueryClient } from "@/lib/get-query-client";
import ProfileListingDetail from "@/modules/profile-listing/detail";
import { caskServerAction } from "@/services/server-action/cask";
import { transactionServerAction } from "@/services/server-action/transaction";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getServerSession } from "next-auth";

export default async function PayoutCatchAllPage({
    params,
}: {
    params: Promise<{ sessionId: string }>;
}) {
    const { sessionId: askId } = await params;
    const queryClient = getQueryClient();
    const session = await getServerSession(OptionNextAuth());

    const listingDetail = await queryClient
        .fetchQuery({
            queryKey: [KEY_TRANSACTIONS.ASKS, askId],
            queryFn: () =>
                transactionServerAction.getTransactionAskDetail(
                    askId,
                    session?.user?.accessToken ?? ""
                ),
        })
        .catch(() => undefined);

    const caskId = listingDetail?.ask?.caskId;
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
            <ProfileListingDetail askId={askId} />
        </HydrationBoundary>
    );
}
