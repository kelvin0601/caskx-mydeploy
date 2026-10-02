import type { ResourceFaq, ResourceFaqGroup } from "@/payload/types/resources";

export type FaqGroup = {
    id: string;
    title: string;
    faqs: ResourceFaq[];
};

function relationId(value: ResourceFaq["group"]) {
    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }
    return value ? String(value.id) : null;
}

export function buildFaqGroups(
    faqGroups: ResourceFaqGroup[],
    faqs: ResourceFaq[]
): FaqGroup[] {
    const groupIds = new Set(faqGroups.map((group) => String(group.id)));
    const configuredGroups = faqGroups.flatMap((group) => {
        const groupFaqs = faqs.filter(
            (faq) => relationId(faq.group) === String(group.id)
        );

        return groupFaqs.length
            ? [{ id: group.slug, title: group.title, faqs: groupFaqs }]
            : [];
    });
    const generalFaqs = faqs.filter((faq) => {
        const groupId = relationId(faq.group);
        return !groupId || !groupIds.has(groupId);
    });

    return generalFaqs.length
        ? [
              ...configuredGroups,
              { id: "general", title: "General", faqs: generalFaqs },
          ]
        : configuredGroups;
}
