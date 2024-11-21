import { config } from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
});

const tempEnv = envSchema.safeParse(process.env);

if (tempEnv.success === false) {
  console.error(tempEnv.error.format());
  throw new Error('Invalid env variable!');
}

export const env = tempEnv.data;