import type { CommandContext, Context } from 'grammy';

export async function handleHelpCommand(ctx: CommandContext<Context>) {
  const message = [
    '🤖 *Nari Georgia Jobs — Available Commands*',
    '',
    '• /start - Welcome message and profile summary',
    '• /help - Show this command list',
    '• /jobs - View matching active jobs',
    '• /latest - Show newly posted jobs discovered recently',
    '• /saved - View jobs you have bookmarked',
    '• /resume - Download Erfan & Fatemeh resume PDFs',
    '• /settings - View current search & match settings',
    '• /stats - View scanner status and job metrics',
    '',
    '💡 *How it works:*',
    'Jobs are scanned periodically from Georgian sources, filtered by your tech stack (Angular, Vue, Nuxt, UI/UX), scored with AI, and fresh high-matching jobs (≥80%) are sent directly here.',
  ].join('\n');

  await ctx.reply(message, { parse_mode: 'Markdown' });
}
