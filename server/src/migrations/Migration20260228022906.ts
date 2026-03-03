import { Migration } from '@mikro-orm/migrations';

export class Migration20260228022906 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "provider_response_cache" ("id" uuid not null default gen_random_uuid(), "normalized_word" varchar(100) not null, "provider" varchar(50) not null, "raw_response" jsonb not null, "http_status" int not null, "created_at" timestamptz not null, "expires_at" timestamptz not null, constraint "provider_response_cache_pkey" primary key ("id"));`);
    this.addSql(`create index "provider_response_cache_normalized_word_index" on "provider_response_cache" ("normalized_word");`);
    this.addSql(`create index "provider_response_cache_expires_at_index" on "provider_response_cache" ("expires_at");`);
    this.addSql(`alter table "provider_response_cache" add constraint "provider_response_cache_normalized_word_provider_unique" unique ("normalized_word", "provider");`);

    this.addSql(`create table "words" ("id" uuid not null default gen_random_uuid(), "text" varchar(255) not null, "normalized_text" varchar(255) not null, "language" varchar(255) not null, "rank" int null, "frequency" real null, "source" varchar(255) not null, "inflects" jsonb null, "word_family" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "words_pkey" primary key ("id"));`);
    this.addSql(`create index "words_normalized_text_index" on "words" ("normalized_text");`);
    this.addSql(`alter table "words" add constraint "words_normalized_text_unique" unique ("normalized_text");`);

    this.addSql(`create table "word_pronunciations" ("id" uuid not null default gen_random_uuid(), "word_id" uuid not null, "ipa" varchar(255) not null, "audio_url" varchar(255) null, "region" varchar(255) not null, constraint "word_pronunciations_pkey" primary key ("id"));`);

    this.addSql(`create table "word_senses" ("id" uuid not null default gen_random_uuid(), "word_id" uuid not null, "part_of_speech" varchar(255) not null, "definition" text not null, "short_definition" varchar(255) null, "cefr_level" varchar(255) null, "synonyms" jsonb null, "antonyms" jsonb null, "collocations" jsonb null, "related_words" jsonb null, "idioms" jsonb null, "phrases" jsonb null, "images" jsonb null, "definition_vi" text null, "order" int not null, constraint "word_senses_pkey" primary key ("id"));`);

    this.addSql(`create table "word_examples" ("id" uuid not null default gen_random_uuid(), "sense_id" uuid not null, "text" text not null, "translation_vi" text null, "order" int not null, constraint "word_examples_pkey" primary key ("id"));`);

    this.addSql(`alter table "word_pronunciations" add constraint "word_pronunciations_word_id_foreign" foreign key ("word_id") references "words" ("id") on update cascade;`);

    this.addSql(`alter table "word_senses" add constraint "word_senses_word_id_foreign" foreign key ("word_id") references "words" ("id") on update cascade;`);

    this.addSql(`alter table "word_examples" add constraint "word_examples_sense_id_foreign" foreign key ("sense_id") references "word_senses" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "word_pronunciations" drop constraint "word_pronunciations_word_id_foreign";`);

    this.addSql(`alter table "word_senses" drop constraint "word_senses_word_id_foreign";`);

    this.addSql(`alter table "word_examples" drop constraint "word_examples_sense_id_foreign";`);

    this.addSql(`drop table if exists "provider_response_cache" cascade;`);

    this.addSql(`drop table if exists "words" cascade;`);

    this.addSql(`drop table if exists "word_pronunciations" cascade;`);

    this.addSql(`drop table if exists "word_senses" cascade;`);

    this.addSql(`drop table if exists "word_examples" cascade;`);
  }

}
