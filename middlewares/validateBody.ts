import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { HttpError, NextHttpHandler } from 'types';
import { ObjectSchema } from 'yup';

export function validateBody(
  schema: ObjectSchema,
  handler: NextHttpHandler,
): NextHttpHandler {
  return async (req, res) => {
    try {
      req.body = await schema.validate(req.body, { abortEarly: false });

      return handler(req, res);
    } catch (error) {
      throw new HttpError(
        getReasonPhrase(StatusCodes.UNPROCESSABLE_ENTITY),
        StatusCodes.UNPROCESSABLE_ENTITY,
        error.errors,
      );
    }
  };
}
