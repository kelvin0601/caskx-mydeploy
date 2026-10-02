import Link from "next/link";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import ResourceGuideCard from "@/modules/resources/components/resource-guide-card";
import { toResourceGuideCard } from "@/modules/resources/utils/card-mappers";
import type { ResourceFeaturedItem } from "@/payload/types/resources";

export default function FeaturedResourceCard({
    resource,
}: {
    resource: ResourceFeaturedItem;
}) {
    if (resource.relationTo === "resource-guides") {
        const card = toResourceGuideCard(resource.value);
        return card ? <ResourceGuideCard guide={card} /> : null;
    }

    const faq = resource.value;
    return (
        <article className="hover:border-bd-primary/60 group relative flex h-full min-w-0 flex-col justify-between gap-8 overflow-hidden border border-bd-main bg-bg-sf1 p-6 transition-colors tb:p-5 mb:p-4">
            <Link
                href={`${ROUTE_PUBLIC.RESOURCE_FAQS}#faq-${faq.id}`}
                className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                aria-label={faq.question}
            />
            <div className="flex min-w-0 flex-col gap-3">
                <p className="text-sm font-medium uppercase tracking-wide text-typo-soft">
                    FAQ
                </p>
                <h3 className="break-words text-base font-semibold text-typo-primary transition-colors group-hover:text-typo-brand">
                    {faq.question}
                </h3>
            </div>
            <span className="text-sm font-medium text-typo-primary underline underline-offset-4">
                View answer
            </span>
        </article>
    );
}
