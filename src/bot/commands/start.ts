import fs from 'fs';
import path from 'path';
import { CommandContext, Context, InputFile } from 'grammy';
import { config } from '../../config/config.js';
import { jobRepository } from '../../database/job.repository.js';
import { logger } from '../../utils/logger.js';

export async function handleStartCommand(ctx: CommandContext<Context>) {
  const chatId = ctx.chat?.id.toString();
  const username = ctx.from?.username;
  const firstName = ctx.from?.first_name;

  if (chatId) {
    jobRepository.registerUser(chatId, username, firstName, config.MIN_MATCH_SCORE);
    logger.info(`[Bot] Registered active user: ${firstName ?? 'User'} (@${username ?? 'none'}, Chat: ${chatId})`);
  }

  const caption = [
    '👋 *Welcome to Nari Georgia Jobs!*',
    '',
    "I'm your personal Georgia job-hunting assistant.",
    '',
    "I'll look for:",
    '',
    '👨‍💻 *Frontend*',
    '• Angular',
    '• Vue',
    '• Nuxt',
    '• HTML/CSS',
    '',
    '🎨 *Design*',
    '• UI/UX',
    '• Product Designer',
    '',
    '📍 *Location:* Georgia 🇬🇪',
    '',
    "I'll prioritize fresh jobs and filter them based on your experience.",
    '💡 *Quick Actions:*',
    '• /frontend - View Frontend jobs',
    '• /design - View UI/UX & Design jobs',
    '• /all - View all matching vacancies',
    '• /resume - Download CV files',
    '• /help - Full command list',
  ].join('\n');

  const profileImagePath = path.resolve(process.cwd(), 'profile.jpeg');

  try {
    if (fs.existsSync(profileImagePath)) {
      await ctx.replyWithPhoto(new InputFile(profileImagePath), {
        caption,
        parse_mode: 'Markdown',
      });
      return;
    }
  } catch (err) {
    logger.debug('Failed to send start profile image:', err);
  }

  await ctx.reply(caption, { parse_mode: 'Markdown' });
}
