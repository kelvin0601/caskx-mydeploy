jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@payload-config", () => ({}), { virtual: true });
jest.mock("payload", () => ({
    getPayload: async () => ({
        find: mockFind,
        findGlobal: mockFindGlobal,
    }),
}));
jest.mock("react", () => ({ cache: (fn: unknown) => fn }));

import { resourceService } from "@/payload/services/ResourceService";

const topic = {
    id: 1,
    title: "Buying",
    slug: "buying",
    description: "Buying casks",
    icon: "buying",
    previousSlugs: [{ slug: "buying-casks" }],
};
const faqGroup = {
    id: 10,
    title: "Transactions",
    slug: "transactions",
};
const content = {
    root: {
        type: "root",
        version: 1,
        children: [],
        direction: null,
        format: "",
        indent: 0,
    },
};
const guide = (id: number) => ({
    id,
    title: `Guide ${id}`,
    slug: `guide-${id}`,
    excerpt: "An introduction",
    primaryTopic: topic,
    content,
    readTimeMinutes: 5,
    previousSlugs: [{ slug: `old-guide-${id}` }],
});
const faq = (id: number) => ({
    id,
    question: `FAQ ${id}`,
    answer: content,
    group: faqGroup,
    topics: [topic],
});
const mockFind = jest.fn();
const mockFindGlobal = jest.fn();
const find = mockFind;
const findGlobal = mockFindGlobal;

beforeEach(() => {
    jest.clearAllMocks();
    find.mockImplementation(async ({ collection }) =>
        collection === "resource-topics"
            ? { docs: [topic] }
            : collection === "resource-faq-groups"
              ? { docs: [faqGroup] }
              : collection === "resource-faqs"
                ? { docs: [faq(4)] }
                : { docs: [guide(2), guide(3)], page: 1, totalPages: 1 }
    );
    findGlobal.mockResolvedValue({
        featuredResources: [
            { relationTo: "resource-faqs", value: 4 },
            { relationTo: "resource-guides", value: 3 },
            { relationTo: "resource-guides", value: 2 },
        ],
        popularFaqs: [],
    });
});

it("keeps the editorial order across featured guides and FAQs", async () => {
    const result = await resourceService.getFeaturedResources();

    expect(result.map((item) => `${item.relationTo}:${item.value.id}`)).toEqual(
        ["resource-faqs:4", "resource-guides:3", "resource-guides:2"]
    );
    expect(find).toHaveBeenCalledWith(
        expect.objectContaining({
            collection: "resource-guides",
            overrideAccess: false,
            draft: false,
            where: {
                and: [
                    { _status: { equals: "published" } },
                    { primaryTopic: { in: [1] } },
                    { id: { in: [3, 2] } },
                ],
            },
        })
    );
    expect(find).toHaveBeenCalledWith(
        expect.objectContaining({
            collection: "resource-faqs",
            overrideAccess: false,
            draft: false,
            where: {
                and: [
                    { _status: { equals: "published" } },
                    { id: { in: [4] } },
                ],
            },
        })
    );
    expect(findGlobal).toHaveBeenCalledWith({
        slug: "resource-settings",
        depth: 0,
        overrideAccess: true,
    });
});

it("loads FAQ groups from their own collection", async () => {
    await expect(resourceService.getFaqGroups()).resolves.toEqual([faqGroup]);
    expect(find).toHaveBeenCalledWith(
        expect.objectContaining({
            collection: "resource-faq-groups",
            overrideAccess: false,
            draft: false,
            where: { _status: { equals: "published" } },
        })
    );
});

it("keeps legacy featured guide selections available during migration", async () => {
    findGlobal.mockResolvedValueOnce({
        featuredResources: [],
        featuredGuides: [3, 2],
        popularFaqs: [],
    });

    const result = await resourceService.getFeaturedResources();

    expect(result.map((item) => item.value.id)).toEqual([3, 2]);
});

it("loads explicitly selected popular FAQs without requiring a topic", async () => {
    findGlobal.mockResolvedValueOnce({
        featuredResources: [],
        popularFaqs: [4],
    });

    await resourceService.getFaqs(true);

    expect(findGlobal).toHaveBeenCalledWith({
        slug: "resource-settings",
        depth: 0,
        overrideAccess: true,
    });
    expect(find).toHaveBeenLastCalledWith(
        expect.objectContaining({
            collection: "resource-faqs",
            overrideAccess: false,
            draft: false,
            where: {
                and: [
                    { _status: { equals: "published" } },
                    { id: { in: [4] } },
                ],
            },
        })
    );
});

it("loads all published FAQs for the listing preview catalog", async () => {
    await resourceService.getFaqs();

    expect(find).toHaveBeenLastCalledWith(
        expect.objectContaining({
            collection: "resource-faqs",
            where: {
                and: [{ _status: { equals: "published" } }],
            },
        })
    );
});

it("searches all published guides", async () => {
    await resourceService.getGuides({ search: "cask", page: 2 });
    expect(findGlobal).not.toHaveBeenCalled();
    expect(find).toHaveBeenLastCalledWith(
        expect.objectContaining({
            page: 2,
            limit: 12,
            where: {
                and: [
                    { _status: { equals: "published" } },
                    { primaryTopic: { in: [1] } },
                    {
                        or: [
                            { title: { like: "cask" } },
                            { excerpt: { like: "cask" } },
                        ],
                    },
                ],
            },
        })
    );
});

it("does not load a guide when its topic is unavailable to public readers", async () => {
    expect(
        await resourceService.getGuide("unpublished-topic", "guide-2")
    ).toBeNull();
    expect(find).toHaveBeenCalledTimes(1);
});

it("resolves previous topic and guide slugs to the canonical documents", async () => {
    const page = await resourceService.getGuidePage(
        "buying-casks",
        "old-guide-2"
    );

    expect(page).toEqual(
        expect.objectContaining({
            topic: expect.objectContaining({ slug: "buying" }),
            guide: expect.objectContaining({ slug: "guide-2" }),
        })
    );
});

it("derives article counts and propagates database failures", async () => {
    const [topicCard] = await resourceService.getTopicCards();
    expect(topicCard).toEqual(
        expect.objectContaining({
            articleCount: 2,
            firstGuideSlug: "guide-2",
        })
    );
    find.mockRejectedValueOnce(new Error("Database unavailable"));
    await expect(resourceService.getTopicCards()).rejects.toThrow(
        "Database unavailable"
    );
});
