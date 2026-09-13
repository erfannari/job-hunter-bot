import { geminiAnalyzer } from './analyzer.js';
import { jobNormalizer } from '../jobs/job.normalizer.js';
import { jobScorer } from '../jobs/job.scorer.js';
import { RawJob } from '../jobs/types.js';

async function verifyAI() {
  console.log('🤖 Testing Google Gemini AI Deep Analysis...\n');

  console.log(`AI Enabled: ${geminiAnalyzer.isEnabled}`);

  const sampleRawJob: RawJob = {
    source: 'jobsge',
    sourceJobId: 'test_ai_1',
    title: 'Senior Frontend Engineer (Angular & Nuxt)',
    company: 'Silknet Telecom',
    location: 'Tbilisi, Georgia',
    description: `
      Silknet is looking for an experienced Senior Frontend Engineer to lead development of our self-service customer portal.
      
      Requirements:
      - 4-6 years of experience in modern frontend development.
      - Solid expertise in Angular and TypeScript.
      - Experience with Vue or Nuxt is a huge advantage.
      - Modern HTML5, CSS3, SCSS, responsive web design.
      - Position is based in our Tbilisi office (hybrid work available).
      - Fluent in English or Georgian.
      
      We offer competitive salary, health insurance, and gym coverage.
    `,
    url: 'https://jobs.ge/en/ads/test_ai_1',
    postedAt: new Date(),
    workplaceType: 'hybrid',
  };

  const normalized = jobNormalizer.normalize(sampleRawJob);
  console.log('Normalized Job:', normalized.title, '| Profile:', normalized.profile);

  console.log('\nCalling Gemini AI Analyzer...');
  const result = await jobScorer.scoreJobWithAI(normalized);

  console.log('\n✨ AI Hybrid Analysis Results:');
  console.log(` • Match Score:     ${result.score}%`);
  console.log(` • Recommendation:  ${result.recommendation.toUpperCase()}`);
  console.log(` • Is Match (>=60): ${result.isMatch}`);
  console.log(' • Reasons:');
  result.reasons.forEach((r) => console.log(`    - ${r}`));
  if (result.concerns.length > 0) {
    console.log(' • Concerns:');
    result.concerns.forEach((c) => console.log(`    - ${c}`));
  }

  console.log('\n✅ AI Analysis Verification complete.');
}

verifyAI().catch((err) => {
  console.error('AI Verification test failed:', err);
  process.exit(1);
});
