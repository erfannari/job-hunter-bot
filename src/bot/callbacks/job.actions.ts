import { CallbackQueryContext, Context } from 'grammy';
import { jobRepository } from '../../database/job.repository.js';
import { logger } from '../../utils/logger.js';
import { jobFormatter } from '../formatters/job.formatter.js';

export async function handleSaveCallback(ctx: CallbackQueryContext<Context>) {
  const data = ctx.callbackQuery.data;
  if (!data) return;

  const jobId = data.replace('save:', '');
  const job = jobRepository.findJobById(jobId);

  if (!job) {
    await ctx.answerCallbackQuery({ text: 'Job not found in database.' });
    return;
  }

  jobRepository.updateJobStatus(jobId, 'saved');
  job.status = 'saved';

  logger.info(`[Bot] User saved job: ${job.title} (${job.id})`);

  await ctx.answerCallbackQuery({ text: '⭐ Job saved to your bookmarks!' });

  try {
    await ctx.editMessageReplyMarkup({
      reply_markup: jobFormatter.createJobKeyboard(job),
    });
  } catch (err) {
    logger.debug('Could not edit reply markup for save callback:', err);
  }
}

export async function handleUnsaveCallback(ctx: CallbackQueryContext<Context>) {
  const data = ctx.callbackQuery.data;
  if (!data) return;

  const jobId = data.replace('unsave:', '');
  const job = jobRepository.findJobById(jobId);

  if (!job) {
    await ctx.answerCallbackQuery({ text: 'Job not found.' });
    return;
  }

  jobRepository.updateJobStatus(jobId, 'sent');
  job.status = 'sent';

  logger.info(`[Bot] User un-saved job: ${job.title} (${job.id})`);

  await ctx.answerCallbackQuery({ text: 'Removed from saved bookmarks.' });

  try {
    await ctx.editMessageReplyMarkup({
      reply_markup: jobFormatter.createJobKeyboard(job),
    });
  } catch (err) {
    logger.debug('Could not edit reply markup for unsave callback:', err);
  }
}

export async function handleIgnoreCallback(ctx: CallbackQueryContext<Context>) {
  const data = ctx.callbackQuery.data;
  if (!data) return;

  const jobId = data.replace('ignore:', '');
  const job = jobRepository.findJobById(jobId);

  if (!job) {
    await ctx.answerCallbackQuery({ text: 'Job not found.' });
    return;
  }

  jobRepository.updateJobStatus(jobId, 'ignored');
  logger.info(`[Bot] User ignored job: ${job.title} (${job.id})`);

  await ctx.answerCallbackQuery({ text: 'Job hidden & ignored.' });

  try {
    await ctx.editMessageText(`❌ *Ignored:* ${job.title} at ${job.company}`, {
      parse_mode: 'Markdown',
    });
  } catch (err) {
    logger.debug('Could not update message for ignore callback:', err);
  }
}
