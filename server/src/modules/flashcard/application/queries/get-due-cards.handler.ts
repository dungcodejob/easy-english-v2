import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { GetDueCardsQuery } from './get-due-cards.query';
import { FlashcardOrmEntity } from '../../infrastructure/persistence/flashcard.orm-entity';

interface DueCard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  source: 'learning-list' | 'custom';
  masteryLevel: number;
}

@QueryHandler(GetDueCardsQuery)
export class GetDueCardsHandler implements IQueryHandler<GetDueCardsQuery> {
  constructor(private readonly em: EntityManager) {}

  async execute(query: GetDueCardsQuery): Promise<DueCard[]> {
    const limit = query.limit ?? 20;

    // Get custom flashcards that are due (all custom cards for now)
    const customCards = await this.em.find(
      FlashcardOrmEntity,
      { userId: query.userId, tenantId: query.tenantId },
      { limit },
    );

    // Map to response format
    const customDue: DueCard[] = customCards.map((c) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      hint: c.hint,
      source: 'custom' as const,
      masteryLevel: 0,
    }));

    return customDue;
  }
}
