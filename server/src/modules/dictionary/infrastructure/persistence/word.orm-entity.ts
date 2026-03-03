import {
  Collection,
  Entity,
  Index,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { WordPronunciationOrmEntity } from './word-pronunciation.orm-entity';
import { WordSenseOrmEntity } from './word-sense.orm-entity';

@Entity({ tableName: 'words' })
export class WordOrmEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  text!: string;

  @Property()
  @Unique()
  @Index()
  normalizedText!: string;

  @Property()
  language!: string;

  @Property({ nullable: true })
  rank!: number | null;

  @Property({ type: 'float', nullable: true })
  frequency!: number | null;

  @Property()
  source!: string;

  @Property({ type: 'jsonb', nullable: true })
  inflects!: unknown | null;

  @Property({ nullable: true })
  wordFamily!: string | null;

  // @Property({ type: 'uuid' }) // Assuming simple uuid storage for tenantId for now, or use relation if Tenant entity works. ERD says FK.
  // @Index()
  // tenantId!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => WordSenseOrmEntity, (sense) => sense.word, {
    orphanRemoval: true,
  })
  senses = new Collection<WordSenseOrmEntity>(this);

  @OneToMany(
    () => WordPronunciationOrmEntity,
    (pronunciation) => pronunciation.word,
    { orphanRemoval: true },
  )
  pronunciations = new Collection<WordPronunciationOrmEntity>(this);
}
