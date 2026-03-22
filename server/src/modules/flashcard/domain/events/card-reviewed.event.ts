import { DomainEvent, DomainEventProps } from '@core/ddd';
import { ReviewRating } from '../value-objects/review-rating.vo';
import { CardState } from '../value-objects/card-state.vo';
import { FsrsParameters } from '../value-objects/fsrs-parameters.vo';

export interface CardReviewedEventPayload {
  cardId: string;
  userId: string;
  tenantId: string;
  rating: ReviewRating;
  newParams: FsrsParameters;
  reviewDurationMs: number;
  previousState: CardState;
  newState: CardState;
}

export class CardReviewedEvent extends DomainEvent {
  public readonly cardId: string;
  public readonly userId: string;
  public readonly tenantId: string;
  public readonly rating: ReviewRating;
  public readonly newParams: FsrsParameters;
  public readonly reviewDurationMs: number;
  public readonly previousState: CardState;
  public readonly newState: CardState;

  constructor(props: DomainEventProps<CardReviewedEventPayload>) {
    super(props);
    this.cardId = props.cardId;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.rating = props.rating;
    this.newParams = props.newParams;
    this.reviewDurationMs = props.reviewDurationMs;
    this.previousState = props.previousState;
    this.newState = props.newState;
  }
}
