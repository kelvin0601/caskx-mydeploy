import {
    authenticatedCmsUser,
    cmsAdministrator,
    isCmsUser,
    readPublishedResource,
} from "@/payload/access";

const accessArgs = (
    user: unknown
): Parameters<typeof authenticatedCmsUser>[0] =>
    ({ req: { user } }) as Parameters<typeof authenticatedCmsUser>[0];

const editor = { collection: "cms-users", role: "editor" };
const administrator = {
    collection: "cms-users",
    role: "administrator",
};

describe("Payload CMS access control", () => {
    it("only recognizes users from the CMS auth collection", () => {
        expect(isCmsUser(editor)).toBe(true);
        expect(isCmsUser(administrator)).toBe(true);
        expect(isCmsUser({ collection: "users", role: "administrator" })).toBe(
            false
        );
        expect(isCmsUser({ collection: "cms-users", role: "owner" })).toBe(
            false
        );
        expect(isCmsUser(null)).toBe(false);
    });

    it("allows resource editing to CMS editors and administrators only", () => {
        expect(authenticatedCmsUser(accessArgs(editor))).toBe(true);
        expect(authenticatedCmsUser(accessArgs(administrator))).toBe(true);
        expect(authenticatedCmsUser(accessArgs(null))).toBe(false);
    });

    it("limits user management to CMS administrators", () => {
        expect(cmsAdministrator(accessArgs(administrator))).toBe(true);
        expect(cmsAdministrator(accessArgs(editor))).toBe(false);
    });

    it("returns published-only constraints to public readers", () => {
        expect(readPublishedResource(accessArgs(null))).toEqual({
            _status: { equals: "published" },
        });
        expect(readPublishedResource(accessArgs(editor))).toBe(true);
    });
});
