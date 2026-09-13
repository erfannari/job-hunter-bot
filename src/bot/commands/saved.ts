import type { CommandContext, Context } from 'grammy';
import { jobRepository } from '../../database/job.repository.js';
import { jobFormatter } from '../formatters/job.formatter.js';

export async function handleSavedCommand(ctx: CommandContext<Context>) {
  const savedJobs = jobRepository.getSavedJobs();

  if (savedJobs.length === 0) {
    const message = [
      '⭐ *Saved Jobs*',
      '',
      'You have not bookmarked any jobs yet.',
      '',
      'When job notifications arrive, use the ⭐ *Save* inline button to bookmark jobs for later review.',
    ].join('\n');

    await ctx.reply(message, { parse_mode: 'Markdown' });
    return;
  }

  await ctx.reply(`⭐ *Your Saved Bookmarks (${savedJobs.length} jobs):*`, {
    parse_mode: 'Markdown',
  });

  for (const job of savedJobs) {
    const cardText = jobFormatter.formatJobCard(job);
    const keyboard = jobFormatter.createJobKeyboard(job);

    await ctx.reply(cardText, {
      reply_markup: keyboard,
      parse_mode: 'Markdown',
    });
  }
}
