import { Bot } from 'grammy';
import { jobFormatter } from '../bot/formatters/job.formatter.js';
import { config } from '../config/config.js';
import { jobRepository } from '../database/job.repository.js';
import { sourceRegistry } from '../sources/source.registry.js';
import { logger } from '../utils/logger.js';
import { jobNormalizer } from './job.normalizer.js';
import { jobScorer } from './job.scorer.js';
import { DEFAULT_SEARCH_QUERIES } from './profiles.js';
import { Job, MatchResult, RawJob } from './types.js';

export interface ScannedJobMatch {
  job: Job;
  match: MatchResult;
  isNew: boolean;
}

export class JobService {
  /**
   * Fetches from all enabled sources, normalizes, scores, and persists to database
   */
  public async scanAndProcess(): Promise<ScannedJobMatch[]> {
    logger.info('[JobService] Starting multi-source scan cycle...');
    const sources = sourceRegistry.getAll();
    const allRawJobs: RawJob[] = [];

    for (const source of sources) {
      try {
        const raw = await source.fetchJobs(DEFAULT_SEARCH_QUERIES);
        allRawJobs.push(...raw);
      } catch (err) {
        logger.error(`[JobService] Error fetching from ${source.name}:`, err);
      }
    }

    logger.info(`[JobService] Total raw listings collected: ${allRawJobs.length}`);

    const results: ScannedJobMatch[] = [];

    for (const raw of allRawJobs) {
      const normalized = jobNormalizer.normalize(raw);
      const existing = jobRepository.findJobById(normalized.id);

      let match: MatchResult;
      if (existing && existing.matchScore !== undefined) {
        // Reuse cached score and match reason from previous scan
        const reasons = existing.matchReason ? existing.matchReason.split('; ') : [];
        match = {
          score: existing.matchScore,
          profile: existing.profile,
          isMatch: existing.matchScore >= config.MIN_MATCH_SCORE,
          reasons,
          concerns: [],
          breakdown: {
            techMatch: 0,
            experienceMatch: 0,
            roleMatch: 0,
            locationMatch: 0,
            seniorityMatch: 0,
            workplaceMatch: 0,
            freshnessMatch: 0,
          },
          recommendation: existing.matchScore >= 85 ? 'strongly_apply' : 'apply',
        };
        normalized.matchScore = existing.matchScore;
        normalized.matchReason = existing.matchReason;
        normalized.status = existing.status;
      } else {
        match = await jobScorer.scoreJobWithAI(normalized);
        normalized.matchScore = match.score;
        normalized.matchReason = match.reasons.join('; ');

        // Small throttling delay to stay comfortably within AI rate limits for new jobs
        if (normalized.profile) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }

      // Save to database
      const isNew = jobRepository.saveJob(normalized);

      if (match.isMatch) {
        results.push({
          job: normalized,
          match,
          isNew,
        });
      }
    }

    logger.info(`[JobService] Scan complete. Total matching jobs (>= ${config.MIN_MATCH_SCORE}%): ${results.length}`);
    return results;
  }

  /**
   * Runs scan and dispatches Telegram push notifications for fresh high-matching jobs
   */
  public async scanAndNotify(bot: Bot): Promise<number> {
    const matches = await this.scanAndProcess();

    // Determine target recipients
    const activeUsers = jobRepository.getActiveUsers();
    const recipientChatIds = new Set<string>();

    activeUsers.forEach((u) => recipientChatIds.add(u.chatId));

    if (config.TELEGRAM_CHAT_ID) {
      recipientChatIds.add(config.TELEGRAM_CHAT_ID);
    }

    if (recipientChatIds.size === 0) {
      logger.info('[JobService] No active Telegram chat recipients registered yet (run /start in bot).');
      return 0;
    }

    let notificationsSent = 0;

    for (const item of matches) {
      const { job, match } = item;

      // Only alert for newly discovered jobs or jobs not yet notified
      for (const chatId of recipientChatIds) {
        const alreadySent = jobRepository.isNotificationSent(job.id, chatId);
        if (alreadySent) continue;

        try {
          const cardText = jobFormatter.formatJobCard(job, match);
          const keyboard = jobFormatter.createJobKeyboard(job);

          const sentMsg = await bot.api.sendMessage(chatId, cardText, {
            reply_markup: keyboard,
            parse_mode: 'Markdown',
          });

          jobRepository.recordNotification(job.id, chatId, sentMsg.message_id);
          jobRepository.updateJobStatus(job.id, 'sent');
          notificationsSent++;

          logger.info(`[JobService] 🔔 Dispatched alert for "${job.title}" (${match.score}%) to chat ${chatId}`);

          // Small delay between Telegram sends to prevent rate limits
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (err) {
          logger.error(`[JobService] Failed to send Telegram alert for job ${job.id} to chat ${chatId}:`, err);
        }
      }
    }

    logger.info(`[JobService] Notification cycle finished. Total notifications sent: ${notificationsSent}`);
    return notificationsSent;
  }
}

export const jobService = new JobService();
