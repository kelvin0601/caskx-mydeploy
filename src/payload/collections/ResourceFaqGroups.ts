import { slugField, type CollectionConfig } from "payload";
import { authenticatedCmsUser, readPublishedResource } from "../access.ts";
import {
    revalidateResourceAfterChange,
    revalidateResourceAfterDelete,
} from "../hooks/resources/revalidate.ts";
import {
    createResourceLivePreview,
    createResourcePreview,
} from "../preview/resources.ts";
import { resourceCollectionVersions } from "../versions.ts";

export const ResourceFaqGroups: CollectionConfig = {
    slug: "resource-faq-groups",
    labels: {
        singular: "FAQ Group",
        plural: "FAQ Groups",
    },
    admin: {
        useAsTitle: "title",
        group: "Resources",
        description:
            "Create and arrange the groups displayed on the Resources FAQ page.",
        listSearchableFields: ["title", "slug"],
        defaultColumns: ["title", "slug", "sortOrder", "_status"],
        livePreview: createResourceLivePreview("resource-faq-groups"),
        preview: createResourcePreview("resource-faq-groups"),
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
            name: "title",
            type: "text",
            label: "Group Name",
            required: true,
            index: true,
        },
        slugField(),
        {
            name: "sortOrder",
            type: "number",
            label: "Display Order",
            required: true,
            defaultValue: 0,
            index: true,
            admin: {
                description:
                    "Controls the group order on the FAQ page. Lower numbers appear first.",
            },
        },
    ],
};
