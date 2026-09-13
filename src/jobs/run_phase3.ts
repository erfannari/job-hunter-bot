import { config } from '../config/config.js';
import { jobsGeSource } from '../sources/jobsge/jobsge.source.js';
import { logger } from '../utils/logger.js';
import { jobNormalizer } from './job.normalizer.js';
import { jobScorer } from './job.scorer.js';
import { DEFAULT_SEARCH_QUERIES } from './profiles.js';
import { initDatabase } from '../database/db.js';
import { jobRepository } from '../database/job.repository.js';
import { Job, MatchResult } from './types.js';

interface ScoredJobEntry {
  job: Job;
  match: MatchResult;
}

async function runPhase3LiveScan() {
  console.log('===============================================================');
  console.log('🚀 NARI GEORGIA JOBS — LIVE JOBS SCANNER & DATABASE SYNC');
  console.log('===============================================================');
  console.log(`Min Match Score Threshold: ${config.MIN_MATCH_SCORE}%`);
  console.log(`Target Profiles: Frontend (Angular/Vue/Nuxt, 4+ yrs) & Design (UI/UX, Product)`);
  console.log(`Location: Georgia 🇬🇪\n`);

  initDatabase();

  const startTime = Date.now();

  // 1. Fetch raw jobs from Jobs.ge
  logger.info('Fetching live vacancies from Jobs.ge...');
  const rawJobs = await jobsGeSource.fetchJobs(DEFAULT_SEARCH_QUERIES);
  logger.info(`Fetched ${rawJobs.length} raw vacancies from Jobs.ge.\n`);

  if (rawJobs.length === 0) {
    logger.warn('No jobs retrieved from source.');
    return;
  }

  // 2. Normalize, Score and Persist
  const allScored: ScoredJobEntry[] = [];
  const matches: ScoredJobEntry[] = [];

  for (const raw of rawJobs) {
    const job = jobNormalizer.normalize(raw);
    const match = jobScorer.scoreJob(job);
    job.matchScore = match.score;
    job.matchReason = match.reasons.join('; ');

    // Persist to database
    jobRepository.saveJob(job);

    const entry: ScoredJobEntry = { job, match };
    allScored.push(entry);

    if (match.isMatch) {
      matches.push(entry);
    }
  }

  // Sort matches by highest score first, then freshness
  matches.sort((a, b) => {
    if (b.match.score !== a.match.score) {
      return b.match.score - a.match.score;
    }
    const timeA = a.job.postedAt?.getTime() || 0;
    const timeB = b.job.postedAt?.getTime() || 0;
    return timeB - timeA;
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  // 3. Print Results
  console.log('\n===============================================================');
  console.log(`📊 LIVE SCAN RESULTS (Completed in ${durationSec}s)`);
  console.log(`Total Jobs Scanned: ${rawJobs.length}`);
  console.log(`Matching Jobs (Score ≥ ${config.MIN_MATCH_SCORE}%): ${matches.length}`);
  console.log('===============================================================\n');

  if (matches.length === 0) {
    console.log('ℹ️ No jobs currently meet the >= 60% threshold in this snapshot.');
  } else {
    matches.forEach((item, index) => {
      const { job, match } = item;
      const profileBadge = job.profile === 'frontend' ? '👨‍💻 FRONTEND' : '🎨 DESIGN';
      const postedStr = job.postedAt ? job.postedAt.toLocaleDateString() : 'Recent';

      console.log(`---------------------------------------------------------------`);
      console.log(`[#${index + 1}] 🔥 ${match.score}% MATCH — [${profileBadge}]`);
      console.log(`📌 Title:      ${job.title}`);
      console.log(`🏢 Company:    ${job.company}`);
      console.log(`📍 Location:   ${job.location} (${job.locationType})`);
      console.log(`🕐 Posted:     ${postedStr}`);
      console.log(`💻 Skills:     ${job.skills.length ? job.skills.join(', ') : 'None explicitly listed'}`);
      console.log(`⭐ Rec:        ${match.recommendation.toUpperCase()}`);
      console.log(`💡 Reasons:`);
      match.reasons.forEach((r) => console.log(`   • ${r}`));
      if (match.concerns.length > 0) {
        console.log(`⚠️ Concerns:`);
        match.concerns.forEach((c) => console.log(`   • ${c}`));
      }
      console.log(`🔗 Link:       ${job.url}`);
    });
    console.log(`---------------------------------------------------------------\n`);
  }

  // Distribution summary
  const score80Plus = allScored.filter((s) => s.match.score >= 80).length;
  const score60to79 = allScored.filter((s) => s.match.score >= 60 && s.match.score < 80).length;
  const score40to59 = allScored.filter((s) => s.match.score >= 40 && s.match.score < 60).length;
  const scoreBelow40 = allScored.filter((s) => s.match.score < 40).length;

  console.log('📈 Score Distribution:');
  console.log(` • 80% - 100% (High Match):     ${score80Plus}`);
  console.log(` • 60% - 79%  (Good Match):     ${score60to79}`);
  console.log(` • 40% - 59%  (Consideration):  ${score40to59}`);
  console.log(` • < 40%      (Irrelevant/Skip): ${scoreBelow40}`);
  console.log('\n✅ Phase 3 live source validation complete.');
}

runPhase3LiveScan().catch((err) => {
  console.error('Fatal error in Phase 3 runner:', err);
  process.exit(1);
});
