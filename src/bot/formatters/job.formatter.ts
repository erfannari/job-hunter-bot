import { InlineKeyboard } from 'grammy';
import { Job, MatchResult } from '../../jobs/types.js';

export class JobFormatter {
  /**
   * Formats a job and match result into visually distinct Frontend vs Design Telegram cards (English only)
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
          lines.push('💡 *Why it fits your profile:*');
          match.reasons.slice(0, 3).forEach((r) => lines.push(`🔸 ${this.escapeMarkdown(r)}`));
          lines.push('');
        }

        if (match.concerns.length > 0) {
          lines.push('⚠️ *Notes & Considerations:*');
          match.concerns.slice(0, 2).forEach((c) => lines.push(`▫️ ${this.escapeMarkdown(c)}`));
          lines.push('');
        }
      } else if (job.matchReason) {
        const rawReasons = job.matchReason.split(/;\s*|\n/).filter(Boolean);
        lines.push('💡 *Highlight & Fit:*');
        rawReasons.slice(0, 3).forEach((r) => lines.push(`🔸 ${this.escapeMarkdown(r)}`));
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
          lines.push('💡 *Key Alignment Reasons:*');
          match.reasons.slice(0, 3).forEach((r) => lines.push(`🔹 ${this.escapeMarkdown(r)}`));
          lines.push('');
        }

        if (match.concerns.length > 0) {
          lines.push('⚠️ *Considerations:*');
          match.concerns.slice(0, 2).forEach((c) => lines.push(`▫️ ${this.escapeMarkdown(c)}`));
          lines.push('');
        }
      } else if (job.matchReason) {
        const rawReasons = job.matchReason.split(/;\s*|\n/).filter(Boolean);
        lines.push('💡 *Highlight & Fit:*');
        rawReasons.slice(0, 3).forEach((r) => lines.push(`🔹 ${this.escapeMarkdown(r)}`));
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
