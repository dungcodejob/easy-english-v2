import { AsyncLocalStorage } from 'async_hooks';

export class RequestContextService {
  private static readonly context = new AsyncLocalStorage<{
    requestId: string;
  }>();

  static getContext(): { requestId: string } {
    const store = this.context.getStore();
    return store || { requestId: 'no-request-id' };
  }

  static getRequestId(): string {
    return this.getContext().requestId;
  }

  static runWithContext(ctx: { requestId: string }, callback: () => void) {
    this.context.run(ctx, callback);
  }
}
