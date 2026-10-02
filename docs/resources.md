# Resources

`/resources` reads published content from the existing Payload CMS. It shares
the site's authentication and layout. Manage content at `/cms-admin`.

## Setup

1. Configure `DATABASE_URI` (PostgreSQL), `PAYLOAD_SECRET`,
   `PAYLOAD_CMS_ENABLED=true`, and `PAYLOAD_SERVER_URL` in the local environment.
2. Run `npm run dev`, then open `/cms-admin` and sign in or create the first CMS user.
3. Create and publish Resource Topics, then Resource Guides related to those topics.
4. In Resource Listing, select and order up to four Featured Resources from
   published guides or FAQs. Select Popular FAQs there, or mark individual FAQs
   as popular.
5. Open `/resources`. Topic cards link to `/resources/[topic]`, articles to
   `/resources/[topic]/[guide]`, and FAQs to `/resources/faqs`.

## Source structure

Payload is kept inside the existing `src` boundary:

```text
src/
├── payload.config.ts                 # Payload config entrypoint
├── payload-types.ts                  # Generated Payload contracts
├── payload/                          # Collections, globals, access, editor
├── app/(payload)/                    # CMS admin and REST API routes
├── modules/resources/             # Resources UI module
├── payload/services/ResourceService.ts # Server-only Payload service class
├── payload/services/PayloadCmsApi.ts    # Custom REST route adapter
└── payload/types/resources.ts           # CMS response schemas and types
public/sw.js                              # Push notifications + preview message bridge
```

All Resources CMS queries are owned by `ResourceService` in
`src/payload/services/ResourceService.ts`. Route files call its typed methods
and do not construct Payload clients or embed collection queries. The custom
REST adapter is `PayloadCmsApi` in the same directory. Related tests live under
`src/__tests__/payload/`.

## Database and schema locations

Resources uses Payload's PostgreSQL adapter. The database connection and
adapter are configured in `src/payload.config.ts`:

```ts
db: postgresAdapter({
    migrationDir: path.resolve(dirname, "payload/migrations"),
    pool: { connectionString: process.env.DATABASE_URI },
});
```

The database schema is not defined in page components. Payload derives it from
the collection and global definitions, then applies SQL changes from:

- `src/payload/collections/ResourceTopics.ts` — `resource-topics`
- `src/payload/collections/ResourceGuides.ts` — `resource-guides`
- `src/payload/collections/ResourceFaqGroups.ts` — `resource-faq-groups`
- `src/payload/collections/ResourceFaqs.ts` — `resource-faqs`
- `src/payload/collections/Media.ts` — uploaded resource media
- `src/payload/globals/ResourceSettings.ts` — featured resources and popular FAQs
- `src/payload/migrations/` — committed database migrations

`src/payload-types.ts` is the generated Payload TypeScript contract. Runtime
response validation is intentionally separate and lives in
`src/payload/types/resources.ts` (Zod schemas). This keeps database-generated
types separate from the public page data contract.

Payload is exposed through `src/app/(payload)/`:

- `/cms-admin` — Payload Admin UI
- `/api-cms` — Payload REST API
- `/graphql-cms` — Payload GraphQL API

## Source and documentation structure

```text
docs/
├── resources.md                    # Runtime architecture and setup
└── resources-payload-cms-plan.md   # Content model and migration plan
src/
├── app/(site)/(root)/resources/    # Public Resources routes
├── modules/resources/              # Resources UI components
├── payload.config.ts               # PostgreSQL adapter and Payload wiring
├── payload/collections/            # Payload collection schemas
├── payload/globals/                # Resource Listing global schema
├── payload/services/ResourceService.ts
├── payload/types/resources.ts      # Zod response schemas
└── payload/migrations/             # Database migrations
```

## Runtime data flow

The public Resources pages do not import static topic, guide, or FAQ data.
Every request goes through the server-only `ResourceService`:

- `getTopicCards()` reads published `resource-topics` and derives each topic's
  guide count from published `resource-guides`.
- `getGuides()` and `getGuidesByTopic()` query published guides, including URL
  search and topic filtering.
- `getFeaturedResources()` reads the ordered `featuredResources` selections
  from the `resource-settings` global and resolves guides or FAQs from Payload.
- `getFaqs(true)` uses the ordered `popularFaqs` selections, falling back to
  FAQs marked popular when no explicit selection exists.
- `getFaqGroups()` and `getFaqs()` populate the FAQ page from their Payload
  collections.

The old static content is kept only in `scripts/resource-migration-data.ts` and
`scripts/resource-migration-topic-data.ts` for migration/audit purposes; those
files are not imported by the application runtime.

## Live Preview message flow

Payload Admin sends unsaved editor data with `postMessage` to the preview
iframe. Resource preview surfaces do not process that message independently.
They use the shared client bridge at
`src/modules/resources/preview/use-resource-live-preview-worker.ts`:

```text
Payload Admin
    │ window.postMessage
    ▼
Preview iframe bridge
    │ ServiceWorker.postMessage
    ▼
public/sw.js
    │ client.postMessage
    ▼
The same preview iframe updates its local state
```

The worker only accepts the `resources-live-preview-forward` channel and a
Payload Live Preview payload. The bridge verifies that the incoming window
message has the same origin before forwarding it. The worker responds to the
originating client only, so another open Resources tab does not receive the
editor's draft data. Browser push notification handling remains in the same
worker.

