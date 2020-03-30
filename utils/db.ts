import mongoose from 'mongoose';

export function connect(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return;

  return mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    // Buffering means mongoose will queue up operations if it gets
    // disconnected from MongoDB and send them when it reconnects.
    // With serverless, better to fail fast if not connected.
    bufferCommands: false, // Disable mongoose buffering
    bufferMaxEntries: 0, // and MongoDB driver buffering
  });
}

export function disconnect(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;

  return mongoose.connection.close();
}
