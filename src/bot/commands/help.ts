import type { CommandContext, Context } from 'grammy';

export async function handleHelpCommand(ctx: CommandContext<Context>) {
  const message = [
    '🤖 *Nari Georgia Jobs — Available Commands*',
    '',
    '• /frontend (or /fe) - 🟦 Filter & view only Frontend developer jobs',
    '• /design (or /uiux) - 🟪 Filter & view only UI/UX & Product Design jobs',
    '• /all (or /jobs) - 📋 View all matching vacancies (Frontend + Design)',
    '• /applied (or /checked) - ✅ View positions you have applied to / checked',
    '• /latest - ⚡ Show newly posted vacancies discovered recently',
    '• /saved - ⭐ View positions you have bookmarked',
    '• /resume (or /cv) - 📄 Download Erfan & Fatemeh resume PDFs',
    '• /settings - ⚙️ View current search & match settings',
    '• /stats - 📊 View scanner status and job metrics',
    '• /start - Welcome message and profile summary',
    '',
    '💡 *How it works:*',
    'Jobs are scanned periodically from Georgian sources, filtered by your tech stack (Angular, Vue, Nuxt, UI/UX), scored with AI, and fresh high-matching jobs (≥80%) are sent directly here with color-coded profile themes.',
  ].join('\n');

  await ctx.reply(message, { parse_mode: 'Markdown' });
}

