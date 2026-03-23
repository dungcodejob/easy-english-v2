import { Entity, PrimaryKey, Property, OneToOne } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { FlashcardOrmEntity } from './flashcard.orm-entity';

@Entity({ tableName: 'flashcard_scheduling_states' })
export class FlashcardSchedulingStateOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @OneToOne(() => FlashcardOrmEntity, (f) => f.schedulingState, {
    owner: true,
    fieldName: 'flashcard_id',
  })
  flashcard!: FlashcardOrmEntity;

  @Property({ type: 'float', default: 0 })
  stability!: number;

  @Property({ type: 'float', default: 0 })
  difficulty!: number;

  @Property({ type: 'int', default: 0 })
  lapses!: number;

  @Property({ type: 'int', default: 0 })
  reps!: number;

  @Property({ type: 'string', length: 50 })
  state!: string; // 'new' | 'learning' | 'review' | 'relearning' | 'grace'

  @Property({ type: 'datetime' })
  dueDate!: Date;

  @Property({ type: 'datetime', nullable: true })
  lastReviewDate?: Date;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor() {
    this.stability = 0;
    this.difficulty = 0;
    this.lapses = 0;
    this.reps = 0;
    this.state = 'new';
    this.dueDate = new Date();
  }
}
