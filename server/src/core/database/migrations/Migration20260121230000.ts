import { Migration } from '@mikro-orm/migrations';

export class Migration20260121230000 extends Migration {
  override async up(): Promise<void> {
    // Create tenants table
    this.addSql(`CREATE TABLE IF NOT EXISTS "tenants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(100) NOT NULL,
        "slug" varchar(50) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
    );`);

    this.addSql(
      `ALTER TABLE "tenants" ADD CONSTRAINT "tenants_slug_unique" UNIQUE ("slug");`,
    );

    // Insert default tenant
    this.addSql(`INSERT INTO "tenants" ("id", "name", "slug") 
        VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default')
        ON CONFLICT DO NOTHING;`);

    // Add FK to users table
    this.addSql(`ALTER TABLE "users" 
        ADD CONSTRAINT "users_tenant_id_foreign" 
        FOREIGN KEY ("tenant_id") 
        REFERENCES "tenants" ("id") 
        ON UPDATE CASCADE;`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_tenant_id_foreign";`,
    );
    this.addSql(`DROP TABLE IF EXISTS "tenants";`);
  }
}
