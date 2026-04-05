import { Migration } from '@mikro-orm/migrations';

export class Migration20260325000100 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE "user_word_sense_progress"
        ADD COLUMN "tenant_id"        UUID NOT NULL,
        ADD COLUMN "stability"         FLOAT   NOT NULL DEFAULT 0,
        ADD COLUMN "difficulty"        FLOAT   NOT NULL DEFAULT 0,
        ADD COLUMN "lapses"           INT     NOT NULL DEFAULT 0,
        ADD COLUMN "reps"             INT     NOT NULL DEFAULT 0,
        ADD COLUMN "state"            VARCHAR(20) NOT NULL DEFAULT 'new',
        ADD COLUMN "due_date"         TIMESTAMPTZ NULL,
        ADD COLUMN "last_review_date" TIMESTAMPTZ NULL;
    `);
    // Backfill tenant_id from the word's workspace via word_senses → words → workspace
    this.addSql(`
      UPDATE "user_word_sense_progress" p
      SET "tenant_id" = w."workspace_id"
      FROM "word_senses" ws
      JOIN "words" w ON ws."word_id" = w."id"
      WHERE p."word_sense_id" = ws."id"
        AND p."tenant_id" IS NULL;
    `);
    // All existing records should have been backfilled; enforce NOT NULL
    this.addSql(`
      ALTER TABLE "user_word_sense_progress"
        ALTER COLUMN "tenant_id" SET NOT NULL;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE "user_word_sense_progress"
        DROP COLUMN "tenant_id",
        DROP COLUMN "stability",
        DROP COLUMN "difficulty",
        DROP COLUMN "lapses",
        DROP COLUMN "reps",
        DROP COLUMN "state",
        DROP COLUMN "due_date",
        DROP COLUMN "last_review_date";
    `);
  }
}
