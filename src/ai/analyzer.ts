import { GoogleGenAI } from '@google/genai';
import { config } from '../config/config.js';
import { Job } from '../jobs/types.js';
import { logger } from '../utils/logger.js';
import { AIJobAnalysis, aiJobAnalysisSchema } from './schemas.js';

export class GeminiJobAnalyzer {
  private ai: GoogleGenAI | null = null;
  private isConfigured: boolean = false;

  constructor() {
    const apiKey = config.GEMINI_API_KEY || config.AI_API_KEY;
    if (apiKey && apiKey.length > 5) {
      try {
        this.ai = new GoogleGenAI({ apiKey });
        this.isConfigured = true;
        logger.info('[AI Analyzer] Google Gemini AI Analyzer initialized successfully.');
      } catch (err) {
        logger.warn('[AI Analyzer] Failed to initialize GoogleGenAI client:', err);
      }
    } else {
      logger.info('[AI Analyzer] Gemini API key not configured. Running in rule-based mode.');
    }
  }

  public get isEnabled(): boolean {
    return this.isConfigured && config.AI_PROVIDER === 'gemini';
  }

  /**
   * Performs deep semantic LLM analysis of a job description against candidate profile
   */
  public async analyzeJob(job: Job): Promise<AIJobAnalysis | null> {
    if (!this.isEnabled || !this.ai) {
      return null;
    }

    const prompt = this.buildPrompt(job);

    try {
      // Use gemini-3.6-flash
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        return null;
      }

      const rawJson = JSON.parse(responseText);
      const validated = aiJobAnalysisSchema.safeParse(rawJson);

      if (!validated.success) {
        logger.warn(`[AI Analyzer] Schema validation warning for job "${job.title}":`, validated.error.issues);
        return null;
      }

      logger.info(`[AI Analyzer] ✨ Analyzed "${job.title}" -> Score: ${validated.data.matchScore}%, Rec: ${validated.data.recommendation}`);
      return validated.data;
    } catch (error) {
      logger.warn(`[AI Analyzer] Error during Gemini analysis for job "${job.title}":`, error);
      return null;
    }
  }

  private buildPrompt(job: Job): string {
    return `
You are an expert AI career agent evaluating job postings for a specific candidate.

### Candidate Profile:
1. **Frontend Developer**:
   - ~5 years of experience
   - Core Stack: Angular, Vue, Nuxt, TypeScript, JavaScript, HTML, CSS, Sass/Tailwind
   - Preference: 4+ years frontend roles, modern SPA/web applications.
2. **Design Profile**:
   - UI/UX Designer: 3-4 years experience target
   - Product Designer: 1-2 years experience target
   - Core Skills: Figma, Design Systems, UX Research, Prototyping, Wireframing.
3. **Location Target**:
   - Georgia 🇬🇪 (Tbilisi, Batumi, Kutaisi, or remote jobs explicitly available from Georgia).
   - Foreign-restricted remote jobs (e.g., US-only, UK-only) are NOT compatible.
4. **Language & Workplace Compatibility**:
   - Candidate communicates fluently in **English** (does not speak Russian/Georgian/German).
   - The job posting itself may be written in English, Georgian, or Russian. That is completely OK.
   - What is required is that the **company and team are OK with English** and accept English-speaking candidates.
   - Only mark "languageCompatible": false (and recommendation: "skip", matchScore: 0) if the company strictly requires Russian or local language as mandatory and does NOT accept English.
5. **Negative Signals / Disqualifiers**:
   - Pure Backend (Java, PHP, C#/.NET, Python backend only, Golang), DevOps, Data engineering, internships, or non-tech jobs.

### Job To Analyze:
- **Title**: ${job.title}
- **Company**: ${job.company}
- **Declared Location**: ${job.location}
- **Workplace Type**: ${job.workplaceType}
- **Description**:
"""
${job.description.substring(0, 4000)}
"""

### Instructions:
Evaluate this job strictly and objectively. Return a JSON object matching this exact schema:
{
  "profile": "frontend" | "design" | "unrelated",
  "relevant": boolean,
  "matchScore": number (0 to 100),
  "experienceRequired": number or null,
  "experienceCompatible": boolean,
  "technologies": string[],
  "locationCompatible": boolean,
  "languageCompatible": boolean,
  "workplaceType": "onsite" | "hybrid" | "remote" | "unknown",
  "visaSponsorship": "yes" | "no" | "unknown",
  "relocationSupport": "yes" | "no" | "unknown",
  "recommendation": "strongly_apply" | "apply" | "consider" | "skip",
  "reasons": string[],
  "concerns": string[],
  "summary": string
}
`;
  }
}

export const geminiAnalyzer = new GeminiJobAnalyzer();
