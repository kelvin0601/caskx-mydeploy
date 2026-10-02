import type { ResourceTopic } from "@/payload/types/resources";

export type ResourceTopicCardData = {
    id: string;
    title: string;
    description: string;
    articleCount: number;
    actionLabel: string;
    href: string;
    icon: ResourceTopic["icon"];
};

export type ResourceGuideCardData = {
    id: string;
    topicId: string;
    href: string;
    title: string;
    description: string;
    readTime: string;
    imageSrc: string;
    imageAlt: string;
};
