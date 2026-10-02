import { Media } from "./Media.ts";
import { CmsUsers } from "./CmsUsers.ts";
import { ResourceFaqGroups } from "./ResourceFaqGroups.ts";
import { ResourceFaqs } from "./ResourceFaqs.ts";
import { ResourceGuides } from "./ResourceGuides.ts";
import { ResourceTopics } from "./ResourceTopics.ts";

export const resourceCollections = [
    ResourceTopics,
    ResourceGuides,
    ResourceFaqGroups,
    ResourceFaqs,
    Media,
] as const;

export {
    CmsUsers,
    Media,
    ResourceFaqGroups,
    ResourceFaqs,
    ResourceGuides,
    ResourceTopics,
};
