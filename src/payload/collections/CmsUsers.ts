import type { CollectionConfig } from "payload";
import { cmsAdministrator } from "../access.ts";

export const CmsUsers: CollectionConfig = {
    slug: "cms-users",
    labels: {
        singular: "CMS User",
        plural: "CMS Users",
    },
    auth: true,
    admin: {
        useAsTitle: "email",
        group: "System",
        description:
            "Manage access for editors and administrators of the content management system.",
    },
    access: {
        admin: ({ req }) => Boolean(req.user),
        read: cmsAdministrator,
        create: cmsAdministrator,
        update: cmsAdministrator,
        delete: cmsAdministrator,
    },
    fields: [
        {
            name: "role",
            type: "select",
            label: "Access Level",
            required: true,
            // The first CMS account must be able to manage later editors.
            defaultValue: "administrator",
            saveToJWT: true,
            admin: {
                description:
                    "Editors manage content. Administrators can also manage CMS users.",
            },
            options: [
                { label: "Editor", value: "editor" },
                { label: "Administrator", value: "administrator" },
            ],
        },
    ],
};