The bridge is used by:

- `useResourceListingPreview` for Resource Listing and Topic cards;
- `useResourceFaqPreview` for FAQ and FAQ Group pages;
- `LivePreviewGuide` for the complete Guide detail layout.

If Service Workers are unavailable or registration fails, the bridge falls
back to handling the validated message in the preview iframe so Live Preview
remains usable during local development.

### Verify Live Preview messages

Open a Resource editor with Live Preview, select the preview iframe context in
browser DevTools, and run:

```js
window.addEventListener("message", (event) => {
    console.log("Payload window message", event.data);
});

navigator.serviceWorker.addEventListener("message", (event) => {
    console.log("Service Worker response", event.data);
});
```

Edit a field in Payload. The console should first show a
`payload-live-preview` message and then a `resources-live-preview` response.
If `navigator.serviceWorker.controller` is `null`, reload the preview once
after the worker is registered. The worker can also be tested directly:

```js
navigator.serviceWorker.ready.then((registration) => {
    registration.active.postMessage({
        type: "resources-live-preview-forward",
        payload: {
            type: "payload-live-preview",
            collectionSlug: "resource-topics",
            data: { title: "Worker test" },
        },
    });
});
```

## Search behavior

Resources has two search paths:

- Payload Admin search uses each collection's `admin.listSearchableFields`.
  Guides search `title` and `slug`, topics search `title` and `slug`, and FAQs
  search `question`.
- Public `/resources` search is handled by `ResourceService.getGuides()` and
  uses Payload's `like` operator against guide `title` and `excerpt`. Results
  remain server-side, published-only, paginated, and ordered by `sortOrder`.

Payload supports query operators such as `like`, `contains`, `equals`, `in`,
and `or`, so the same search can be exposed through REST when needed. The
current Resources search is substring matching, not ranked full-text search or
typo-tolerant search. If the content volume grows substantially, add a
PostgreSQL full-text index (`tsvector`/GIN) or a dedicated search service behind
`ResourceService` rather than moving filtering into the client.

The public route intentionally remains `/resources`; the source module uses
the repo's kebab-case convention. Uploaded media is written to the project-level
`media/` directory by Payload's upload collection, so it is not coupled to
`src/`.

Only published content associated with published topics is shown. Empty CMS
collections produce an empty state. Database/query failures use a retryable error
boundary. Pages read fresh data on each request, so publishing does not require a
rebuild. Search queries guide titles and excerpts on the server; it is debounced,
stored in the URL, and resets pagination. Featured Resources preserve the mixed
Guide/FAQ order selected in Payload when search is empty. Guide search results
use pages of 12 results.

The server-only repository uses Payload's [Local API](https://payloadcms.com/docs/local-api/overview)
with access checks enabled and explicit published filters. Zod validates response
contracts before rendering. Lexical rich text is rendered with Payload's React
renderer. Existing static Resources content is not automatically imported.

Production uses the existing Payload PostgreSQL setup and requires its schema
migrations and durable media storage to be managed with the deployment.

## S3 media storage

Payload uses the official `@payloadcms/storage-s3` adapter when `S3_BUCKET` is
set. The adapter disables local storage for the `media` collection and streams
private objects through Payload's existing media access control. Without
`S3_BUCKET`, local development continues to write to the project-level `media/`
directory.

Required runtime values:

```text
S3_BUCKET=cask-exchange-media
S3_REGION=us-east-1
S3_PREFIX=staging
```

On ECS, grant the task role `s3:GetObject`, `s3:PutObject`, and
`s3:DeleteObject` for the bucket and leave `S3_ACCESS_KEY_ID` and
`S3_SECRET_ACCESS_KEY` empty. For EC2 staging without an instance role, provide
both credentials through the deployment environment. `S3_ENDPOINT` supports
Neon Storage and other S3-compatible services. Set `S3_FORCE_PATH_STYLE=true`
for a Neon branch storage endpoint so the bucket remains in the URL path and
the request hostname matches Neon's TLS certificate.

Existing files in local `media/` are not copied automatically when S3 is
enabled. Upload them to the configured bucket with the same prefix before
switching an environment, or re-upload them through Payload Admin.

When Payload's default TypeScript loader cannot load the Lexical editor on the
local Node version, generate the contracts with:

```bash
npx payload generate:types --disable-transpile
```

Payload's built-in editorial controls are Draft, Changed, Published, Save Draft,
scheduled publish/unpublish, and Preview. Resources autosave drafts every 1.5
seconds, offer five-minute scheduling intervals, and retain up to 50 versions
per document/global. Payload's job worker runs every minute from the application
process, so production must keep at least one long-running instance active.

Topic, Guide, FAQ, FAQ Group, and Resource Listing editors use the real public
layouts in Live Preview. Preview entry and rendering both authenticate the CMS
session. Published changes and deletions revalidate the Resources layout, so
cached public pages update immediately.

Topic and Guide slug changes are recorded in the hidden `previousSlugs` field
(up to 20 values). Public routes resolve historic slugs and redirect to the
current canonical URL. A historic slug cannot be reused by another document in
the same collection.

After changing Payload schemas, regenerate the contract and apply the reviewed
migrations:

```bash
npm run payload:types
npx payload migrate
```

Payload does not provide a separate Review status by default. A multi-step
"Ready for review → Approved" workflow would require a custom status field and
access controls (or a workflow plugin); it is separate from draft support.
