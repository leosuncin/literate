import { StatusCodes } from 'http-status-codes';
import { HttpError, NextHttpHandler } from 'types';
import { connect } from 'utils/db';

export function connectDB(handler: NextHttpHandler): NextHttpHandler {
  return async function handleConnection(req, res) {
    try {
      await connect();

      return handler(req, res);
    } catch (error) {
      throw new HttpError(
        'Database connection error',
        StatusCodes.SERVICE_UNAVAILABLE,
        error,
      );
    }
  };
}
