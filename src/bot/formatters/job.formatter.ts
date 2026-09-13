import { InlineKeyboard } from 'grammy';
import { Job, MatchResult } from '../../jobs/types.js';

export class JobFormatter {
  /**
   * Translates common match reasons into natural Persian (Farsi)
   */
  public translateReasonToPersian(reason: string): string {
    const trimmed = reason.trim();

    // If already in Persian, return directly
    if (/[\u0600-\u06FF]/.test(trimmed)) {
      return trimmed;
    }

    // Role / Title Matches
    const frontendRoleMatch = trimmed.match(/^Target Frontend role:\s*["']?([^"']+)["']?/i);
    if (frontendRoleMatch) {
      return `موقعیت شغلی تخصصی فرانت‌اند: ${frontendRoleMatch[1]}`;
    }
    if (/frontend responsibilities highlighted/i.test(trimmed)) {
      return 'شامل وظایف و مسئولیت‌های کلیدی فرانت‌اند';
    }

    const designRoleMatch = trimmed.match(/^Target Design role:\s*["']?([^"']+)["']?/i);
    if (designRoleMatch) {
      return `موقعیت شغلی تخصصی طراحی / UI-UX: ${designRoleMatch[1]}`;
    }

    // Tech / Skills Matches
    const techMatch = trimmed.match(/^Key technology match:\s*(.+)$/i);
    if (techMatch) {
      return `تطابق تکنولوژی کلیدی: ${techMatch[1]}`;
    }

    const designSkillMatch = trimmed.match(/^Core design skill match:\s*(.+)$/i);
    if (designSkillMatch) {
      return `تطابق مهارت اصلی طراحی: ${designSkillMatch[1]}`;
    }

    // Experience Matches
    const expMatch = trimmed.match(/Experience requirement\s*\((\d+)\s*yrs\)\s*matches your 5-year background/i);
    if (expMatch) {
      return `سابقه درخواستی (${expMatch[1]} سال) منطبق با ۵ سال تجربه کاری شماست`;
    }
    if (/Product design experience criteria/i.test(trimmed)) {
      return 'تطابق با سابقه کاری درخواستی طراحی محصول (۱ تا ۲ سال)';
    }
    if (/UI\/UX design experience criteria/i.test(trimmed)) {
      return 'تطابق با سابقه کاری درخواستی طراحی UI/UX (۳ تا ۴ سال)';
    }

    // Location & Workplace Matches
    const locMatch = trimmed.match(/^Directly based in Georgia\s*\((.+)\)$/i);
    if (locMatch) {
      return `مستقر در گرجستان (${locMatch[1]})`;
    }
    if (/Remote opportunity available from Georgia/i.test(trimmed)) {
      return 'امکان دورکاری کامل از گرجستان';
    }
    if (/Flexible workplace:\s*hybrid/i.test(trimmed)) {
      return 'محیط کاری منعطف: هیبریدی (حضوری + دورکاری)';
    }
    if (/Flexible workplace:\s*remote/i.test(trimmed)) {
      return 'محیط کاری منعطف: کاملاً دورکاری (Remote)';
    }
    const flexWorkplace = trimmed.match(/^Flexible workplace:\s*(.+)$/i);
    if (flexWorkplace) {
      return `نوع محیط کاری: ${flexWorkplace[1]}`;
    }

    // Freshness & Visa Matches
    if (/Fresh job:\s*posted within the last 24 hours/i.test(trimmed)) {
      return 'فرصت شغلی تازه: ثبت شده در ۲۴ ساعت گذشته';
    }
    if (/Recently posted\s*\(within 3 days\)/i.test(trimmed)) {
      return 'آگهی جدید (طی ۳ روز گذشته)';
    }
    if (/Visa sponsorship:\s*yes/i.test(trimmed)) {
      return 'امکان اسپانسر ویزا و اقامت';
    }

    // Common AI Semantic sentences translations
    if (/Angular/i.test(trimmed) && /stack|match|experience/i.test(trimmed)) {
      return `تطابق تخصص با فریم‌ورک Angular`;
    }
    if (/Vue|Nuxt/i.test(trimmed) && /stack|match|experience/i.test(trimmed)) {
      return `تطابق تخصص با فریم‌ورک Vue / Nuxt`;
    }
    if (/Figma/i.test(trimmed) && /UI|UX|design/i.test(trimmed)) {
      return `تطابق مهارت دیزاین با ابزار Figma`;
    }
    if (/English/i.test(trimmed) && /environment|team|compatible/i.test(trimmed)) {
      return `محیط کاری سازگار با زبان انگلیسی`;
    }

    return `انطباق با نیازمندی‌های شغلی: ${trimmed}`;
  }

