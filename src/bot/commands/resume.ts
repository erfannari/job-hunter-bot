import fs from 'fs';
import path from 'path';
import { CallbackQueryContext, CommandContext, Context, InlineKeyboard, InputFile } from 'grammy';
import { logger } from '../../utils/logger.js';

const erfanPdfPath = path.resolve(process.cwd(), 'Erfan-narshirin.pdf');
const fatemehPdfPath = path.resolve(process.cwd(), 'Fatemeh-Khaji.pdf');

export async function handleResumeCommand(ctx: CommandContext<Context>) {
  const keyboard = new InlineKeyboard()
    .text('📄 Erfan Narshirin (Frontend)', 'cv:erfan')
    .row()
    .text('📄 Fatemeh Khaji (UI/UX Design)', 'cv:fatemeh')
    .row()
    .text('📦 Download Both Resumes', 'cv:both');

  await ctx.reply(
    '📑 *Quick Resume Access*\n\nSelect a resume below to download the PDF directly:',
    {
      reply_markup: keyboard,
      parse_mode: 'Markdown',
    }
  );
}

export async function handleResumeCallback(ctx: CallbackQueryContext<Context>) {
  const data = ctx.callbackQuery.data;
  if (!data) return;

  await ctx.answerCallbackQuery({ text: 'Sending resume PDF...' });

  if (data === 'cv:erfan' || data === 'cv:both') {
    if (fs.existsSync(erfanPdfPath)) {
      await ctx.replyWithDocument(new InputFile(erfanPdfPath, 'Erfan-Narshirin-Resume.pdf'), {
        caption: '📄 *Erfan Narshirin* — Senior Frontend Engineer (Angular · Vue · Nuxt · TypeScript)',
        parse_mode: 'Markdown',
      });
      logger.info('[Bot] Dispatched Erfan resume PDF');
    } else {
      await ctx.reply('❌ Erfan-narshirin.pdf not found on server.');
    }
  }

  if (data === 'cv:fatemeh' || data === 'cv:both') {
    if (fs.existsSync(fatemehPdfPath)) {
      await ctx.replyWithDocument(new InputFile(fatemehPdfPath, 'Fatemeh-Khaji-Resume.pdf'), {
        caption: '📄 *Fatemeh Khaji* — UI/UX & Product Designer (Figma · Design Systems · UX Research)',
        parse_mode: 'Markdown',
      });
      logger.info('[Bot] Dispatched Fatemeh resume PDF');
    } else {
      await ctx.reply('❌ Fatemeh-Khaji.pdf not found on server.');
    }
  }
}
