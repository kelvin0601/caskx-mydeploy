import { PAGE_METADATA } from "@/lib/constants/metadata";
import DistilleryDetailModule from "@/modules/distillery-detail";
import React from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { DISTILLERY_KEYS } from "@/lib/constants";
import { distilleryServerAction } from "@/services/server-action/distillery";

export const metadata = PAGE_METADATA.DISTILLERY_DETAIL;

export const dynamic = "force-static";

export async function generateStaticParams() {
    return [];
}

export default async function DistilleryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const queryClient = getQueryClient();

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: [DISTILLERY_KEYS.DETAIL, id],
            queryFn: () => distilleryServerAction.getDetailDistillery(id),
        }),
        queryClient.prefetchQuery({
            queryKey: [DISTILLERY_KEYS.RELATED, id],
            queryFn: () =>
                distilleryServerAction.getRelatedDistilleries({ id }),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DistilleryDetailModule id={id} />
        </HydrationBoundary>
    );
}
