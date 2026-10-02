import { env } from "@/config/env";
import type { MetadataRoute } from "next";

import { SERVER_URL } from "@/lib/constants/app";
import { PATH_CASK_MASTERS, PATH_DISTILLERIES } from "@/lib/constants/path";

function getSiteUrl() {
    return (SERVER_URL || "http://localhost:3000").replace(/\/+$/, "");
}

type ChangeFrequency = NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
>;

function getApiBaseUrl() {
    return env.apiUrl.replace(/\/+$/, "");
}

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
        // keep this uncached; we want sitemap to reflect latest public catalog
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }
    return (await res.json()) as T;
}

async function fetchAllIdsFromPaginatedEndpoint({
    urlForPage,
    maxPages = 50,
}: {
    urlForPage: (page: number) => string;
    maxPages?: number;
}) {
    const ids: string[] = [];

    for (let page = 1; page <= maxPages; page++) {
        const data = await fetchJson<{
            data?: Array<{ id?: string | number }>;
            totalPages?: number;
        }>(urlForPage(page));

        const pageIds =
            data?.data
                ?.map((x) => x?.id)
                .filter(
                    (x): x is string | number => x !== undefined && x !== null
                )
                .map(String) ?? [];

        ids.push(...pageIds);

        // stop early if backend tells us totalPages or returns empty
        if (data?.totalPages && page >= data.totalPages) break;
        if (!data?.data || data.data.length === 0) break;
    }

    return Array.from(new Set(ids));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getSiteUrl();
    const now = new Date();
    const apiBaseUrl = getApiBaseUrl();

    const staticRoutes = [
        "/",
        "/marketplace",
        "/distillery",
        "/terms-of-use",
        "/terms-of-use/buyer",
        "/terms-of-use/supplier",
    ] as const;

    const items: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
        url: `${baseUrl}${path}`,
        lastModified: now,
        changeFrequency: (path === "/" ? "daily" : "weekly") as ChangeFrequency,
        priority: path === "/" ? 1 : 0.7,
    }));

    return items;
}
