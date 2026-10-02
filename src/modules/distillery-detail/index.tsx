"use client";

import DynamicTitle from "@/components/shared/dynamic-title";
import { TabsContent } from "@/components/ui/tabs";
import { DISTILLERY_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import distilleriesServices from "@/services/distilleries";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Breadcrumb from "@/components/shared/breadcrumb";
import DistillerySidebar from "./sidebar";
import DistilleryTabs from "./content/vintage-tabs";
import DistilleryStatsRow from "./content/stats-row";
import DistilleryCaskGrid from "./content/cask-grid";
import MarketActivityTab from "./content/market-activity-tab";
import RelatedDistilleries from "./related";
import { distillery } from "@/types";

export default function DistilleryDetailModule({ id }: { id: string }) {
    const [activeTab, setActiveTab] = useState<"portfolio" | "market-activity">(
        "portfolio"
    );
    const [page, setPage] = useState(1);

    const distilleryDetailQuery = useQuery({
        queryKey: [DISTILLERY_KEYS.DETAIL, id],
        queryFn: () => distilleriesServices.getDetailDistillery(id),
    });

    const relatedDistilleriesQuery = useQuery({
        queryKey: [DISTILLERY_KEYS.RELATED, id],
        queryFn: () => distilleriesServices.getRelatedDistilleries({ id }),
    });

    const distilleryData = distilleryDetailQuery.data;
    // Extract cask masters from distillery data
    const caskMasters = useMemo(() => {
        if (!distilleryData?.caskMasters) return [];
        return distilleryData.caskMasters;
    }, [distilleryData?.caskMasters]);

    // Calculate statistics from cask masters
    const stats = useMemo(() => {
        if (!caskMasters.length) {
            return {
                totalCasks: 0,
                totalValue: 0,
                avgPrice: 0,
                highestPrice: 0,
            };
        }

        const prices = caskMasters
            .map((cm) => cm.price || 0)
            .filter((p) => p > 0);

        const totalCasks = distilleryData?.caskCount || caskMasters.length;
        const totalValue = prices.reduce((sum, p) => sum + p, 0);
        const avgPrice =
            prices.length > 0 ? Math.round(totalValue / prices.length) : 0;
        const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;

        return { totalCasks, totalValue, avgPrice, highestPrice };
    }, [caskMasters, distilleryData?.caskCount]);

    const breadcrumbItems = [
        { label: "Home", href: ROUTE_PUBLIC.HOME },
        { label: "Distilleries", href: ROUTE_PUBLIC.DISTILLERY },
        { label: distilleryData?.name || "Distillery" },
    ];

    // Get first child cask for description/tasting notes
    const firstChild = caskMasters[0]?.children?.[0];

    return (
        <section className="container bg-bg-main">
            <DynamicTitle title={distilleryData?.name} />

            {/* Breadcrumb */}
            <div className="-mx-[var(--padding-container)] border-b border-bd-main px-[var(--padding-container)] py-3">
                <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-16">
                {/* Left Sidebar */}
                <div className="col-span-4 border-bd-main pr-2 pt-6 tb:col-span-16 tb:-mx-[var(--padding-container)] tb:border-b tb:border-r-0 tb:pr-0 tb:pt-0">
                    <DistillerySidebar
                        image={
                            distilleryData?.imageUrl ||
                            firstChild?.imageUrl ||
                            undefined
                        }
                        name={distilleryData?.name || ""}
                        isVerified={distilleryData?.isVerified}
                        region={distilleryData?.region}
                        country={distilleryData?.country || "Scotland"}
                        company={distilleryData?.company || undefined}
                        establishedYear={
                            distilleryData?.establishedYear
                                ? String(distilleryData.establishedYear)
                                : undefined
                        }
                        summary={distilleryData?.summary}
                        description={
                            distilleryData?.description ||
                            firstChild?.description
                        }
                    />
                </div>

                {/* Right Content */}
                <div className="relative col-span-12 -mr-[var(--padding-container)] flex min-w-0 flex-col border-l border-bd-main tb:col-span-16 tb:-mx-[var(--padding-container)] tb:border-l-0">
                    <DistilleryTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        hideIndicator
                        className="-ml-px flex h-full flex-col tb:w-auto"
                    >
                        <TabsContent
                            value="portfolio"
                            className="mt-0 flex-1 pt-0 focus-visible:outline-none"
                        >
                            <div className="flex h-full flex-col gap-6 bg-bg-sf4 px-6 py-6 tb:gap-5 tb:px-5 tb:py-5 mb:gap-4 mb:px-4 mb:py-4">
                                <DistilleryStatsRow
                                    totalCasks={stats.totalCasks}
                                    totalValue={stats.totalValue}
                                    avgPrice={stats.avgPrice}
                                    highestPrice={stats.highestPrice}
                                />
                                <DistilleryCaskGrid
                                    casks={caskMasters}
                                    isLoading={distilleryDetailQuery.isLoading}
                                    page={page}
                                    setPage={setPage}
                                    totalPages={Math.ceil(
                                        caskMasters.length / 12
                                    )}
                                    totalRecords={caskMasters.length}
                                    size={12}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent
                            value="market-activity"
                            className="mt-0 flex-1 pt-0 focus-visible:outline-none"
                        >
                            <div className="h-full bg-bg-sf4 p-6 tb:px-5 tb:py-5 mb:px-4 mb:py-4">
                                <MarketActivityTab
                                    isLoading={distilleryDetailQuery.isLoading}
                                />
                            </div>
                        </TabsContent>
                    </DistilleryTabs>
                </div>
            </div>

            {/* Related Distilleries */}
            <RelatedDistilleries data={relatedDistilleriesQuery} />
        </section>
    );
}