  /**
   * Translates concerns/notes into Persian
   */
  public translateConcernToPersian(concern: string): string {
    const trimmed = concern.trim();
    if (/[\u0600-\u06FF]/.test(trimmed)) {
      return trimmed;
    }

    if (/Requires Russian or non-English/i.test(trimmed)) {
      return 'نیاز به زبان روسی یا غیرانگلیسی (عدم پذیرش انگلیسی)';
    }
    if (/Role does not match Frontend or Design/i.test(trimmed)) {
      return 'عنوان شغلی با فیلدهای هدف فرانت‌اند یا طراحی منطبق نیست';
    }
    if (/Few primary frontend technologies/i.test(trimmed)) {
      return 'تعداد کمی از تکنولوژی‌های اصلی فرانت‌اند مستقیماً ذکر شده است';
    }
    const highExp = trimmed.match(/High experience requested:\s*(\d+)\+?\s*years/i);
    if (highExp) {
      return `سابقه درخواستی بالا: ${highExp[1]}+ سال`;
    }
    if (/Remote role restricted to other regions/i.test(trimmed)) {
      return 'موقعیت دورکاری محدود به کشورها یا مناطق دیگر است';
    }
    if (/Junior \/ Entry-level role/i.test(trimmed)) {
      return 'سطح شغلی جونیور یا کارآموزی';
    }
    const negMatch = trimmed.match(/Negative title match:\s*contains\s*["']?([^"']+)["']?/i);
    if (negMatch) {
      return `شامل کلمات نامرتبط در عنوان (${negMatch[1]})`;
    }

    return trimmed;
  }

  /**
   * Formats a job and match result into visually distinct Frontend vs Design Telegram cards
   * with bilingual (English + Persian) highlight and fit explanations.
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
          lines.push('💡 *Highlight & Fit / نکات کلیدی و تطابق:*');
          match.reasons.slice(0, 3).forEach((r) => {
            const fa = this.translateReasonToPersian(r);
            lines.push(`🔸 ${this.escapeMarkdown(r)}`);
            lines.push(`   🇮🇷 _${this.escapeMarkdown(fa)}_`);
          });
          lines.push('');
        }

        if (match.concerns.length > 0) {
          lines.push('⚠️ *Notes & Considerations / نکات قابل توجه:*');
          match.concerns.slice(0, 2).forEach((c) => {
            const fa = this.translateConcernToPersian(c);
            lines.push(`▫️ ${this.escapeMarkdown(c)}`);
            if (fa !== c) {
              lines.push(`   🇮🇷 _${this.escapeMarkdown(fa)}_`);
            }
          });
          lines.push('');
        }
      } else if (job.matchReason) {
        const rawReasons = job.matchReason.split(/;\s*|\n/).filter(Boolean);
        lines.push('💡 *Highlight & Fit / نکات کلیدی و تطابق:*');
        rawReasons.slice(0, 3).forEach((r) => {
          const fa = this.translateReasonToPersian(r);
          lines.push(`🔸 ${this.escapeMarkdown(r)}`);
          lines.push(`   🇮🇷 _${this.escapeMarkdown(fa)}_`);
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
          lines.push('💡 *Highlight & Fit / نکات کلیدی و تطابق:*');
          match.reasons.slice(0, 3).forEach((r) => {
            const fa = this.translateReasonToPersian(r);
            lines.push(`🔹 ${this.escapeMarkdown(r)}`);
            lines.push(`   🇮🇷 _${this.escapeMarkdown(fa)}_`);
          });
          lines.push('');
        }

        if (match.concerns.length > 0) {
          lines.push('⚠️ *Considerations / نکات قابل توجه:*');
          match.concerns.slice(0, 2).forEach((c) => {
            const fa = this.translateConcernToPersian(c);
            lines.push(`▫️ ${this.escapeMarkdown(c)}`);
            if (fa !== c) {
              lines.push(`   🇮🇷 _${this.escapeMarkdown(fa)}_`);
            }
          });
          lines.push('');
        }
      } else if (job.matchReason) {
        const rawReasons = job.matchReason.split(/;\s*|\n/).filter(Boolean);
        lines.push('💡 *Highlight & Fit / نکات کلیدی و تطابق:*');
        rawReasons.slice(0, 3).forEach((r) => {
          const fa = this.translateReasonToPersian(r);
          lines.push(`🔹 ${this.escapeMarkdown(r)}`);
          lines.push(`   🇮🇷 _${this.escapeMarkdown(fa)}_`);
        });
        lines.push('');
      }
    }

    return lines.join('\n');
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
