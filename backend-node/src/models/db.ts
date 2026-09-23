import mongoose from 'mongoose';

let isDbConnected = false;

export const connectDatabase = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/film_studio';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    isDbConnected = true;
    console.log(`[Database] MongoDB connected successfully at ${mongoUri}`);
    return true;
  } catch (err: any) {
    isDbConnected = false;
    console.error(`[Database] MongoDB connection failed: ${err?.message}`);
    return false;
  }
};

export const getDbStatus = (): boolean => isDbConnected;

// Rule #12 Enforcement: Never silently proceed with in-memory store if DB is down.
export const assertDbHealthy = (): void => {
  if (!isDbConnected && mongoose.connection.readyState !== 1) {
    const error: any = new Error('DATABASE_UNAVAILABLE');
    error.status = 503;
    error.code = 'DATABASE_UNAVAILABLE';
    throw error;
  }
};
