import { Collection } from '@mikro-orm/core';
import { err, ok, type Result } from 'neverthrow';
import { v7 as uuid } from 'uuid';

import { AggregateRoot } from '@core/ddd';

import { TopicWord } from './topic-word.entity';
import { TopicCreatedEvent } from '../events/topic-created.event';
import { TopicDeletedEvent } from '../events/topic-deleted.event';
import { TopicUpdatedEvent } from '../events/topic-updated.event';
import { TopicWordAddedEvent } from '../events/topic-word-added.event';
import { TopicWordRemovedEvent } from '../events/topic-word-removed.event';

export const MAX_TOPICS_PER_USER = 50;
export const MAX_WORDS_PER_TOPIC = 200;

export interface TopicProps {
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
}

export class Topic extends AggregateRoot {
  private _tenantId!: string;
  private _userId!: string;
  private _name!: string;
  private _description!: string | null;
  private _words!: Collection<TopicWord>;

  get tenantId(): string {
    return this._tenantId;
  }

  get userId(): string {
    return this._userId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get words(): Collection<TopicWord> {
    return this._words;
  }

  static create(
    props: TopicProps,
    existingCount: number,
  ): Result<Topic, 'limit_reached'> {
    if (existingCount >= MAX_TOPICS_PER_USER) {
      return err('limit_reached');
    }

    const topic = new Topic({
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    topic._tenantId = props.tenantId;
    topic._userId = props.userId;
    topic._name = props.name;
    topic._description = props.description ?? null;
    topic._words = new Collection<TopicWord>(topic);

    topic.addEvent(new TopicCreatedEvent({ aggregateId: topic.id, topic }));

    return ok(topic);
  }

  static rehydrate(
    props: {
      id: string;
      tenantId: string;
      userId: string;
      name: string;
      description: string | null;
    },
    createdAt: Date,
    updatedAt: Date,
    words: TopicWord[],
  ): Topic {
    const topic = new Topic({ id: props.id, createdAt, updatedAt });

    topic._tenantId = props.tenantId;
    topic._userId = props.userId;
    topic._name = props.name;
    topic._description = props.description;
    topic._words = new Collection<TopicWord>(topic);
    for (const word of words) {
      topic._words.add(word);
    }

    return topic;
  }

  update(props: { name?: string; description?: string | null }): void {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    this.updateUpdatedAt();
    this.addEvent(new TopicUpdatedEvent({ aggregateId: this.id, topic: this }));
  }

  markDeleted(): void {
    this.addEvent(
      new TopicDeletedEvent({
        aggregateId: this.id,
        topicId: this.id,
        userId: this._userId,
        tenantId: this._tenantId,
      }),
    );
  }

  addWord(
    wordSenseId: string,
    existingWordCount: number,
  ): Result<{ topicWord: TopicWord }, 'duplicate' | 'limit_reached'> {
    // Check for duplicate within current collection
    const isDuplicate = this._words
      .getItems()
      .some((tw) => tw.wordSenseId === wordSenseId);

    if (isDuplicate) {
      return err('duplicate');
    }

    if (existingWordCount >= MAX_WORDS_PER_TOPIC) {
      return err('limit_reached');
    }

    const topicWord = TopicWord.create(wordSenseId);

    this._words.add(topicWord);

    this.addEvent(
      new TopicWordAddedEvent({
        aggregateId: this.id,
        topicId: this.id,
        userId: this._userId,
        tenantId: this._tenantId,
        wordSenseId,
      }),
    );

    return ok({ topicWord });
  }

  removeWord(wordSenseId: string): Result<void, 'not_found'> {
    const topicWord = this._words
      .getItems()
      .find((tw) => tw.wordSenseId === wordSenseId);

    if (!topicWord) {
      return err('not_found');
    }

    this._words.remove(topicWord);

    this.addEvent(
      new TopicWordRemovedEvent({
        aggregateId: this.id,
        topicId: this.id,
        userId: this._userId,
        tenantId: this._tenantId,
        wordSenseId,
      }),
    );

    return ok(undefined);
  }
}
