import { geminiAnalyzer } from '../ai/analyzer.js';
import { config } from '../config/config.js';
import { jobNormalizer } from './job.normalizer.js';
import { HUNTER_PROFILE } from './profiles.js';
import { Job, MatchResult, MatchScoreBreakdown } from './types.js';

export class JobScorer {
  /**
   * Evaluates and scores a job using rule-based heuristics
   */
  public scoreJob(job: Job): MatchResult {
    const reasons: string[] = [];
    const concerns: string[] = [];

    // Language requirement check (English required, Russian/non-English disqualified)
    const langCheck = jobNormalizer.detectLanguageMismatch(job.title, job.description);
    if (langCheck.isMismatch) {
      concerns.push(langCheck.reason || 'Requires Russian or non-English language (English-only candidate)');
      return {
        score: 0,
        profile: undefined,
        isMatch: false,
        reasons: [],
        concerns,
        breakdown: {
          techMatch: 0,
          experienceMatch: 0,
          roleMatch: 0,
          locationMatch: 0,
          seniorityMatch: 0,
          workplaceMatch: 0,
          freshnessMatch: 0,
        },
        recommendation: 'skip',
      };
    }

    const fullText = `${job.title} ${job.description}`.toLowerCase();
    const profile = job.profile;

    // If job does not belong to Frontend or Design profile, reject as irrelevant
    if (!profile) {
      concerns.push('Role does not match Frontend or Design target profiles');
      return {
        score: 0,
        profile: undefined,
        isMatch: false,
        reasons: [],
        concerns,
        breakdown: {
          techMatch: 0,
          experienceMatch: 0,
          roleMatch: 0,
          locationMatch: 0,
          seniorityMatch: 0,
          workplaceMatch: 0,
          freshnessMatch: 0,
        },
        recommendation: 'skip',
      };
    }

    let techMatch = 0;
    let experienceMatch = 0;
    let roleMatch = 0;
    let locationMatch = 0;
    let seniorityMatch = 0;
    let workplaceMatch = 0;
    let freshnessMatch = 0;
    let penalty = 0;

    const normTitle = (job.normalizedTitle || job.title || '').toLowerCase();

    // 1. Role / Title Match (Max 15)
    if (profile === 'frontend') {
      const isTargetTitle = HUNTER_PROFILE.frontend.supportedTitles.some((t) =>
        normTitle.includes(t) || job.title.toLowerCase().includes(t)
      );
      if (isTargetTitle) {
        roleMatch = 15;
        reasons.push(`Target Frontend role: "${job.title}"`);
      } else if (fullText.includes('frontend') || fullText.includes('front-end')) {
        roleMatch = 10;
        reasons.push('Frontend responsibilities highlighted');
      } else {
        roleMatch = 4;
      }
    } else {
      const isTargetDesignTitle = HUNTER_PROFILE.design.supportedTitles.some((t) =>
        normTitle.includes(t) || job.title.toLowerCase().includes(t)
      );
      if (isTargetDesignTitle) {
        roleMatch = 15;
        reasons.push(`Target Design role: "${job.title}"`);
      } else {
        roleMatch = 6;
      }
    }

    // 2. Technology / Skills Match (Max 30)
    if (profile === 'frontend') {
      let matchedTechCount = 0;
      const keyTechs = ['Angular', 'Vue', 'Nuxt', 'TypeScript', 'JavaScript', 'HTML/CSS'];

      for (const tech of keyTechs) {
        if (job.skills.includes(tech) || fullText.includes(tech.toLowerCase())) {
          matchedTechCount++;
          reasons.push(`Key technology match: ${tech}`);
        }
      }

      if (matchedTechCount >= 3) {
        techMatch = 30;
      } else if (matchedTechCount === 2) {
        techMatch = 24;
      } else if (matchedTechCount === 1) {
        techMatch = 16;
      } else {
        techMatch = 5;
        concerns.push('Few primary frontend technologies explicitly matched');
      }
    } else {
      let matchedSkillCount = 0;
      const designSkills = ['Figma', 'UI/UX', 'Product Design', 'Design Systems', 'Wireframing', 'User Research'];

      for (const skill of designSkills) {
        if (job.skills.includes(skill) || fullText.includes(skill.toLowerCase())) {
          matchedSkillCount++;
          reasons.push(`Core design skill match: ${skill}`);
        }
      }

      if (matchedSkillCount >= 3) {
        techMatch = 30;
      } else if (matchedSkillCount === 2) {
        techMatch = 22;
      } else if (matchedSkillCount === 1) {
        techMatch = 14;
      } else {
        techMatch = 5;
      }
    }

    // 3. Experience Match (Max 20)
    const requiredExp = job.requiredExperienceYears;
    if (profile === 'frontend') {
      if (requiredExp === undefined) {
        experienceMatch = 14; // Unspecified is acceptable
      } else if (requiredExp >= 4 && requiredExp <= 6) {
        experienceMatch = 20;
        reasons.push(`Experience requirement (${requiredExp} yrs) matches your 5-year background`);
      } else if (requiredExp >= 2 && requiredExp < 4) {
        experienceMatch = 17;
      } else if (requiredExp > 6) {
        experienceMatch = 10;
        concerns.push(`High experience requested: ${requiredExp}+ years`);
      } else {
        experienceMatch = 12;
      }
    } else {
      // Design profile (UI/UX 3-4 yrs, Product Designer 1-2 yrs)
      const isProductDesigner = job.normalizedTitle.includes('product') || fullText.includes('product designer');
      if (isProductDesigner) {
        if (requiredExp === undefined || (requiredExp >= 1 && requiredExp <= 3)) {
          experienceMatch = 20;
          reasons.push('Product design experience criteria (1-2 yrs) satisfied');
        } else {
          experienceMatch = 12;
        }
      } else {
        if (requiredExp === undefined || (requiredExp >= 2 && requiredExp <= 4)) {
          experienceMatch = 20;
          reasons.push('UI/UX design experience criteria (3-4 yrs) satisfied');
        } else {
          experienceMatch = 12;
        }
      }
    }

    // 4. Location Match (Max 15)
    if (job.locationType === 'georgia_onsite') {
      locationMatch = 15;
      reasons.push(`Directly based in Georgia (${job.location})`);
    } else if (job.locationType === 'georgia_remote') {
      locationMatch = 13;
      reasons.push('Remote opportunity available from Georgia');
    } else if (job.locationType === 'foreign_remote') {
      locationMatch = 0;
      concerns.push('Remote role restricted to other regions/countries');
      penalty += 20;
    } else {
      locationMatch = 8;
    }

    // 5. Seniority Match (Max 10)
    if (fullText.includes('senior') || fullText.includes('lead') || fullText.includes('middle') || fullText.includes('mid')) {
      seniorityMatch = 10;
    } else if (fullText.includes('junior') || fullText.includes('intern')) {
      seniorityMatch = 4;
      concerns.push('Junior / Entry-level role');
    } else {
      seniorityMatch = 8;
    }

    // 6. Workplace Match (Max 5)
    if (job.workplaceType === 'hybrid' || job.workplaceType === 'remote') {
      workplaceMatch = 5;
      reasons.push(`Flexible workplace: ${job.workplaceType}`);
    } else {
      workplaceMatch = 4;
    }

    // 7. Freshness Match (Max 5)
    if (job.postedAt) {
      const ageHours = (Date.now() - job.postedAt.getTime()) / (1000 * 60 * 60);
      if (ageHours <= 24) {
        freshnessMatch = 5;
        reasons.push('Fresh job: posted within the last 24 hours');
      } else if (ageHours <= 72) {
        freshnessMatch = 4;
        reasons.push('Recently posted (within 3 days)');
      } else if (ageHours <= 168) {
        freshnessMatch = 3;
      } else {
        freshnessMatch = 1;
      }
    } else {
      freshnessMatch = 3;
    }

    // 8. Negative Penalties
    if (profile === 'frontend') {
      for (const neg of HUNTER_PROFILE.frontend.negativeKeywords) {
        if (normTitle.includes(neg) || job.title.toLowerCase().includes(neg)) {
          penalty += 80;
          concerns.push(`Negative title match: contains "${neg}"`);
          break;
        }
      }
    } else if (profile === 'design') {
      for (const neg of HUNTER_PROFILE.design.negativeKeywords) {
        if (normTitle.includes(neg) || job.title.toLowerCase().includes(neg)) {
          penalty += 80;
          concerns.push(`Negative title match: contains "${neg}"`);
          break;
        }
      }
    }

    const rawTotal =
      techMatch +
      experienceMatch +
      roleMatch +
      locationMatch +
      seniorityMatch +
      workplaceMatch +
      freshnessMatch -
      penalty;

    const finalScore = Math.max(0, Math.min(100, Math.round(rawTotal)));
    const minThreshold = config.MIN_MATCH_SCORE;
    const isMatch = finalScore >= minThreshold;

    let recommendation: 'strongly_apply' | 'apply' | 'consider' | 'skip';
    if (finalScore >= 85) {
      recommendation = 'strongly_apply';
    } else if (finalScore >= minThreshold) {
      recommendation = 'apply';
    } else if (finalScore >= 45) {
      recommendation = 'consider';
    } else {
      recommendation = 'skip';
    }

    const breakdown: MatchScoreBreakdown = {
      techMatch,
      experienceMatch,
      roleMatch,
      locationMatch,
      seniorityMatch,
      workplaceMatch,
      freshnessMatch,
    };

    return {
      score: finalScore,
      profile,
      isMatch,
      reasons,
      concerns,
      breakdown,
      recommendation,
    };
  }

