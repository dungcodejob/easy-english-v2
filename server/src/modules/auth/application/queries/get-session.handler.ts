import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Session } from '../../domain/entities/session.entity';
import { SessionNotFoundException } from '../../domain/exceptions/email-already-exists.exception';
import {
  type ISessionRepository,
  InjectSessionRepository,
} from '../repositories/session.repository.interface';
import { GetSessionQuery } from './get-session.query';

@QueryHandler(GetSessionQuery)
export class GetSessionHandler implements IQueryHandler<GetSessionQuery> {
  @InjectSessionRepository()
  private readonly sessionRepo: ISessionRepository;

  async execute(query: GetSessionQuery): Promise<Session> {
    const { sessionId } = query;
    // We assume the repository has findById or similar.
    // ISessionRepository interface we defined:
    // persist(session: Session);
    // findActiveByUserId(userId: string);
    // countActiveByUserId(userId: string);

    // It seems we missed findById in ISessionRepository.
    // We should add it.

    // For now, I'll update the interface and implementation in next steps.
    // Assuming findById exists for now to scaffold this.
    const session = await this.sessionRepo.findById(sessionId);

    if (!session) {
      throw new SessionNotFoundException(sessionId);
    }

    return session;
  }
}
