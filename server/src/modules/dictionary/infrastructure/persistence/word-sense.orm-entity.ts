import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { WordExampleOrmEntity } from './word-example.orm-entity';
import { WordOrmEntity } from './word.orm-entity';

@Entity({ tableName: 'word_senses' })
export class WordSenseOrmEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => WordOrmEntity)
  word!: WordOrmEntity;

  @Property()
  partOfSpeech!: string;

  @Property({ type: 'text' })
  definition!: string;

  @Property({ nullable: true })
  shortDefinition!: string | null;

  @Property({ nullable: true })
  cefrLevel!: string | null;

  @Property({ type: 'jsonb', nullable: true })
  synonyms!: string[] | null;

  @Property({ type: 'jsonb', nullable: true })
  antonyms!: string[] | null;

  @Property({ type: 'jsonb', nullable: true })
  collocations!: unknown;

  @Property({ type: 'jsonb', nullable: true })
  relatedWords!: string[] | null;

  @Property({ type: 'jsonb', nullable: true })
  idioms!: string[] | null;

  @Property({ type: 'jsonb', nullable: true })
  phrases!: string[] | null;

  @Property({ type: 'jsonb', nullable: true })
  images!: string[] | null;

  @Property({ type: 'text', nullable: true })
  definitionVi!: string | null;

  @Property()
  order!: number;

  @OneToMany(() => WordExampleOrmEntity, (example) => example.sense, {
    orphanRemoval: true,
  })
  examples = new Collection<WordExampleOrmEntity>(this);
}