  /**
   * Hybrid scoring combining rule-based heuristics with Google Gemini AI Deep Analysis
   */
  public async scoreJobWithAI(job: Job): Promise<MatchResult> {
    const baseResult = this.scoreJob(job);

    // If job is already disqualified by basic filters (e.g. Cook, Lawyer), skip AI to save tokens
    if (baseResult.score < 40 || !geminiAnalyzer.isEnabled) {
      return baseResult;
    }

    try {
      const aiAnalysis = await geminiAnalyzer.analyzeJob(job);
      if (!aiAnalysis) {
        return baseResult;
      }

      if (aiAnalysis.languageCompatible === false) {
        const langConcerns = Array.from(new Set(['Incompatible language requirement (Requires Russian or non-English language)', ...aiAnalysis.concerns, ...baseResult.concerns]));
        return {
          score: 0,
          profile: undefined,
          isMatch: false,
          reasons: [],
          concerns: langConcerns,
          breakdown: baseResult.breakdown,
          recommendation: 'skip',
        };
      }

      // Blend AI score with rule-based heuristics
      const combinedScore = Math.round(aiAnalysis.matchScore * 0.7 + baseResult.score * 0.3);
      const isMatch = combinedScore >= config.MIN_MATCH_SCORE;

      // Merge and deduplicate reasons & concerns
      const reasons = Array.from(new Set([...aiAnalysis.reasons, ...baseResult.reasons]));
      const concerns = Array.from(new Set([...aiAnalysis.concerns, ...baseResult.concerns]));

      if (aiAnalysis.visaSponsorship !== 'unknown') {
        reasons.push(`Visa sponsorship: ${aiAnalysis.visaSponsorship}`);
      }

      return {
        score: combinedScore,
        profile: aiAnalysis.profile === 'unrelated' ? undefined : aiAnalysis.profile,
        isMatch,
        reasons,
        concerns,
        breakdown: baseResult.breakdown,
        recommendation: aiAnalysis.recommendation,
      };
    } catch {
      return baseResult;
    }
  }
}

export const jobScorer = new JobScorer();
