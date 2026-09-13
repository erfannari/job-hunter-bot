import type { CommandContext, Context } from 'grammy';
import { config } from '../../config/config.js';
import { jobRepository } from '../../database/job.repository.js';
import { jobFormatter } from '../formatters/job.formatter.js';

export async function handleJobsCommand(ctx: CommandContext<Context>) {
  const matchingJobs = jobRepository.getMatchingJobs(config.MIN_MATCH_SCORE, 6);

  if (matchingJobs.length === 0) {
    const message = [
      '📋 *Active Matching Jobs (All Profiles)*',
      '',
      `No matching vacancies (≥${config.MIN_MATCH_SCORE}%) currently found.`,
      '',
      '• Use /frontend to check only Frontend vacancies',
      '• Use /design to check only UI/UX & Product Design vacancies',
      '• The scanner checks every 15 minutes and will notify you when new jobs match!',
    ].join('\n');

    await ctx.reply(message, { parse_mode: 'Markdown' });
    return;
  }

  await ctx.reply(`📋 *Found ${matchingJobs.length} Matching Jobs (Frontend + Design ≥${config.MIN_MATCH_SCORE}%):*`, {
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

export async function handleFrontendJobsCommand(ctx: CommandContext<Context>) {
  const frontendJobs = jobRepository.getMatchingJobsByProfile('frontend', config.MIN_MATCH_SCORE, 6);

  if (frontendJobs.length === 0) {
    const message = [
      '🟦 👨‍💻 *Frontend Developer Positions*',
      '',
      `No active Frontend vacancies (≥${config.MIN_MATCH_SCORE}%) found currently.`,
      '',
      '💡 Matching stack: Angular, Vue, Nuxt, TypeScript, JavaScript, HTML/CSS.',
      'The scanner runs automatically and will alert you as soon as new positions appear.',
    ].join('\n');

    await ctx.reply(message, { parse_mode: 'Markdown' });
    return;
  }

  await ctx.reply(`🟦 👨‍💻 *Found ${frontendJobs.length} Matching Frontend Jobs (≥${config.MIN_MATCH_SCORE}%):*`, {
    parse_mode: 'Markdown',
  });

  for (const job of frontendJobs) {
    const cardText = jobFormatter.formatJobCard(job);
    const keyboard = jobFormatter.createJobKeyboard(job);

    await ctx.reply(cardText, {
      reply_markup: keyboard,
      parse_mode: 'Markdown',
    });
  }
}

export async function handleDesignJobsCommand(ctx: CommandContext<Context>) {
  const designJobs = jobRepository.getMatchingJobsByProfile('design', config.MIN_MATCH_SCORE, 6);

  if (designJobs.length === 0) {
    const message = [
      '🟪 🎨 *UI/UX & Product Design Positions*',
      '',
      `No active Design vacancies (≥${config.MIN_MATCH_SCORE}%) found currently.`,
      '',
      '💡 Matching roles: UI/UX Designer, Product Designer, Figma, Design Systems.',
      'The scanner runs automatically and will alert you as soon as new positions appear.',
    ].join('\n');

    await ctx.reply(message, { parse_mode: 'Markdown' });
    return;
  }

  await ctx.reply(`🟪 🎨 *Found ${designJobs.length} Matching Design Jobs (≥${config.MIN_MATCH_SCORE}%):*`, {
    parse_mode: 'Markdown',
  });

  for (const job of designJobs) {
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

