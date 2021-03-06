import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import MongooseCastError from 'mongoose/lib/error/cast';
import MongooseValidationError from 'mongoose/lib/error/validation';
import log from 'ololog';
import { ErrorResponse, HttpApiError, NextHttpHandler } from 'types';
import { ValidationError } from 'yup';

export function catchErrors(
  handler: NextHttpHandler,
): NextHttpHandler<ErrorResponse> {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'test') {
        // silent log on test environment
        log.debug(`[${req.method}] ${req.url}`);
        log.error(error);
      }

      if (error instanceof HttpApiError) {
        const { message, statusCode, context } = error;

        return res.status(statusCode).json({
          message,
          statusCode,
          errors: Array.isArray(context) ? context : undefined,
        });
      }

      if (error instanceof MongooseValidationError) {
        return res.status(StatusCodes.CONFLICT).json({
          message: getReasonPhrase(StatusCodes.CONFLICT),
          statusCode: StatusCodes.CONFLICT,
          errors: Object.entries<Error>(error.errors).map(
            ([path, error]) => path + ' ' + error.message,
          ),
        });
      }

      if (error instanceof ValidationError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: getReasonPhrase(StatusCodes.BAD_REQUEST),
          statusCode: StatusCodes.BAD_REQUEST,
          errors: error.errors,
        });
      }

      if (error instanceof MongooseCastError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: error.message,
          statusCode: StatusCodes.BAD_REQUEST,
        });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  };
}
