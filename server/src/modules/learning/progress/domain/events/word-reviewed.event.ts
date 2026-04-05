import { DomainEvent, type DomainEventProps } from '@core/ddd';

import { type FsrsParameters } from '../value-objects/fsrs-parameters.vo';
import { type ReviewRating } from '../value-objects/review-rating.vo';

export interface WordReviewedEventPayload {
  userId: string;
  tenantId: string;
  wordSenseId: string;
  rating: ReviewRating;
  previousParams: FsrsParameters;
  newParams: FsrsParameters;
  reviewDurationMs: number;
  sessionId?: string;
}

export class WordReviewedEvent extends DomainEvent {
  public readonly userId: string;
  public readonly tenantId: string;
  public readonly wordSenseId: string;
  public readonly rating: ReviewRating;
  public readonly previousParams: FsrsParameters;
  public readonly newParams: FsrsParameters;
  public readonly reviewDurationMs: number;
  public readonly sessionId?: string;

  constructor(props: DomainEventProps<WordReviewedEventPayload>) {
    super(props);
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.wordSenseId = props.wordSenseId;
    this.rating = props.rating;
    this.previousParams = props.previousParams;
    this.newParams = props.newParams;
    this.reviewDurationMs = props.reviewDurationMs;
    this.sessionId = props.sessionId;
  }
}
