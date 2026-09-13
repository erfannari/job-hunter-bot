import { db } from './db.js';
import { Job, JobProfile, JobStatus, LocationType, WorkplaceType } from '../jobs/types.js';

interface JobDbRow {
  id: string;
  source: string;
  source_job_id: string | null;
  title: string;
  normalized_title: string;
  company: string;
  normalized_company: string;
  location: string;
  location_type: string;
  description: string;
  url: string;
  posted_at: string | null;
  discovered_at: string;
  updated_at: string;
  employment_type: string | null;
  workplace_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  required_experience_years: number | null;
  skills: string; // JSON string
  profile: string | null;
  match_score: number | null;
  match_reason: string | null;
  status: string;
  fingerprint: string;
}

export class JobRepository {
  private mapRowToJob(row: JobDbRow): Job {
    return {
      id: row.id,
      source: row.source,
      sourceJobId: row.source_job_id || undefined,
      title: row.title,
      normalizedTitle: row.normalized_title,
      company: row.company,
      normalizedCompany: row.normalized_company,
      location: row.location,
      locationType: row.location_type as LocationType,
      description: row.description,
      url: row.url,
      postedAt: row.posted_at ? new Date(row.posted_at) : undefined,
      discoveredAt: new Date(row.discovered_at),
      updatedAt: new Date(row.updated_at),
      employmentType: row.employment_type || undefined,
      workplaceType: row.workplace_type as WorkplaceType,
      salaryMin: row.salary_min !== null ? row.salary_min : undefined,
      salaryMax: row.salary_max !== null ? row.salary_max : undefined,
      salaryCurrency: row.salary_currency || undefined,
      requiredExperienceYears: row.required_experience_years !== null ? row.required_experience_years : undefined,
      skills: JSON.parse(row.skills || '[]'),
      profile: (row.profile as JobProfile) || undefined,
      matchScore: row.match_score !== null ? row.match_score : undefined,
      matchReason: row.match_reason || undefined,
      status: row.status as JobStatus,
      fingerprint: row.fingerprint,
    };
  }

