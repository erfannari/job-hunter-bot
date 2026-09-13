import { createBot, setupBotCommands } from './bot/bot.js';
import { config } from './config/config.js';
import { initDatabase } from './database/db.js';
import { jobService } from './jobs/job.service.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  logger.info('🚀 Initializing Nari Georgia Jobs bot...');
  logger.info(`Environment: ${config.NODE_ENV}`);

  // 1. Initialize SQLite Database
  initDatabase();

  // 2. Initialize Telegram Bot
  const bot = createBot();
  await setupBotCommands(bot);

  // 3. Setup Graceful Shutdown Handlers
  let isShuttingDown = false;
  let scanIntervalTimer: NodeJS.Timeout | null = null;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info(`Received ${signal}, shutting down gracefully...`);

    if (scanIntervalTimer) {
      clearInterval(scanIntervalTimer);
    }

    try {
      bot.stop();
      logger.info('Bot stopped successfully.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  // 4. Start Telegram Bot Polling
  logger.info('🤖 Starting bot in long polling mode...');
  bot.start({
    onStart(botInfo) {
      logger.info(`✅ Bot @${botInfo.username} (ID: ${botInfo.id}) is running and ready for commands!`);

      // 5. Trigger first job scan and setup recurring interval
      const runScan = async () => {
        try {
          logger.info('⏰ Running scheduled job scan & notification cycle...');
          await jobService.scanAndNotify(bot);
        } catch (scanErr) {
          logger.error('Error during scan cycle:', scanErr);
        }
      };

      // Run initial scan 5 seconds after startup so bot is fully receptive
      setTimeout(() => {
        runScan().catch((err) => logger.error('Initial scan error:', err));
      }, 5000);

      // Recurring interval (default: 30 minutes)
      const intervalMs = config.JOB_SCAN_INTERVAL_MINUTES * 60 * 1000;
      scanIntervalTimer = setInterval(runScan, intervalMs);
      logger.info(`⏱️ Job scanner scheduled to run every ${config.JOB_SCAN_INTERVAL_MINUTES} minutes.`);
    },
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start application:', err);
  process.exit(1);
});
