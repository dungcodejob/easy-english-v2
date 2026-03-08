import { Migration } from '@mikro-orm/migrations';

export class Migration20260308080629 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `CREATE INDEX idx_words_normalized_text_pattern ON words (normalized_text varchar_pattern_ops);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX idx_words_normalized_text_pattern;`);
  }
}
