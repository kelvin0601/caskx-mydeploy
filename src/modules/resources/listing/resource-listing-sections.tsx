import LinkCustom from "@/components/shared/link-custom";
import { Button } from "@/components/ui/button";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import ResourceFaqList from "@/modules/resources/components/resource-faq-list";
import {
    ResourceGuideSlideList,
    ResourceTopicSlideList,
} from "@/modules/resources/components/resource-slide-card-list";
import ResourcePagination from "@/modules/resources/components/resource-pagination";
import ResourcesEmpty from "@/modules/resources/components/resources-empty";
import FeaturedResourceSlideList from "@/modules/resources/components/featured-resource-slide-list";
import type {
    ResourceGuideCardData,
    ResourceTopicCardData,
} from "@/modules/resources/types/card";
import type {
    ResourceFaq,
    ResourceFeaturedItem,
} from "@/payload/types/resources";
import type { ResourceSearchParams } from "@/modules/resources/utils/search-params";

export function ResourceListingHeader() {
    return (
        <div className="container flex min-w-0 items-end justify-between gap-8 tb:flex-col tb:items-stretch tb:gap-4 tb:py-8 mb:gap-4 mb:py-6">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <h1 className="font-reckless text-3xl font-medium leading-none text-typo-primary tb:text-2xl mb:text-xl">
                    Resources
                </h1>
                <p className="break-words text-sm font-normal leading-[1.5] text-typo-soft">
                    Everything you need to know about buying, selling, and
                    managing whisky casks.
                </p>
            </div>
        </div>
    );
}

export function ResourceTopicSection({
    topics,
}: {
    topics: ResourceTopicCardData[];
}) {
    return (
        <section
            id="browse-by-topic"
            className="container flex scroll-mt-[var(--height-header)] flex-col pb-10 pt-[2.4375rem] tb:gap-4 tb:py-8"
        >
            <h2 className="mb-4 font-reckless text-xl font-medium leading-none text-typo-primary tb:mb-0 mb:text-lg">
                Browse by Topic
            </h2>
            <div className="tb:overflow-hidden">
                {topics.length ? (
                    <ResourceTopicSlideList topics={topics} />
                ) : (
                    <ResourcesEmpty />
                )}
            </div>
        </section>
    );
}

export function ResourceFeaturedSection({
    guideResults,
    featuredResources,
    params,
    search,
}: {
    guideResults: {
        cards: ResourceGuideCardData[];
        page: number;
        totalPages: number;
    } | null;
    featuredResources: ResourceFeaturedItem[];
    params: ResourceSearchParams;
    search: string;
}) {
    return (
        <section
            id="featured-resources"
            className="scroll-mt-[var(--height-header)] border-t border-bd-main bg-bg-sf2 pb-10 pt-[2.4375rem] tb:py-8"
        >
            <div className="container flex flex-col tb:gap-4">
                <h2 className="mb-4 font-reckless text-xl font-medium leading-none text-typo-primary tb:mb-0 mb:text-lg">
                    {search ? "Search Results" : "Featured Resources"}
                </h2>
                <div className="tb:overflow-hidden">
                    {guideResults ? (
                        guideResults.cards.length ? (
                            <>
                                <ResourceGuideSlideList
                                    guides={guideResults.cards}
                                />
                                <ResourcePagination
                                    page={guideResults.page}
                                    totalPages={guideResults.totalPages}
                                    pathname={ROUTE_PUBLIC.RESOURCES}
                                    params={params}
                                />
                            </>
                        ) : (
                            <ResourcesEmpty search={search} />
                        )
                    ) : featuredResources.length ? (
                        <FeaturedResourceSlideList
                            resources={featuredResources}
                        />
                    ) : (
                        <ResourcesEmpty />
                    )}
                </div>
            </div>
        </section>
    );
}

export function ResourceFaqSection({
    popularFaqs,
}: {
    popularFaqs: ResourceFaq[];
}) {
    return (
        <section
            id="popular-faqs"
            className="scroll-mt-[var(--height-header)] border-t border-bd-main pt-[2.4375rem] tb:pb-8 tb:pt-8"
        >
            <div className="container grid grid-cols-[minmax(0,25.5rem)_minmax(0,1fr)] gap-4 tb:flex tb:flex-col tb:gap-6">
                <div className="flex min-w-0 flex-col items-start gap-6 tb:flex-row tb:items-end tb:justify-between tb:gap-4 mb:flex-col mb:items-start mb:gap-4">
                    <div className="flex max-w-[18.875rem] flex-col gap-2 tb:max-w-[20.25rem] mb:max-w-none">
                        <h2 className="font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                            Popular FAQs
                        </h2>
                        <p className="break-words text-sm font-normal leading-[1.5] text-typo-soft">
                            Find answers to frequently asked questions about
                            Cask Exchange and the trading process.
                        </p>
                    </div>
                    <Button variant="link" asChild>
                        <LinkCustom
                            href={ROUTE_PUBLIC.RESOURCE_FAQS}
                            className="text-sm font-medium capitalize text-typo-primary"
                        >
                            View all
                        </LinkCustom>
                    </Button>
                </div>
                <ResourceFaqList faqs={popularFaqs} />
            </div>
        </section>
    );
}
