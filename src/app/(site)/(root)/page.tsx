import {
    BANNER_CASK_FILTER,
    CASK_KEYS,
    DISTILLERY_KEYS,
    EXPLORE_CASK_FILTERS,
} from "@/lib/constants";
import { getQueryClient } from "@/lib/get-query-client";
import HomeModule from "@/modules/home";
import { caskMasterServerAction } from "@/services/server-action/cask-master";
import { distilleryServerAction } from "@/services/server-action/distillery";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export const metadata: Metadata = {
    title: "Home Page",
};

const HomePage = async () => {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const isMobile = device.type === "mobile";
    const isTablet = device.type === "tablet";
    const isDesktop = !isMobile && !isTablet;
    const queryClient = getQueryClient();

    const size = isDesktop ? 12 : 6;
    const activeFilter = `${EXPLORE_CASK_FILTERS[0].value}&size=${size}`;
    const moversFilter =
        "page=1&size=10&sortBy=volumeDelta30D&includeAllStatuses=true";
    const bannerFilter = BANNER_CASK_FILTER;

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: [`${DISTILLERY_KEYS.TOP_DISTILLERIES}`],
            queryFn: () => distilleryServerAction.getDistilleryTopRank(),
        }),
        queryClient.prefetchQuery({
            queryKey: [CASK_KEYS.LIST_CASK, activeFilter],
            queryFn: () =>
                caskMasterServerAction.getCaskMastersListing(activeFilter),
        }),
        queryClient.prefetchQuery({
            queryKey: [CASK_KEYS.LIST_CASK, moversFilter],
            queryFn: () =>
                caskMasterServerAction.getCaskMastersListing(moversFilter),
        }),
        queryClient.prefetchQuery({
            queryKey: [CASK_KEYS.LIST_CASK, bannerFilter],
            queryFn: () =>
                caskMasterServerAction.getCaskMastersListing(bannerFilter),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeModule isMobile={isMobile} isTablet={isTablet} />
        </HydrationBoundary>
    );
};

export default HomePage;
