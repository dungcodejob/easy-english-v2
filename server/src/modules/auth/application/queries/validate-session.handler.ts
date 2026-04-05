import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ValidateSessionQuery } from './validate-session.query';
import {
  type ISessionRepository,
  InjectSessionRepository,
} from '../../domain/repositories/session.repository.interface';

@QueryHandler(ValidateSessionQuery)
export class ValidateSessionHandler implements IQueryHandler<ValidateSessionQuery> {
  @InjectSessionRepository()
  private readonly sessionRepo: ISessionRepository;

  async execute(query: ValidateSessionQuery): Promise<boolean> {
    const { sessionId } = query;

    // Again, need findById or similar.
    // Or check if session is active.
    const session = await this.sessionRepo.findById(sessionId);

    if (!session) {
      return false;
    }

    if (session.isExpired()) {
      return false;
    }

    if (session.isRevoked()) {
      return false;
    }

    return true;
  }
}
