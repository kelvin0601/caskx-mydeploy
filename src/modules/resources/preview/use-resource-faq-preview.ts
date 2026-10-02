"use client";

import { useCallback, useState } from "react";
import {
    resourceFaqGroupSchema,
    resourceFaqSchema,
    resourceRichTextSchema,
    type ResourceFaq,
    type ResourceFaqGroup,
} from "@/payload/types/resources";
import {
    useResourceLivePreviewWorker,
    type ResourceLivePreviewMessage,
} from "@/modules/resources/preview/use-resource-live-preview-worker";

export function useResourceFaqPreview({
    enabled,
    initialFaqGroups,
    initialFaqs,
    previewId,
}: {
    enabled: boolean;
    initialFaqGroups: ResourceFaqGroup[];
    initialFaqs: ResourceFaq[];
    previewId?: string;
}) {
    const [faqGroups, setFaqGroups] = useState(initialFaqGroups);
    const [faqs, setFaqs] = useState(initialFaqs);

    const handlePreviewMessage = useCallback(
        (message: ResourceLivePreviewMessage) => {
            const data = message.data;
            if (message.collectionSlug === "resource-faq-groups") {
                setFaqGroups((current) =>
                    current.map((group) => {
                        if (String(group.id) !== previewId) return group;
                        const parsed = resourceFaqGroupSchema.safeParse({
                            ...group,
                            title:
                                typeof data.title === "string"
                                    ? data.title
                                    : group.title,
                            slug:
                                typeof data.slug === "string" && data.slug
                                    ? data.slug
                                    : group.slug,
                        });
                        return parsed.success ? parsed.data : group;
                    })
                );
            }

            if (message.collectionSlug === "resource-faqs") {
                setFaqs((current) =>
                    current.map((faq) => {
                        if (String(faq.id) !== previewId) return faq;
                        const answer = resourceRichTextSchema.safeParse(
                            data.answer
                        );
                        const parsed = resourceFaqSchema.safeParse({
                            ...faq,
                            question:
                                typeof data.question === "string"
                                    ? data.question
                                    : faq.question,
                            answer: answer.success ? answer.data : faq.answer,
                        });
                        return parsed.success ? parsed.data : faq;
                    })
                );
            }
        },
        [previewId]
    );

    useResourceLivePreviewWorker({
        enabled: Boolean(enabled && previewId),
        onMessage: handlePreviewMessage,
    });

    return { faqGroups, faqs };
}
