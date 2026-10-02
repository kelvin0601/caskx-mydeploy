import {
    ValidationError,
    type CollectionBeforeChangeHook,
    type Field,
} from "payload";

type SlugHistoryCollection = "resource-guides" | "resource-topics";

type SlugHistoryEntry = {
    slug: string;
};

function readSlugHistory(value: unknown): SlugHistoryEntry[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((entry) => {
        if (
            typeof entry === "object" &&
            entry !== null &&
            "slug" in entry &&
            typeof entry.slug === "string" &&
            entry.slug
        ) {
            return [{ slug: entry.slug }];
        }
        return [];
    });
}

export const previousSlugsField: Field = {
    name: "previousSlugs",
    type: "array",
    admin: {
        hidden: true,
    },
    fields: [
        {
            name: "slug",
            type: "text",
            required: true,
        },
    ],
};

export function trackPreviousSlugs(
    collection: SlugHistoryCollection
): CollectionBeforeChangeHook {
    return async ({ data, operation, originalDoc, req }) => {
        const nextSlug = typeof data.slug === "string" ? data.slug : null;
        const currentSlug =
            originalDoc && typeof originalDoc.slug === "string"
                ? originalDoc.slug
                : null;

        if (!nextSlug || nextSlug === currentSlug) return data;

        const conflicts = await req.payload.find({
            collection,
            depth: 0,
            draft: true,
            limit: 1,
            overrideAccess: true,
            where: {
                and: [
                    { "previousSlugs.slug": { equals: nextSlug } },
                    ...(originalDoc?.id
                        ? [{ id: { not_equals: originalDoc.id } }]
                        : []),
                ],
            },
        });

        if (conflicts.docs.length) {
            throw new ValidationError({
                collection,
                id: originalDoc?.id,
                req,
                errors: [
                    {
                        path: "slug",
                        message:
                            "This slug is reserved by another document's redirect history.",
                    },
                ],
            });
        }

        if (operation !== "update" || !currentSlug) return data;

        const history = readSlugHistory(
            data.previousSlugs ?? originalDoc.previousSlugs
        );
        const seen = new Set<string>();
        data.previousSlugs = [{ slug: currentSlug }, ...history]
            .filter(({ slug }) => slug !== nextSlug)
            .filter(({ slug }) => {
                if (seen.has(slug)) return false;
                seen.add(slug);
                return true;
            })
            .slice(0, 20);

        return data;
    };
}
