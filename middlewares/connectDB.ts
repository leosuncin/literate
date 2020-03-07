import { SERVICE_UNAVAILABLE } from 'http-status-codes';
import mongoose from 'mongoose';
import { NextHttpHandler } from 'types';

export function connectDB(handler: NextHttpHandler): NextHttpHandler {
  return async function handleConnection(req, res) {
    if (mongoose.connection.readyState === 1) return handler(req, res);

    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      mongoose.connection.on('disconnected', handleConnection);

      return handler(req, res);
    } catch (error) {
      return res.status(SERVICE_UNAVAILABLE).send({
        statusCode: SERVICE_UNAVAILABLE,
        message: 'Database connection error',
      });
    }
  };
}
