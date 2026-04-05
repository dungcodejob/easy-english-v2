import { Migration } from '@mikro-orm/migrations';

export class Migration20260322151643 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "flashcards" ("id" uuid not null, "tenant_id" uuid not null, "user_id" uuid not null, "front" varchar(500) not null, "back" varchar(1000) not null, "hint" varchar(255) null, "notes" varchar(1000) null, "source" varchar(50) not null, "word_sense_id" uuid null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "flashcards_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "flashcards_tenant_id_index" on "flashcards" ("tenant_id");`,
    );
    this.addSql(
      `create index "flashcards_user_id_index" on "flashcards" ("user_id");`,
    );

    this.addSql(
      `create table "study_stats" ("id" uuid not null, "tenant_id" uuid not null, "user_id" uuid not null, "streak" int not null default 0, "total_cards_reviewed" int not null default 0, "total_study_time_minutes" int not null default 0, "mastered_cards" int not null default 0, "last_study_date" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "study_stats_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "study_stats_tenant_id_index" on "study_stats" ("tenant_id");`,
    );
    this.addSql(
      `create index "study_stats_user_id_index" on "study_stats" ("user_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "flashcards" cascade;`);

    this.addSql(`drop table if exists "study_stats" cascade;`);
  }
}
