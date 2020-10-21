import { NextHttpHandler, ServiceUnavailableError } from 'types';
import { connect } from 'utils/db';

export function connectDB(handler: NextHttpHandler): NextHttpHandler {
  return async function handleConnection(req, res) {
    try {
      await connect();

      return handler(req, res);
    } catch (error) {
      throw new ServiceUnavailableError('Database connection error', error);
    }
  };
}
