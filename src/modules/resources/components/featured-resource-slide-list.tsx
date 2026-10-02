"use client";

import ListCardData from "@/components/shared/list-casks";
import FeaturedResourceCard from "@/modules/resources/components/featured-resource-card";
import {
    RESOURCE_SLIDE_CLASS,
    RESOURCE_SLIDE_ITEM_CLASS,
} from "@/modules/resources/components/resource-slide-card-list";
import type { ResourceFeaturedItem } from "@/payload/types/resources";

export default function FeaturedResourceSlideList({
    resources,
}: {
    resources: ResourceFeaturedItem[];
}) {
    return (
        <ListCardData<ResourceFeaturedItem>
            type="custom"
            lists={resources}
            renderItem={(resource) => (
                <FeaturedResourceCard resource={resource} />
            )}
            getItemKey={(resource) =>
                `${resource.relationTo}-${resource.value.id}`
            }
            itemClassName={RESOURCE_SLIDE_ITEM_CLASS}
            opts={{ align: "start", slidesToScroll: 1 }}
            pagination
            className={RESOURCE_SLIDE_CLASS}
        />
    );
}
