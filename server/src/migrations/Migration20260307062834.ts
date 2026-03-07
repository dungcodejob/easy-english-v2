import { Migration } from '@mikro-orm/migrations';

export class Migration20260307062834 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "words" alter column "word_family" type jsonb using ("word_family"::jsonb);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "words" alter column "word_family" type varchar(255) using ("word_family"::varchar(255));`);
  }

}
