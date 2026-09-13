import { Bot } from 'grammy';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';
import { handleStartCommand } from './commands/start.js';
import { handleHelpCommand } from './commands/help.js';
import { handleJobsCommand, handleLatestCommand } from './commands/jobs.js';
import { handleResumeCallback, handleResumeCommand } from './commands/resume.js';
import { handleSavedCommand } from './commands/saved.js';
import { handleSettingsCommand } from './commands/settings.js';
import { handleStatsCommand } from './commands/stats.js';
import { handleSaveCallback, handleUnsaveCallback, handleIgnoreCallback } from './callbacks/job.actions.js';

export function createBot(): Bot {
  const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

  // Optional: Restrict bot usage to authorized chat/user ID if configured
  if (config.TELEGRAM_CHAT_ID) {
    bot.use(async (ctx, next) => {
      const fromId = ctx.from?.id.toString();
      const chatId = ctx.chat?.id.toString();

      if (fromId === config.TELEGRAM_CHAT_ID || chatId === config.TELEGRAM_CHAT_ID) {
        return next();
      }

      logger.warn(`Unauthorized access attempt from user ${fromId ?? 'unknown'} in chat ${chatId ?? 'unknown'}`);
      await ctx.reply('⛔ You are not authorized to use this personal job-hunting bot.');
    });
  }

  // Register command handlers
  bot.command('start', handleStartCommand);
  bot.command('help', handleHelpCommand);
  bot.command('jobs', handleJobsCommand);
  bot.command('latest', handleLatestCommand);
  bot.command('saved', handleSavedCommand);
  bot.command(['resume', 'cv', 'resumes'], handleResumeCommand);
  bot.command('settings', handleSettingsCommand);
  bot.command('stats', handleStatsCommand);

  // Register interactive callback queries for job cards & resumes
  bot.callbackQuery(/^save:/, handleSaveCallback);
  bot.callbackQuery(/^unsave:/, handleUnsaveCallback);
  bot.callbackQuery(/^ignore:/, handleIgnoreCallback);
  bot.callbackQuery(/^cv:/, handleResumeCallback);

  // Global Error handling
  bot.catch((err) => {
    logger.error('Error occurred in Telegram bot handler:', err.error);
  });

  return bot;
}

export async function setupBotCommands(bot: Bot): Promise<void> {
  try {
    await bot.api.setMyCommands([
      { command: 'start', description: 'Welcome message & subscribe to alerts' },
      { command: 'jobs', description: 'View active matching vacancies' },
      { command: 'latest', description: 'View latest discovered jobs' },
      { command: 'saved', description: 'View saved bookmarks' },
      { command: 'resume', description: 'Download Erfan & Fatemeh resume PDFs' },
      { command: 'settings', description: 'View search & filtering settings' },
      { command: 'stats', description: 'View scanner & database metrics' },
      { command: 'help', description: 'Help & command overview' },
    ]);
    logger.info('Registered Telegram bot menu commands successfully');
  } catch (error) {
    logger.warn('Could not register bot menu commands (bot may still operate):', error);
  }
}
