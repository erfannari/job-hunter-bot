import { initDatabase } from '../database/db.js';
import { sourceRegistry } from '../sources/source.registry.js';
import { DEFAULT_SEARCH_QUERIES } from './profiles.js';

async function verifyPhase7() {
  console.log('===============================================================');
  console.log('🌐 TESTING MULTI-SOURCE DISCOVERY (Jobs.ge + LinkedIn + HeadHunter)');
  console.log('===============================================================\n');

  initDatabase();

  const sources = sourceRegistry.getAll();
  console.log(`Active registered sources: ${sources.map((s) => s.name).join(', ')}\n`);

  for (const source of sources) {
    console.log(`📡 Fetching from [${source.name}]...`);
    const rawJobs = await source.fetchJobs(DEFAULT_SEARCH_QUERIES);
    console.log(`   Fetched ${rawJobs.length} listings from ${source.name}.\n`);

    const sample = rawJobs.slice(0, 3);
    sample.forEach((r, i) => {
      console.log(`   [${i + 1}] ${r.title} | ${r.company} (${r.location})`);
    });
    console.log('');
  }

  console.log('✅ Multi-source verification complete.');
}

verifyPhase7().catch((err) => {
  console.error('Phase 7 verification error:', err);
  process.exit(1);
});
