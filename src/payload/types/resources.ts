import { z } from "zod";

const id = z.union([z.string(), z.number()]);
const previousSlugs = z
    .array(
        z.object({
            id: id.optional(),
            slug: z.string(),
        })
    )
    .nullish();
export const resourceTopicSchema = z.object({
    id,
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    icon: z.enum(["buying", "selling", "marketplace", "whisky-casks"]),
    previousSlugs,
});
export const resourceFaqGroupSchema = z.object({
    id,
    title: z.string(),
    slug: z.string(),
});
export const resourceRichTextSchema = z.object({
    root: z
        .object({
            type: z.literal("root"),
            version: z.number(),
            children: z.array(
                z
                    .object({ type: z.string(), version: z.number() })
                    .passthrough()
            ),
            direction: z.enum(["ltr", "rtl"]).nullable(),
            format: z.enum([
                "",
                "left",
                "start",
                "center",
                "right",
                "end",
                "justify",
            ]),
            indent: z.number(),
        })
        .passthrough(),
});

export const resourceGuideSchema = z.object({
    id,
    title: z.string(),
    slug: z.string(),
    excerpt: z.string(),
    primaryTopic: z.union([id, resourceTopicSchema, z.null()]),
    content: resourceRichTextSchema,
    readTimeMinutes: z.number().min(1).nullish(),
    coverImage: z
        .union([
            id,
            z.object({
                url: z.string().nullish(),
                alt: z.string(),
            }),
            z.null(),
        ])
        .optional(),
    previousSlugs,
});
export const resourceFaqSchema = z.object({
    id,
    question: z.string(),
    answer: resourceRichTextSchema,
    group: z.union([id, resourceFaqGroupSchema, z.null()]).nullish(),
    topics: z.array(z.union([id, resourceTopicSchema, z.null()])).nullish(),
});
export const resourceFeaturedReferenceSchema = z.discriminatedUnion(
    "relationTo",
    [
        z.object({ relationTo: z.literal("resource-guides"), value: id }),
        z.object({ relationTo: z.literal("resource-faqs"), value: id }),
    ]
);
export const resourceSettingsSchema = z.object({
    featuredResources: z.array(resourceFeaturedReferenceSchema).nullish(),
    featuredGuides: z.array(id).nullish().optional(),
    popularFaqs: z.array(id).nullish(),
});
export const resourceFeaturedItemSchema = z.discriminatedUnion("relationTo", [
    z.object({
        relationTo: z.literal("resource-guides"),
        value: resourceGuideSchema,
    }),
    z.object({
        relationTo: z.literal("resource-faqs"),
        value: resourceFaqSchema,
    }),
]);
export type ResourceTopic = z.infer<typeof resourceTopicSchema>;
export type ResourceFaqGroup = z.infer<typeof resourceFaqGroupSchema>;
export type ResourceGuide = z.infer<typeof resourceGuideSchema>;
export type ResourceFaq = z.infer<typeof resourceFaqSchema>;
export type ResourceFeaturedItem = z.infer<typeof resourceFeaturedItemSchema>;
