import { createServerFeature } from "@payloadcms/richtext-lexical";

export const HTMLImportFeature = createServerFeature({
    feature: {
        ClientFeature:
            "./payload/features/html-import/feature.client#HTMLImportFeatureClient",
    },
    key: "htmlImport",
});
