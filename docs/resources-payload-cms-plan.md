# Resources → Payload CMS Plan

Status: Resources runtime and Payload read integration implemented; content
migration and production infrastructure remain deployment tasks.

## Objective

Move the public Resources content from TypeScript constants into Payload CMS
while preserving the existing URLs, responsive UI, SEO metadata, and the
editorial ability to choose which guides or FAQs appear in Featured Resources.

The commerce backend remains the source of truth for marketplace, payment,
order, payout, and account data. Payload owns only editorial Resources
content and media.

## Current implementation audit

### Routes

| Route                        | Current behavior                                                       | CMS target                                     |
| ---------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| `/resources`                 | Topics, Featured Resources, Popular FAQs, URL search                   | Implemented: server-rendered CMS queries       |
| `/resources/[topic]`         | Redirects to the first published guide                                 | Implemented: resolve the first published guide |
| `/resources/[topic]/[guide]` | Published guide detail with desktop sidebar and mobile/tablet selector | Implemented: published guide by topic and slug |
| `/resources/faqs`            | Published FAQ groups with sticky navigation and hash scrolling         | Implemented: published FAQ groups from CMS     |

### Existing content sources (migration only)

- `scripts/resource-migration-data.ts`: 4 topics, 4 featured guide cards, 14 FAQs.
- `scripts/resource-migration-topic-data.ts`: 11 article bodies (Buying 3,
  Selling 4, Marketplace 2, Whisky Casks 2).
- `public/images/resources`: 4 guide images.
- `public/icons/resources`: 4 topic icons.

The migration source topic `articleCount` values are not reliable: Marketplace is
declared as 5 but has 2 articles, and Whisky Casks is declared as 3 but has 2.
The count must be derived from published guide relations in CMS.

## Target content model

### `resource-topics` collection

| Field         | Type                  | Notes                                              |
| ------------- | --------------------- | -------------------------------------------------- |
| `title`       | text                  | Localizable later if required                      |
| `slug`        | text                  | Required, unique, URL-safe; old values redirect    |
| `description` | textarea              | Topic summary                                      |
| `icon`        | select                | `buying`, `selling`, `marketplace`, `whisky-casks` |
| `sortOrder`   | number                | Controls landing/sidebar ordering                  |
| `_status`     | Payload drafts status | Public reads only use published docs               |

### `resource-guides` collection

One collection owns both the article detail and the card that may be featured.
This avoids maintaining `RESOURCE_GUIDES` and `topic-data.ts` as separate
sources for the same article.

| Field             | Type                  | Notes                                      |
| ----------------- | --------------------- | ------------------------------------------ |
| `title`           | text                  | Required, admin title                      |
| `slug`            | text                  | Required, unique; historic values redirect |
| `excerpt`         | textarea              | Landing/card/SEO description               |
| `primaryTopic`    | relationship          | Required relation to `resource-topics`     |
| `relatedTopics`   | relationship[]        | Optional cross-topic discovery             |
| `content`         | richText              | Payload Lexical content                    |
| `readTimeMinutes` | number                | Rendered as `N mins read`                  |
| `coverImage`      | upload                | Optional relation to `media`               |
| `sortOrder`       | number                | Ordering within the primary topic          |
| `_status`         | Payload drafts status | Only published guides are public           |

`primaryTopic` provides a stable canonical URL. `relatedTopics` is for
discovery and should not change the canonical route.

### `resource-faqs` collection

| Field       | Type                  | Notes                                         |
| ----------- | --------------------- | --------------------------------------------- |
| `question`  | text                  | Required                                      |
| `answer`    | richText              | Supports links and formatting later           |
| `group`     | relationship          | Required relation to `resource-faq-groups`    |
| `topics`    | relationship[]        | Hidden legacy relation retained for migration |
| `isPopular` | checkbox              | Controls the landing Popular FAQs section     |
| `sortOrder` | number                | Ordering within the FAQ section               |
| `_status`   | Payload drafts status | Only published FAQs are public                |

### `resource-faq-groups` collection

FAQ groups are managed independently from Resource Topics. Each FAQ selects
one required group, and the FAQ page builds its navigation from the published
groups ordered by `sortOrder`. The collection is defined in
`src/payload/collections/ResourceFaqGroups.ts`.

### `resource-settings` global

| Field               | Type                       | Notes                                                   |
| ------------------- | -------------------------- | ------------------------------------------------------- |
| `featuredResources` | polymorphic relationship[] | Guides or FAQs, ordered manually, limited to four items |
| `popularFaqs`       | relationship[]             | Optional explicit selection for landing page            |

`featuredResources` is the source of truth for Featured Resources. Editors can
mix guides and FAQs and reorder them without editing each document. The
frontend filters unpublished selections before rendering. The hidden legacy
`featuredGuides` field remains temporarily as a read fallback during migration.

### `media` collection

Upload-enabled collection for Resource images. It should include `alt`, use
image sizes for cards, and be ready for object storage in production.

## Phase 0 — Content contract and migration preparation (implemented)

### Deliverables

- This document as the implementation source of truth.
- A normalized CMS-facing domain contract separate from Payload response shape.
- A migration manifest for the existing 4 topics, 11 articles, 14 FAQs, and 4
  existing featured images.
