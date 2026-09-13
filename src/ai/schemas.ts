import { z } from 'zod';

export const aiJobAnalysisSchema = z.object({
  profile: z.enum(['frontend', 'design', 'unrelated']).describe('Which target profile this role matches'),
  relevant: z.boolean().describe('Whether this job is relevant to the candidate'),
  matchScore: z.number().min(0).max(100).describe('Overall match score from 0 to 100'),
  experienceRequired: z.number().nullable().describe('Years of experience required, or null if unspecified'),
  experienceCompatible: z.boolean().describe('Whether candidate experience (5 yrs Frontend, 3-4 yrs UI/UX, 1-2 yrs Product) matches'),
  technologies: z.array(z.string()).describe('Primary technologies or design tools detected in the description'),
  locationCompatible: z.boolean().describe('Whether the position is in Georgia (Tbilisi/Batumi/Kutaisi) or allows remote from Georgia'),
  languageCompatible: z.boolean().default(true).describe('Whether the job is compatible with an English speaker and does NOT require Russian or other non-English language'),
  workplaceType: z.enum(['onsite', 'hybrid', 'remote', 'unknown']).default('unknown'),
  visaSponsorship: z.enum(['yes', 'no', 'unknown']).default('unknown'),
  relocationSupport: z.enum(['yes', 'no', 'unknown']).default('unknown'),
  recommendation: z.enum(['strongly_apply', 'apply', 'consider', 'skip']).describe('Actionable recommendation for the candidate'),
  reasons: z.array(z.string()).describe('List of key positive matching reasons'),
  concerns: z.array(z.string()).describe('List of potential red flags, mismatches, or missing details'),
  summary: z.string().describe('One concise sentence summarizing the role and its fit'),
});

export type AIJobAnalysis = z.infer<typeof aiJobAnalysisSchema>;
