import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/film_studio'),
  AGENTS_SERVICE_URL: z.string().default('http://localhost:8000'),
  JWT_SECRET: z.string().default('default-dev-secret-replace-in-prod'),
});

export const env = envSchema.parse({
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  MONGODB_URI: process.env.MONGODB_URI,
  AGENTS_SERVICE_URL: process.env.AGENTS_SERVICE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
});
