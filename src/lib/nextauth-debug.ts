import { env } from "@/config/env";

const NEXTAUTH_DEBUG = env.nextAuthDebug;

type ParsedUrl = {
    origin?: string;
    path?: string;
};

type HeaderValue = string | string[] | undefined;
type HeaderRecord = Record<string, HeaderValue>;
type RequestLike = {
    headers?: Headers | HeaderRecord;
    method?: string;
    url?: string;
    nextUrl?: URL;
};

const normalizeUrl = (value?: string) => {
    if (!value) return undefined;
    return value?.startsWith("http") ? value : `https://${value}`;
};

const parseUrl = (value?: string): ParsedUrl => {
    if (!value) return {};
    try {
        const url = new URL(value);
        return { origin: url.origin, path: url.pathname };
    } catch {
        return {};
    }
};

const getHeaderValue = (
    headers: Headers | HeaderRecord | undefined,
    name: string
) => {
    if (!headers) return undefined;
    if (headers instanceof Headers) {
        const value = headers.get(name);
        return value ?? undefined;
    }
    const direct = headers[name];
    const lower = headers[name.toLowerCase()];
    const upper = headers[name.toUpperCase()];
    const value = direct ?? lower ?? upper;
    if (Array.isArray(value)) return value.join(", ");
    return value;
};

export const getNextAuthRequestDebug = (req?: RequestLike) => {
    if (!req) return undefined;
    const nextUrl = req.nextUrl;
    return {
        method: req.method,
        url: req.url,
        nextUrl: nextUrl
            ? {
                  origin: nextUrl.origin,
                  path: nextUrl.pathname,
                  href: nextUrl.href,
              }
            : undefined,
        headers: {
            host: getHeaderValue(req.headers, "host"),
            "x-forwarded-host": getHeaderValue(req.headers, "x-forwarded-host"),
            "x-forwarded-proto": getHeaderValue(
                req.headers,
                "x-forwarded-proto"
            ),
            "x-forwarded-port": getHeaderValue(req.headers, "x-forwarded-port"),
            "x-forwarded-for": getHeaderValue(req.headers, "x-forwarded-for"),
            "cloudfront-forwarded-proto": getHeaderValue(
                req.headers,
                "cloudfront-forwarded-proto"
            ),
            "cf-connecting-ip": getHeaderValue(req.headers, "cf-connecting-ip"),
        },
    };
};

export const logNextAuthDebug = (
    context: string,
    extra?: Record<string, unknown>
) => {
    if (!NEXTAUTH_DEBUG) return;
    if (typeof window !== "undefined") return;

    const nextAuthUrl = env.nextAuthUrl;
    const nextAuthUrlInternal = env.nextAuthUrlInternal;
    const vercelUrl = env.vercelUrl;

    const parsedNextAuth = parseUrl(nextAuthUrl);
    const parsedNextAuthInternal = parseUrl(nextAuthUrlInternal);
    const parsedVercel = parseUrl(normalizeUrl(vercelUrl));

    console.error("[NextAuth debug]", {
        context,
        env: {
            NEXTAUTH_URL: nextAuthUrl,
            NEXTAUTH_URL_INTERNAL: nextAuthUrlInternal,
            VERCEL_URL: vercelUrl,
        },
        resolved: {
            nextAuth: parsedNextAuth,
            nextAuthInternal: parsedNextAuthInternal,
            vercel: parsedVercel,
        },
        ...extra,
    });
};
