import axios, { type AxiosError } from 'axios';
import {
  ApiRequestError,
  ErrorType,
  type ApiResponseEnvelope,
  type ApiSuccessResponse,
} from './api.model';

export async function apiCall<T>(
  apiFunction: () => Promise<ApiSuccessResponse<T>>,
): Promise<ApiSuccessResponse<T>> {
  try {
    // Interceptor already extracts the data from AxiosResponse and throws ApiRequestError on success: false
    const result = await apiFunction();
    return result;
  } catch (error) {
    // Nếu lỗi đã được throw từ try block (Business Error có success: false), ta throw tiếp luôn
    if (error instanceof ApiRequestError) {
      throw error;
    }

    // Network / HTTP error
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponseEnvelope<T>>;

      // Server responded with error status (4xx, 5xx)
      if (axiosError.response) {
        const responseData = axiosError.response.data;

        // If backend sent structured error
        if (
          responseData &&
          'success' in responseData &&
          !responseData.success
        ) {
          const backendError = responseData.error;
          throw new ApiRequestError(backendError, responseData.correlationId);
        }

        // Generic HTTP error
        throw new ApiRequestError(
          {
            type: ErrorType.NETWORK,
            code: axiosError.response.status.toString(),
            message: axiosError.message || 'An unexpected error occurred',
          },
          axiosError.response.data.correlationId || axiosError.name,
        );
      }

      // Network error (no response)
      if (axiosError.request) {
        throw new ApiRequestError(
          {
            type: ErrorType.NETWORK,
            code: axiosError.code || 'NETWORK_ERROR',
            message: axiosError.message || 'An unexpected error occurred',
          },
          axiosError.name,
        );
      }
    }

    // Unknown error
    throw new ApiRequestError(
      {
        type: ErrorType.NETWORK,
        code: 'UNKNOWN_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
      error instanceof Error ? error.name : 'UNKNOWN_ERROR',
    );
  }
}
