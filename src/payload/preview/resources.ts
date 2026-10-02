import type { LivePreviewConfig } from "payload";
import { RESOURCE_LIVE_PREVIEW_BREAKPOINTS } from "../constants.ts";

export type ResourcePreviewCollection =
    | "resource-faq-groups"
    | "resource-faqs"
    | "resource-guides"
    | "resource-topics";

function getPreviewPath(
    collection: ResourcePreviewCollection,
    data: Record<string, unknown>
) {
    const query = new URLSearchParams({ collection });

    if (typeof data.id === "number" || typeof data.id === "string") {
        query.set("id", String(data.id));
    } else if (typeof data.slug === "string" && data.slug) {
        query.set("slug", data.slug);
    } else {
        return null;
    }

    return `/resources/preview?${query.toString()}`;
}

export function getResourcePreviewUrl(
    collection: ResourcePreviewCollection,
    data: Record<string, unknown>
) {
    const path = getPreviewPath(collection, data);
    if (!path) return null;

    return `/resources/preview/enter?path=${encodeURIComponent(path)}`;
}

export function createResourceLivePreview(
    collection: ResourcePreviewCollection
): LivePreviewConfig {
    return {
        openByDefault: true,
        breakpoints: RESOURCE_LIVE_PREVIEW_BREAKPOINTS,
        url: ({ data }) => getResourcePreviewUrl(collection, data),
    };
}

export function createResourcePreview(collection: ResourcePreviewCollection) {
    return (data: Record<string, unknown>) =>
        getResourcePreviewUrl(collection, data);
}
