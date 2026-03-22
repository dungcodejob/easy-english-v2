import { createInjection } from '@shared/utils';
import { FlashcardOrmEntity } from '../../infrastructure/persistence/flashcard.orm-entity';

export interface IFlashcardRepository {
  findById(id: string): Promise<FlashcardOrmEntity | null>;
  findByUserId(userId: string, tenantId: string): Promise<FlashcardOrmEntity[]>;
  create(flashcard: FlashcardOrmEntity): Promise<FlashcardOrmEntity>;
  update(flashcard: FlashcardOrmEntity): Promise<FlashcardOrmEntity>;
  delete(id: string): Promise<boolean>;
}

const { inject, provider, token } = createInjection<IFlashcardRepository>(
  'IFlashcardRepository',
);

export const InjectFlashcardRepository = inject;
export const provideFlashcardRepository = provider;
export const FlashcardRepositoryToken = token;
