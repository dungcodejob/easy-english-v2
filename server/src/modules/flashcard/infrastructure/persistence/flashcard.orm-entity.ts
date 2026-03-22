import {
  Entity,
  Index,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'flashcards' })
export class FlashcardOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ type: 'uuid' })
  @Index()
  tenantId!: string;

  @Property({ type: 'uuid' })
  @Index()
  userId!: string;

  @Property({ length: 500 })
  front!: string;

  @Property({ length: 1000 })
  back!: string;

  @Property({ length: 255, nullable: true })
  hint?: string;

  @Property({ length: 1000, nullable: true })
  notes?: string;

  @Property({ length: 50 })
  source!: 'dictionary' | 'custom';

  @Property({ type: 'uuid', nullable: true })
  wordSenseId?: string;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(
    tenantId: string,
    userId: string,
    front: string,
    back: string,
    source: 'dictionary' | 'custom',
    hint?: string,
    notes?: string,
    wordSenseId?: string,
  ) {
    this.tenantId = tenantId;
    this.userId = userId;
    this.front = front;
    this.back = back;
    this.source = source;
    this.hint = hint;
    this.notes = notes;
    this.wordSenseId = wordSenseId;
  }
}
