import { duplicateService } from './duplicate.service.js';
import { HUNTER_PROFILE } from './profiles.js';
import { Job, JobProfile, LocationType, RawJob, WorkplaceType } from './types.js';

export class JobNormalizer {
  /**
   * Cleans HTML tags, entities, and excessive whitespace
   */
  public cleanText(text?: string): string {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extracts required years of experience from title and description
   */
  public extractExperienceYears(text: string): number | undefined {
    const patterns = [
      /(\d+)\s*\+?\s*(?:years?|yrs?|წელი|წლიანი)\s*(?:of\s+)?(?:experience|exp)/i,
      /(?:at\s+least|minimum|min)\s*(\d+)\s*(?:years?|yrs?)/i,
      /(?:experience|exp)[:\s]+(\d+)\s*\+?\s*(?:years?|yrs?)/i,
      /(\d+)\s*[-–]\s*\d+\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 15) {
          return parsed;
        }
      }
    }

    // Seniority keyword fallback
    const lower = text.toLowerCase();
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal')) {
      return 5;
    }
    if (lower.includes('middle') || lower.includes('mid-level') || lower.includes('intermediate')) {
      return 3;
    }
    if (lower.includes('junior')) {
      return 1;
    }

    return undefined;
  }

  /**
   * Identifies technologies and design skills mentioned in description
   */
  public extractSkills(text: string): string[] {
    const lower = ` ${text.toLowerCase()} `;
    const detected = new Set<string>();

    const skillTaxonomy: Record<string, string[]> = {
      Angular: ['angular', 'angularjs', 'rxjs', 'ngrx'],
      Vue: ['vue', 'vue.js', 'vuejs', 'pinia', 'vuex'],
      Nuxt: ['nuxt', 'nuxt.js', 'nuxtjs'],
      TypeScript: ['typescript', 'ts'],
      JavaScript: ['javascript', 'js', 'es6', 'ecmascript'],
      'HTML/CSS': ['html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'bootstrap'],
      Figma: ['figma'],
      'UI/UX': ['ui/ux', 'ux/ui', 'ui designer', 'ux designer', 'user experience', 'user interface'],
      'Product Design': ['product design', 'product designer'],
      'Design Systems': ['design system', 'design systems', 'component library'],
      Wireframing: ['wireframe', 'wireframes', 'wireframing', 'prototyping', 'prototypes'],
      'User Research': ['user research', 'usability testing', 'user interviews'],
      Git: ['git', 'github', 'gitlab'],
      REST: ['rest api', 'restful', 'graphql'],
    };

    for (const [skillName, aliases] of Object.entries(skillTaxonomy)) {
      for (const alias of aliases) {
        // Look for word boundaries or distinct occurrences
        const regex = new RegExp(`(?:^|[^a-z0-9])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^a-z0-9])`, 'i');
        if (regex.test(lower)) {
          detected.add(skillName);
          break;
        }
      }
    }

    return Array.from(detected);
  }

  /**
   * Categorizes workplace type (onsite / hybrid / remote)
   */
  public detectWorkplaceType(text: string, declaredType?: string): WorkplaceType {
    const combined = `${declaredType ?? ''} ${text}`.toLowerCase();
    if (combined.includes('hybrid') || combined.includes('ჰიბრიდული')) return 'hybrid';
    if (combined.includes('remote') || combined.includes('დისტანციური') || combined.includes('work from home')) return 'remote';
    if (combined.includes('on-site') || combined.includes('onsite') || combined.includes('office')) return 'onsite';
    return 'unknown';
  }

  /**
   * Categorizes location compatibility for Georgia
   */
  public detectLocationType(locationStr?: string, fullText: string = ''): LocationType {
    const combined = `${locationStr ?? ''} ${fullText}`.toLowerCase();

    // Check disallowed countries
    for (const disallow of HUNTER_PROFILE.location.remoteDisallowKeywords) {
      if (combined.includes(disallow)) {
        return 'foreign_remote';
      }
    }

    // Check physical presence in Georgia / Georgian cities
    for (const keyword of HUNTER_PROFILE.location.countryKeywords) {
      if (combined.includes(keyword)) {
        return 'georgia_onsite';
      }
    }

    // Check remote allowed from Georgia / worldwide
    for (const allow of HUNTER_PROFILE.location.remoteAllowKeywords) {
      if (combined.includes(allow)) {
        return 'georgia_remote';
      }
    }

    // If source is a local Georgian job board (like jobs.ge / hr.ge), default to georgia_onsite
    return 'unknown';
  }

  /**
   * Detects target profile (frontend vs design)
   */
  public detectProfile(title: string, description: string, skills: string[]): JobProfile | undefined {
    const combined = `${title} ${description}`.toLowerCase();
    const titleLower = title.toLowerCase();

    const frontendSignals = [
      'frontend',
      'front-end',
      'angular',
      'vue',
      'nuxt',
      'javascript',
      'typescript',
      'html',
      'css',
      'web developer',
      'ui developer',
      'react', // recognize as frontend even if not primary tech
    ];

    const designSignals = [
      'ui designer',
      'ux designer',
      'ui/ux',
      'ux/ui',
      'product designer',
      'product design',
      'figma',
      'user experience designer',
      'user interface designer',
      'design system',
    ];

    let feScore = 0;
    let deScore = 0;

    // Direct title matching gets high weight
    for (const s of frontendSignals) {
      if (titleLower.includes(s)) feScore += 5;
      else if (combined.includes(s)) feScore += 1;
    }

    for (const s of skills) {
      if (['Angular', 'Vue', 'Nuxt', 'TypeScript', 'JavaScript', 'HTML/CSS'].includes(s)) feScore += 3;
    }

    for (const s of designSignals) {
      if (titleLower.includes(s)) deScore += 5;
      else if (combined.includes(s)) deScore += 1;
    }

    for (const s of skills) {
      if (['Figma', 'UI/UX', 'Product Design', 'Design Systems', 'Wireframing', 'User Research'].includes(s)) deScore += 3;
    }

    // Require at least a baseline of relevant frontend/design signals
    if (feScore >= 3 && feScore >= deScore) return 'frontend';
    if (deScore >= 3 && deScore > feScore) return 'design';

    return undefined;
  }

  /**
   * Main normalizer converting a RawJob to a canonical Job object
   */
  public normalize(raw: RawJob): Job {
    const cleanTitle = this.cleanText(raw.title);
    const cleanDesc = this.cleanText(raw.description);
    const cleanCompany = this.cleanText(raw.company);
    const cleanLocation = this.cleanText(raw.location) || 'Tbilisi, Georgia';

    const fullContent = `${cleanTitle} ${cleanDesc} ${cleanLocation}`;

    const skills = this.extractSkills(fullContent);
    const experienceYears = this.extractExperienceYears(fullContent);
    const workplaceType = this.detectWorkplaceType(fullContent, raw.workplaceType);
    let locationType = this.detectLocationType(raw.location, fullContent);

    // If source is known Georgian platform (jobs.ge / hr.ge / headhunter.ge), ensure locationType is marked Georgia
    if (
      locationType === 'unknown' &&
      (raw.source.toLowerCase().includes('jobsge') ||
        raw.source.toLowerCase().includes('hrge') ||
        raw.source.toLowerCase().includes('headhunter') ||
        raw.url.includes('.ge'))
    ) {
      locationType = 'georgia_onsite';
    }

    const profile = this.detectProfile(cleanTitle, cleanDesc, skills);
    const fingerprint = duplicateService.generateFingerprint(cleanTitle, cleanCompany, cleanLocation);
    const id = duplicateService.generateJobId(raw);

    let postedAt: Date | undefined;
    if (raw.postedAt) {
      const parsed = new Date(raw.postedAt);
      if (!isNaN(parsed.getTime())) {
        postedAt = parsed;
      }
    }

    const now = new Date();

    return {
      id,
      source: raw.source,
      sourceJobId: raw.sourceJobId,
      title: cleanTitle,
      normalizedTitle: duplicateService.normalizeTitle(cleanTitle),
      company: cleanCompany,
      normalizedCompany: duplicateService.normalizeCompany(cleanCompany),
      location: cleanLocation,
      locationType,
      description: cleanDesc,
      url: raw.url,
      postedAt,
      discoveredAt: now,
      updatedAt: now,
      employmentType: raw.employmentType,
      workplaceType,
      salaryMin: raw.salaryMin,
      salaryMax: raw.salaryMax,
      salaryCurrency: raw.salaryCurrency,
      requiredExperienceYears: experienceYears,
      skills,
      profile,
      status: 'new',
      fingerprint,
    };
  }
}

export const jobNormalizer = new JobNormalizer();
