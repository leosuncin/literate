import mongoose from 'mongoose';
import { SERVICE_UNAVAILABLE } from 'http-status-codes';

import { NextHttpHandler } from 'types';

export function connectDB(handler: NextHttpHandler): NextHttpHandler {
  return async function handleConnection(req, res) {
    if (mongoose.connection.readyState) return handler(req, res);

    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      });
      mongoose.connection.on('disconnected', handleConnection);

      handler(req, res);
    } catch (error) {
      res.status(SERVICE_UNAVAILABLE).send({
        statusCode: SERVICE_UNAVAILABLE,
        message: 'Database connection error',
      });
    }
  };
}
