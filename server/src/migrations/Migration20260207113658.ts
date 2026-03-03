import { Migration } from '@mikro-orm/migrations';

export class Migration20260207113658 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "tenants" ("id" uuid not null, "name" varchar(255) not null, "status" varchar(255) not null default 'ACTIVE', "plan" varchar(255) not null default 'FREE', "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "tenants_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "login_attempt_trackers" ("id" uuid not null, "tenant_id" uuid not null, "identifier" varchar(255) not null, "identifier_type" varchar(255) not null, "attempt_count" int not null default 0, "last_attempt_at" timestamptz not null, "lock_expires_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "login_attempt_trackers_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "login_attempt_trackers_tenant_id_identifier_identi_2398f_index" on "login_attempt_trackers" ("tenant_id", "identifier", "identifier_type");`,
    );

    this.addSql(
      `create table "users" ("id" uuid not null, "tenant_id" uuid not null, "email" varchar(255) not null, "name" varchar(255) not null, "username" varchar(255) not null, "role" varchar(255) not null default 'MEMBER', "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "users_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "users_tenant_id_index" on "users" ("tenant_id");`,
    );
    this.addSql(`create index "users_email_index" on "users" ("email");`);
    this.addSql(
      `alter table "users" add constraint "users_username_unique" unique ("username");`,
    );

    this.addSql(
      `create table "auth_identities" ("id" uuid not null, "user_id" uuid not null, "provider" varchar(255) not null, "provider_user_id" varchar(255) not null, "password_hash" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "auth_identities_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "auth_identities_user_id_index" on "auth_identities" ("user_id");`,
    );
    this.addSql(
      `alter table "auth_identities" add constraint "auth_identities_provider_provider_user_id_unique" unique ("provider", "provider_user_id");`,
    );

    this.addSql(
      `create table "sessions" ("id" uuid not null, "tenant_id" uuid not null, "user_id" uuid not null, "auth_identity_id" uuid null, "refresh_token_hash" varchar(255) null, "status" varchar(255) not null default 'ACTIVE', "expires_at" timestamptz not null, "device_id" varchar(255) null, "ip_address" varchar(255) null, "user_agent" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "sessions_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "sessions_tenant_id_index" on "sessions" ("tenant_id");`,
    );
    this.addSql(
      `create index "sessions_user_id_index" on "sessions" ("user_id");`,
    );
    this.addSql(
      `create index "sessions_status_index" on "sessions" ("status");`,
    );
    this.addSql(
      `create index "sessions_expires_at_index" on "sessions" ("expires_at");`,
    );

    this.addSql(
      `alter table "login_attempt_trackers" add constraint "login_attempt_trackers_tenant_id_foreign" foreign key ("tenant_id") references "tenants" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "users" add constraint "users_tenant_id_foreign" foreign key ("tenant_id") references "tenants" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "auth_identities" add constraint "auth_identities_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "sessions" add constraint "sessions_tenant_id_foreign" foreign key ("tenant_id") references "tenants" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "sessions" add constraint "sessions_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "sessions" add constraint "sessions_auth_identity_id_foreign" foreign key ("auth_identity_id") references "auth_identities" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "login_attempt_trackers" drop constraint "login_attempt_trackers_tenant_id_foreign";`,
    );

    this.addSql(
      `alter table "users" drop constraint "users_tenant_id_foreign";`,
    );

    this.addSql(
      `alter table "sessions" drop constraint "sessions_tenant_id_foreign";`,
    );

    this.addSql(
      `alter table "auth_identities" drop constraint "auth_identities_user_id_foreign";`,
    );

    this.addSql(
      `alter table "sessions" drop constraint "sessions_user_id_foreign";`,
    );

    this.addSql(
      `alter table "sessions" drop constraint "sessions_auth_identity_id_foreign";`,
    );

    this.addSql(`drop table if exists "tenants" cascade;`);

    this.addSql(`drop table if exists "login_attempt_trackers" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "auth_identities" cascade;`);

    this.addSql(`drop table if exists "sessions" cascade;`);
  }
}
