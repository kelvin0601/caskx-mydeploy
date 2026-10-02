import { draftMode } from "next/headers";
import ResourceListing from "@/modules/resources/listing";
import {
    getResourceGuideRoute,
    getResourceTopicRoute,
} from "@/lib/constants/route";
import { toResourceGuideCard } from "@/modules/resources/utils/card-mappers";
import {
    resourcePageValue,
    resourceSearchValue,
    type ResourceSearchParams,
} from "@/modules/resources/utils/search-params";
import { resourceService } from "@/payload/services/ResourceService";
import type { ResourceFeaturedItem } from "@/payload/types/resources";

export const dynamic = "force-dynamic";
export const metadata = {
    title: "Resources | Cask Exchange",
    description: "Learn about buying, selling, and managing whisky casks.",
};

export default async function ResourcesPage({
    searchParams,
}: {
    searchParams: Promise<ResourceSearchParams>;
}) {
    const [params, preview] = await Promise.all([searchParams, draftMode()]);
    const search = resourceSearchValue(params);
    const [
        topics,
        guides,
        featuredResources,
        faqs,
        catalogGuides,
        catalogFaqs,
    ] = await Promise.all([
        resourceService.getTopicCards(),
        search
            ? resourceService.getGuides({
                  search,
                  page: resourcePageValue(params),
              })
            : Promise.resolve(null),
        search ? Promise.resolve([]) : resourceService.getFeaturedResources(),
        resourceService.getFaqs(true),
        preview.isEnabled
            ? resourceService.getGuideCatalog()
            : Promise.resolve([]),
        preview.isEnabled ? resourceService.getFaqs() : Promise.resolve([]),
    ]);
    const topicCards = topics.map((topic) => ({
        ...topic,
        id: String(topic.id),
        href: topic.firstGuideSlug
            ? getResourceGuideRoute(topic.slug, topic.firstGuideSlug)
            : getResourceTopicRoute(topic.slug),
        actionLabel: "Explore Now",
    }));
    const guideCards = guides?.docs.flatMap((guide) => {
        const card = toResourceGuideCard(guide);
        return card ? [card] : [];
    });
    const catalogResources: ResourceFeaturedItem[] = [
        ...catalogGuides.map((value) => ({
            relationTo: "resource-guides" as const,
            value,
        })),
        ...catalogFaqs.map((value) => ({
            relationTo: "resource-faqs" as const,
            value,
        })),
    ];

    return (
        <ResourceListing
            topics={topicCards}
            guideResults={
                guides
                    ? {
                          cards: guideCards ?? [],
                          page: guides.page,
                          totalPages: guides.totalPages,
                      }
                    : null
            }
            featuredResources={featuredResources}
            popularFaqs={faqs}
            params={params}
            search={search}
            livePreviewCatalog={
                preview.isEnabled
                    ? { resources: catalogResources, faqs: catalogFaqs }
                    : undefined
            }
        />
    );
}
