"use client";

import { useCallback, useState } from "react";
import ResourceTopicGuideLayout from "@/modules/resources/components/resource-topic-guide-layout";
import {
    resourceRichTextSchema,
    type ResourceGuide,
    type ResourceTopic,
} from "@/payload/types/resources";
import {
    useResourceLivePreviewWorker,
    type ResourceLivePreviewMessage,
} from "@/modules/resources/preview/use-resource-live-preview-worker";

export default function LivePreviewGuide({
    initialGuide,
    initialGuides,
    topic,
}: {
    initialGuide: ResourceGuide;
    initialGuides: ResourceGuide[];
    topic: ResourceTopic;
}) {
    const [guide, setGuide] = useState(initialGuide);

    const handlePreviewMessage = useCallback(
        (message: ResourceLivePreviewMessage) => {
            if (message.collectionSlug !== "resource-guides") return;

            setGuide((current) => {
                const data = message.data;
                const content = resourceRichTextSchema.safeParse(data.content);
                return {
                    ...current,
                    title:
                        typeof data.title === "string"
                            ? data.title
                            : current.title,
                    slug:
                        typeof data.slug === "string" && data.slug
                            ? data.slug
                            : current.slug,
                    excerpt:
                        typeof data.excerpt === "string"
                            ? data.excerpt
                            : current.excerpt,
                    readTimeMinutes:
                        typeof data.readTimeMinutes === "number" ||
                        data.readTimeMinutes === null
                            ? data.readTimeMinutes
                            : current.readTimeMinutes,
                    content: content.success ? content.data : current.content,
                };
            });
        },
        []
    );

    useResourceLivePreviewWorker({
        enabled: true,
        onMessage: handlePreviewMessage,
    });

    const guides = initialGuides.map((item) =>
        String(item.id) === String(guide.id) ? guide : item
    );

    return (
        <ResourceTopicGuideLayout topic={topic} guides={guides} guide={guide} />
    );
}