  /**
   * Inserts or updates a job. Returns true if newly inserted.
   */
  public saveJob(job: Job): boolean {
    const existing = db.prepare('SELECT id FROM jobs WHERE id = ? OR fingerprint = ?').get(job.id, job.fingerprint) as { id: string } | undefined;

    const skillsJson = JSON.stringify(job.skills);
    const postedAtStr = job.postedAt ? job.postedAt.toISOString() : null;
    const discoveredAtStr = job.discoveredAt.toISOString();
    const updatedAtStr = new Date().toISOString();

    if (existing) {
      db.prepare(`
        UPDATE jobs SET
          title = ?,
          normalized_title = ?,
          company = ?,
          normalized_company = ?,
          location = ?,
          location_type = ?,
          description = ?,
          url = ?,
          posted_at = COALESCE(?, posted_at),
          updated_at = ?,
          employment_type = ?,
          workplace_type = ?,
          salary_min = ?,
          salary_max = ?,
          salary_currency = ?,
          required_experience_years = ?,
          skills = ?,
          profile = ?,
          match_score = ?,
          match_reason = ?
        WHERE id = ?
      `).run(
        job.title,
        job.normalizedTitle,
        job.company,
        job.normalizedCompany,
        job.location,
        job.locationType,
        job.description,
        job.url,
        postedAtStr,
        updatedAtStr,
        job.employmentType || null,
        job.workplaceType,
        job.salaryMin ?? null,
        job.salaryMax ?? null,
        job.salaryCurrency || null,
        job.requiredExperienceYears ?? null,
        skillsJson,
        job.profile || null,
        job.matchScore ?? null,
        job.matchReason || null,
        existing.id
      );
      return false;
    }

    db.prepare(`
      INSERT INTO jobs (
        id, source, source_job_id, title, normalized_title, company, normalized_company,
        location, location_type, description, url, posted_at, discovered_at, updated_at,
        employment_type, workplace_type, salary_min, salary_max, salary_currency,
        required_experience_years, skills, profile, match_score, match_reason, status, fingerprint
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      job.id,
      job.source,
      job.sourceJobId || null,
      job.title,
      job.normalizedTitle,
      job.company,
      job.normalizedCompany,
      job.location,
      job.locationType,
      job.description,
      job.url,
      postedAtStr,
      discoveredAtStr,
      updatedAtStr,
      job.employmentType || null,
      job.workplaceType,
      job.salaryMin ?? null,
      job.salaryMax ?? null,
      job.salaryCurrency || null,
      job.requiredExperienceYears ?? null,
      skillsJson,
      job.profile || null,
      job.matchScore ?? null,
      job.matchReason || null,
      job.status,
      job.fingerprint
    );

    return true;
  }

  public jobExists(id: string, fingerprint: string): boolean {
    const row = db.prepare('SELECT 1 FROM jobs WHERE id = ? OR fingerprint = ?').get(id, fingerprint);
    return !!row;
  }

  public findJobById(id: string): Job | null {
    const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as JobDbRow | undefined;
    return row ? this.mapRowToJob(row) : null;
  }

  public updateJobStatus(id: string, status: JobStatus): boolean {
    const result = db.prepare('UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?').run(status, new Date().toISOString(), id);
    return result.changes > 0;
  }

  public getMatchingJobs(minScore: number = 60, limit: number = 20): Job[] {
    const rows = db.prepare(`
      SELECT * FROM jobs
      WHERE match_score >= ? AND status != 'ignored'
      ORDER BY match_score DESC, discovered_at DESC
      LIMIT ?
    `).all(minScore, limit) as JobDbRow[];

    return rows.map((r) => this.mapRowToJob(r));
  }

  public getLatestJobs(minScore: number = 60, limit: number = 10): Job[] {
    const rows = db.prepare(`
      SELECT * FROM jobs
      WHERE match_score >= ? AND profile IS NOT NULL AND status != 'ignored'
      ORDER BY discovered_at DESC
      LIMIT ?
    `).all(minScore, limit) as JobDbRow[];

    return rows.map((r) => this.mapRowToJob(r));
  }

  public getSavedJobs(): Job[] {
    const rows = db.prepare(`
      SELECT * FROM jobs
      WHERE status = 'saved'
      ORDER BY updated_at DESC
    `).all() as JobDbRow[];

    return rows.map((r) => this.mapRowToJob(r));
  }

  public getJobStats(): {
    totalJobs: number;
    matchingJobs: number;
    savedJobs: number;
    ignoredJobs: number;
    notificationsSent: number;
  } {
    const total = db.prepare('SELECT COUNT(*) as cnt FROM jobs').get() as { cnt: number };
    const matching = db.prepare('SELECT COUNT(*) as cnt FROM jobs WHERE match_score >= 60').get() as { cnt: number };
    const saved = db.prepare("SELECT COUNT(*) as cnt FROM jobs WHERE status = 'saved'").get() as { cnt: number };
    const ignored = db.prepare("SELECT COUNT(*) as cnt FROM jobs WHERE status = 'ignored'").get() as { cnt: number };
    const notifs = db.prepare('SELECT COUNT(*) as cnt FROM job_notifications').get() as { cnt: number };

    return {
      totalJobs: total.cnt,
      matchingJobs: matching.cnt,
      savedJobs: saved.cnt,
      ignoredJobs: ignored.cnt,
      notificationsSent: notifs.cnt,
    };
  }

  // --- User State ---
  public registerUser(chatId: string, username?: string, firstName?: string, minScore: number = 60): void {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO user_state (chat_id, username, first_name, is_active, min_score, created_at, last_active_at)
      VALUES (?, ?, ?, 1, ?, ?, ?)
      ON CONFLICT(chat_id) DO UPDATE SET
        username = COALESCE(excluded.username, user_state.username),
        first_name = COALESCE(excluded.first_name, user_state.first_name),
        is_active = 1,
        last_active_at = excluded.last_active_at
    `).run(chatId, username || null, firstName || null, minScore, now, now);
  }

  public getActiveUsers(): { chatId: string; minScore: number }[] {
    const rows = db.prepare('SELECT chat_id, min_score FROM user_state WHERE is_active = 1').all() as {
      chat_id: string;
      min_score: number;
    }[];
    return rows.map((r) => ({ chatId: r.chat_id, minScore: r.min_score }));
  }

  // --- Notifications ---
  public isNotificationSent(jobId: string, chatId: string): boolean {
    const row = db.prepare('SELECT 1 FROM job_notifications WHERE job_id = ? AND chat_id = ?').get(jobId, chatId);
    return !!row;
  }

  public recordNotification(jobId: string, chatId: string, messageId?: number): void {
    db.prepare(`
      INSERT OR IGNORE INTO job_notifications (job_id, chat_id, sent_at, message_id)
      VALUES (?, ?, ?, ?)
    `).run(jobId, chatId, new Date().toISOString(), messageId || null);
  }
}

export const jobRepository = new JobRepository();
