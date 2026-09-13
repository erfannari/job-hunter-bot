import type { CommandContext, Context } from 'grammy';
import { jobRepository } from '../../database/job.repository.js';
import { jobFormatter } from '../formatters/job.formatter.js';

export async function handleAppliedCommand(ctx: CommandContext<Context>) {
  const appliedJobs = jobRepository.getAppliedJobs();

  if (appliedJobs.length === 0) {
    const message = [
      '✅ *Checked / Applied Applications*',
      '',
      'You have not marked any applications as applied or checked yet.',
      '',
      'Use the *✅ Mark Checked / Applied* button on any job card to track the positions you have sent CVs to or reviewed.',
    ].join('\n');

    await ctx.reply(message, { parse_mode: 'Markdown' });
    return;
  }

  await ctx.reply(`✅ *Your Checked & Applied Positions (${appliedJobs.length} tracked):*`, {
    parse_mode: 'Markdown',
  });

  for (const job of appliedJobs) {
    const cardText = jobFormatter.formatJobCard(job);
    const keyboard = jobFormatter.createJobKeyboard(job);

    await ctx.reply(cardText, {
      reply_markup: keyboard,
      parse_mode: 'Markdown',
    });
  }
}
