import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getResourceGuideRoute } from "@/lib/constants/route";
import type { ResourceSearchParams } from "@/modules/resources/utils/search-params";
import { resourceService } from "@/payload/services/ResourceService";

export const revalidate = 60;

type Props = {
    params: Promise<{ topic: string }>;
    searchParams: Promise<
        ResourceSearchParams & { article?: string | string[] }
    >;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { topic } = await params;
    const item = await resourceService.getTopic(topic);

    if (!item) return { title: "Topic Not Found" };

    return {
        title: `${item.title} - Resources`,
        description: item.description,
    };
}

export default async function ResourceTopicPage({
    params,
    searchParams,
}: Props) {
    const [{ topic }, query] = await Promise.all([params, searchParams]);
    const parent = await resourceService.getTopic(topic);
    if (!parent) notFound();
    const guides = await resourceService.getGuidesByTopic(parent.slug);

    const articleParam = query.article;
    const requestedGuide = Array.isArray(articleParam)
        ? articleParam[0]
        : articleParam;
    const targetGuide =
        guides.find((guide) => guide.slug === requestedGuide) ?? guides[0];

    if (!targetGuide) notFound();
    redirect(getResourceGuideRoute(parent.slug, targetGuide.slug));
}
