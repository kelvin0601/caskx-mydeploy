import {
    type MigrateDownArgs,
    type MigrateUpArgs,
    sql,
} from "@payloadcms/db-postgres";

type ColumnRow = {
    column_name: string;
    data_type: string;
};

export async function up({ db }: MigrateUpArgs): Promise<void> {
    const schemaResult = await db.execute(sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'resource_faq_groups'
          AND column_name IN ('title', 'slug')
    `);
    const columns = schemaResult.rows as ColumnRow[];
    const schemaIsValid =
        columns.find((column) => column.column_name === "title")?.data_type ===
            "character varying" &&
        columns.find((column) => column.column_name === "slug")?.data_type ===
            "character varying";

    if (schemaIsValid) return;

    const safetyResult = await db.execute(sql`
        SELECT
          (SELECT count(*)::int FROM resource_faq_groups) AS groups,
          (SELECT count(*)::int FROM _resource_faq_groups_v) AS versions,
          (SELECT count(*)::int FROM resource_faqs WHERE group_id IS NOT NULL) AS faq_refs,
          (SELECT count(*)::int FROM _resource_faqs_v WHERE version_group_id IS NOT NULL) AS faq_version_refs,
          (SELECT count(*)::int FROM payload_locked_documents_rels WHERE resource_faq_groups_id IS NOT NULL) AS lock_refs
    `);
    const counts = safetyResult.rows[0] as Record<string, number>;
    if (Object.values(counts).some((count) => count !== 0)) {
        throw new Error(
            `Cannot repair resource_faq_groups because related data exists: ${JSON.stringify(counts)}`
        );
    }

    await db.execute(sql`
        DROP TABLE IF EXISTS "_resource_faq_groups_v" CASCADE;
        DROP TABLE IF EXISTS "resource_faq_groups" CASCADE;
        DROP TYPE IF EXISTS "enum_resource_faq_groups_status";
        DROP TYPE IF EXISTS "enum__resource_faq_groups_v_version_status";

        CREATE TYPE "enum_resource_faq_groups_status" AS ENUM ('draft', 'published');
        CREATE TYPE "enum__resource_faq_groups_v_version_status" AS ENUM ('draft', 'published');

        CREATE TABLE "resource_faq_groups" (
          "id" serial PRIMARY KEY NOT NULL,
          "title" varchar,
          "generate_slug" boolean DEFAULT true,
          "slug" varchar,
          "sort_order" numeric DEFAULT 0,
          "updated_at" timestamptz DEFAULT now() NOT NULL,
          "created_at" timestamptz DEFAULT now() NOT NULL,
          "_status" "enum_resource_faq_groups_status" DEFAULT 'draft'
        );

        CREATE TABLE "_resource_faq_groups_v" (
          "id" serial PRIMARY KEY NOT NULL,
          "parent_id" integer,
          "version_title" varchar,
          "version_generate_slug" boolean DEFAULT true,
          "version_slug" varchar,
          "version_sort_order" numeric DEFAULT 0,
          "version_updated_at" timestamptz,
          "version_created_at" timestamptz,
          "version__status" "enum__resource_faq_groups_v_version_status" DEFAULT 'draft',
          "created_at" timestamptz DEFAULT now() NOT NULL,
          "updated_at" timestamptz DEFAULT now() NOT NULL,
          "latest" boolean
        );

        ALTER TABLE "_resource_faq_groups_v"
          ADD CONSTRAINT "_resource_faq_groups_v_parent_id_resource_faq_groups_id_fk"
          FOREIGN KEY ("parent_id") REFERENCES "public"."resource_faq_groups"("id") ON DELETE SET NULL;
        ALTER TABLE "resource_faqs"
          ADD CONSTRAINT "resource_faqs_group_id_resource_faq_groups_id_fk"
          FOREIGN KEY ("group_id") REFERENCES "public"."resource_faq_groups"("id") ON DELETE SET NULL;
        ALTER TABLE "_resource_faqs_v"
          ADD CONSTRAINT "_resource_faqs_v_version_group_id_resource_faq_groups_id_fk"
          FOREIGN KEY ("version_group_id") REFERENCES "public"."resource_faq_groups"("id") ON DELETE SET NULL;
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_resource_faq_groups_fk"
          FOREIGN KEY ("resource_faq_groups_id") REFERENCES "public"."resource_faq_groups"("id") ON DELETE CASCADE;

        CREATE INDEX "resource_faq_groups_title_idx" ON "resource_faq_groups" ("title");
        CREATE UNIQUE INDEX "resource_faq_groups_slug_idx" ON "resource_faq_groups" ("slug");
        CREATE INDEX "resource_faq_groups_sort_order_idx" ON "resource_faq_groups" ("sort_order");
        CREATE INDEX "resource_faq_groups_updated_at_idx" ON "resource_faq_groups" ("updated_at");
        CREATE INDEX "resource_faq_groups_created_at_idx" ON "resource_faq_groups" ("created_at");
        CREATE INDEX "resource_faq_groups__status_idx" ON "resource_faq_groups" ("_status");
        CREATE INDEX "_resource_faq_groups_v_parent_idx" ON "_resource_faq_groups_v" ("parent_id");
        CREATE INDEX "_resource_faq_groups_v_version_version_title_idx" ON "_resource_faq_groups_v" ("version_title");
        CREATE INDEX "_resource_faq_groups_v_version_version_slug_idx" ON "_resource_faq_groups_v" ("version_slug");
        CREATE INDEX "_resource_faq_groups_v_version_version_sort_order_idx" ON "_resource_faq_groups_v" ("version_sort_order");
        CREATE INDEX "_resource_faq_groups_v_version_version_updated_at_idx" ON "_resource_faq_groups_v" ("version_updated_at");
        CREATE INDEX "_resource_faq_groups_v_version_version_created_at_idx" ON "_resource_faq_groups_v" ("version_created_at");
        CREATE INDEX "_resource_faq_groups_v_version_version__status_idx" ON "_resource_faq_groups_v" ("version__status");
        CREATE INDEX "_resource_faq_groups_v_created_at_idx" ON "_resource_faq_groups_v" ("created_at");
        CREATE INDEX "_resource_faq_groups_v_updated_at_idx" ON "_resource_faq_groups_v" ("updated_at");
        CREATE INDEX "_resource_faq_groups_v_latest_idx" ON "_resource_faq_groups_v" ("latest");
    `);
}

export async function down({}: MigrateDownArgs): Promise<void> {
    // Intentionally retained: rolling back must not delete FAQ groups or FAQ relationships.
}
