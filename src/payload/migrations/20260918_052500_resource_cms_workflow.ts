import {
    type MigrateDownArgs,
    type MigrateUpArgs,
    sql,
} from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_resource_settings_status') THEN
                CREATE TYPE "enum_resource_settings_status" AS ENUM ('draft', 'published');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum__resource_settings_v_version_status') THEN
                CREATE TYPE "enum__resource_settings_v_version_status" AS ENUM ('draft', 'published');
            END IF;
        END
        $$;

        ALTER TABLE "resource_settings"
            ADD COLUMN IF NOT EXISTS "_status" "enum_resource_settings_status" DEFAULT 'draft';

        ALTER TABLE "_resource_topics_v" ADD COLUMN IF NOT EXISTS "autosave" boolean;
        ALTER TABLE "_resource_guides_v" ADD COLUMN IF NOT EXISTS "autosave" boolean;
        ALTER TABLE "_resource_faq_groups_v" ADD COLUMN IF NOT EXISTS "autosave" boolean;
        ALTER TABLE "_resource_faqs_v" ADD COLUMN IF NOT EXISTS "autosave" boolean;

        CREATE TABLE IF NOT EXISTS "resource_topics_previous_slugs" (
            "_order" integer NOT NULL,
            "_parent_id" integer NOT NULL,
            "id" varchar PRIMARY KEY NOT NULL,
            "slug" varchar
        );
        CREATE TABLE IF NOT EXISTS "_resource_topics_v_version_previous_slugs" (
            "_order" integer NOT NULL,
            "_parent_id" integer NOT NULL,
            "id" serial PRIMARY KEY NOT NULL,
            "slug" varchar,
            "_uuid" varchar
        );
        CREATE TABLE IF NOT EXISTS "resource_guides_previous_slugs" (
            "_order" integer NOT NULL,
            "_parent_id" integer NOT NULL,
            "id" varchar PRIMARY KEY NOT NULL,
            "slug" varchar
        );
        CREATE TABLE IF NOT EXISTS "_resource_guides_v_version_previous_slugs" (
            "_order" integer NOT NULL,
            "_parent_id" integer NOT NULL,
            "id" serial PRIMARY KEY NOT NULL,
            "slug" varchar,
            "_uuid" varchar
        );

        CREATE TABLE IF NOT EXISTS "_resource_settings_v" (
            "id" serial PRIMARY KEY NOT NULL,
            "version__status" "enum__resource_settings_v_version_status" DEFAULT 'draft',
            "version_updated_at" timestamptz,
            "version_created_at" timestamptz,
            "created_at" timestamptz DEFAULT now() NOT NULL,
            "updated_at" timestamptz DEFAULT now() NOT NULL,
            "latest" boolean,
            "autosave" boolean
        );
        ALTER TABLE "_resource_settings_v" ADD COLUMN IF NOT EXISTS "autosave" boolean;

        CREATE TABLE IF NOT EXISTS "_resource_settings_v_rels" (
            "id" serial PRIMARY KEY NOT NULL,
            "order" integer,
            "parent_id" integer NOT NULL,
            "path" varchar NOT NULL,
            "resource_guides_id" integer,
            "resource_faqs_id" integer
        );

        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resource_topics_previous_slugs_parent_id_fk') THEN
                ALTER TABLE "resource_topics_previous_slugs" ADD CONSTRAINT "resource_topics_previous_slugs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "resource_topics"("id") ON DELETE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_resource_topics_v_version_previous_slugs_parent_id_fk') THEN
                ALTER TABLE "_resource_topics_v_version_previous_slugs" ADD CONSTRAINT "_resource_topics_v_version_previous_slugs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "_resource_topics_v"("id") ON DELETE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resource_guides_previous_slugs_parent_id_fk') THEN
                ALTER TABLE "resource_guides_previous_slugs" ADD CONSTRAINT "resource_guides_previous_slugs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "resource_guides"("id") ON DELETE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_resource_guides_v_version_previous_slugs_parent_id_fk') THEN
                ALTER TABLE "_resource_guides_v_version_previous_slugs" ADD CONSTRAINT "_resource_guides_v_version_previous_slugs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "_resource_guides_v"("id") ON DELETE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_resource_settings_v_rels_parent_fk') THEN
                ALTER TABLE "_resource_settings_v_rels" ADD CONSTRAINT "_resource_settings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "_resource_settings_v"("id") ON DELETE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_resource_settings_v_rels_resource_guides_fk') THEN
                ALTER TABLE "_resource_settings_v_rels" ADD CONSTRAINT "_resource_settings_v_rels_resource_guides_fk" FOREIGN KEY ("resource_guides_id") REFERENCES "resource_guides"("id") ON DELETE CASCADE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_resource_settings_v_rels_resource_faqs_fk') THEN
                ALTER TABLE "_resource_settings_v_rels" ADD CONSTRAINT "_resource_settings_v_rels_resource_faqs_fk" FOREIGN KEY ("resource_faqs_id") REFERENCES "resource_faqs"("id") ON DELETE CASCADE;
            END IF;
        END
        $$;

        CREATE INDEX IF NOT EXISTS "resource_topics_previous_slugs_order_idx" ON "resource_topics_previous_slugs" ("_order");
        CREATE INDEX IF NOT EXISTS "resource_topics_previous_slugs_parent_id_idx" ON "resource_topics_previous_slugs" ("_parent_id");
        CREATE INDEX IF NOT EXISTS "_resource_topics_v_version_previous_slugs_order_idx" ON "_resource_topics_v_version_previous_slugs" ("_order");
        CREATE INDEX IF NOT EXISTS "_resource_topics_v_version_previous_slugs_parent_id_idx" ON "_resource_topics_v_version_previous_slugs" ("_parent_id");
        CREATE INDEX IF NOT EXISTS "resource_guides_previous_slugs_order_idx" ON "resource_guides_previous_slugs" ("_order");
        CREATE INDEX IF NOT EXISTS "resource_guides_previous_slugs_parent_id_idx" ON "resource_guides_previous_slugs" ("_parent_id");
        CREATE INDEX IF NOT EXISTS "_resource_guides_v_version_previous_slugs_order_idx" ON "_resource_guides_v_version_previous_slugs" ("_order");
        CREATE INDEX IF NOT EXISTS "_resource_guides_v_version_previous_slugs_parent_id_idx" ON "_resource_guides_v_version_previous_slugs" ("_parent_id");
        CREATE INDEX IF NOT EXISTS "resource_settings__status_idx" ON "resource_settings" ("_status");
        CREATE INDEX IF NOT EXISTS "_resource_settings_v_version_version__status_idx" ON "_resource_settings_v" ("version__status");
        CREATE INDEX IF NOT EXISTS "_resource_settings_v_created_at_idx" ON "_resource_settings_v" ("created_at");
        CREATE INDEX IF NOT EXISTS "_resource_settings_v_updated_at_idx" ON "_resource_settings_v" ("updated_at");
        CREATE INDEX IF NOT EXISTS "_resource_settings_v_latest_idx" ON "_resource_settings_v" ("latest");
        CREATE INDEX IF NOT EXISTS "_resource_settings_v_autosave_idx" ON "_resource_settings_v" ("autosave");
        CREATE INDEX IF NOT EXISTS "_resource_settings_v_rels_order_idx" ON "_resource_settings_v_rels" ("order");
        CREATE INDEX IF NOT EXISTS "_resource_settings_v_rels_parent_idx" ON "_resource_settings_v_rels" ("parent_id");
        CREATE INDEX IF NOT EXISTS "_resource_settings_v_rels_path_idx" ON "_resource_settings_v_rels" ("path");
        CREATE INDEX IF NOT EXISTS "_resource_settings_v_rels_resource_guides_id_idx" ON "_resource_settings_v_rels" ("resource_guides_id");
        CREATE INDEX IF NOT EXISTS "_resource_settings_v_rels_resource_faqs_id_idx" ON "_resource_settings_v_rels" ("resource_faqs_id");

        ALTER TYPE "enum_payload_jobs_task_slug" ADD VALUE IF NOT EXISTS 'schedulePublish';
        ALTER TYPE "enum_payload_jobs_log_task_slug" ADD VALUE IF NOT EXISTS 'schedulePublish';
    `);
}

export async function down({}: MigrateDownArgs): Promise<void> {
    // Keep editorial history and scheduled jobs intact during a rollback.
}
