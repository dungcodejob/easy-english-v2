import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from './response.builder';
import { ApiSuccessResponse } from './response.types';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data: unknown) => {
        // If response is already an ApiSuccessResponse (e.g. from ApiResponse.success()), pass it through
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          (data as { success: boolean }).success === true &&
          'data' in data
        ) {
          return data as ApiSuccessResponse<T>;
        }

        // Otherwise wrap simple data
        return ApiResponse.success(data as T);
      }),
    );
  }
}
