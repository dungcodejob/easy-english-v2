import { Migration } from '@mikro-orm/migrations';

export class Migration20260203153412 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "session_entity" drop constraint "session_entity_account_id_foreign";`);

    this.addSql(`alter table "vocab_set_entity" drop constraint "vocab_set_entity_category_id_foreign";`);

    this.addSql(`alter table "category_entity" drop constraint "category_entity_collection_id_foreign";`);

    this.addSql(`alter table "account_entity" drop constraint "account_entity_tenant_id_foreign";`);

    this.addSql(`alter table "session_entity" drop constraint "session_entity_tenant_id_foreign";`);

    this.addSql(`alter table "topic_entity" drop constraint "topic_entity_tenant_id_foreign";`);

    this.addSql(`alter table "user_entity" drop constraint "user_entity_tenant_id_foreign";`);

    this.addSql(`alter table "workspace_entity" drop constraint "workspace_entity_tenant_id_foreign";`);

    this.addSql(`alter table "topic_senses" drop constraint "topic_senses_topic_id_foreign";`);

    this.addSql(`alter table "user_word_sense_entity" drop constraint "user_word_sense_entity_topic_id_foreign";`);

    this.addSql(`alter table "account_entity" drop constraint "account_entity_user_id_foreign";`);

    this.addSql(`alter table "session_entity" drop constraint "session_entity_user_id_foreign";`);

    this.addSql(`alter table "topic_entity" drop constraint "topic_entity_user_id_foreign";`);

    this.addSql(`alter table "vocab_set_entity_examples" drop constraint "vocab_set_entity_examples_vocab_set_entity_id_foreign";`);

    this.addSql(`alter table "vocab_set_entity_senses" drop constraint "vocab_set_entity_senses_vocab_set_entity_id_foreign";`);

    this.addSql(`alter table "word_pronunciation_entity" drop constraint "word_pronunciation_entity_word_id_foreign";`);

    this.addSql(`alter table "word_sense_entity" drop constraint "word_sense_entity_word_id_foreign";`);

    this.addSql(`alter table "vocab_set_entity_examples" drop constraint "vocab_set_entity_examples_word_example_entity_id_foreign";`);

    this.addSql(`alter table "topic_senses" drop constraint "topic_senses_word_sense_id_foreign";`);

    this.addSql(`alter table "user_word_sense_entity" drop constraint "user_word_sense_entity_dictionary_sense_id_foreign";`);

    this.addSql(`alter table "vocab_set_entity_senses" drop constraint "vocab_set_entity_senses_word_sense_entity_id_foreign";`);

    this.addSql(`alter table "word_example_entity" drop constraint "word_example_entity_sense_id_foreign";`);

    this.addSql(`alter table "topic_entity" drop constraint "topic_entity_workspace_id_foreign";`);

    this.addSql(`alter table "user_word_sense_entity" drop constraint "user_word_sense_entity_workspace_id_foreign";`);

    this.addSql(`create table "tenants" ("id" uuid not null, "name" varchar(255) not null, "status" varchar(255) not null default 'ACTIVE', "plan" varchar(255) not null default 'FREE', "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "tenants_pkey" primary key ("id"));`);

    this.addSql(`create table "users" ("id" uuid not null, "tenant_id" uuid not null, "email" varchar(255) not null, "name" varchar(255) not null, "username" varchar(255) not null, "role" varchar(255) not null default 'MEMBER', "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`create index "users_tenant_id_index" on "users" ("tenant_id");`);
    this.addSql(`create index "users_email_index" on "users" ("email");`);
    this.addSql(`alter table "users" add constraint "users_username_unique" unique ("username");`);

    this.addSql(`create table "auth_identities" ("id" uuid not null, "user_id" uuid not null, "provider" varchar(255) not null, "provider_user_id" varchar(255) not null, "password_hash" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "auth_identities_pkey" primary key ("id"));`);
    this.addSql(`create index "auth_identities_user_id_index" on "auth_identities" ("user_id");`);
    this.addSql(`alter table "auth_identities" add constraint "auth_identities_provider_provider_user_id_unique" unique ("provider", "provider_user_id");`);

    this.addSql(`alter table "users" add constraint "users_tenant_id_foreign" foreign key ("tenant_id") references "tenants" ("id") on update cascade;`);

    this.addSql(`alter table "auth_identities" add constraint "auth_identities_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);

    this.addSql(`drop table if exists "account_entity" cascade;`);

    this.addSql(`drop table if exists "api_response_cache" cascade;`);

    this.addSql(`drop table if exists "category_entity" cascade;`);

    this.addSql(`drop table if exists "collection_entity" cascade;`);

    this.addSql(`drop table if exists "session_entity" cascade;`);

    this.addSql(`drop table if exists "tenant_entity" cascade;`);

    this.addSql(`drop table if exists "topic_entity" cascade;`);

    this.addSql(`drop table if exists "topic_senses" cascade;`);

    this.addSql(`drop table if exists "user_entity" cascade;`);

    this.addSql(`drop table if exists "user_word_sense_entity" cascade;`);

    this.addSql(`drop table if exists "vocab_set_entity" cascade;`);

    this.addSql(`drop table if exists "vocab_set_entity_examples" cascade;`);

    this.addSql(`drop table if exists "vocab_set_entity_senses" cascade;`);

    this.addSql(`drop table if exists "word_cache_entity" cascade;`);

    this.addSql(`drop table if exists "word_entity" cascade;`);

    this.addSql(`drop table if exists "word_example_entity" cascade;`);

    this.addSql(`drop table if exists "word_pronunciation_entity" cascade;`);

    this.addSql(`drop table if exists "word_sense_entity" cascade;`);

    this.addSql(`drop table if exists "workspace_entity" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "users" drop constraint "users_tenant_id_foreign";`);

    this.addSql(`alter table "auth_identities" drop constraint "auth_identities_user_id_foreign";`);

    this.addSql(`create table "account_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "tenant_id" uuid not null, "username" varchar(255) not null, "email" varchar(255) not null, "password_hash" varchar(255) not null, "version" int4 not null, "password_updated_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "is_active" bool not null default true, "last_login_at" timestamptz(6) null, "user_id" varchar(255) not null, constraint "account_entity_pkey" primary key ("id"));`);
    this.addSql(`alter table "account_entity" add constraint "account_entity_email_unique" unique ("email");`);
    this.addSql(`alter table "account_entity" add constraint "account_entity_username_unique" unique ("username");`);

    this.addSql(`create table "api_response_cache" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "provider" text check ("provider" in ('azvocab', 'cambridge', 'free_dictionary')) not null, "endpoint_type" text check ("endpoint_type" in ('search', 'definition')) not null, "request_identifier" varchar(255) not null, "raw_response" jsonb not null, "response_size_bytes" int4 null, "status_code" int4 not null default 200, "latency_ms" int4 null, constraint "api_response_cache_pkey" primary key ("id"));`);
    this.addSql(`alter table "api_response_cache" add constraint "api_response_cache_provider_endpoint_type_request_6b54c_unique" unique ("provider", "endpoint_type", "request_identifier");`);
    this.addSql(`create index "api_response_cache_provider_request_identifier_index" on "api_response_cache" ("provider", "request_identifier");`);

    this.addSql(`create table "category_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "external_id" varchar(255) not null, "name" varchar(255) not null, "collection_id" uuid not null, constraint "category_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "category_entity_collection_id_index" on "category_entity" ("collection_id");`);
    this.addSql(`alter table "category_entity" add constraint "category_entity_external_id_unique" unique ("external_id");`);

    this.addSql(`create table "collection_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "external_id" varchar(255) not null, "name" varchar(255) not null, "brief" varchar(255) null, "description" text null, "image" varchar(255) null, "languages" jsonb null, constraint "collection_entity_pkey" primary key ("id"));`);
    this.addSql(`alter table "collection_entity" add constraint "collection_entity_external_id_unique" unique ("external_id");`);

    this.addSql(`create table "session_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "tenant_id" uuid not null, "device_id" varchar(255) not null, "expires_at" timestamptz(6) null, "last_accessed_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "is_active" bool not null default true, "refresh_token_hash" varchar(255) null, "refresh_count" int4 not null default 0, "ip_address" varchar(45) null, "user_agent" varchar(500) null, "device_type" varchar(100) null, "location" varchar(100) null, "account_id" uuid not null, "user_id" varchar(255) not null, constraint "session_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "session_entity_account_id_is_active_index" on "session_entity" ("account_id", "is_active");`);
    this.addSql(`create index "session_entity_id_index" on "session_entity" ("id");`);
    this.addSql(`create index "session_entity_tenant_id_is_active_index" on "session_entity" ("tenant_id", "is_active");`);

    this.addSql(`create table "tenant_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "name" varchar(100) not null, "slug" varchar(50) not null, "description" varchar(500) null, "status" text check ("status" in ('ACTIVE', 'SUSPENDED', 'INACTIVE')) not null, "plan" text check ("plan" in ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE')) not null, "logo_url" varchar(2048) null, "primary_color" varchar(7) null, "settings" jsonb null, "limits" jsonb null, "usage" jsonb null, "subscription_expires_at" timestamptz(6) null, "is_active" bool not null default true, constraint "tenant_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "tenant_entity_id_index" on "tenant_entity" ("id");`);
    this.addSql(`create index "tenant_entity_plan_index" on "tenant_entity" ("plan");`);
    this.addSql(`create index "tenant_entity_slug_index" on "tenant_entity" ("slug");`);
    this.addSql(`alter table "tenant_entity" add constraint "tenant_entity_slug_unique" unique ("slug");`);
    this.addSql(`create index "tenant_entity_status_index" on "tenant_entity" ("status");`);

    this.addSql(`create table "topic_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "tenant_id" uuid not null, "name" varchar(255) not null, "description" varchar(255) null, "category" text check ("category" in ('Vocabulary', 'Grammar', 'Idioms', 'Phrases', 'Pronunciation', 'Listening', 'Speaking', 'Reading', 'Writing')) not null default 'VOCABULARY', "tags" text[] not null, "language_pair" varchar(255) not null, "cover_image_url" varchar(255) null, "is_public" bool not null default false, "word_count" int4 not null default 0, "share_url" varchar(255) null, "user_id" varchar(255) not null, "workspace_id" uuid not null, constraint "topic_entity_pkey" primary key ("id"));`);

    this.addSql(`create table "topic_senses" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "topic_id" uuid not null, "word_sense_id" uuid not null, "personal_note" text null, "personal_examples" jsonb null, "definition_vi" text null, "custom_images" jsonb null, "difficulty_rating" int4 null, "tags" jsonb null, "order_index" int4 not null default 0, "learning_status" text check ("learning_status" in ('new', 'learning', 'reviewing', 'mastered')) not null default 'new', "last_review_at" date null, "review_count" int4 not null default 0, "ease_factor" numeric(10,0) not null default 2.5, "interval" int4 not null default 0, "next_review_at" date null, constraint "topic_senses_pkey" primary key ("id"));`);
    this.addSql(`create index "topic_senses_topic_id_index" on "topic_senses" ("topic_id");`);
    this.addSql(`alter table "topic_senses" add constraint "topic_senses_topic_id_word_sense_id_unique" unique ("topic_id", "word_sense_id");`);
    this.addSql(`create index "topic_senses_word_sense_id_index" on "topic_senses" ("word_sense_id");`);

    this.addSql(`create table "user_entity" ("id" varchar(255) not null, "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "name" varchar(255) not null, "role" text check ("role" in ('USER', 'ADMIN')) not null, "tenant_id" uuid not null, constraint "user_entity_pkey" primary key ("id"));`);

    this.addSql(`create table "user_word_sense_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "user_id" varchar(255) not null, "topic_id" uuid not null, "word" varchar(255) not null, "language" varchar(255) not null, "part_of_speech" varchar(255) not null, "definition" text not null, "examples" jsonb null, "pronunciation" varchar(255) null, "synonyms" varchar(255) null, "antonyms" varchar(255) null, "difficulty_level" text check ("difficulty_level" in ('easy', 'medium', 'hard')) not null default 'easy', "media" jsonb null, "learning_status" text check ("learning_status" in ('new', 'learning', 'reviewing', 'mastered')) not null default 'new', "last_review_at" date null, "dictionary_sense_id" uuid null, "workspace_id" uuid not null, "definition_vi" text null, "pronunciation_uk" varchar(255) null, "pronunciation_us" varchar(255) null, "audio_uk" varchar(255) null, "audio_us" varchar(255) null, "images" jsonb null, "collocations" jsonb null, "related_words" jsonb null, "idioms" jsonb null, "phrases" jsonb null, "verb_phrases" jsonb null, "cefr_level" varchar(255) null, "is_custom_word" bool not null default true, constraint "user_word_sense_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "user_word_sense_entity_topic_id_index" on "user_word_sense_entity" ("topic_id");`);
    this.addSql(`create index "user_word_sense_entity_user_id_index" on "user_word_sense_entity" ("user_id");`);

    this.addSql(`create table "vocab_set_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "external_id" varchar(255) not null, "name" varchar(255) not null, "category_id" uuid not null, constraint "vocab_set_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "vocab_set_entity_category_id_index" on "vocab_set_entity" ("category_id");`);
    this.addSql(`alter table "vocab_set_entity" add constraint "vocab_set_entity_external_id_unique" unique ("external_id");`);

    this.addSql(`create table "vocab_set_entity_examples" ("vocab_set_entity_id" uuid not null, "word_example_entity_id" uuid not null, constraint "vocab_set_entity_examples_pkey" primary key ("vocab_set_entity_id", "word_example_entity_id"));`);

    this.addSql(`create table "vocab_set_entity_senses" ("vocab_set_entity_id" uuid not null, "word_sense_entity_id" uuid not null, constraint "vocab_set_entity_senses_pkey" primary key ("vocab_set_entity_id", "word_sense_entity_id"));`);

    this.addSql(`create table "word_cache_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "word" varchar(255) not null, "source" varchar(255) not null, "raw" jsonb not null, "expires_at" timestamptz(6) null, constraint "word_cache_entity_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX word_cache_entity_word_source_active_idx ON public.word_cache_entity USING btree (word, source) WHERE (delete_flag = false);`);

    this.addSql(`create table "word_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "text" varchar(255) not null, "normalized_text" varchar(255) not null, "language" varchar(255) not null default 'en', "rank" int4 null, "frequency" int4 null, "source" varchar(255) not null default 'cambridge', "inflects" jsonb null, "word_family" jsonb null, "update_by" varchar(255) null, constraint "word_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "word_entity_normalized_text_index" on "word_entity" ("normalized_text");`);
    this.addSql(`alter table "word_entity" add constraint "word_entity_normalized_text_language_unique" unique ("normalized_text", "language");`);

    this.addSql(`create table "word_example_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "external_id" varchar(255) null, "sense_id" uuid not null, "text" text not null, "translation_vi" text null, "order" int4 not null default 0, constraint "word_example_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "word_example_entity_sense_id_index" on "word_example_entity" ("sense_id");`);

    this.addSql(`create table "word_pronunciation_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "word_id" uuid not null, "ipa" varchar(255) null, "audio_url" varchar(255) null, "region" varchar(255) null, constraint "word_pronunciation_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "word_pronunciation_entity_word_id_index" on "word_pronunciation_entity" ("word_id");`);

    this.addSql(`create table "word_sense_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "word_id" uuid not null, "part_of_speech" varchar(255) not null, "definition" text not null, "short_definition" text null, "synonyms" jsonb null, "antonyms" jsonb null, "sense_index" int4 not null, "source" varchar(255) not null, "external_id" varchar(255) null, "cefr_level" varchar(255) null, "images" jsonb null, "collocations" jsonb null, "related_words" jsonb null, "idioms" jsonb null, "phrases" jsonb null, "verb_phrases" jsonb null, "definition_vi" text null, "update_by" varchar(255) null, constraint "word_sense_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "word_sense_entity_part_of_speech_index" on "word_sense_entity" ("part_of_speech");`);
    this.addSql(`create index "word_sense_entity_word_id_index" on "word_sense_entity" ("word_id");`);

    this.addSql(`create table "workspace_entity" ("id" uuid not null default uuidv7(), "create_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "update_at" timestamptz(6) not null default CURRENT_TIMESTAMP, "deleted_at" timestamptz(6) null, "delete_flag" bool not null default false, "tenant_id" uuid not null, "name" varchar(255) not null, "description" varchar(255) not null, "language" text check ("language" in ('en')) not null, "user_id" varchar(255) not null, constraint "workspace_entity_pkey" primary key ("id"));`);
    this.addSql(`alter table "workspace_entity" add constraint "workspace_entity_name_unique" unique ("name");`);

    this.addSql(`alter table "account_entity" add constraint "account_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade on delete no action;`);
    this.addSql(`alter table "account_entity" add constraint "account_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "category_entity" add constraint "category_entity_collection_id_foreign" foreign key ("collection_id") references "collection_entity" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "session_entity" add constraint "session_entity_account_id_foreign" foreign key ("account_id") references "account_entity" ("id") on update cascade on delete no action;`);
    this.addSql(`alter table "session_entity" add constraint "session_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade on delete no action;`);
    this.addSql(`alter table "session_entity" add constraint "session_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "topic_entity" add constraint "topic_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade on delete no action;`);
    this.addSql(`alter table "topic_entity" add constraint "topic_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade on delete no action;`);
    this.addSql(`alter table "topic_entity" add constraint "topic_entity_workspace_id_foreign" foreign key ("workspace_id") references "workspace_entity" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "topic_senses" add constraint "topic_senses_topic_id_foreign" foreign key ("topic_id") references "topic_entity" ("id") on update cascade on delete no action;`);
    this.addSql(`alter table "topic_senses" add constraint "topic_senses_word_sense_id_foreign" foreign key ("word_sense_id") references "word_sense_entity" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "user_entity" add constraint "user_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "user_word_sense_entity" add constraint "user_word_sense_entity_dictionary_sense_id_foreign" foreign key ("dictionary_sense_id") references "word_sense_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "user_word_sense_entity" add constraint "user_word_sense_entity_topic_id_foreign" foreign key ("topic_id") references "topic_entity" ("id") on update cascade on delete no action;`);
    this.addSql(`alter table "user_word_sense_entity" add constraint "user_word_sense_entity_workspace_id_foreign" foreign key ("workspace_id") references "workspace_entity" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "vocab_set_entity" add constraint "vocab_set_entity_category_id_foreign" foreign key ("category_id") references "category_entity" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "vocab_set_entity_examples" add constraint "vocab_set_entity_examples_vocab_set_entity_id_foreign" foreign key ("vocab_set_entity_id") references "vocab_set_entity" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "vocab_set_entity_examples" add constraint "vocab_set_entity_examples_word_example_entity_id_foreign" foreign key ("word_example_entity_id") references "word_example_entity" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "vocab_set_entity_senses" add constraint "vocab_set_entity_senses_vocab_set_entity_id_foreign" foreign key ("vocab_set_entity_id") references "vocab_set_entity" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "vocab_set_entity_senses" add constraint "vocab_set_entity_senses_word_sense_entity_id_foreign" foreign key ("word_sense_entity_id") references "word_sense_entity" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "word_example_entity" add constraint "word_example_entity_sense_id_foreign" foreign key ("sense_id") references "word_sense_entity" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "word_pronunciation_entity" add constraint "word_pronunciation_entity_word_id_foreign" foreign key ("word_id") references "word_entity" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "word_sense_entity" add constraint "word_sense_entity_word_id_foreign" foreign key ("word_id") references "word_entity" ("id") on update cascade on delete no action;`);

    this.addSql(`alter table "workspace_entity" add constraint "workspace_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade on delete no action;`);

    this.addSql(`drop table if exists "tenants" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "auth_identities" cascade;`);
  }

}
