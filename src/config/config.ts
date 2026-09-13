import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required in your .env file'),
  TELEGRAM_CHAT_ID: z.string().optional(),
  JOB_SCAN_INTERVAL_MINUTES: z.coerce.number().positive().default(15),
  MIN_MATCH_SCORE: z.coerce.number().min(0).max(100).default(60),
  AI_PROVIDER: z.enum(['gemini', 'openai', 'disabled']).default('gemini'),
  GEMINI_API_KEY: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
});

function loadConfig() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');

    console.error('❌ Configuration validation failed:\n' + errorDetails);
    console.error('\n👉 Please check your .env file. You can copy .env.example to .env to get started.');
    process.exit(1);
  }

  return result.data;
}

export type Config = z.infer<typeof envSchema>;
export const config: Config = loadConfig();
