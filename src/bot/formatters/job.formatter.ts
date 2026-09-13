import { InlineKeyboard } from 'grammy';
import { Job, MatchResult } from '../../jobs/types.js';

export class JobFormatter {
  /**
   * Formats a job and match result into a clean, scannable Telegram Markdown card
   */
  public formatJobCard(job: Job, match?: MatchResult): string {
    const score = match?.score ?? job.matchScore ?? 0;
    const isDesign = job.profile === 'design';
    const profileLabel = isDesign ? '🎨 DESIGN' : '👨‍💻 FRONTEND';

    const header = score >= 80 ? `🔥 NEW JOB — ${score}% MATCH` : `⚡ ${profileLabel} JOB — ${score}% MATCH`;

    const postedStr = this.formatRelativeTime(job.postedAt);
    const skillsStr = job.skills.length > 0 ? job.skills.join(' · ') : 'Not specified';
    const expStr = job.requiredExperienceYears ? `${job.requiredExperienceYears}+ years` : 'Not specified';

    const lines: string[] = [
      `*${header}*`,
      '',
      `💼 *${this.escapeMarkdown(job.title)}*`,
      '',
      `🏢 *Company:* ${this.escapeMarkdown(job.company)}`,
      `📍 *Location:* ${this.escapeMarkdown(job.location)}`,
      `🕐 *Posted:* ${postedStr}`,
      `💻 *Skills:* \`${skillsStr}\``,
      `⏳ *Experience:* ${expStr}`,
      '',
    ];

    // Match highlights
    if (match) {
      lines.push('*Match:*');
      if (match.breakdown.techMatch >= 20) lines.push('🟢 Tech Stack — Excellent');
      else if (match.breakdown.techMatch >= 10) lines.push('🟡 Tech Stack — Good');

      if (match.breakdown.experienceMatch >= 18) lines.push('🟢 Experience — Strong Match');
      else if (match.breakdown.experienceMatch >= 12) lines.push('🟡 Experience — Compatible');

      if (match.breakdown.locationMatch >= 13) lines.push('🟢 Location — In Georgia 🇬🇪');

      lines.push('');
      lines.push(`*Recommendation:* ⭐ *${match.recommendation.toUpperCase().replace('_', ' ')}*`);
      lines.push('');

      if (match.reasons.length > 0) {
        lines.push('*Why:*');
        match.reasons.slice(0, 3).forEach((r) => lines.push(`• ${this.escapeMarkdown(r)}`));
        lines.push('');
      }

      if (match.concerns.length > 0) {
        lines.push('*Potential concerns:*');
        match.concerns.slice(0, 2).forEach((c) => lines.push(`• ${this.escapeMarkdown(c)}`));
        lines.push('');
      }
    } else if (job.matchReason) {
      lines.push(`💡 *Highlight:* ${this.escapeMarkdown(job.matchReason)}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Creates inline action keyboard: Apply, Save, Ignore
   */
  public createJobKeyboard(job: Job): InlineKeyboard {
    const keyboard = new InlineKeyboard();

    // Row 1: Apply link button
    keyboard.url('Apply ↗', job.url);
    keyboard.row();

    // Row 2: Save and Ignore callback buttons
    if (job.status === 'saved') {
      keyboard.text('✅ Saved', `unsave:${job.id}`);
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
