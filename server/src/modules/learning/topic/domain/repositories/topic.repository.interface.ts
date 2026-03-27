import { createInjection } from '@shared/utils';

import { type Topic } from '../entities/topic.aggregate';

export interface TopicWordRef {
  topicWordId: string;
  wordSenseId: string;
  addedAt: Date;
}

export interface ITopicRepository {
  findById(id: string, tenantId: string, userId: string): Promise<Topic | null>;
  findByUser(
    tenantId: string,
    userId: string,
    top: number,
    skip: number,
  ): Promise<{ data: Topic[]; count: number }>;
  findWordsByTopic(
    topicId: string,
    tenantId: string,
    userId: string,
  ): Promise<TopicWordRef[]>;
  persist(topic: Topic): void;
  delete(id: string, tenantId: string, userId: string): Promise<boolean>;
}

const { inject, provider, token } =
  createInjection<ITopicRepository>('ITopicRepository');

export const InjectTopicRepository = inject;
export const provideTopicRepository = provider;
export const TopicRepositoryToken = token;
