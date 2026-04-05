import { Migration } from '@mikro-orm/migrations';

export class Migration20260325000102 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`ALTER TABLE "topic_words" DROP COLUMN "status";`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `ALTER TABLE "topic_words" ADD COLUMN "status" VARCHAR(20) NOT NULL DEFAULT 'NEW';`,
    );
  }
}
