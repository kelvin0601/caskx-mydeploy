import * as migration_20260917_112700_fix_resource_faq_groups from "./20260917_112700_fix_resource_faq_groups";
import * as migration_20260918_052500_resource_cms_workflow from "./20260918_052500_resource_cms_workflow";

export const migrations = [
    {
        up: migration_20260917_112700_fix_resource_faq_groups.up,
        down: migration_20260917_112700_fix_resource_faq_groups.down,
        name: "20260917_112700_fix_resource_faq_groups",
    },
    {
        up: migration_20260918_052500_resource_cms_workflow.up,
        down: migration_20260918_052500_resource_cms_workflow.down,
        name: "20260918_052500_resource_cms_workflow",
    },
];
