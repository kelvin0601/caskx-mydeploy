import type { CollectionConfig } from "payload";
import { authenticatedCmsUser, readPublishedResource } from "../access.ts";
import {
    convertHtmlRichText,
    createResourceRichTextEditor,
} from "../editor.ts";
import {
    revalidateResourceAfterChange,
    revalidateResourceAfterDelete,
} from "../hooks/resources/revalidate.ts";
import {
    createResourceLivePreview,
    createResourcePreview,
} from "../preview/resources.ts";
import { resourceCollectionVersions } from "../versions.ts";

export const ResourceFaqs: CollectionConfig = {
    slug: "resource-faqs",
    labels: {
        singular: "FAQ",
        plural: "FAQs",
    },
    admin: {
        useAsTitle: "question",
        group: "Resources",
        description:
            "Create and organise clear answers to common customer questions.",
        listSearchableFields: ["question"],
        defaultColumns: ["question", "group", "isPopular", "_status"],
        livePreview: createResourceLivePreview("resource-faqs"),
        preview: createResourcePreview("resource-faqs"),
    },
    access: {
        read: readPublishedResource,
        create: authenticatedCmsUser,
        update: authenticatedCmsUser,
        delete: authenticatedCmsUser,
    },
    hooks: {
        afterChange: [revalidateResourceAfterChange],
        afterDelete: [revalidateResourceAfterDelete],
    },
    versions: resourceCollectionVersions,
    defaultSort: "sortOrder",
    fields: [
        {
            name: "question",
            type: "text",
            label: "Question",
            required: true,
        },
        {
            name: "answer",
            type: "richText",
            label: "Answer",
            required: true,
            admin: {
                description:
                    "Provide a direct, accurate answer. Use formatting only when it improves readability.",
            },
            hooks: {
                beforeValidate: [convertHtmlRichText],
            },
            editor: createResourceRichTextEditor("Write the FAQ answer..."),
        },
        {
            name: "group",
            type: "relationship",
            label: "FAQ Group",
            relationTo: "resource-faq-groups",
            required: true,
            admin: {
                description:
                    "Select the group where this question appears on the FAQ page.",
            },
        },
        {
            name: "topics",
            type: "relationship",
            label: "Legacy Resource Topics",
            relationTo: "resource-topics",
            hasMany: true,
            admin: {
                hidden: true,
            },
        },
        {
            name: "isPopular",
            type: "checkbox",
            label: "Mark as Popular",
            defaultValue: false,
            index: true,
            admin: {
                description:
                    "Used as a fallback when no Popular FAQs are selected in Resource Listing.",
            },
        },
        {
            name: "sortOrder",
            type: "number",
            label: "Display Order",
            required: true,
            defaultValue: 0,
            index: true,
            admin: {
                description:
                    "Controls the FAQ order. Lower numbers appear first.",
            },
        },
    ],
};
