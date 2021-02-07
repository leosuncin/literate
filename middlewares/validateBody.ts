import { NextHttpHandler, UnprocessableEntityError } from 'types';
import { AnyObjectSchema } from 'yup';

export function validateBody(
  schema: AnyObjectSchema,
  handler: NextHttpHandler,
): NextHttpHandler {
  return async (req, res) => {
    try {
      req.body = await schema.validate(req.body, { abortEarly: false });

      return handler(req, res);
    } catch (error) {
      throw new UnprocessableEntityError('Validation errors', error.errors);
    }
  };
}
