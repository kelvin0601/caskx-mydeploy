import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",
    crossOrigin: "anonymous",
    compiler: {
        removeConsole: {
            exclude: [
                ...(process.env.NODE_ENV === "development"
                    ? ["error", "warn", "log", "info"]
                    : ["error"]),
            ],
        },
    },
    images: {
        minimumCacheTTL: 3600,
        deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
        imageSizes: [32, 48, 64, 96, 128, 160, 256, 384],
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "3001",
                pathname: "/api-cms/media/file/**",
            },
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    logging: {
        fetches: {
            fullUrl: process.env.NODE_ENV === "development",
        },
    },
    async rewrites() {
        //remove it when we back to normal
        return [
            {
                source: "/api/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
            },
        ];
    },
    async redirects() {
        return [
            // {
            //     source: "/buying/bids",
            //     destination: "/profile/offers",
            //     permanent: true,
            // },
            // {
            //     source: "/buying/payments",
            //     destination: "/profile/payments",
            //     permanent: true,
            // },
            // {
            //     source: "/selling/asks",
            //     destination: "/profile/listings",
            //     permanent: true,
            // },
        ];
    },
    async headers() {
        return [
            {
                source: "/api-fe/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,DELETE,PATCH,POST,PUT",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
                    },
                ],
            },
        ];
    },
};

export default withBundleAnalyzer({
    enabled:
        process.env.ANALYZE === "true" &&
        process.env.NODE_ENV === "development",
})(withPayload(nextConfig));
