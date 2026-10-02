"use client";

import {
    ResourceFaqSection,
    ResourceFeaturedSection,
    ResourceListingHeader,
    ResourceTopicSection,
} from "@/modules/resources/listing/resource-listing-sections";
import type { ResourceListingProps } from "@/modules/resources/listing/types";
import { useResourceListingPreview } from "@/modules/resources/listing/use-resource-listing-preview";

export default function ResourceListing({
    topics: initialTopics,
    guideResults,
    featuredResources: initialFeaturedResources,
    popularFaqs: initialPopularFaqs,
    params,
    search,
    livePreviewCatalog,
    livePreviewTopicId,
}: ResourceListingProps) {
    const { featuredResources, popularFaqs, topics } =
        useResourceListingPreview({
            initialTopics,
            initialFeaturedResources,
            initialPopularFaqs,
            livePreviewCatalog,
            livePreviewTopicId,
        });

    return (
        <section className="flex flex-col gap-8 py-10 tb:gap-0 tb:py-0">
            <ResourceListingHeader />

            <div className="border-t border-bd-main">
                <ResourceTopicSection topics={topics} />
                <ResourceFeaturedSection
                    guideResults={guideResults}
                    featuredResources={featuredResources}
                    params={params}
                    search={search}
                />
                <ResourceFaqSection popularFaqs={popularFaqs} />
            </div>
        </section>
    );
}
