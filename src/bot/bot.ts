import { Bot } from 'grammy';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';
import { handleStartCommand } from './commands/start.js';
import { handleHelpCommand } from './commands/help.js';
import {
  handleDesignJobsCommand,
  handleFrontendJobsCommand,
  handleJobsCommand,
  handleLatestCommand,
} from './commands/jobs.js';
import { handleAppliedCommand } from './commands/applied.js';
import { handleResumeCallback, handleResumeCommand } from './commands/resume.js';
import { handleSavedCommand } from './commands/saved.js';
import { handleSettingsCommand } from './commands/settings.js';
import { handleStatsCommand } from './commands/stats.js';
import {
  handleApplyCallback,
  handleIgnoreCallback,
  handleSaveCallback,
  handleUnapplyCallback,
  handleUnsaveCallback,
} from './callbacks/job.actions.js';

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
  bot.command(['frontend', 'fe'], handleFrontendJobsCommand);
  bot.command(['design', 'uiux', 'ux'], handleDesignJobsCommand);
  bot.command(['jobs', 'all'], handleJobsCommand);
  bot.command('latest', handleLatestCommand);
  bot.command('saved', handleSavedCommand);
  bot.command(['applied', 'checked'], handleAppliedCommand);
  bot.command(['resume', 'cv', 'resumes'], handleResumeCommand);
  bot.command('settings', handleSettingsCommand);
  bot.command('stats', handleStatsCommand);

  // Register interactive callback queries for job cards & resumes
  bot.callbackQuery(/^apply:/, handleApplyCallback);
  bot.callbackQuery(/^unapply:/, handleUnapplyCallback);
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
      { command: 'frontend', description: '🟦 View matching Frontend developer jobs' },
      { command: 'design', description: '🟪 View matching UI/UX & Product Design jobs' },
      { command: 'all', description: '📋 View all matching vacancies (Frontend + Design)' },
      { command: 'applied', description: '✅ View checked & applied applications' },
      { command: 'latest', description: '⚡ View latest discovered jobs' },
      { command: 'saved', description: '⭐ View saved bookmarks' },
      { command: 'resume', description: '📄 Download Erfan & Fatemeh resume PDFs' },
      { command: 'stats', description: '📊 View scanner & database metrics' },
      { command: 'settings', description: '⚙️ View search & filtering settings' },
      { command: 'help', description: '❓ Help & command overview' },
    ]);
    logger.info('Registered Telegram bot menu commands successfully');
  } catch (error) {
    logger.warn('Could not register bot menu commands (bot may still operate):', error);
  }
}

