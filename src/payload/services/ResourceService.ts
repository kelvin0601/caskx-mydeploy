import "server-only";

import { cache } from "react";
import { getPayload, type Where } from "payload";
import config from "@payload-config";
import {
    resourceFaqGroupSchema,
    resourceFaqSchema,
    resourceGuideSchema,
    resourceSettingsSchema,
    resourceTopicSchema,
    type ResourceTopic,
    type ResourceFeaturedItem,
    type ResourceGuide,
} from "@/payload/types/resources";

const publicRead = { overrideAccess: false, draft: false } as const;
const published: Where = { _status: { equals: "published" } };

type PayloadClient = Awaited<ReturnType<typeof getPayload>>;
export type ResourceGuideQuery = {
    search?: string;
    page?: number;
    topic?: string;
};
export type PayloadClientFactory = () => Promise<PayloadClient>;

function hasSlug(
    document: Pick<ResourceTopic | ResourceGuide, "previousSlugs" | "slug">,
    slug: string
) {
    return (
        document.slug === slug ||
        document.previousSlugs?.some((item) => item.slug === slug) === true
    );
}

const defaultCmsFactory: PayloadClientFactory = cache(() =>
    getPayload({ config })
);

/**
 * Server-only application service for the Resources Payload collections.
 * Route files depend on this class instead of constructing Payload clients or
 * duplicating collection queries.
 */
export class ResourceService {
    private readonly getCms: () => Promise<PayloadClient>;
    private readonly getTopicsCached: () => Promise<ResourceTopic[]>;

    constructor(
        private readonly cmsFactory: PayloadClientFactory = defaultCmsFactory
    ) {
        this.getCms = cache(() => this.cmsFactory());
        this.getTopicsCached = cache(() => this.getTopics());
    }

    async getTopics() {
        const cms = await this.getCms();
        const result = await cms.find({
            ...publicRead,
            collection: "resource-topics",
            depth: 0,
            pagination: false,
            limit: 0,
            sort: ["sortOrder", "id"],
            where: published,
        });
        return resourceTopicSchema.array().parse(result.docs);
    }

    async getFaqGroups() {
        const cms = await this.getCms();
        const result = await cms.find({
            ...publicRead,
            collection: "resource-faq-groups",
            depth: 0,
            pagination: false,
            limit: 0,
            sort: ["sortOrder", "id"],
            where: published,
        });
        return resourceFaqGroupSchema.array().parse(result.docs);
    }

    async getTopicCards() {
        const [cms, topics] = await Promise.all([
            this.getCms(),
            this.getTopicsCached(),
        ]);
        if (!topics.length) return [];

        const result = await cms.find({
            ...publicRead,
            collection: "resource-guides",
            depth: 0,
            pagination: false,
            limit: 0,
            sort: ["sortOrder", "id"],
            select: { primaryTopic: true, slug: true },
            where: {
                and: [
                    published,
                    { primaryTopic: { in: topics.map((topic) => topic.id) } },
                ],
            },
        });
        const guideStats = new Map<
            string,
            { articleCount: number; firstGuideSlug?: string }
        >();

        result.docs.forEach((guide) => {
            const primaryTopic =
                typeof guide.primaryTopic === "object"
                    ? guide.primaryTopic.id
                    : guide.primaryTopic;
            const topicId = String(primaryTopic);
            const current = guideStats.get(topicId) ?? { articleCount: 0 };
            current.articleCount += 1;
            current.firstGuideSlug ??= guide.slug;
            guideStats.set(topicId, current);
        });

        return topics.map((topic) => ({
            ...topic,
            articleCount: guideStats.get(String(topic.id))?.articleCount ?? 0,
            firstGuideSlug: guideStats.get(String(topic.id))?.firstGuideSlug,
        }));
    }

    async getGuides({ search = "", page = 1, topic }: ResourceGuideQuery = {}) {
        const [cms, topics] = await Promise.all([
            this.getCms(),
            this.getTopicsCached(),
        ]);
        const topicIds = topics
            .filter((item) => !topic || hasSlug(item, topic))
            .map((item) => item.id);
        if (!topicIds.length) return { docs: [], page: 1, totalPages: 1 };
        const conditions: Where[] = [
            published,
            { primaryTopic: { in: topicIds } },
        ];
        if (search)
            conditions.push({
                or: [
                    { title: { like: search } },
                    { excerpt: { like: search } },
                ],
            });
        const result = await cms.find({
            ...publicRead,
            collection: "resource-guides",
            depth: 1,
            sort: ["sortOrder", "id"],
            limit: 12,
            page,
            where: { and: conditions },
        });
        const docs = resourceGuideSchema.array().parse(result.docs);
        return {
            docs,
            page: result.page ?? 1,
            totalPages: result.totalPages,
        };
    }

    async getGuideCatalog() {
        const [cms, topics] = await Promise.all([
            this.getCms(),
            this.getTopicsCached(),
        ]);
        if (!topics.length) return [];

        const result = await cms.find({
            ...publicRead,
            collection: "resource-guides",
            depth: 1,
            pagination: false,
            limit: 0,
            sort: ["sortOrder", "id"],
            where: {
                and: [
                    published,
                    { primaryTopic: { in: topics.map((topic) => topic.id) } },
                ],
            },
        });

        return resourceGuideSchema.array().parse(result.docs);
    }

