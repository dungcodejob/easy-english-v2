import { Migration } from '@mikro-orm/migrations';

export class Migration20260121154242 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "users" ("id" uuid not null default gen_random_uuid(), "tenant_id" uuid not null, "name" varchar(100) not null, "username" varchar(50) not null, "email" varchar(255) not null, "token_version" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`create index "users_tenant_id_index" on "users" ("tenant_id");`);
    this.addSql(`create index "users_username_index" on "users" ("username");`);
    this.addSql(`alter table "users" add constraint "users_username_unique" unique ("username");`);
    this.addSql(`create index "users_email_index" on "users" ("email");`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`create table "sessions" ("id" uuid not null default gen_random_uuid(), "user_id" uuid not null, "refresh_token_hash" varchar(255) not null, "identifier" varchar(255) not null, "user_ip" varchar(45) not null, "expires_at" timestamptz not null, "revoked_at" timestamptz null, "created_at" timestamptz not null, "last_activity_at" timestamptz not null, "deleted_at" timestamptz null, constraint "sessions_pkey" primary key ("id"));`);

    this.addSql(`create table "accounts" ("id" uuid not null default gen_random_uuid(), "user_id" uuid not null, "type" text check ("type" in ('LOCAL', 'GOOGLE', 'GITHUB', 'FACEBOOK')) not null, "provider_id" varchar(255) null, "email" varchar(255) not null, "password_hash" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "accounts_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_account_type_email" on "accounts" ("type", "email");`);
    this.addSql(`create index "idx_account_provider" on "accounts" ("type", "provider_id");`);

    this.addSql(`alter table "sessions" add constraint "sessions_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "accounts" add constraint "accounts_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "sessions" drop constraint "sessions_user_id_foreign";`);

    this.addSql(`alter table "accounts" drop constraint "accounts_user_id_foreign";`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "sessions" cascade;`);

    this.addSql(`drop table if exists "accounts" cascade;`);
  }

}
