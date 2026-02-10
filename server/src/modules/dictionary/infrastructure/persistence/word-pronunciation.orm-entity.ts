import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { WordOrmEntity } from './word.orm-entity';

@Entity({ tableName: 'word_pronunciations' })
export class WordPronunciationOrmEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => WordOrmEntity)
  word!: WordOrmEntity;

  @Property()
  ipa!: string;

  @Property({ nullable: true })
  audioUrl!: string | null;

  @Property()
  region!: string;
}
