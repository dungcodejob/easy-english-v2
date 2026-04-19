import { Migration } from '@mikro-orm/migrations';

export class Migration20260418041455 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "study_sessions" drop constraint "study_sessions_deck_id_foreign";`,
    );

    this.addSql(
      `create table "review_logs" ("id" uuid not null, "card_id" uuid not null, "word_sense_id" uuid null, "user_id" uuid not null, "tenant_id" uuid not null, "rating" int not null, "previous_state" varchar(50) not null, "new_state" varchar(50) not null, "previous_stability" real not null, "new_stability" real not null, "previous_difficulty" real not null, "new_difficulty" real not null, "review_duration_ms" int not null, "reviewed_at" timestamptz not null, "created_at" timestamptz not null, constraint "review_logs_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "review_logs_word_sense_id_index" on "review_logs" ("word_sense_id");`,
    );
    this.addSql(
      `create index "review_logs_user_id_tenant_id_index" on "review_logs" ("user_id", "tenant_id");`,
    );
    this.addSql(
      `create index "review_logs_card_id_index" on "review_logs" ("card_id");`,
    );

    this.addSql(
      `create table "study_review_logs" ("id" uuid not null default gen_random_uuid(), "session_id" uuid not null, "word_sense_id" uuid not null, "user_id" uuid not null, "tenant_id" uuid not null, "rating" int not null, "review_duration_ms" int not null, "reviewed_at" timestamptz not null, "created_at" timestamptz not null default now(), constraint "study_review_logs_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "study_review_logs_user_id_index" on "study_review_logs" ("user_id");`,
    );
    this.addSql(
      `create index "study_review_logs_tenant_id_index" on "study_review_logs" ("tenant_id");`,
    );
    this.addSql(
      `create index "study_review_logs_user_id_tenant_id_index" on "study_review_logs" ("user_id", "tenant_id");`,
    );
    this.addSql(
      `create index "study_review_logs_session_id_index" on "study_review_logs" ("session_id");`,
    );
    this.addSql(
      `alter table "study_review_logs" add constraint "study_review_logs_session_id_word_sense_id_unique" unique ("session_id", "word_sense_id");`,
    );

    this.addSql(
      `alter table "study_review_logs" add constraint "study_review_logs_session_id_foreign" foreign key ("session_id") references "study_sessions" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "study_review_logs" add constraint "study_review_logs_word_sense_id_foreign" foreign key ("word_sense_id") references "word_senses" ("id") on update cascade;`,
    );

    this.addSql(`drop table if exists "decks" cascade;`);

    this.addSql(`drop table if exists "learning_progress" cascade;`);

    this.addSql(`drop table if exists "reviews" cascade;`);

    this.addSql(`drop index "study_sessions_user_id_workspace_id_index";`);
    this.addSql(`drop index "study_sessions_workspace_id_status_index";`);
    this.addSql(`alter table "study_sessions" drop column "deck_id";`);

    this.addSql(
      `alter table "study_sessions" add column "scope" varchar(20) not null, add column "study_type" varchar(20) not null default 'Flashcard', add column "topic_id" uuid null, add column "enrolled_card_ids" jsonb not null, add column "hard_count" int not null default 0, add column "good_count" int not null default 0, add column "easy_count" int not null default 0, add column "abandoned_at" timestamptz null;`,
    );
    this.addSql(`alter table "study_sessions" alter column "id" drop default;`);
    this.addSql(
      `alter table "study_sessions" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "id" set default gen_random_uuid();`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "status" type varchar(20) using ("status"::varchar(20));`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "status" set default 'InProgress';`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "started_at" type timestamptz using ("started_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "started_at" set default now();`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "created_at" set default now();`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "updated_at" set default now();`,
    );
    this.addSql(
      `alter table "study_sessions" rename column "workspace_id" to "tenant_id";`,
    );
    this.addSql(
      `alter table "study_sessions" rename column "due_item_count" to "again_count";`,
    );
    this.addSql(
      `create index "study_sessions_user_id_index" on "study_sessions" ("user_id");`,
    );
    this.addSql(
      `create index "study_sessions_tenant_id_index" on "study_sessions" ("tenant_id");`,
    );
    this.addSql(
      `create index "study_sessions_user_id_tenant_id_status_index" on "study_sessions" ("user_id", "tenant_id", "status");`,
    );

    this.addSql(
      `alter table "study_stats" add column "longest_streak" int not null default 0;`,
    );
    this.addSql(
      `alter table "study_stats" rename column "streak" to "current_streak";`,
    );

    this.addSql(`drop index "idx_words_normalized_text_pattern";`);

    this.addSql(
      `alter table "user_word_sense_progress" add column "tenant_id" uuid not null, add column "stability" real not null default 0, add column "difficulty" real not null default 0, add column "lapses" int not null default 0, add column "reps" int not null default 0, add column "state" varchar(20) not null default 'new', add column "due_date" timestamptz null, add column "last_review_date" timestamptz null;`,
    );
    this.addSql(
      `create index "user_word_sense_progress_tenant_id_index" on "user_word_sense_progress" ("tenant_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `create table "decks" ("id" uuid not null, "workspace_id" uuid not null, "name" varchar(255) not null, "description" text null, "created_at" timestamptz(6) not null, "updated_at" timestamptz(6) not null, constraint "decks_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "decks_workspace_id_index" on "decks" ("workspace_id");`,
    );

    this.addSql(
      `create table "learning_progress" ("id" uuid not null, "user_id" uuid not null, "flashcard_id" uuid not null, "status" varchar(50) not null default 'NEW', "interval" int4 not null default 0, "ease_factor" numeric(5,2) not null default 2.50, "repetitions" int4 not null default 0, "next_due_date" timestamptz(6) null, "created_at" timestamptz(6) not null, "updated_at" timestamptz(6) not null, constraint "learning_progress_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "learning_progress_next_due_date_index" on "learning_progress" ("next_due_date");`,
    );
    this.addSql(
      `create index "learning_progress_user_id_flashcard_id_index" on "learning_progress" ("user_id", "flashcard_id");`,
    );

    this.addSql(
      `create table "reviews" ("id" uuid not null, "session_id" uuid not null, "user_id" uuid not null, "flashcard_id" uuid not null, "response" varchar(50) not null, "interval_before" int4 not null, "interval_after" int4 not null, "reviewed_at" timestamptz(6) not null, "created_at" timestamptz(6) not null, "updated_at" timestamptz(6) not null, constraint "reviews_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "reviews_session_id_index" on "reviews" ("session_id");`,
    );
    this.addSql(
      `create index "reviews_user_id_flashcard_id_index" on "reviews" ("user_id", "flashcard_id");`,
    );

    this.addSql(
      `alter table "reviews" add constraint "reviews_session_id_foreign" foreign key ("session_id") references "study_sessions" ("id") on update cascade on delete cascade;`,
    );

    this.addSql(`drop table if exists "review_logs" cascade;`);

    this.addSql(`drop table if exists "study_review_logs" cascade;`);

    this.addSql(`drop index "study_sessions_user_id_index";`);
    this.addSql(`drop index "study_sessions_tenant_id_index";`);
    this.addSql(`drop index "study_sessions_user_id_tenant_id_status_index";`);
    this.addSql(
      `alter table "study_sessions" drop column "scope", drop column "study_type", drop column "topic_id", drop column "enrolled_card_ids", drop column "hard_count", drop column "good_count", drop column "easy_count", drop column "abandoned_at";`,
    );

    this.addSql(`alter table "study_sessions" add column "deck_id" uuid null;`);
    this.addSql(`alter table "study_sessions" alter column "id" drop default;`);
    this.addSql(`alter table "study_sessions" alter column "id" drop default;`);
    this.addSql(
      `alter table "study_sessions" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "status" type varchar(50) using ("status"::varchar(50));`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "status" set default 'PENDING';`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "started_at" drop default;`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "started_at" type timestamptz(6) using ("started_at"::timestamptz(6));`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "created_at" drop default;`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "created_at" type timestamptz(6) using ("created_at"::timestamptz(6));`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "updated_at" drop default;`,
    );
    this.addSql(
      `alter table "study_sessions" alter column "updated_at" type timestamptz(6) using ("updated_at"::timestamptz(6));`,
    );
    this.addSql(
      `alter table "study_sessions" add constraint "study_sessions_deck_id_foreign" foreign key ("deck_id") references "decks" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table "study_sessions" rename column "tenant_id" to "workspace_id";`,
    );
    this.addSql(
      `alter table "study_sessions" rename column "again_count" to "due_item_count";`,
    );
    this.addSql(
      `create index "study_sessions_user_id_workspace_id_index" on "study_sessions" ("user_id", "workspace_id");`,
    );
    this.addSql(
      `create index "study_sessions_workspace_id_status_index" on "study_sessions" ("workspace_id", "status");`,
    );

    this.addSql(`alter table "study_stats" drop column "longest_streak";`);

    this.addSql(
      `alter table "study_stats" rename column "current_streak" to "streak";`,
    );

    this.addSql(`drop index "user_word_sense_progress_tenant_id_index";`);
    this.addSql(
      `alter table "user_word_sense_progress" drop column "tenant_id", drop column "stability", drop column "difficulty", drop column "lapses", drop column "reps", drop column "state", drop column "due_date", drop column "last_review_date";`,
    );

    this.addSql(
      `create index "idx_words_normalized_text_pattern" on "words" ("normalized_text");`,
    );
  }
}
