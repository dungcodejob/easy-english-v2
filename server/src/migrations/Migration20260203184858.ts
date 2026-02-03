import { Migration } from '@mikro-orm/migrations';

export class Migration20260203184858 extends Migration {
  override async up(): Promise<void> {
    // Sessions Table
    this.addSql(`create table "sessions" (
      "id" uuid not null,
      "tenant_id" uuid not null,
      "user_id" uuid not null,
      "auth_identity_id" uuid null,
      "refresh_token_hash" varchar(255) null,
      "status" varchar(50) not null default 'ACTIVE',
      "expires_at" timestamptz not null,
      "device_id" varchar(255) null,
      "ip_address" varchar(45) null,
      "user_agent" varchar(500) null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      constraint "sessions_pkey" primary key ("id")
    );`);

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
      `alter table "sessions" add constraint "sessions_tenant_id_foreign" foreign key ("tenant_id") references "tenants" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "sessions" add constraint "sessions_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "sessions" add constraint "sessions_auth_identity_id_foreign" foreign key ("auth_identity_id") references "auth_identities" ("id") on update cascade on delete set null;`,
    );

    // Login Attempt Trackers Table
    this.addSql(`create table "login_attempt_trackers" (
      "id" uuid not null,
      "tenant_id" uuid not null,
      "identifier" varchar(255) not null,
      "identifier_type" varchar(50) not null,
      "attempt_count" int not null default 0,
      "last_attempt_at" timestamptz not null default now(),
      "lock_expires_at" timestamptz null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      constraint "login_attempt_trackers_pkey" primary key ("id")
    );`);

    this.addSql(
      `create index "login_attempt_trackers_tenant_id_identifier_index" on "login_attempt_trackers" ("tenant_id", "identifier", "identifier_type");`,
    );
    this.addSql(
      `alter table "login_attempt_trackers" add constraint "login_attempt_trackers_tenant_id_foreign" foreign key ("tenant_id") references "tenants" ("id") on update cascade on delete cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "sessions" cascade;`);
    this.addSql(`drop table if exists "login_attempt_trackers" cascade;`);
  }
}
