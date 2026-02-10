import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { WordSenseOrmEntity } from './word-sense.orm-entity';

@Entity({ tableName: 'word_examples' })
export class WordExampleOrmEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => WordSenseOrmEntity)
  sense!: WordSenseOrmEntity;

  @Property({ type: 'text' })
  text!: string;

  @Property({ type: 'text', nullable: true })
  translationVi!: string | null;

  @Property()
  order!: number;
}
