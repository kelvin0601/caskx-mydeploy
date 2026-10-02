"use client";

import ListCardData from "@/components/shared/list-casks";
import type {
    ResourceGuideCardData,
    ResourceTopicCardData,
} from "@/modules/resources/types/card";
import ResourceGuideCard from "./resource-guide-card";
import ResourceTopicCard from "./resource-topic-card";

export const RESOURCE_SLIDE_ITEM_CLASS =
    "w-[calc((100%-3rem)/4)] tb:w-[16.0625rem] mb:w-[16.8125rem]";
export const RESOURCE_SLIDE_CLASS =
    "!py-0 mb:!pb-0 [&_*[data-dot-active='true']]:!bg-bd-inverse [&_*[data-dot='true']]:bg-bd-surface";

export function ResourceTopicSlideList({
    topics,
}: {
    topics: readonly ResourceTopicCardData[];
}) {
    return (
        <ListCardData<ResourceTopicCardData>
            type="custom"
            lists={topics}
            renderItem={(topic) => <ResourceTopicCard topic={topic} />}
            getItemKey={(topic) => topic.id}
            itemClassName={RESOURCE_SLIDE_ITEM_CLASS}
            opts={{
                align: "start",
                slidesToScroll: 1,
            }}
            pagination
            className={RESOURCE_SLIDE_CLASS}
        />
    );
}

export function ResourceGuideSlideList({
    guides,
}: {
    guides: readonly ResourceGuideCardData[];
}) {
    return (
        <ListCardData<ResourceGuideCardData>
            type="custom"
            lists={guides}
            renderItem={(guide) => <ResourceGuideCard guide={guide} />}
            getItemKey={(guide) => guide.id}
            itemClassName={RESOURCE_SLIDE_ITEM_CLASS}
            opts={{
                align: "start",
                slidesToScroll: 1,
            }}
            pagination
            className={RESOURCE_SLIDE_CLASS}
        />
    );
}
