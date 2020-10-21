import { MethodNotAllowedError, NextHttpHandler } from 'types';

export function validateMethod(
  methods: string | string[],
  handler: NextHttpHandler,
): NextHttpHandler {
  if (!Array.isArray(methods)) methods = [methods];

  return (req, res) => {
    if (!methods.includes(req.method))
      throw new MethodNotAllowedError(methods as string[]);
    else return handler(req, res);
  };
}
