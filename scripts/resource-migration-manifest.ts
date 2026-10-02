import {
    RESOURCE_FAQS,
    RESOURCE_GUIDES,
    RESOURCE_TOPICS,
} from "./resource-migration-data";
import { getArticlesByTopic } from "./resource-migration-topic-data";

export type TResourceMigrationManifest = {
    topics: {
        slug: string;
        source: string;
        declaredArticleCount: number;
        actualArticleCount: number;
        sortOrder: number;
    }[];
    guides: {
        slug: string;
        source: string;
        primaryTopic: string;
        featured: boolean;
        coverImage?: string;
    }[];
    faqs: {
        slug: string;
        source: string;
        topicSlugs: readonly string[];
        sortOrder: number;
    }[];
    settings: {
        featuredGuideSlugs: readonly string[];
    };
};

const featuredGuideBySlug = new Map(
    RESOURCE_GUIDES.map((guide) => [guide.id, guide])
);

const getArticleSource = (topicSlug: string, articleSlug: string) =>
    `scripts/resource-migration-topic-data.ts:${topicSlug}/${articleSlug}`;

export function buildResourceMigrationManifest(): TResourceMigrationManifest {
    const topics = RESOURCE_TOPICS.map((topic, index) => ({
        slug: topic.id,
        source: "scripts/resource-migration-data.ts:RESOURCE_TOPICS",
        declaredArticleCount: topic.articleCount,
        actualArticleCount: getArticlesByTopic(topic.id).length,
        sortOrder: index,
    }));

    const guides = RESOURCE_TOPICS.flatMap((topic) =>
        getArticlesByTopic(topic.id).map((article, index) => {
            const featuredGuide = featuredGuideBySlug.get(article.id);

            return {
                slug: article.id,
                source: getArticleSource(topic.id, article.id),
                primaryTopic: topic.id,
                featured: Boolean(featuredGuide),
                ...(featuredGuide?.imageSrc
                    ? { coverImage: featuredGuide.imageSrc }
                    : {}),
                sortOrder: index,
            };
        })
    );

    const faqs = RESOURCE_FAQS.map((faq, index) => ({
        slug: faq.id,
        source: "scripts/resource-migration-data.ts:RESOURCE_FAQS",
        topicSlugs: faq.topics ?? [],
        sortOrder: index,
    }));

    return {
        topics,
        guides,
        faqs,
        settings: {
            featuredGuideSlugs: RESOURCE_GUIDES.map((guide) => guide.id),
        },
    };
}

export const RESOURCE_MIGRATION_MANIFEST = buildResourceMigrationManifest();

export const RESOURCE_CONTENT_AUDIT = RESOURCE_MIGRATION_MANIFEST.topics.map(
    (topic) => ({
        topic: topic.slug,
        declaredArticleCount: topic.declaredArticleCount,
        actualArticleCount: topic.actualArticleCount,
        hasCountMismatch:
            topic.declaredArticleCount !== topic.actualArticleCount,
    })
);
