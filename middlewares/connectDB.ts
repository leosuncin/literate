import { StatusCodes } from 'http-status-codes';
import log from 'ololog';
import { NextHttpHandler } from 'types';
import { connect } from 'utils/db';

export function connectDB(handler: NextHttpHandler): NextHttpHandler {
  return async function handleConnection(req, res) {
    try {
      await connect();

      return handler(req, res);
    } catch (error) {
      log.error(`[${req.method}] ${req.url}`, error);

      return res.status(StatusCodes.SERVICE_UNAVAILABLE).send({
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        message: 'Database connection error',
      });
    }
  };
}
