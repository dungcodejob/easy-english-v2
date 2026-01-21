import { Session } from '../entities/session.entity';

export interface ISessionRepository {
  create(session: Session): Promise<void>;
  update(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  findAllByUserId(userId: string): Promise<Session[]>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
