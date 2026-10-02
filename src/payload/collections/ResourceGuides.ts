import { slugField, type CollectionConfig } from "payload";
import { authenticatedCmsUser, readPublishedResource } from "../access.ts";
import {
    convertHtmlRichText,
    createResourceRichTextEditor,
} from "../editor.ts";
import {
    previousSlugsField,
    trackPreviousSlugs,
} from "../fields/previousSlugs.ts";
import {
    revalidateResourceAfterChange,
    revalidateResourceAfterDelete,
} from "../hooks/resources/revalidate.ts";
import {
    createResourceLivePreview,
    createResourcePreview,
} from "../preview/resources.ts";
import { resourceCollectionVersions } from "../versions.ts";

export const ResourceGuides: CollectionConfig = {
    slug: "resource-guides",
    labels: {
        singular: "Resource Guide",
        plural: "Resource Guides",
    },
    admin: {
        useAsTitle: "title",
        group: "Resources",
        description:
            "Create, organise and publish educational content for the Resources library.",
        listSearchableFields: ["title", "slug"],
        livePreview: createResourceLivePreview("resource-guides"),
        preview: createResourcePreview("resource-guides"),
        defaultColumns: [
            "title",
            "primaryTopic",
            "readTimeMinutes",
            "_status",
            "updatedAt",
        ],
    },
    access: {
        read: readPublishedResource,
        create: authenticatedCmsUser,
        update: authenticatedCmsUser,
        delete: authenticatedCmsUser,
    },
    hooks: {
        beforeChange: [trackPreviousSlugs("resource-guides")],
        afterChange: [revalidateResourceAfterChange],
        afterDelete: [revalidateResourceAfterDelete],
    },
    versions: resourceCollectionVersions,
    defaultSort: "sortOrder",
    fields: [
        {
            name: "title",
            type: "text",
            label: "Guide Title",
            required: true,
            index: true,
        },
        slugField(),
        previousSlugsField,
        {
            name: "excerpt",
            type: "textarea",
            label: "Card Summary",
            required: true,
            admin: {
                description:
                    "A short summary displayed on guide cards and in search results.",
            },
        },
        {
            name: "primaryTopic",
            type: "relationship",
            label: "Primary Topic",
            relationTo: "resource-topics",
            required: true,
            index: true,
            admin: {
                description:
                    "Determines the guide's main category and public URL.",
            },
        },
        {
            name: "relatedTopics",
            type: "relationship",
            label: "Related Topics",
            relationTo: "resource-topics",
            hasMany: true,
            admin: {
                description:
                    "Optional additional topics that help customers discover this guide.",
            },
        },
        {
            name: "content",
            type: "richText",
            label: "Guide Content",
            required: true,
            admin: {
                description:
                    "Structure the article with clear headings, concise paragraphs, lists and relevant links.",
            },
            hooks: {
                beforeValidate: [convertHtmlRichText],
            },
            editor: createResourceRichTextEditor(
                "Start writing the guide content..."
            ),
        },
        {
            name: "readTimeMinutes",
            type: "number",
            label: "Reading Time Override (minutes)",
            min: 1,
            admin: {
                description:
                    "Leave blank to calculate reading time automatically from the guide content.",
            },
        },
        {
            name: "coverImage",
            type: "upload",
            label: "Cover Image",
            relationTo: "media",
            admin: {
                description:
                    "Displayed on guide cards. Use a clear landscape image with meaningful alternative text.",
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
                    "Controls the guide order within its topic. Lower numbers appear first.",
            },
        },
    ],
};
