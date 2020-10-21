export interface HttpError extends Error {
  statusCode: number;
  message: string;
  context?: Error | string[];
}

export class HttpError extends Error {
  readonly name = 'HttpError';

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
