export const env = {
    // App Environment
    nodeEnv: process.env.NODE_ENV || "development",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",

    // API & URLs
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    public_domain: process.env.NEXT_PUBLIC_DOMAIN_TEST,
    serviceUrl: process.env.NEXT_PUBLIC_SERVICE_URL || "http://localhost:3000",
    nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3001",
    nextAuthUrlInternal: process.env.NEXTAUTH_URL_INTERNAL,
    vercelUrl: process.env.VERCEL_URL,
    nextAuthDebug: process.env.NEXTAUTH_DEBUG === "true",

    // App Info
    appName: "Cask Exchange",
    appDescription:
        process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
        "Cask Exchange is a platform for buying and selling casks of whiskey.",
    appVersion: process.env.APP_VERSION || "1.0.0",

    // Authentication
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
    hmacSecret: process.env.HMAC_SECRET,

    // Integration Tokens
    loraSftAuthToken: process.env.LORA_SFT_AUTH_TOKEN,
    stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "",
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000",

    // Feature Flags & Limits
    latestProductsLimit: Number(process.env.LATEST_PRODUCTS_LIMIT) || 8,
    defaultPageSize: Number(process.env.DEFAULT_PAGE_SIZE) || 10,

    // Logging/Debug
    debug: process.env.DEBUG,
    logStream: process.env.LOG_STREAM === "true",
    enableReactScan: process.env.NEXT_PUBLIC_ENABLE_REACT_SCAN === "true",
    enableReactQueryDevtools:
        process.env.NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS === "true",
    payloadCmsEnabled: process.env.PAYLOAD_CMS_ENABLED === "true",
} as const;

export type Env = typeof env;