- A decision that article count is derived, not stored.
- A decision that Featured Resources is an ordered polymorphic relationship on
  the global.
- A slug compatibility checklist for existing URLs.

### Acceptance criteria

- Every current article has a unique topic and slug.
- Every current featured card maps to one guide document.
- No content is duplicated between a guide card and guide detail document.
- Marketplace and Whisky Casks counts are derived from the article set.
- The migration can be rerun without creating duplicate documents.

### Implemented in this phase

- `src/payload/types/resources.ts` defines the validated CMS response
  contracts consumed by the Resources UI.
- `scripts/resource-migration-manifest.ts` derives a migration manifest from
  the current static content without duplicating article bodies.
- The manifest reports declared-versus-actual topic article counts and keeps
  the current Featured Guide selection as an ordered list.

## Phase 1 — Payload foundation (implemented)

### Deliverables

- Payload configuration boundary and collection configs.
- `resource-topics`, `resource-guides`, `resource-faqs`, and `media`.
- `resource-settings` global with ordered mixed `featuredResources` selection.
- Draft/publish status and public read access policy.
- Generated Payload types or an equivalent typed CMS contract.
- Seed/migration entry point for the existing Resources content.

### Acceptance criteria

- An editor can create, edit, draft, publish, reorder, and select guides or FAQs
  for Featured Resources in Payload Admin.
- A public query returns published content only.
- Media has meaningful alt text and usable image URLs.
- The setup does not change existing commerce API contracts.
- The selected database/storage adapter is documented before production use.

### Implementation boundary for this iteration

The local and production runtime use PostgreSQL through `DATABASE_URI`. The
adapter is configured in `src/payload.config.ts`; migrations are loaded from
`src/payload/migrations/`. The database host, credentials, SSL settings,
pooling, and migration ownership remain deployment configuration rather than
page-level concerns.

## Phase 2 — Read integration (implemented)

- `src/payload/services/ResourceService.ts` is the server-only Resources
  repository.
- Query independent landing sections in parallel.
- Replace static imports in the route and client modules with serializable
  server props.
- Query topics/guides/FAQs by slug and published status.
- Keep the existing search parameter and move search filtering to CMS queries.
- Generate page metadata from CMS content.
- Preserve sticky selectors, responsive cards, empty states, and all current
  routes.

## Phase 3 — Rich text and preview (implemented)

- Render Payload Lexical content through a server-side `ResourceRichText`
  component.
- Add protected full-layout live preview for Guide, Topic, FAQ, FAQ Group, and
  Resource Listing.
- Route Payload live-preview messages through the shared Service Worker bridge
  in `public/sw.js`, scoped to the originating preview iframe, with a direct
  browser fallback when Service Workers are unavailable.
- Revalidate public Resources pages after published content changes/deletions.
- Store Topic/Guide slug history and redirect historic URLs to their canonical
  routes.
- Enable autosave, scheduled publish/unpublish, bounded version history, and
  the Payload schedule job worker.
- Add optional localization once English content and editorial workflow are
  stable.

## Phase 4 — Cleanup and verification (in progress)

- Migrate and verify all existing content.
- Runtime `data.ts` and `topic-data.ts` imports have been removed. Their
  content is retained only under `scripts/` as migration input.
- Test invalid slugs, draft visibility, search, metadata, media, and responsive
  behavior.
- Run targeted Prettier, ESLint, TypeScript, Jest, and `git diff --check`.

## Infrastructure decision

`PAYLOAD_SERVER_URL` is the origin used to access CMS, without `/cms-admin`.
Development defaults to `http://localhost:3001`; production must use the deployed
origin (falling back to `NEXT_PUBLIC_DOMAIN_TEST`). Payload automatically trusts
this origin for cookie authentication. A mismatched origin can allow the initial
page to render but reject List View server actions as Unauthorized. Restart Next
after changing this value and sign in again if the session has expired.

Commerce pages live under `src/app/(site)` with their own root layout.
Payload uses `src/app/(payload)/layout.tsx` as a separate root layout, so its
HTML document, styles, and providers are not nested inside the commerce shell.
Route groups do not change public URLs. Restart the Next development server
after moving these route groups to refresh its route cache.

Payload is embedded in this Next.js app and uses the PostgreSQL adapter. The
connection string is deliberately supplied through `DATABASE_URI` rather than
committed to the repository. `PAYLOAD_CMS_ENABLED` controls whether the CMS
Admin Panel is exposed; it defaults to disabled. The UI integration remains
behind a repository boundary so the database choice does not leak into
Resources components.

Before production, provide the PostgreSQL connection details and decide on
durable media storage. Payload migrations, backups, pooling, SSL, and
deployment secrets must be configured with the project infrastructure.

## References

- [Payload installation](https://payloadcms.com/docs/getting-started/installation)
- [Payload collections](https://payloadcms.com/docs/configuration/collections)
- [Payload Local API](https://payloadcms.com/docs/local-api/overview)
- [Payload relationships](https://payloadcms.com/docs/fields/relationship)
- [Payload uploads](https://payloadcms.com/docs/upload/overview)
- [Payload Rich Text](https://payloadcms.com/docs/rich-text/overview)
- [Payload drafts](https://payloadcms.com/docs/versions/drafts)
