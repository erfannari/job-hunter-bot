import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { logger } from '../utils/logger.js';

const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(dbDir, 'jobs.db');
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency and write speed
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

export function initDatabase(): void {
  logger.info(`[Database] Initializing SQLite database at ${dbPath}...`);

  // 1. Jobs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      source_job_id TEXT,
      title TEXT NOT NULL,
      normalized_title TEXT NOT NULL,
      company TEXT NOT NULL,
      normalized_company TEXT NOT NULL,
      location TEXT NOT NULL,
      location_type TEXT NOT NULL,
      description TEXT NOT NULL,
      url TEXT NOT NULL,
      posted_at TEXT,
      discovered_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      employment_type TEXT,
      workplace_type TEXT NOT NULL,
      salary_min REAL,
      salary_max REAL,
      salary_currency TEXT,
      required_experience_years REAL,
      skills TEXT NOT NULL, -- JSON array of strings
      profile TEXT, -- 'frontend' | 'design' | NULL
      match_score REAL,
      match_reason TEXT,
      status TEXT NOT NULL DEFAULT 'new', -- 'new' | 'sent' | 'saved' | 'ignored' | 'applied'
      fingerprint TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_fingerprint ON jobs(fingerprint);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_match_score ON jobs(match_score);
    CREATE INDEX IF NOT EXISTS idx_jobs_discovered_at ON jobs(discovered_at);
  `);

  // 2. Notifications table (tracks every alert sent to user chats)
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT NOT NULL,
      chat_id TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      message_id INTEGER,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      UNIQUE(job_id, chat_id)
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_job_chat ON job_notifications(job_id, chat_id);
  `);

  // 3. User State table (tracks active user chat IDs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_state (
      chat_id TEXT PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      min_score INTEGER NOT NULL DEFAULT 60,
      created_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL
    );
  `);

  logger.info('[Database] Tables and indexes initialized successfully.');
}
