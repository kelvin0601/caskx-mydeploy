"use client";

import { CaskCardSkeleton } from "@/components/shared/cask-card";
import { HeadingContentSkeleton } from "@/components/shared/heading";
import { ListCardSkeleton } from "@/components/shared/list-casks";
import { STRIPE_KEYS } from "@/lib/constants/key";
import stripeService from "@/services/stripe";
import { useBoundStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import useResponsive from "@/hooks/useResponsive";
import Banner, { BannerSkeleton } from "./banner";
import BrowseByCategory from "./browse-category";
import ExploreCasks from "./explore-casks";
import PopularDistilleries from "./popular-distilleries";
import TableCask, { TableCaskSkeleton } from "./table-cask";

const HomeSidebar = dynamic(() => import("./home-sidebar"), {
    loading: () => <HomeSidebarPlaceholder />,
});

const HomeSidebarTablet = dynamic(() => import("./home-sidebar/tablet"));

function HomeSidebarPlaceholder() {
    return (
        <div className="relative col-start-13 -col-end-1 tb:hidden">
            <div className="sticky top-[var(--height-header)] h-[calc(100vh-var(--height-header))] border-l border-bd-main bg-bg-main" />
        </div>
    );
}

export default function HomeModule({
    isMobile: isMobileSSR,
    isTablet: isTabletSSR,
}: {
    isMobile: boolean;
    isTablet: boolean;
}) {
    const { user } = useBoundStore();
    const responsive = useResponsive();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const isMobile = isMounted ? responsive.isMobile : isMobileSSR;
    const isTablet = isMounted ? responsive.isTablet : isTabletSSR;

    useQuery({
        queryKey: [STRIPE_KEYS.ACCOUNT_REFRESH, user?.stripeAccount?.id],
        enabled: !!user?.stripeAccount?.id,
        queryFn: () =>
            stripeService.refreshStripeAccount(
                user?.stripeAccount?.id as string
            ),
    });

    return (
        <div>
            <Banner isMobile={isMobile} isTablet={isTablet} />
            <div className="container grid grid-cols-16 bg-bg-main tb:grid-cols-12 mb:grid-cols-4">
                <div className="col-start-1 col-end-13 tb:col-start-1 tb:-col-end-1">
                    <PopularDistilleries />
                    <ExploreCasks isMobile={isMobile} isTablet={isTablet} />
                    <TableCask />
                    <BrowseByCategory />
                </div>
                {!isMobile && !isTablet ? <HomeSidebar /> : null}

                {/* Tablet-only sticky bottom bar */}
                {isMobile || isTablet ? (
                    <div className="hidden tb:block">
                        <HomeSidebarTablet />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export function HomeSkeleton() {
    return (
        <div className="container grid grid-cols-16 bg-bg-main tb:mt-8 tb:grid-cols-6 mb:mt-6 mb:grid-cols-4">
            <div className="col-start-1 -col-end-1 -mx-4 contain-paint">
                <BannerSkeleton />
            </div>

            <div className="col-start-1 col-end-13">
                <div className="-ml-[var(--size-open-container)] -mr-[var(--gap-x)] bg-bg-sf1 pr-[var(--gap-x)]">
                    <div className="ml-[var(--size-open-container)]">
                        <ListCardSkeleton type="distillery" />
                    </div>
                </div>
                <div className="flex flex-col gap-8">
                    <HeadingContentSkeleton />
                    <div className="grid grid-cols-3 gap-[var(--gap-x)] tb:grid-cols-2 mb:grid-cols-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <CaskCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
                <TableCaskSkeleton />
                <ListCardSkeleton type="category" />
            </div>

            <HomeSidebarPlaceholder />
        </div>
    );
}
