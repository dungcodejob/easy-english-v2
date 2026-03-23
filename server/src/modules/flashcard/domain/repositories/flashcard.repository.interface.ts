import { createInjection } from '@shared/utils';
import { Flashcard } from '../entities/flashcard.aggregate';

export interface IFlashcardRepository {
  findById(id: string): Promise<Flashcard | null>;
  findByUserId(userId: string, tenantId: string): Promise<Flashcard[]>;
  findDueCards(
    userId: string,
    tenantId: string,
    now: Date,
    limit?: number,
  ): Promise<Flashcard[]>;
  persist(flashcard: Flashcard): Promise<void>;
  delete(id: string, userId: string, tenantId: string): Promise<boolean>;
}

const { inject, provider, token } = createInjection<IFlashcardRepository>(
  'IFlashcardRepository',
);

export const InjectFlashcardRepository = inject;
export const provideFlashcardRepository = provider;
export const FlashcardRepositoryToken = token;
