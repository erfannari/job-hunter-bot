import type { CommandContext, Context } from 'grammy';
import { config } from '../../config/config.js';
import { jobRepository } from '../../database/job.repository.js';

export async function handleStatsCommand(ctx: CommandContext<Context>) {
  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  const stats = jobRepository.getJobStats();

  const message = [
    '📊 *Nari Georgia Jobs — System Stats*',
    '',
    `• *Status:* Online 🟢`,
    `• *Environment:* \`${config.NODE_ENV}\``,
    `• *Uptime:* ${hours}h ${minutes}m ${seconds}s`,
    `• *Total Jobs Tracked:* ${stats.totalJobs}`,
    `• *Matching Jobs (≥${config.MIN_MATCH_SCORE}%):* ${stats.matchingJobs}`,
    `• *Saved Bookmarks:* ${stats.savedJobs}`,
    `• *Checked / Applied:* ${stats.appliedJobs}`,
    `• *Ignored Jobs:* ${stats.ignoredJobs}`,
    `• *Telegram Alerts Sent:* ${stats.notificationsSent}`,
    '',
    `⏱️ *Scan Schedule:* Running automatically every ${config.JOB_SCAN_INTERVAL_MINUTES} minutes.`,
  ].join('\n');

  await ctx.reply(message, { parse_mode: 'Markdown' });
}
