import { slugField, type CollectionConfig } from "payload";
import { authenticatedCmsUser, readPublishedResource } from "../access.ts";
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

export const ResourceTopics: CollectionConfig = {
    slug: "resource-topics",
    labels: {
        singular: "Resource Topic",
        plural: "Resource Topics",
    },
    admin: {
        useAsTitle: "title",
        group: "Resources",
        description:
            "Create and organise the topics customers use to browse the Resources library.",
        listSearchableFields: ["title", "slug"],
        defaultColumns: ["title", "slug", "sortOrder", "updatedAt"],
        livePreview: createResourceLivePreview("resource-topics"),
        preview: createResourcePreview("resource-topics"),
    },
    access: {
        read: readPublishedResource,
        create: authenticatedCmsUser,
        update: authenticatedCmsUser,
        delete: authenticatedCmsUser,
    },
    hooks: {
        beforeChange: [trackPreviousSlugs("resource-topics")],
        afterChange: [revalidateResourceAfterChange],
        afterDelete: [revalidateResourceAfterDelete],
    },
    versions: resourceCollectionVersions,
    defaultSort: "sortOrder",
    fields: [
        {
            name: "title",
            type: "text",
            label: "Topic Name",
            required: true,
            index: true,
        },
        slugField(),
        previousSlugsField,
        {
            name: "description",
            type: "textarea",
            label: "Topic Summary",
            required: true,
            admin: {
                description:
                    "A concise introduction displayed on the Resources landing page.",
            },
        },
        {
            name: "icon",
            type: "select",
            label: "Topic Icon",
            required: true,
            admin: {
                description:
                    "Select the icon that best represents this topic on the Resources landing page.",
            },
            options: [
                { label: "Buying", value: "buying" },
                { label: "Selling", value: "selling" },
                { label: "Marketplace", value: "marketplace" },
                { label: "Whisky Casks", value: "whisky-casks" },
            ],
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
                    "Controls the topic order. Lower numbers appear first.",
            },
        },
    ],
};
