import { duplicateService } from './duplicate.service.js';
import { jobNormalizer } from './job.normalizer.js';
import { jobScorer } from './job.scorer.js';
import { RawJob } from './types.js';

console.log('🧪 Running Phase 2 Verification Tests...\n');

// 1. Test Normalization & Skill Extraction
const sampleRawFrontend: RawJob = {
  source: 'jobsge',
  sourceJobId: '12345',
  title: 'Senior Front-End Developer (Angular/TypeScript)',
  company: 'Bank of Georgia LLC',
  location: 'Tbilisi, Georgia',
  description: `
    <p>We are looking for a Senior Front-End Developer with <b>4+ years of experience</b> in modern web development.</p>
    <ul>
      <li>Strong proficiency in Angular, TypeScript, RxJS, and HTML/CSS.</li>
      <li>Experience with Nuxt or Vue is a plus.</li>
      <li>Hybrid working mode in Tbilisi office.</li>
    </ul>
  `,
  url: 'https://jobs.ge/en/ads/12345',
  postedAt: new Date(),
  workplaceType: 'hybrid',
};

const normalizedFrontend = jobNormalizer.normalize(sampleRawFrontend);
console.log('1️⃣ Normalization Test (Frontend):');
console.log(' - Title:', normalizedFrontend.title);
console.log(' - Normalized Title:', normalizedFrontend.normalizedTitle);
console.log(' - Skills detected:', normalizedFrontend.skills);
console.log(' - Exp Years detected:', normalizedFrontend.requiredExperienceYears);
console.log(' - Workplace Type:', normalizedFrontend.workplaceType);
console.log(' - Location Type:', normalizedFrontend.locationType);
console.log(' - Fingerprint:', normalizedFrontend.fingerprint);

const feScore = jobScorer.scoreJob(normalizedFrontend);
console.log(` - Score: ${feScore.score}% | Recommendation: ${feScore.recommendation} | IsMatch (>=60%): ${feScore.isMatch}`);
console.log(' - Reasons:', feScore.reasons);
console.log(' - Concerns:', feScore.concerns);
console.log(' - Breakdown:', feScore.breakdown);

if (feScore.score < 80) {
  throw new Error(`Expected frontend job score >= 80, got ${feScore.score}`);
}

// 2. Test Design Normalization & Scoring
const sampleRawDesign: RawJob = {
  source: 'hrge',
  sourceJobId: '8899',
  title: 'UI/UX Designer',
  company: 'TBC Tech',
  location: 'Batumi, Georgia',
  description: `
    Seeking a talented UI/UX Designer with 3 years of experience.
    Must have hands-on experience in Figma, design systems, wireframing, and user research.
  `,
  url: 'https://hr.ge/8899',
  postedAt: new Date(Date.now() - 3600 * 1000 * 5),
};

const normalizedDesign = jobNormalizer.normalize(sampleRawDesign);
const designScore = jobScorer.scoreJob(normalizedDesign);
console.log('\n2️⃣ Normalization & Score Test (Design):');
console.log(` - Score: ${designScore.score}% | Recommendation: ${designScore.recommendation}`);
console.log(' - Skills detected:', normalizedDesign.skills);
console.log(' - Reasons:', designScore.reasons);

if (designScore.score < 75) {
  throw new Error(`Expected design job score >= 75, got ${designScore.score}`);
}

// 3. Test Negative / Irrelevant Role
const sampleRawBackend: RawJob = {
  source: 'jobsge',
  sourceJobId: '9999',
  title: 'Senior Java Backend Developer',
  company: 'Some Corp',
  location: 'Tbilisi, Georgia',
  description: 'Java 17, Spring Boot, Microservices, PostgreSQL, Kubernetes. No frontend required.',
  url: 'https://jobs.ge/en/ads/9999',
};

const normalizedBackend = jobNormalizer.normalize(sampleRawBackend);
const backendScore = jobScorer.scoreJob(normalizedBackend);
console.log('\n3️⃣ Negative Job Test (Backend only):');
console.log(` - Score: ${backendScore.score}% | Recommendation: ${backendScore.recommendation} | IsMatch: ${backendScore.isMatch}`);
console.log(' - Concerns:', backendScore.concerns);

if (backendScore.score >= 55) {
  throw new Error(`Expected backend job score < 55, got ${backendScore.score}`);
}

// 4. Test Duplicate Tolerant Fingerprinting
const jobVariantA: RawJob = {
  source: 'linkedin',
  title: 'Senior Front-End Developer',
  company: 'TBC Bank LLC',
  location: 'Tbilisi, Georgia',
  description: '...',
  url: 'https://linkedin.com/1',
};

const jobVariantB: RawJob = {
  source: 'jobsge',
  title: 'Senior Frontend Developer',
  company: 'TBC Bank',
  location: 'Tbilisi',
  description: '...',
  url: 'https://jobs.ge/2',
};

const normA = jobNormalizer.normalize(jobVariantA);
const normB = jobNormalizer.normalize(jobVariantB);

console.log('\n4️⃣ Duplicate Tolerant Fingerprinting Test:');
console.log(' - Job A Fingerprint:', normA.fingerprint);
console.log(' - Job B Fingerprint:', normB.fingerprint);
const isDup = duplicateService.isDuplicate(normA, normB);
console.log(' - Detected as duplicate across sources:', isDup);

if (!isDup || normA.fingerprint !== normB.fingerprint) {
  throw new Error('Duplicate detection failed to equate Senior Front-End Developer and Senior Frontend Developer!');
}

console.log('\n✅ All Phase 2 verification tests PASSED successfully!\n');
