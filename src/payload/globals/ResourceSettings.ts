import type { GlobalConfig } from "payload";
import { authenticatedCmsUser } from "../access.ts";
import { RESOURCE_LIVE_PREVIEW_BREAKPOINTS } from "../constants.ts";
import { revalidateResourceSettings } from "../hooks/resources/revalidate.ts";
import { resourceGlobalVersions } from "../versions.ts";

const RESOURCE_LISTING_PATH = "/resources";

function resourceListingPreviewUrl() {
    return `/resources/preview/enter?path=${encodeURIComponent(RESOURCE_LISTING_PATH)}`;
}

export const ResourceSettings: GlobalConfig = {
    slug: "resource-settings",
    label: "Resource Listing",
    admin: {
        group: "Resources",
        description:
            "Curate the featured content and popular questions shown on the Resources landing page.",
        livePreview: {
            openByDefault: true,
            breakpoints: RESOURCE_LIVE_PREVIEW_BREAKPOINTS,
            url: resourceListingPreviewUrl,
        },
        preview: resourceListingPreviewUrl,
    },
    access: {
        // The global contains editorial IDs and must never be exposed through
        // the public REST API. Public pages read the selected, published
        // documents through the server-only Resources service instead.
        read: authenticatedCmsUser,
        update: authenticatedCmsUser,
    },
    hooks: {
        afterChange: [revalidateResourceSettings],
    },
    versions: resourceGlobalVersions,
    fields: [
        {
            name: "featuredResources",
            type: "relationship",
            label: "Featured Resources",
            relationTo: ["resource-guides", "resource-faqs"],
            hasMany: true,
            maxRows: 10,
            required: true,
            admin: {
                description:
                    "Select and arrange up to four published guides or FAQs for the featured section.",
            },
        },
        {
            name: "featuredGuides",
            type: "relationship",
            relationTo: "resource-guides",
            hasMany: true,
            maxRows: 10,
            admin: {
                hidden: true,
                description:
                    "Legacy featured guide selections retained during the featured resources migration.",
            },
        },
        {
            name: "popularFaqs",
            type: "relationship",
            label: "Popular FAQs",
            relationTo: "resource-faqs",
            hasMany: true,
            admin: {
                description:
                    "Select and arrange the questions displayed in the Popular FAQs section.",
            },
        },
    ],
};
