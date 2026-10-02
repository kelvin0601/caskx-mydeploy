import type {
    ResourceFaq,
    ResourceFeaturedItem,
} from "@/payload/types/resources";
import type {
    ResourceGuideCardData,
    ResourceTopicCardData,
} from "@/modules/resources/types/card";
import type { ResourceSearchParams } from "@/modules/resources/utils/search-params";

export type ResourceLivePreviewCatalog = {
    resources: ResourceFeaturedItem[];
    faqs: ResourceFaq[];
};

export type ResourceListingProps = {
    topics: ResourceTopicCardData[];
    guideResults: {
        cards: ResourceGuideCardData[];
        page: number;
        totalPages: number;
    } | null;
    featuredResources: ResourceFeaturedItem[];
    popularFaqs: ResourceFaq[];
    params: ResourceSearchParams;
    search: string;
    livePreviewCatalog?: ResourceLivePreviewCatalog;
    livePreviewTopicId?: string;
};
