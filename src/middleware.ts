import {
    ensureValidSession,
    getSessionCookieOptions,
} from "@/lib/auth-middleware";
import { env } from "@/config/env";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse, userAgent } from "next/server";
import { KEY_PREV_PAGE, KEY_RESET_PREV_PAGE } from "./lib/constants/keyword";
import {
    ROUTE_ADMIN,
    ROUTE_AUTH,
    ROUTE_AUTH_EXCLUDE,
    ROUTE_CMS,
    ROUTE_PUBLIC,
} from "./lib/constants/route";

function isRouteOrChild(pathname: string, route: string) {
    return pathname === route || pathname.startsWith(`${route}/`);
}

export async function middleware(req: NextRequest) {
    // Allow GoogleBot to access
    // const { isBot } = userAgent(req);

    // if (isBot) {
    //     return NextResponse.next();
    // }

    const url = new URL(req.url);
    const origin = url.origin;
    // normalize pathname to avoid trailing-slash mismatches
    const rawPathname = url.pathname;
    const pathname =
        rawPathname !== "/" && rawPathname.endsWith("/")
            ? rawPathname.slice(0, -1)
            : rawPathname;

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-url", req.url);
    requestHeaders.set("x-origin", origin);
    requestHeaders.set("x-pathname", pathname);

    // Keep the Payload feature flag for CMS routes, but require an authenticated
    // commerce administrator before exposing the CMS Admin Panel.
    const isCmsAdminRoute = isRouteOrChild(pathname, ROUTE_CMS.ADMIN);
    const isPayloadRoute = [
        ROUTE_CMS.ADMIN,
        ROUTE_CMS.GRAPHQL,
        ROUTE_CMS.GRAPHQL_PLAYGROUND,
    ].some((route) => isRouteOrChild(pathname, route));

    if (isPayloadRoute) {
        if (!env.payloadCmsEnabled) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const sessionToken = await getToken({ req });
        if (isCmsAdminRoute && !sessionToken?.accessToken) {
            return NextResponse.redirect(new URL(ROUTE_AUTH.LOGIN, req.url));
        }
        if (isCmsAdminRoute && sessionToken?.role !== "Admin") {
            return NextResponse.redirect(new URL(ROUTE_PUBLIC.HOME, req.url));
        }

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    }

    if (isRouteOrChild(pathname, ROUTE_PUBLIC.RESOURCE_PREVIEW)) {
        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    }

    const secFetchDest = req.headers.get("sec-fetch-dest") || "";
    const secFetchMode = req.headers.get("sec-fetch-mode") || "";
    const purpose =
        req.headers.get("purpose") || req.headers.get("sec-purpose") || "";
    // Treat ONLY real navigations as top-level; ignore prefetch/probes/background fetches
    const isTopNavigation =
        (secFetchDest === "document" || secFetchMode === "navigate") &&
        !["prefetch", "prerender"].includes(purpose);

    const sessionToken = await getToken({ req });
    const includesAuth = Object.values(ROUTE_AUTH)
        .filter((route) => !ROUTE_AUTH_EXCLUDE.includes(route))
        .includes(pathname);
    const includesAdmin = Object.values(ROUTE_ADMIN).some((route) =>
        isRouteOrChild(pathname, route)
    );

    const isAdmin = sessionToken?.role === "Admin";

    if (sessionToken && includesAuth && sessionToken?.accessToken) {
        const prevUrl =
            req.cookies.get(KEY_PREV_PAGE)?.value || ROUTE_PUBLIC.HOME;
        const response = NextResponse.redirect(new URL(prevUrl, req.url));
        response.cookies.delete(KEY_PREV_PAGE);
        response.cookies.delete(KEY_RESET_PREV_PAGE);
        return response;
    } else if (
        !sessionToken?.accessToken &&
        !includesAuth &&
        !ROUTE_AUTH_EXCLUDE.includes(pathname)
    ) {
        const response = NextResponse.redirect(
            new URL(ROUTE_AUTH.LOGIN, req.url)
        );
        const isResetPrevPage = req.cookies.get(KEY_RESET_PREV_PAGE)?.value;
        const fullPath = pathname + url.search;
        // Avoid overwriting with "/" or auth routes; keep existing when present
        const isAuthRoute = Object.values(ROUTE_AUTH).includes(pathname);
        const isWellKnown = pathname.startsWith("/.well-known");
        const canUseFullPath =
            fullPath !== "/" && !isAuthRoute && !isWellKnown && isTopNavigation;

        if (isResetPrevPage) {
            const newPrev = canUseFullPath ? fullPath : ROUTE_PUBLIC.HOME;
            response.cookies.set(KEY_PREV_PAGE, newPrev, {
                path: "/",
                maxAge: 60 * 10,
            });
            // Apply once then clear
            response.cookies.delete(KEY_RESET_PREV_PAGE);
        } else {
            // Only set when we have a valid full path. Otherwise, keep whatever exists.
            if (canUseFullPath) {
                response.cookies.set(KEY_PREV_PAGE, fullPath, {
                    path: "/",
                    maxAge: 60 * 10,
                });
            }
        }
        return response;
    } else if (!isAdmin && includesAdmin) {
        return NextResponse.redirect(new URL(ROUTE_PUBLIC.HOME, req.url));
    }

    // Refresh expired token BEFORE creating the forwarded response so the
    // updated session cookie propagates to getServerSession() downstream.
    let refreshedCookie: string | null = null;
    let shouldClearCookies = false;
    if (sessionToken?.accessToken) {
        const refreshed = await ensureValidSession(sessionToken);
        console.log("refreshed______", refreshed);
        if (refreshed && "error" in refreshed) {
            shouldClearCookies = true;
        } else if (refreshed) {
            refreshedCookie = refreshed.encodedCookie;
            const { name } = getSessionCookieOptions();
            const existing = requestHeaders.get("cookie") || "";
            const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            requestHeaders.set(
                "cookie",
                existing.replace(
                    new RegExp(`${escaped}=[^;]*`),
                    `${name}=${refreshedCookie}`
                )
            );
        }
    }

    if (shouldClearCookies) {
        const isPublicPage =
            ROUTE_AUTH_EXCLUDE.includes(pathname) ||
            Object.values(ROUTE_AUTH).includes(pathname);

        const response = isPublicPage
            ? NextResponse.next({
                  request: { headers: requestHeaders },
              })
            : NextResponse.redirect(new URL(ROUTE_AUTH.LOGIN, req.url));

        if (!isPublicPage) {
            const fullPath = pathname + url.search;
            const isWellKnown = pathname.startsWith("/.well-known");
            if (fullPath !== "/" && !isWellKnown && isTopNavigation) {
                response.cookies.set(KEY_PREV_PAGE, fullPath, {
                    path: "/",
                    maxAge: 60 * 10,
                });
            }
        }

        const { name } = getSessionCookieOptions();
        const isSecure =
            process.env.NODE_ENV === "production" ||
            req.url.startsWith("https://");
        const deleteCookieHeader = (cookieName: string) =>
            `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${isSecure ? "; Secure" : ""}`;

        response.headers.append("Set-Cookie", deleteCookieHeader(name));
        response.headers.append(
            "Set-Cookie",
            deleteCookieHeader("next-auth.session-token")
        );
        response.headers.append(
            "Set-Cookie",
            deleteCookieHeader("__Secure-next-auth.session-token")
        );

        return response;
    }

    const response = NextResponse.next({
        request: { headers: requestHeaders },
    });

    // Also set on the response so the browser persists the refreshed token
    if (refreshedCookie) {
        const { name, options } = getSessionCookieOptions();
        response.cookies.set(name, refreshedCookie, options);
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon\\.ico|images|icons|\\.well-known|terms-of-use).*)",
    ],
};
