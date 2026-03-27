import { Migration } from '@mikro-orm/migrations';

export class Migration20260327000000_Phase2StudySessionTracking extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table "study_sessions" (
        "id" uuid primary key default gen_random_uuid(),
        "user_id" uuid not null,
        "tenant_id" uuid not null,
        "scope" varchar(20) not null,
        "study_type" varchar(20) not null default 'FLASHCARD',
        "topic_id" uuid null,
        "enrolled_card_ids" jsonb not null default '[]',
        "reviewed_count" int not null default 0,
        "again_count" int not null default 0,
        "hard_count" int not null default 0,
        "good_count" int not null default 0,
        "easy_count" int not null default 0,
        "status" varchar(20) not null default 'IN_PROGRESS',
        "started_at" timestamptz not null default now(),
        "completed_at" timestamptz null,
        "abandoned_at" timestamptz null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now()
      );
    `);

    this.addSql(`
      create index "study_sessions_user_tenant_status_index"
        on "study_sessions" ("user_id", "tenant_id", "status");
    `);
    this.addSql(`
      create index "study_sessions_user_id_index"
        on "study_sessions" ("user_id");
    `);
    this.addSql(`
      create index "study_sessions_tenant_id_index"
        on "study_sessions" ("tenant_id");
    `);

    // Allow only one active (in-progress) session per user at a time.
    // Completed and abandoned sessions are historical and may coexist.
    this.addSql(`
      create unique index "study_sessions_active_user_tenant_unique"
        on "study_sessions" ("user_id", "tenant_id")
        where status = 'IN_PROGRESS';
    `);

    this.addSql(`
      create table "study_review_logs" (
        "id" uuid primary key default gen_random_uuid(),
        "session_id" uuid not null references "study_sessions"("id") on delete cascade,
        "word_sense_id" uuid not null,
        "user_id" uuid not null,
        "tenant_id" uuid not null,
        "rating" int not null,
        "review_duration_ms" int not null,
        "reviewed_at" timestamptz not null,
        "created_at" timestamptz not null default now()
      );
    `);

    this.addSql(`
      create unique index "study_review_logs_session_word_sense_unique"
        on "study_review_logs" ("session_id", "word_sense_id");
    `);
    this.addSql(`
      create index "study_review_logs_session_id_index"
        on "study_review_logs" ("session_id");
    `);
    this.addSql(`
      create index "study_review_logs_user_tenant_index"
        on "study_review_logs" ("user_id", "tenant_id");
    `);

    // Add check constraint for valid status values
    this.addSql(`
      alter table "study_sessions"
        add constraint "study_sessions_status_check"
        check (status in ('IN_PROGRESS', 'COMPLETED', 'ABANDONED'));
    `);

    // Add check constraint for valid scope values
    this.addSql(`
      alter table "study_sessions"
        add constraint "study_sessions_scope_check"
        check (scope in ('DUE', 'TOPIC'));
    `);

    // Add check constraint for valid study_type values
    this.addSql(`
      alter table "study_sessions"
        add constraint "study_sessions_study_type_check"
        check (study_type in ('FLASHCARD'));
    `);

    // Add check constraint for valid rating values (1=again, 2=hard, 3=good, 4=easy)
    this.addSql(`
      alter table "study_review_logs"
        add constraint "study_review_logs_rating_check"
        check (rating between 1 and 4);
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "study_review_logs" cascade;`);
    this.addSql(`drop table if exists "study_sessions" cascade;`);
  }
}
