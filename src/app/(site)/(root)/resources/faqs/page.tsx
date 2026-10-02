import type { Metadata } from "next";
import ResourceFaqsModule from "@/modules/resources/faqs";
import { resourceService } from "@/payload/services/ResourceService";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
    title: "FAQs - Resources",
    description:
        "Find answers to frequently asked questions about Cask Exchange and the trading process.",
};

export default async function ResourceFaqsPage() {
    const [faqGroups, faqs] = await Promise.all([
        resourceService.getFaqGroups(),
        resourceService.getFaqs(),
    ]);

    return <ResourceFaqsModule faqGroups={faqGroups} faqs={faqs} />;
}
