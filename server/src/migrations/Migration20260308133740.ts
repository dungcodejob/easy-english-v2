import { Migration } from '@mikro-orm/migrations';

export class Migration20260308133740 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "topics" ("id" uuid not null, "tenant_id" uuid not null, "user_id" uuid not null, "name" varchar(100) not null, "description" varchar(500) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "topics_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "topics_tenant_id_index" on "topics" ("tenant_id");`,
    );
    this.addSql(`create index "topics_user_id_index" on "topics" ("user_id");`);

    this.addSql(
      `create table "topic_words" ("id" uuid not null, "topic_id" uuid not null, "word_sense_id" uuid not null, "status" varchar(255) not null default 'NEW', "added_at" timestamptz not null, constraint "topic_words_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "topic_words_topic_id_index" on "topic_words" ("topic_id");`,
    );
    this.addSql(
      `create index "topic_words_word_sense_id_index" on "topic_words" ("word_sense_id");`,
    );
    this.addSql(
      `alter table "topic_words" add constraint "topic_words_topic_id_word_sense_id_unique" unique ("topic_id", "word_sense_id");`,
    );

    this.addSql(
      `alter table "topic_words" add constraint "topic_words_topic_id_foreign" foreign key ("topic_id") references "topics" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "topic_words" drop constraint "topic_words_topic_id_foreign";`,
    );

    this.addSql(`drop table if exists "topics" cascade;`);

    this.addSql(`drop table if exists "topic_words" cascade;`);
  }
}
