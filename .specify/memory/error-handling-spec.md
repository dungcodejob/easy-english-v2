# Error Handling Specification

**Version**: 1.0.0
**Status**: Draft

This document provides detailed standards for error handling, classification, and response formats, as required by the System Constitution.

## 1. Error Classification

All errors encountered at runtime MUST be classified into one of the following three categories.

### 1.1. Client Errors (4xx Status Codes)
- **Description**: Errors caused by invalid input from the client. The client can potentially fix the issue and retry the request.
- **Examples**: Invalid JSON, validation failures (e.g., malformed email), missing required fields, requesting a non-existent resource.
- **HTTP Status Codes**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Unprocessable Entity`.
- **Logging**: Logged at `WARN` level. Include the specific validation failure.

### 1.2. Domain Errors (4xx Status Codes)
- **Description**: Errors caused by a client request that is valid in format but violates a business rule or invariant. The request cannot be processed in its current state.
- **Examples**: Insufficient funds for a transaction, attempting to book an already reserved item, username already taken.
- **HTTP Status Codes**: `400 Bad Request`, `409 Conflict`, `422 Unprocessable Entity`.
- **Logging**: Logged at `WARN` level. Include a clear message about the business rule that was violated.

### 1.3. System Errors (5xx Status Codes)
- **Description**: Errors caused by an internal failure within the system. The client cannot fix this issue. The development team must investigate.
- **Examples**: Database connection failure, downstream service unavailable, unexpected null pointer, file system error.
- **HTTP Status Codes**: `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`.
- **Logging**: Logged at `ERROR` level with a full stack trace and as much context as possible (e.g., tenant ID, user ID, request body).

## 2. Standard Error Response Format

All error responses sent to a client MUST conform to the following JSON structure. Internal error details MUST NOT be included in the response.

```json
{
  "error_code": "UNIQUE_ERROR_CODE",
  "message": "A concise, human-readable description of the error.",
  "correlation_id": "uuid-v4-linking-to-logs",
  "details": [
    {
      "field": "fieldName",
      "message": "Specific message for this field, e.g., 'must be a valid email address'"
    }
  ]
}
```
- **`error_code`**: A unique, uppercase string identifying the specific error (e.g., `INSUFFICIENT_FUNDS`, `VALIDATION_FAILED`).
- **`message`**: A general, user-friendly error message.
- **`correlation_id`**: The unique ID that links this request to server logs.
- **`details`**: (Optional) An array of objects providing specific information, typically used for validation failures on multiple fields.

## 3. Traceability

The `correlation_id` is mandatory. It MUST be generated at the edge of the system (e.g., API Gateway or initial middleware) for every incoming request and propagated through all subsequent service calls and log messages related to that request. This ensures that a client-facing error can be traced back to the exact sequence of events in the server logs.