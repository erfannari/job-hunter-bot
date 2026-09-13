import type { CommandContext, Context } from 'grammy';
import { config } from '../../config/config.js';

export async function handleSettingsCommand(ctx: CommandContext<Context>) {
  const message = [
    '⚙️ *Current Hunter Settings & Preferences*',
    '',
    '🎯 *Target Profiles:*',
    '• *Frontend Developer:* Enabled (4+ years preferred)',
    '  _Technologies:_ Angular, Vue, Nuxt, TypeScript, JavaScript, HTML, CSS',
    '• *UI/UX Designer:* Enabled (3–4 years preferred)',
    '• *Product Designer:* Enabled (1–2 years preferred)',
    '  _Skills:_ Figma, Design Systems, Wireframing, UX Research',
    '',
    '📍 *Target Location:*',
    '• Georgia 🇬🇪 (Tbilisi, Batumi, Kutaisi, Remote for Georgia)',
    '',
    '🔔 *Alert Thresholds:*',
    `• Minimum Match Score: *${config.MIN_MATCH_SCORE}%*`,
    `• Scan Interval: *Every ${config.JOB_SCAN_INTERVAL_MINUTES} minutes*`,
  ].join('\n');

  await ctx.reply(message, { parse_mode: 'Markdown' });
}
