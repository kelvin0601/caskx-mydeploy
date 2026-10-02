import type { CollectionConfig } from "payload";
import { authenticatedCmsUser, readPublicMedia } from "../access.ts";

export const Media: CollectionConfig = {
    slug: "media",
    labels: {
        singular: "Resource Image",
        plural: "Resource Images",
    },
    admin: {
        useAsTitle: "filename",
        group: "Resources",
        description: "Upload and manage images used across Resources content.",
        defaultColumns: ["filename", "mimeType", "filesize", "updatedAt"],
    },
    access: {
        read: readPublicMedia,
        create: authenticatedCmsUser,
        update: authenticatedCmsUser,
        delete: authenticatedCmsUser,
    },
    upload: {
        staticDir: "media",
        mimeTypes: ["image/*"],
        imageSizes: [
            {
                name: "card",
                width: 768,
                height: 512,
                position: "centre",
            },
            {
                name: "thumbnail",
                width: 400,
                height: 267,
                position: "centre",
            },
        ],
        adminThumbnail: "thumbnail",
    },
    fields: [
        {
            name: "alt",
            type: "text",
            label: "Alternative Text",
            required: true,
            admin: {
                description:
                    "Describe the image's purpose for customers who use screen readers.",
            },
        },
    ],
};
