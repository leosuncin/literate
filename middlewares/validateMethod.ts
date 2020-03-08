import { NextHttpHandler } from 'types';
import { METHOD_NOT_ALLOWED } from 'http-status-codes';

export function validateMethod(
  methods: string | string[],
  handler: NextHttpHandler,
): NextHttpHandler {
  if (!Array.isArray(methods)) methods = [methods];

  return (req, res) => {
    if (!methods.includes(req.method))
      return res.status(METHOD_NOT_ALLOWED).json({
        statusCode: METHOD_NOT_ALLOWED,
        message: `Allowed method(s): ${(methods as string[]).join(', ')}`,
      });
    else return handler(req, res);
  };
}
