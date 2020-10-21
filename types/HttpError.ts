import { StatusCodes } from 'http-status-codes';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: string[];
}

export interface HttpApiError extends Error {
  statusCode: number;
  message: string;
  context?: Error | string[];
}

export class HttpApiError extends Error {
  readonly name = 'HttpApiError';

  constructor(
    public message: string,
    public statusCode: number,
    public context?: Error | string[],
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    // @ts-ignore
    if (Error.captureStackTrace) Error.captureStackTrace(this);
  }
}

export class ServiceUnavailableError extends HttpApiError {
  constructor(message: string, error: Error) {
    super(message, StatusCodes.SERVICE_UNAVAILABLE, error);
  }
}

export class MethodNotAllowedError extends HttpApiError {
  constructor(methods: string[]) {
    super(
      `Allowed method(s): ${methods.join(', ')}`,
      StatusCodes.METHOD_NOT_ALLOWED,
    );
  }
}

export class UnprocessableEntityError extends HttpApiError {
  constructor(message: string, errors: string[]) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY, errors);
  }
}

export class UnauthorizedError extends HttpApiError {
  constructor(message: string) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends HttpApiError {
  constructor(message: string, context?: Error) {
    super(message, StatusCodes.FORBIDDEN, context);
  }
}

export class NotFoundError extends HttpApiError {
  constructor(message: string) {
    super(message, StatusCodes.NOT_FOUND);
  }
}
