import { postgresAdapter } from "@payloadcms/db-postgres";
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { createResourceRichTextEditor } from "./payload/editor.ts";
import { payloadStoragePlugins } from "./payload/storage.ts";
import {
    CmsUsers,
    resourceCollections,
    resourceGlobals,
} from "./payload/index.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const databaseURL = process.env.DATABASE_URI;
const payloadCmsEnabled = process.env.PAYLOAD_CMS_ENABLED === "true";
const isProduction = process.env.NODE_ENV === "production";

const configuredServerURL =
    process.env.PAYLOAD_SERVER_URL ||
    (isProduction
        ? process.env.NEXT_PUBLIC_DOMAIN_TEST || "http://localhost:3001"
        : "http://localhost:3001");
const parsedServerURL = new URL(configuredServerURL);

if (
    !["http:", "https:"].includes(parsedServerURL.protocol) ||
    parsedServerURL.origin === "null" ||
    parsedServerURL.pathname !== "/" ||
    parsedServerURL.search ||
    parsedServerURL.hash
) {
    throw new Error(
        "PAYLOAD_SERVER_URL must be an HTTP(S) origin without a path, query, or hash."
    );
}

if (payloadCmsEnabled && isProduction && !process.env.PAYLOAD_SERVER_URL) {
    throw new Error(
        "PAYLOAD_SERVER_URL must be explicitly configured when Payload CMS is enabled in production."
    );
}

const payloadSecret = process.env.PAYLOAD_SECRET?.trim();
if (isProduction && (!payloadSecret || payloadSecret.length < 32)) {
    throw new Error(
        "PAYLOAD_SECRET must be at least 32 characters in production."
    );
}

// Server actions send Origin, which Payload checks before accepting auth cookies.
// Do not use the deployed commerce domain for a local CMS session.
const serverURL = parsedServerURL.origin;

export default buildConfig({
    admin: {
        disable: !payloadCmsEnabled,
        user: CmsUsers.slug,
        suppressHydrationWarning: true,
        meta: {
            titleSuffix: " - Cask Exchange CMS",
        },
        importMap: {
            baseDir: path.resolve(dirname),
        },
    },
    // Keep Payload's auth cookie scoped to this application and reject
    // cross-origin cookie requests. Public resource reads do not require
    // browser CORS because they are served by the Next.js app itself.
    cookiePrefix: "cask-payload",
    cors: [serverURL],
    csrf: [serverURL],
    collections: [...resourceCollections, CmsUsers],
    db: postgresAdapter({
        migrationDir: path.resolve(dirname, "payload/migrations"),
        pool: {
            connectionString: databaseURL,
        },
    }),
    editor: createResourceRichTextEditor("Start writing resource content..."),
    graphQL: {
        disable: !payloadCmsEnabled,
        disableIntrospectionInProduction: true,
        disablePlaygroundInProduction: true,
        maxComplexity: 100,
    },
    globals: [...resourceGlobals],
    jobs: {
        autoRun: [
            {
                allQueues: true,
                cron: "0 * * * * *",
                limit: 10,
            },
        ],
        deleteJobOnComplete: true,
    },
    maxDepth: 4,
    plugins: payloadStoragePlugins,
    routes: {
        admin: "/cms-admin",
        api: "/api-cms",
        graphQL: "/graphql-cms",
        graphQLPlayground: "/graphql-cms-playground",
    },
    sharp,
    secret: payloadSecret || "local-development-payload-secret",
    serverURL,
    typescript: {
        autoGenerate: true,
        outputFile: path.resolve(dirname, "payload-types.ts"),
    },
});
