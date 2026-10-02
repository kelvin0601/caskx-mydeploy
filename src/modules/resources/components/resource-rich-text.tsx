import {
    LinkJSXConverter,
    RichText,
    type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";
import {
    getResourceGuideRoute,
    getResourceTopicRoute,
    ROUTE_PUBLIC,
} from "@/lib/constants/route";
import { resourceTopicSchema } from "@/payload/types/resources";

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({
        internalDocToHref: ({ linkNode }) => {
            const doc = linkNode.fields.doc;
            if (doc?.relationTo === "resource-topics") {
                const topic = resourceTopicSchema.safeParse(doc.value);
                if (topic.success)
                    return getResourceTopicRoute(topic.data.slug);
            }
            if (
                doc?.relationTo === "resource-guides" &&
                typeof doc.value === "object" &&
                doc.value !== null
            ) {
                const topic = resourceTopicSchema.safeParse(
                    doc.value.primaryTopic
                );
                if (topic.success && typeof doc.value.slug === "string") {
                    return getResourceGuideRoute(
                        topic.data.slug,
                        doc.value.slug
                    );
                }
            }
            return ROUTE_PUBLIC.RESOURCES;
        },
    }),
});

export default function ResourceRichText({
    data,
}: {
    data: SerializedEditorState;
}) {
    return (
        <RichText
            data={data}
            converters={converters}
            className="basic-richtext"
        />
    );
}
