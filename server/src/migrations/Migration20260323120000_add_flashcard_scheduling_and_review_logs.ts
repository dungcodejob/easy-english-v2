import { Migration } from '@mikro-orm/migrations';

export class Migration20260323120000_AddFlashcardSchedulingAndReviewLogs extends Migration {
  override async up(): Promise<void> {
    // Flashcard scheduling states (one-to-one with flashcards)
    this.addSql(`
      create table "flashcard_scheduling_states" (
        "id" uuid primary key default gen_random_uuid(),
        "flashcard_id" uuid not null unique references "flashcards"("id") on delete cascade,
        "stability" float not null default 0,
        "difficulty" float not null default 0,
        "lapses" int not null default 0,
        "reps" int not null default 0,
        "state" varchar(50) not null default 'new',
        "due_date" timestamptz not null default now(),
        "last_review_date" timestamptz null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now()
      );
    `);
    this.addSql(
      `create index "flashcard_scheduling_states_flashcard_id_index" on "flashcard_scheduling_states" ("flashcard_id");`,
    );

    // Review logs (immutable history)
    this.addSql(`
      create table "review_logs" (
        "id" uuid primary key default gen_random_uuid(),
        "card_id" uuid not null references "flashcards"("id") on delete cascade,
        "user_id" uuid not null,
        "tenant_id" uuid not null,
        "rating" int not null,
        "previous_state" varchar(50) not null,
        "new_state" varchar(50) not null,
        "previous_stability" float not null,
        "new_stability" float not null,
        "previous_difficulty" float not null,
        "new_difficulty" float not null,
        "review_duration_ms" int not null,
        "reviewed_at" timestamptz not null,
        "created_at" timestamptz not null default now()
      );
    `);
    this.addSql(
      `create index "review_logs_card_id_index" on "review_logs" ("card_id");`,
    );
    this.addSql(
      `create index "review_logs_user_tenant_index" on "review_logs" ("user_id", "tenant_id");`,
    );

    // Update study_stats: split streak → current_streak + longest_streak
    this.addSql(
      `alter table "study_stats" add column if not exists "current_streak" int not null default 1`,
    );
    this.addSql(
      `alter table "study_stats" add column if not exists "longest_streak" int not null default 0`,
    );
    // Migrate existing streak value to current_streak, preserve longest_streak as 0
    this.addSql(
      `update "study_stats" set "current_streak" = "streak" where "current_streak" = 1 and "streak" > 1`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "flashcard_scheduling_states" cascade;`);
    this.addSql(`drop table if exists "review_logs" cascade;`);
    this.addSql(
      `alter table "study_stats" drop column if exists "current_streak"`,
    );
    this.addSql(
      `alter table "study_stats" drop column if exists "longest_streak"`,
    );
  }
}
