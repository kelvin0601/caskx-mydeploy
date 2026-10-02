import type { CollectionConfig, GlobalConfig } from "payload";

type ResourceCollectionVersions = Exclude<
    CollectionConfig["versions"],
    boolean | undefined
>;
type ResourceGlobalVersions = Exclude<
    GlobalConfig["versions"],
    boolean | undefined
>;
type ResourceDrafts = Exclude<
    ResourceCollectionVersions["drafts"],
    boolean | undefined
>;

const resourceDrafts = {
    autosave: {
        interval: 1500,
        showSaveDraftButton: true,
    },
    schedulePublish: {
        timeFormat: "HH:mm",
        timeIntervals: 5,
    },
    validate: false,
} satisfies ResourceDrafts;

export const resourceCollectionVersions = {
    drafts: resourceDrafts,
    maxPerDoc: 50,
} satisfies ResourceCollectionVersions;

export const resourceGlobalVersions = {
    drafts: resourceDrafts,
    max: 50,
} satisfies ResourceGlobalVersions;
