import { s3Storage } from "@payloadcms/storage-s3";
import type { Plugin } from "payload";
import { PAYLOAD_S3_CONFIG } from "./constants.ts";

if (
    PAYLOAD_S3_CONFIG.bucket &&
    Boolean(PAYLOAD_S3_CONFIG.accessKeyId) !==
        Boolean(PAYLOAD_S3_CONFIG.secretAccessKey)
) {
    throw new Error(
        "S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be configured together."
    );
}

export const payloadStoragePlugins: Plugin[] = [
    s3Storage({
        alwaysInsertFields: true,
        bucket: PAYLOAD_S3_CONFIG.bucket || "local-media",
        collections: {
            media: PAYLOAD_S3_CONFIG.prefix
                ? { prefix: PAYLOAD_S3_CONFIG.prefix }
                : true,
        },
        config: {
            region: PAYLOAD_S3_CONFIG.region,
            ...(PAYLOAD_S3_CONFIG.endpoint
                ? { endpoint: PAYLOAD_S3_CONFIG.endpoint }
                : {}),
            ...(PAYLOAD_S3_CONFIG.accessKeyId &&
            PAYLOAD_S3_CONFIG.secretAccessKey
                ? {
                      credentials: {
                          accessKeyId: PAYLOAD_S3_CONFIG.accessKeyId,
                          secretAccessKey: PAYLOAD_S3_CONFIG.secretAccessKey,
                      },
                  }
                : {}),
            forcePathStyle: true,
        },
        enabled: Boolean(PAYLOAD_S3_CONFIG.bucket),
    }),
];
