import { DISTILLERY_KEYS } from "@/lib/constants/key";
import { PAGE_METADATA } from "@/lib/constants/metadata";
import { PARAMS } from "@/lib/constants/route";
import { getQueryClient } from "@/lib/get-query-client";
import DistilleriesModule from "@/modules/distilleries";
import { distilleryServerAction } from "@/services/server-action/distillery";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export const metadata = PAGE_METADATA.DISTILLERIES;

export default async function DistilleriesPage({
    searchParams,
}: {
    searchParams: Promise<{ sortBy: string; search: string }>;
}) {
    const { sortBy, search } = await searchParams;

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const isMobile = device.type === "mobile";
    const isTablet = device.type === "tablet";
    const isDesktop = !isMobile && !isTablet;

    const queryClient = getQueryClient();

    const size = isDesktop ? 24 : 12;
    const page = 1;
    const changeParams = [
        sortBy && `${PARAMS.sortBy}=${sortBy}`,
        search && `${PARAMS.search}=${search}`,
    ]
        .filter(Boolean)
        .join("&");

    const queryParams = `${changeParams}${changeParams ? "&" : ""}${PARAMS.size}=${size}&${PARAMS.page}=${page}`;

    await queryClient.prefetchQuery({
        queryKey: [
            DISTILLERY_KEYS.GET_DISTILLERIES,
            { changeParams, search, size, page },
        ],
        queryFn: () =>
            distilleryServerAction.getDistilleriesListing(queryParams),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DistilleriesModule sortBy={sortBy} search={search} />
        </HydrationBoundary>
    );
}
