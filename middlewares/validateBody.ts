import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { NextHttpHandler } from 'types';
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
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
        message: getReasonPhrase(StatusCodes.UNPROCESSABLE_ENTITY),
        errors: error.errors,
      });
    }
  };
}
