import { StatusCodes } from 'http-status-codes';
import { NextHttpHandler } from 'types';

export function validateMethod(
  methods: string | string[],
  handler: NextHttpHandler,
): NextHttpHandler {
  if (!Array.isArray(methods)) methods = [methods];

  return (req, res) => {
    if (!methods.includes(req.method))
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
        statusCode: StatusCodes.METHOD_NOT_ALLOWED,
        message: `Allowed method(s): ${(methods as string[]).join(', ')}`,
      });
    else return handler(req, res);
  };
}
