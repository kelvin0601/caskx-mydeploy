"use client";

import { useCallback, useState } from "react";
import { getResourceTopicRoute } from "@/lib/constants/route";
import type { ResourceLivePreviewCatalog } from "@/modules/resources/listing/types";
import {
    useResourceLivePreviewWorker,
    type ResourceLivePreviewMessage,
} from "@/modules/resources/preview/use-resource-live-preview-worker";
import type { ResourceTopicCardData } from "@/modules/resources/types/card";
import type {
    ResourceFaq,
    ResourceFeaturedItem,
} from "@/payload/types/resources";

function relationId(value: unknown) {
    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }
    if (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        (typeof value.id === "string" || typeof value.id === "number")
    ) {
        return String(value.id);
    }
    return null;
}

export function useResourceListingPreview({
    initialFeaturedResources,
    initialPopularFaqs,
    initialTopics,
    livePreviewCatalog,
    livePreviewTopicId,
}: {
    initialFeaturedResources: ResourceFeaturedItem[];
    initialPopularFaqs: ResourceFaq[];
    initialTopics: ResourceTopicCardData[];
    livePreviewCatalog?: ResourceLivePreviewCatalog;
    livePreviewTopicId?: string;
}) {
    const [previewTopics, setPreviewTopics] = useState(initialTopics);
    const [previewFeaturedResources, setPreviewFeaturedResources] = useState(
        initialFeaturedResources
    );
    const [previewPopularFaqs, setPreviewPopularFaqs] =
        useState(initialPopularFaqs);

    const handlePreviewMessage = useCallback(
        (message: ResourceLivePreviewMessage) => {
            const resourcesByKey = new Map(
                (livePreviewCatalog?.resources ?? []).map((resource) => [
                    `${resource.relationTo}:${resource.value.id}`,
                    resource,
                ])
            );
            const faqsById = new Map(
                (livePreviewCatalog?.faqs ?? []).map((faq) => [
                    String(faq.id),
                    faq,
                ])
            );
            const data = message.data;

            if (
                message.collectionSlug === "resource-topics" &&
                livePreviewTopicId
            ) {
                setPreviewTopics((current) =>
                    current.map((topic) => {
                        if (topic.id !== livePreviewTopicId) return topic;
                        const slug =
                            typeof data.slug === "string" && data.slug
                                ? data.slug
                                : null;
                        const icon =
                            data.icon === "buying" ||
                            data.icon === "selling" ||
                            data.icon === "marketplace" ||
                            data.icon === "whisky-casks"
                                ? data.icon
                                : topic.icon;
                        return {
                            ...topic,
                            title:
                                typeof data.title === "string"
                                    ? data.title
                                    : topic.title,
                            description:
                                typeof data.description === "string"
                                    ? data.description
                                    : topic.description,
                            icon,
                            href: slug
                                ? getResourceTopicRoute(slug)
                                : topic.href,
                        };
                    })
                );
                return;
            }

            if (message.globalSlug !== "resource-settings") return;
            if (Array.isArray(data.featuredResources)) {
                setPreviewFeaturedResources(
                    data.featuredResources.flatMap((reference) => {
                        if (
                            typeof reference !== "object" ||
                            reference === null ||
                            !("relationTo" in reference) ||
                            !("value" in reference) ||
                            (reference.relationTo !== "resource-guides" &&
                                reference.relationTo !== "resource-faqs")
                        ) {
                            return [];
                        }
                        const id = relationId(reference.value);
                        const resource = id
                            ? resourcesByKey.get(
                                  `${reference.relationTo}:${id}`
                              )
                            : undefined;
                        return resource ? [resource] : [];
                    })
                );
            }
            if (Array.isArray(data.popularFaqs)) {
                setPreviewPopularFaqs(
                    data.popularFaqs.flatMap((value) => {
                        const id = relationId(value);
                        const faq = id ? faqsById.get(id) : undefined;
                        return faq ? [faq] : [];
                    })
                );
            }
        },
        [livePreviewCatalog, livePreviewTopicId]
    );

    useResourceLivePreviewWorker({
        enabled: Boolean(livePreviewCatalog || livePreviewTopicId),
        onMessage: handlePreviewMessage,
    });

    return {
        featuredResources: livePreviewCatalog
            ? previewFeaturedResources
            : initialFeaturedResources,
        popularFaqs: livePreviewCatalog
            ? previewPopularFaqs
            : initialPopularFaqs,
        topics: livePreviewTopicId ? previewTopics : initialTopics,
    };
}
