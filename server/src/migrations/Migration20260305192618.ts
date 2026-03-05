import { Migration } from '@mikro-orm/migrations';

export class Migration20260305192618 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user_word_sense_progress" ("id" uuid not null default gen_random_uuid(), "user_id" uuid not null, "word_sense_id" uuid not null, "mastery_level" int not null default 0, "review_count" int not null default 0, "next_review_at" timestamptz not null default now(), "last_reviewed_at" timestamptz null, "archived_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), constraint "user_word_sense_progress_pkey" primary key ("id"));`);
    this.addSql(`create index "user_word_sense_progress_user_id_index" on "user_word_sense_progress" ("user_id");`);
    this.addSql(`create index "user_word_sense_progress_word_sense_id_index" on "user_word_sense_progress" ("word_sense_id");`);
    this.addSql(`create index "user_word_sense_progress_user_id_archived_at_index" on "user_word_sense_progress" ("user_id", "archived_at");`);
    this.addSql(`alter table "user_word_sense_progress" add constraint "user_word_sense_progress_user_id_word_sense_id_unique" unique ("user_id", "word_sense_id");`);

    this.addSql(`alter table "user_word_sense_progress" add constraint "user_word_sense_progress_word_sense_id_foreign" foreign key ("word_sense_id") references "word_senses" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user_word_sense_progress" cascade;`);
  }

}
