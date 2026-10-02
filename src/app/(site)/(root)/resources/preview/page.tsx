import { draftMode, headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload, type Where } from "payload";
import config from "@payload-config";
import { env } from "@/config/env";
import {
    getResourceGuideRoute,
    getResourceTopicRoute,
} from "@/lib/constants/route";
import ResourceFaqsModule from "@/modules/resources/faqs";
import ResourceListing from "@/modules/resources/listing";
import LivePreviewGuide from "@/modules/resources/preview/live-preview-guide";
import type { ResourceTopicCardData } from "@/modules/resources/types/card";
import { isCmsUser } from "@/payload/access";
import type { ResourcePreviewCollection } from "@/payload/preview/resources";
import { resourceService } from "@/payload/services/ResourceService";
import {
    resourceFaqGroupSchema,
    resourceFaqSchema,
    resourceGuideSchema,
    resourceTopicSchema,
    type ResourceFeaturedItem,
    type ResourceGuide,
} from "@/payload/types/resources";

export const dynamic = "force-dynamic";

type PreviewSearchParams = {
    collection?: string | string[];
    id?: string | string[];
    slug?: string | string[];
};

function first(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function isResourcePreviewCollection(
    value: string | undefined
): value is ResourcePreviewCollection {
    return (
        value === "resource-faq-groups" ||
        value === "resource-faqs" ||
        value === "resource-guides" ||
        value === "resource-topics"
    );
}

function replaceById<T extends { id: string | number }>(items: T[], item: T) {
    const next = items.filter(
        (candidate) => String(candidate.id) !== String(item.id)
    );
    return [...next, item];
}

async function findPreviewDocument(
    payload: Awaited<ReturnType<typeof getPayload>>,
    collection: ResourcePreviewCollection,
    id: string | undefined,
    slug: string | undefined
) {
    const where: Where | null = id
        ? { id: { equals: id } }
        : slug
          ? { slug: { equals: slug } }
          : null;
    if (!where) return null;

    const options = {
        draft: true,
        depth: 2,
        limit: 1,
        overrideAccess: true,
        where,
    } as const;

    switch (collection) {
        case "resource-faq-groups":
            return (await payload.find({ ...options, collection })).docs[0];
        case "resource-faqs":
            return (await payload.find({ ...options, collection })).docs[0];
        case "resource-guides":
            return (await payload.find({ ...options, collection })).docs[0];
        case "resource-topics":
            return (await payload.find({ ...options, collection })).docs[0];
    }
}

export default async function ResourcePreviewPage({
    searchParams,
}: {
    searchParams: Promise<PreviewSearchParams>;
}) {
    if (!env.payloadCmsEnabled || !(await draftMode()).isEnabled) notFound();

    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: await headers() });
    if (!isCmsUser(user)) notFound();

    const query = await searchParams;
    const collection = first(query.collection);
    const id = first(query.id);
    const slug = first(query.slug);
    if (!isResourcePreviewCollection(collection)) notFound();

    const document = await findPreviewDocument(payload, collection, id, slug);
    if (!document) notFound();

    if (collection === "resource-guides") {
        const guide = resourceGuideSchema.safeParse(document);
        if (!guide.success) notFound();

        const topic =
            typeof guide.data.primaryTopic === "object"
                ? resourceTopicSchema.safeParse(guide.data.primaryTopic)
                : null;
        if (!topic?.success) notFound();

        const guideResult = await payload.find({
            collection: "resource-guides",
            depth: 2,
            draft: true,
            pagination: false,
            limit: 0,
            overrideAccess: true,
            sort: ["sortOrder", "id"],
            where: { primaryTopic: { equals: topic.data.id } },
        });
        const guides = guideResult.docs.flatMap((item) => {
            const parsed = resourceGuideSchema.safeParse(item);
            return parsed.success ? [parsed.data] : [];
        });

        return (
            <LivePreviewGuide
                initialGuide={guide.data}
                initialGuides={replaceById<ResourceGuide>(guides, guide.data)}
                topic={topic.data}
            />
        );
    }

    if (collection === "resource-topics") {
        const topic = resourceTopicSchema.safeParse(document);
        if (!topic.success) notFound();

        const [topicCards, featuredResources, popularFaqs, guides, faqs] =
            await Promise.all([
                resourceService.getTopicCards(),
                resourceService.getFeaturedResources(),
                resourceService.getFaqs(true),
                resourceService.getGuideCatalog(),
                resourceService.getFaqs(),
            ]);
        const currentCard = topicCards.find(
            (item) => String(item.id) === String(topic.data.id)
        );
        const previewCard: ResourceTopicCardData = {
            id: String(topic.data.id),
            title: topic.data.title,
            description: topic.data.description,
            icon: topic.data.icon,
            articleCount: currentCard?.articleCount ?? 0,
            actionLabel: "Explore Now",
            href: currentCard?.firstGuideSlug
                ? getResourceGuideRoute(
                      topic.data.slug,
                      currentCard.firstGuideSlug
                  )
                : getResourceTopicRoute(topic.data.slug),
        };
        const cards = replaceById<ResourceTopicCardData>(
            topicCards.map((item) => ({
                ...item,
                id: String(item.id),
                actionLabel: "Explore Now",
                href: item.firstGuideSlug
                    ? getResourceGuideRoute(item.slug, item.firstGuideSlug)
                    : getResourceTopicRoute(item.slug),
            })),
            previewCard
        );
        const catalog: ResourceFeaturedItem[] = [
            ...guides.map((value) => ({
                relationTo: "resource-guides" as const,
                value,
            })),
            ...faqs.map((value) => ({
                relationTo: "resource-faqs" as const,
                value,
            })),
        ];

        return (
            <ResourceListing
                topics={cards}
                guideResults={null}
                featuredResources={featuredResources}
                popularFaqs={popularFaqs}
                params={{}}
                search=""
                livePreviewCatalog={{ resources: catalog, faqs }}
                livePreviewTopicId={String(topic.data.id)}
            />
        );
    }

    const [initialGroups, initialFaqs] = await Promise.all([
        resourceService.getFaqGroups(),
        resourceService.getFaqs(),
    ]);
    if (collection === "resource-faq-groups") {
        const group = resourceFaqGroupSchema.safeParse(document);
        if (!group.success) notFound();
        return (
            <ResourceFaqsModule
                faqGroups={replaceById(initialGroups, group.data)}
                faqs={initialFaqs}
                livePreview
                previewId={String(group.data.id)}
            />
        );
    }

    const faq = resourceFaqSchema.safeParse(document);
    if (!faq.success) notFound();
    return (
        <ResourceFaqsModule
            faqGroups={initialGroups}
            faqs={replaceById(initialFaqs, faq.data)}
            livePreview
            previewId={String(faq.data.id)}
        />
    );
}
