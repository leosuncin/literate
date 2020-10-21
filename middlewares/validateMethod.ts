import { StatusCodes } from 'http-status-codes';
import { HttpError, NextHttpHandler } from 'types';

export function validateMethod(
  methods: string | string[],
  handler: NextHttpHandler,
): NextHttpHandler {
  if (!Array.isArray(methods)) methods = [methods];

  return (req, res) => {
    if (!methods.includes(req.method))
      throw new HttpError(
        `Allowed method(s): ${(methods as string[]).join(', ')}`,
        StatusCodes.METHOD_NOT_ALLOWED,
      );
    else return handler(req, res);
  };
}
