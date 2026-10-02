import { getResourceGuideRoute } from "@/lib/constants/route";
import type { ResourceGuideCardData } from "@/modules/resources/types/card";
import { getReadTimeMinutes } from "@/modules/resources/utils/read-time";
import type { ResourceGuide } from "@/payload/types/resources";

export function toResourceGuideCard(
    guide: ResourceGuide
): ResourceGuideCardData | null {
    const topic = guide.primaryTopic;
    if (!topic || typeof topic !== "object") return null;

    const media =
        typeof guide.coverImage === "object" ? guide.coverImage : null;

    return {
        id: String(guide.id),
        topicId: String(topic.id),
        title: guide.title,
        href: getResourceGuideRoute(topic.slug, guide.slug),
        description: guide.excerpt,
        readTime: `${getReadTimeMinutes({
            content: guide.content,
            override: guide.readTimeMinutes,
        })} mins read`,
        imageSrc: media?.url ?? "",
        imageAlt: media?.alt ?? guide.title,
    };
}
