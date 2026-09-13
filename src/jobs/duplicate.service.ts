import { createHash } from 'crypto';
import { Job, RawJob } from './types.js';

export class DuplicateService {
  /**
   * Normalizes a company name for consistent matching
   */
  public normalizeCompany(company: string): string {
    if (!company) return 'unknown_company';
    return company
      .toLowerCase()
      .replace(/\b(llc|inc|corp|corporation|ltd|gmbh|co|company|group|technologies|tech|georgia)\b/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  /**
   * Normalizes a job title to be tolerant of dashes, spaces, and minor variations
   */
  public normalizeTitle(title: string): string {
    if (!title) return 'unknown_title';
    return title
      .toLowerCase()
      .replace(/front[\s-]end/gi, 'frontend')
      .replace(/back[\s-]end/gi, 'backend')
      .replace(/full[\s-]stack/gi, 'fullstack')
      .replace(/ui[\s/|-]+ux/gi, 'ui_ux')
      .replace(/ux[\s/|-]+ui/gi, 'ui_ux')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normalizes location string
   */
  public normalizeLocation(location?: string): string {
    if (!location) return 'georgia';
    const loc = location.toLowerCase();
    if (loc.includes('tbilisi') || loc.includes('თბილისი')) return 'georgia_tbilisi';
    if (loc.includes('batumi') || loc.includes('ბათუმი')) return 'georgia_batumi';
    if (loc.includes('kutaisi') || loc.includes('ქუთაისი')) return 'georgia_kutaisi';
    if (loc.includes('georgia') || loc.includes('sakartvelo') || loc.includes('საქართველო')) return 'georgia_general';
    if (loc.includes('remote')) return 'remote';
    return loc.replace(/[^a-z0-9]/g, '');
  }

  /**
   * Generates a deterministic SHA256 fingerprint for duplicate detection across sources
   */
  public generateFingerprint(title: string, company: string, location?: string): string {
    const normTitle = this.normalizeTitle(title);
    const normCompany = this.normalizeCompany(company);
    const normLocation = this.normalizeLocation(location);

    const rawKey = `${normCompany}:${normTitle}:${normLocation}`;
    return createHash('sha256').update(rawKey).digest('hex').substring(0, 24);
  }

  /**
   * Generates a unique stable job ID
   */
  public generateJobId(rawJob: RawJob | Job): string {
    if (rawJob.source && rawJob.sourceJobId) {
      const sanitizedSource = rawJob.source.toLowerCase().replace(/[^a-z0-9]/g, '');
      const sanitizedId = String(rawJob.sourceJobId).replace(/[^a-z0-9_-]/gi, '');
      return `${sanitizedSource}_${sanitizedId}`;
    }
    return this.generateFingerprint(rawJob.title, rawJob.company, rawJob.location);
  }

  /**
   * Checks if two jobs are duplicates based on either exact ID or content fingerprint
   */
  public isDuplicate(jobA: Job, jobB: Job): boolean {
    if (jobA.id === jobB.id) return true;
    if (jobA.fingerprint === jobB.fingerprint) return true;
    if (jobA.url === jobB.url && jobA.url.length > 10) return true;

    // Check high similarity between normalized company and title
    if (
      jobA.normalizedCompany === jobB.normalizedCompany &&
      jobA.normalizedTitle === jobB.normalizedTitle
    ) {
      return true;
    }

    return false;
  }
}

export const duplicateService = new DuplicateService();