    async getGuidesByTopic(topic: string) {
        const [cms, topics] = await Promise.all([
            this.getCms(),
            this.getTopicsCached(),
        ]);
        const parent = topics.find((item) => hasSlug(item, topic));
        if (!parent) return [];

        const result = await cms.find({
            ...publicRead,
            collection: "resource-guides",
            depth: 1,
            pagination: false,
            limit: 0,
            sort: ["sortOrder", "id"],
            where: {
                and: [published, { primaryTopic: { equals: parent.id } }],
            },
        });

        return resourceGuideSchema.array().parse(result.docs);
    }

    async getFeaturedResources() {
        const [cms, topics] = await Promise.all([
            this.getCms(),
            this.getTopicsCached(),
        ]);

        const settings = resourceSettingsSchema.parse(
            await cms.findGlobal({
                slug: "resource-settings",
                depth: 0,
                overrideAccess: true,
            })
        );
        const references = settings.featuredResources?.length
            ? settings.featuredResources
            : (settings.featuredGuides ?? []).map((value) => ({
                  relationTo: "resource-guides" as const,
                  value,
              }));
        if (!references.length) return [];

        const guideIds = references.flatMap((reference) =>
            reference.relationTo === "resource-guides" ? [reference.value] : []
        );
        const faqIds = references.flatMap((reference) =>
            reference.relationTo === "resource-faqs" ? [reference.value] : []
        );
        const topicIds = topics.map((topic) => topic.id);
        const [guideResult, faqResult] = await Promise.all([
            guideIds.length
                ? cms.find({
                      ...publicRead,
                      collection: "resource-guides",
                      depth: 1,
                      pagination: false,
                      limit: 0,
                      where: {
                          and: [
                              published,
                              { primaryTopic: { in: topicIds } },
                              { id: { in: guideIds } },
                          ],
                      },
                  })
                : Promise.resolve({ docs: [] }),
            faqIds.length
                ? cms.find({
                      ...publicRead,
                      collection: "resource-faqs",
                      depth: 1,
                      pagination: false,
                      limit: 0,
                      where: { and: [published, { id: { in: faqIds } }] },
                  })
                : Promise.resolve({ docs: [] }),
        ]);
        const guides = resourceGuideSchema.array().parse(guideResult.docs);
        const faqs = resourceFaqSchema.array().parse(faqResult.docs);
        const guidesById = new Map(
            guides.map((guide) => [String(guide.id), guide])
        );
        const faqsById = new Map(faqs.map((faq) => [String(faq.id), faq]));
        const featured: ResourceFeaturedItem[] = [];

        references.forEach((reference) => {
            if (reference.relationTo === "resource-guides") {
                const value = guidesById.get(String(reference.value));
                if (value)
                    featured.push({ relationTo: reference.relationTo, value });
                return;
            }
            const value = faqsById.get(String(reference.value));
            if (value)
                featured.push({ relationTo: reference.relationTo, value });
        });

        return featured;
    }

    async getGuide(topic: string, slug: string) {
        return (await this.getGuidePage(topic, slug))?.guide ?? null;
    }

    async getTopic(slug: string) {
        return (await this.getTopicsCached()).find((topic) =>
            hasSlug(topic, slug)
        );
    }

    async getGuidePage(topicSlug: string, guideSlug: string) {
        const topic = await this.getTopic(topicSlug);
        if (!topic) return null;

        const guides = await this.getGuidesByTopic(topic.slug);
        const guide = guides.find((item) => hasSlug(item, guideSlug));
        if (!guide) return null;

        return { guide, guides, topic };
    }

    async getFaqs(popular = false) {
        const cms = await this.getCms();
        const conditions: Where[] = [published];
        let selectedIds: (string | number)[] = [];
        if (popular) {
            const settings = resourceSettingsSchema.parse(
                await cms.findGlobal({
                    slug: "resource-settings",
                    depth: 0,
                    overrideAccess: true,
                })
            );
            selectedIds = settings.popularFaqs ?? [];
            conditions.push(
                selectedIds.length
                    ? { id: { in: selectedIds } }
                    : { isPopular: { equals: true } }
            );
        }
        const result = await cms.find({
            ...publicRead,
            collection: "resource-faqs",
            depth: 1,
            pagination: false,
            limit: 0,
            sort: ["sortOrder", "id"],
            where: { and: conditions },
        });
        const docs = resourceFaqSchema.array().parse(result.docs);
        if (!selectedIds.length) return docs;

        const selectedOrder = new Map(
            selectedIds.map((selectedId, index) => [String(selectedId), index])
        );
        return docs.toSorted(
            (a, b) =>
                (selectedOrder.get(String(a.id)) ?? Number.MAX_SAFE_INTEGER) -
                (selectedOrder.get(String(b.id)) ?? Number.MAX_SAFE_INTEGER)
        );
    }
}

export const resourceService = new ResourceService();
