import type { CommandContext, Context } from 'grammy';
import { config } from '../../config/config.js';
import { jobRepository } from '../../database/job.repository.js';
import { jobFormatter } from '../formatters/job.formatter.js';

export async function handleJobsCommand(ctx: CommandContext<Context>) {
  const matchingJobs = jobRepository.getMatchingJobs(config.MIN_MATCH_SCORE, 5);

  if (matchingJobs.length === 0) {
    const message = [
      '📋 *Active Matching Jobs*',
      '',
      `No matching jobs (≥${config.MIN_MATCH_SCORE}%) currently found in the database.`,
      '',
      'The scanner will continuously look for new vacancies and notify you immediately when a match appears!',
    ].join('\n');

    await ctx.reply(message, { parse_mode: 'Markdown' });
    return;
  }

  await ctx.reply(`📋 *Found ${matchingJobs.length} Top Matching Jobs (≥${config.MIN_MATCH_SCORE}%):*`, {
    parse_mode: 'Markdown',
  });

  for (const job of matchingJobs) {
    const cardText = jobFormatter.formatJobCard(job);
    const keyboard = jobFormatter.createJobKeyboard(job);

    await ctx.reply(cardText, {
      reply_markup: keyboard,
      parse_mode: 'Markdown',
    });
  }
}

export async function handleLatestCommand(ctx: CommandContext<Context>) {
  const latestJobs = jobRepository.getLatestJobs(config.MIN_MATCH_SCORE, 5);

  if (latestJobs.length === 0) {
    const message = [
      '⚡ *Latest Matching Jobs*',
      '',
      `No recent vacancies matching your profile (≥${config.MIN_MATCH_SCORE}%) found yet.`,
      '',
      'The scanner runs automatically every 15 minutes to sync newly posted positions.',
    ].join('\n');

    await ctx.reply(message, { parse_mode: 'Markdown' });
    return;
  }

  await ctx.reply(`⚡ *Latest ${latestJobs.length} Matching Vacancies (≥${config.MIN_MATCH_SCORE}%):*`, {
    parse_mode: 'Markdown',
  });

  for (const job of latestJobs) {
    const cardText = jobFormatter.formatJobCard(job);
    const keyboard = jobFormatter.createJobKeyboard(job);

    await ctx.reply(cardText, {
      reply_markup: keyboard,
      parse_mode: 'Markdown',
    });
  }
}
