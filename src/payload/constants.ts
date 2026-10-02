export const PAYLOAD_S3_CONFIG = {
    bucket: process.env.S3_BUCKET?.trim(),
    accessKeyId: process.env.S3_ACCESS_KEY_ID?.trim(),
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY?.trim(),
    endpoint: process.env.S3_ENDPOINT?.trim(),
    prefix: process.env.S3_PREFIX?.trim(),
    region: process.env.S3_REGION || process.env.AWS_REGION || "us-east-1",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
} as const;

/**
 * Shared device presets for every Resources live preview surface.
 * Keep these aligned with the public Resources responsive layout.
 */
export const RESOURCE_LIVE_PREVIEW_BREAKPOINTS = [
    { name: "mobile", label: "Mobile", width: 390, height: 844 },
    { name: "tablet", label: "Tablet", width: 768, height: 1024 },
    { name: "desktop", label: "Desktop", width: 1200, height: 800 },
] satisfies {
    name: string;
    label: string;
    width: number;
    height: number;
}[];
