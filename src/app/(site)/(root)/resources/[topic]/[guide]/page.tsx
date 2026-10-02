import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getResourceGuideRoute } from "@/lib/constants/route";
import { resourceService } from "@/payload/services/ResourceService";
import ResourceTopicGuideLayout from "@/modules/resources/components/resource-topic-guide-layout";

export const revalidate = 60;
type Props = { params: Promise<{ topic: string; guide: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { topic, guide } = await params;
    const page = await resourceService.getGuidePage(topic, guide);

    if (!page) return { title: "Guide Not Found" };

    return {
        title: `${page.guide.title} - ${page.topic.title} - Resources`,
        description: page.guide.excerpt,
    };
}
export default async function ResourceGuidePage({ params }: Props) {
    const { topic, guide } = await params;
    const page = await resourceService.getGuidePage(topic, guide);
    if (!page) notFound();

    if (topic !== page.topic.slug || guide !== page.guide.slug) {
        redirect(getResourceGuideRoute(page.topic.slug, page.guide.slug));
    }

    return (
        <ResourceTopicGuideLayout
            topic={page.topic}
            guides={page.guides}
            guide={page.guide}
        />
    );
}
