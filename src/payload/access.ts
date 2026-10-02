import type { Access } from "payload";

type CmsUser = {
    collection?: unknown;
    role?: unknown;
};

const CMS_USER_COLLECTION = "cms-users";

export function isCmsUser(user: unknown): user is CmsUser {
    if (!user || typeof user !== "object") return false;

    const candidate = user as CmsUser;
    return (
        candidate.collection === CMS_USER_COLLECTION &&
        (candidate.role === "editor" || candidate.role === "administrator")
    );
}

export const readPublishedResource: Access = ({ req }) => {
    if (isCmsUser(req.user)) return true;

    return {
        _status: {
            equals: "published",
        },
    };
};

export const authenticatedCmsUser: Access = ({ req }) => isCmsUser(req.user);

export const cmsAdministrator: Access = ({ req }) =>
    isCmsUser(req.user) && req.user.role === "administrator";

export const readPublicMedia: Access = () => true;
