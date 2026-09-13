import { Bot } from 'grammy';
import { config } from '../config/config.js';
import { initDatabase } from '../database/db.js';
import { jobRepository } from '../database/job.repository.js';
import { jobService } from './job.service.js';
import { logger } from '../utils/logger.js';

async function runScheduledScanner() {
  logger.info('🚀 Starting GitHub Actions Automated Job Hunter Scan...');
  logger.info(`Environment: ${config.NODE_ENV} | Min Match Score: ${config.MIN_MATCH_SCORE}%`);

  // 1. Initialize SQLite Database
  initDatabase();

  // 2. Ensure Telegram Chat ID is registered if provided in environment
  if (config.TELEGRAM_CHAT_ID) {
    jobRepository.registerUser(config.TELEGRAM_CHAT_ID, 'subscriber', 'User', config.MIN_MATCH_SCORE);
    logger.info(`Registered target chat recipient: ${config.TELEGRAM_CHAT_ID}`);
  }

  // 3. Create bot instance for sending notifications
  const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

  // 4. Run scan & send Telegram notifications
  const sentCount = await jobService.scanAndNotify(bot);

  const stats = jobRepository.getJobStats();
  logger.info('📊 Scan Summary:');
  logger.info(` • Total jobs tracked in DB: ${stats.totalJobs}`);
  logger.info(` • Total matching jobs: ${stats.matchingJobs}`);
  logger.info(` • New notifications sent in this run: ${sentCount}`);

  // Flush WAL to main DB file
  try {
    const { db } = await import('../database/db.js');
    db.pragma('wal_checkpoint(TRUNCATE)');
  } catch {
    // Ignore if already flushed
  }

  logger.info('✅ GitHub Actions scan finished successfully.');
}

runScheduledScanner().catch((err) => {
  logger.error('Fatal error during scheduled scan:', err);
  process.exit(1);
});
