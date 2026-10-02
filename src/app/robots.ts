import type { MetadataRoute } from "next";

import { SERVER_URL } from "@/lib/constants/app";

function getSiteUrl() {
    return (SERVER_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getSiteUrl();

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin",
                    "/api-fe",
                    "/settings",
                    "/checkout",
                    "/payout",
                    "/docusign",
                    "/buying",
                    "/selling",
                    "/log-in",
                    "/sign-up",
                    "/forgot-password",
                    "/reset-password",
                    "/verify-user",
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
