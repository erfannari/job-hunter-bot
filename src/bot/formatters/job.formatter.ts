import { InlineKeyboard } from 'grammy';
import { Job, MatchResult } from '../../jobs/types.js';

export class JobFormatter {
  /**
   * Formats a job and match result into visually distinct Frontend vs Design Telegram cards
   */
  public formatJobCard(job: Job, match?: MatchResult): string {
    const score = match?.score ?? job.matchScore ?? 0;
    const isDesign = job.profile === 'design';

    const postedStr = this.formatRelativeTime(job.postedAt);
    const skillsStr = job.skills.length > 0 ? job.skills.join(' · ') : 'Not specified';
    const expStr = job.requiredExperienceYears ? `${job.requiredExperienceYears}+ years` : 'Not specified';

    const lines: string[] = [];

    if (isDesign) {
      // =========================================================
      // 🎨 DESIGN & UI/UX THEME (Purple / Magenta / Violet Aesthetic)
      // =========================================================
      lines.push(`🟪 🎨 *UI/UX & DESIGN — ${score}% MATCH* 🟣`);
      if (job.status === 'applied') {
        lines.push('✅ *APPLICATION STATUS: [CHECKED / APPLIED]* 🎯');
      }
      lines.push('');
      lines.push(`> 🎨 *${this.escapeMarkdown(job.title)}*`);
      lines.push('');
      lines.push(`🏢 *Studio / Company:* ${this.escapeMarkdown(job.company)}`);
      lines.push(`📍 *Location:* ${this.escapeMarkdown(job.location)}`);
      lines.push(`🕐 *Posted:* ${postedStr}`);
      lines.push(`✨ *Design Tools:* _${this.escapeMarkdown(skillsStr)}_`);
      lines.push(`⏳ *Experience:* ${expStr}`);
      lines.push('');

      if (match) {
        lines.push('🟣 *Design Fit Breakdown:*');
        if (match.breakdown.techMatch >= 20) lines.push('💜 Design Skills — Exceptional');
        else if (match.breakdown.techMatch >= 10) lines.push('💜 Design Skills — Good Match');

        if (match.breakdown.experienceMatch >= 18) lines.push('💜 Experience — Ideal Level');
        else if (match.breakdown.experienceMatch >= 12) lines.push('💜 Experience — Compatible');

        if (match.breakdown.locationMatch >= 13) lines.push('🇬🇪 Location — Georgia / Remote Allowed');

        lines.push('');
        lines.push(`🎯 *Recommendation:* ⭐ *${match.recommendation.toUpperCase().replace('_', ' ')}*`);
        lines.push('');

        if (match.reasons.length > 0) {
          lines.push('💡 *Highlights & Fit / نکات برجسته و تطابق:*');
          match.reasons.slice(0, 3).forEach((r, idx) => {
            const fa = match.reasonsFa && match.reasonsFa[idx] ? match.reasonsFa[idx] : this.translateReasonToPersian(r);
            lines.push(`🔸 *${this.escapeMarkdown(r)}*`);
            if (fa) {
              lines.push(`   🇮🇷 _${this.escapeMarkdown(fa)}_`);
            }
          });
          lines.push('');
        }

        if (match.concerns.length > 0) {
          lines.push('⚠️ *Notes & Considerations:*');
          match.concerns.slice(0, 2).forEach((c) => lines.push(`▫️ ${this.escapeMarkdown(c)}`));
          lines.push('');
        }
      } else if (job.matchReason) {
        lines.push('💡 *Highlights & Fit / نکات برجسته و تطابق:*');
        const reasonItems = job.matchReason.split(/;\s*|\n+/).filter(Boolean);
        reasonItems.slice(0, 3).forEach((r) => {
          const fa = this.translateReasonToPersian(r);
          lines.push(`🔸 *${this.escapeMarkdown(r)}*`);
          if (fa) {
            lines.push(`   🇮🇷 _${this.escapeMarkdown(fa)}_`);
          }
        });
        lines.push('');
      }
    } else {
      // =========================================================
      // 👨‍💻 FRONTEND DEVELOPER THEME (Blue / Cyan / Code Aesthetic)
      // =========================================================
      lines.push(`🟦 👨‍💻 *FRONTEND ENGINEERING — ${score}% MATCH* 🔵`);
      if (job.status === 'applied') {
        lines.push('✅ *APPLICATION STATUS: [CHECKED / APPLIED]* 🎯');
      }
      lines.push('');
      lines.push(`> 💻 *${this.escapeMarkdown(job.title)}*`);
      lines.push('');
      lines.push(`🏢 *Company:* ${this.escapeMarkdown(job.company)}`);
      lines.push(`📍 *Location:* ${this.escapeMarkdown(job.location)}`);
      lines.push(`🕐 *Posted:* ${postedStr}`);
      lines.push(`💻 *Tech Stack:* \`${skillsStr}\``);
      lines.push(`⏳ *Experience:* ${expStr}`);
      lines.push('');

      if (match) {
        lines.push('🔵 *Engineering Fit Breakdown:*');
        if (match.breakdown.techMatch >= 20) lines.push('💙 Tech Stack — Angular/Vue/Nuxt Match');
        else if (match.breakdown.techMatch >= 10) lines.push('💙 Tech Stack — Solid Frontend Match');

        if (match.breakdown.experienceMatch >= 18) lines.push('💙 Experience — 5-Year Level Match');
        else if (match.breakdown.experienceMatch >= 12) lines.push('💙 Experience — Compatible');

        if (match.breakdown.locationMatch >= 13) lines.push('🇬🇪 Location — Georgia / Remote Allowed');

        lines.push('');
        lines.push(`🚀 *Recommendation:* ⭐ *${match.recommendation.toUpperCase().replace('_', ' ')}*`);
        lines.push('');

        if (match.reasons.length > 0) {
          lines.push('💡 *Key Alignment Reasons / نکات برجسته و دلایل تطابق:*');
          match.reasons.slice(0, 3).forEach((r, idx) => {
            const fa = match.reasonsFa && match.reasonsFa[idx] ? match.reasonsFa[idx] : this.translateReasonToPersian(r);
            lines.push(`🔹 *${this.escapeMarkdown(r)}*`);
            if (fa) {
              lines.push(`   🇮🇷 _${this.escapeMarkdown(fa)}_`);
            }
          });
          lines.push('');
        }

        if (match.concerns.length > 0) {
          lines.push('⚠️ *Considerations:*');
          match.concerns.slice(0, 2).forEach((c) => lines.push(`▫️ ${this.escapeMarkdown(c)}`));
          lines.push('');
        }
      } else if (job.matchReason) {
        lines.push('💡 *Key Alignment Reasons / نکات برجسته و دلایل تطابق:*');
        const reasonItems = job.matchReason.split(/;\s*|\n+/).filter(Boolean);
        reasonItems.slice(0, 3).forEach((r) => {
          const fa = this.translateReasonToPersian(r);
          lines.push(`🔹 *${this.escapeMarkdown(r)}*`);
          if (fa) {
            lines.push(`   🇮🇷 _${this.escapeMarkdown(fa)}_`);
          }
        });
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Translates rule-based or standard matching reasons into clean Persian
   */
  public translateReasonToPersian(reason: string): string {
    const text = reason.trim();

    if (/key technology match:\s*angular/i.test(text)) return 'تطابق با استک اصلی فرانت‌اند (Angular)';
    if (/key technology match:\s*vue/i.test(text)) return 'تطابق با فریم‌ورک تخصصی ویو (Vue)';
    if (/key technology match:\s*nuxt/i.test(text)) return 'تطابق با فریم‌ورک ناکست (Nuxt)';
    if (/key technology match:\s*typescript/i.test(text)) return 'تطابق با مهارت کلیدی تایپ‌اسکریپت (TypeScript)';
    if (/key technology match:\s*javascript/i.test(text)) return 'تطابق با زبان جاوااسکریپت (JavaScript)';
    if (/key technology match:\s*html\/css/i.test(text)) return 'تطابق با مهارت‌های پایه وب HTML/CSS';
    if (/key technology match:\s*(.+)/i.test(text)) {
      const match = text.match(/key technology match:\s*(.+)/i);
      return `تطابق مهارت و تکنولوژی کلیدی: ${match ? match[1] : ''}`;
    }

    if (/target frontend role/i.test(text)) return 'تطابق دقیق عنوان شغلی با فرانت‌اند دولوپر';
    if (/frontend responsibilities highlighted/i.test(text)) return 'تاکید بر وظایف و مسئولیت‌های تخصصی فرانت‌اند';
    if (/target design role/i.test(text)) return 'تطابق دقیق عنوان شغلی با طراحی محصول و UI/UX';

    if (/core design skill match:\s*figma/i.test(text)) return 'تطابق با ابزار تخصصی فیگما (Figma)';
    if (/core design skill match:\s*ui\/ux/i.test(text)) return 'تطابق با مهارت‌های تخصصی UI/UX';
    if (/core design skill match:\s*product design/i.test(text)) return 'تطابق با طراحی محصول (Product Design)';
    if (/core design skill match:\s*design systems/i.test(text)) return 'تطابق با سیستم‌های طراحی و دیزاین سیستم';
    if (/core design skill match:\s*wireframing/i.test(text)) return 'تطابق با وایرفریمینگ و پروتوتایپینگ';
    if (/core design skill match:\s*user research/i.test(text)) return 'تطابق با تحقیقات کاربر (User Research)';
    if (/core design skill match:\s*(.+)/i.test(text)) {
      const match = text.match(/core design skill match:\s*(.+)/i);
      return `تطابق مهارت تخصصی طراحی: ${match ? match[1] : ''}`;
    }

    if (/experience requirement.*5-year background/i.test(text)) return 'سابقه کار مورد نیاز با رزومه ۵ ساله شما همخوانی ایده‌آل دارد';
    if (/product design experience criteria.*satisfied/i.test(text)) return 'معیار سابقه کار طراحی محصول (۱-۲ سال) منطبق است';
    if (/ui\/ux design experience criteria.*satisfied/i.test(text)) return 'معیار سابقه کار طراحی UI/UX (۳-۴ سال) منطبق است';

    if (/directly based in georgia/i.test(text)) return 'موقعیت مکانی مستقر در گرجستان';
    if (/remote opportunity available from georgia/i.test(text)) return 'امکان همکاری به صورت دورکاری / ریموت از گرجستان';
    if (/flexible workplace:\s*hybrid/i.test(text)) return 'محیط کاری منعطف و هیبریدی';
    if (/flexible workplace:\s*remote/i.test(text)) return 'محیط کاری کاملاً ریموت (دورکاری)';
    if (/fresh job: posted within the last 24 hours/i.test(text)) return 'آگهی جدید: منتشر شده طی ۲۴ ساعت گذشته';
    if (/recently posted/i.test(text)) return 'آگهی جدید: ثبت شده در چند روز اخیر';
    if (/visa sponsorship:\s*yes/i.test(text)) return 'پشتیبانی از ویزای کاری و اقامت';

    return text;
  }

  /**
   * Creates profile-customized inline action keyboard: Apply, Mark Applied, Save, Ignore
   */
  public createJobKeyboard(job: Job): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    const isDesign = job.profile === 'design';
    const isApplied = job.status === 'applied';

    // Row 1: Apply link button (with bold/checked indicator if already applied)
    const applyLabel = isApplied
      ? (isDesign ? '🎨 Apply (Design) ↗ [Checked ✅]' : '💻 Apply (Frontend) ↗ [Checked ✅]')
      : (isDesign ? '🎨 Apply (Design) ↗' : '💻 Apply (Frontend) ↗');

    keyboard.url(applyLabel, job.url);
    keyboard.row();

    // Row 2: Mark Checked / Applied toggle button
    if (isApplied) {
      keyboard.text('↩️ Mark Unchecked', `unapply:${job.id}`);
    } else {
      keyboard.text('✅ Mark Checked / Applied', `apply:${job.id}`);
    }
    keyboard.row();

    // Row 3: Save and Ignore callback buttons
    if (job.status === 'saved') {
      keyboard.text('✅ Saved in Bookmarks', `unsave:${job.id}`);
    } else {
      keyboard.text('⭐ Save', `save:${job.id}`);
    }

    keyboard.text('❌ Ignore', `ignore:${job.id}`);

    return keyboard;
  }

  private formatRelativeTime(date?: Date): string {
    if (!date) return 'Recently';
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  }

  private escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }
}

export const jobFormatter = new JobFormatter();
