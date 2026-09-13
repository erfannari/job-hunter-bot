import * as cheerio from 'cheerio';
import { RawJob, SearchQuery } from '../../jobs/types.js';
import { logger } from '../../utils/logger.js';
import { JobSource } from '../source.interface.js';

interface LinkedInJobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  dateText?: string;
}

export class LinkedInSource implements JobSource {
  public readonly name = 'LinkedIn';
  public readonly baseUrl = 'https://www.linkedin.com';
  public readonly isEnabled = true;

  private readonly userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  /**
   * Fetches public job postings for Georgia from LinkedIn guest search
   */
  public async fetchJobs(queries?: SearchQuery[]): Promise<RawJob[]> {
    logger.info(`[${this.name}] Starting Georgia job scan...`);
    const listingsMap = new Map<string, LinkedInJobItem>();

    const searchKeywords = queries && queries.length > 0
      ? Array.from(new Set(queries.map((q) => q.keyword))).slice(0, 4)
      : ['Frontend Developer', 'Angular Developer', 'Vue Developer', 'UI/UX Designer', 'Product Designer'];

    for (const kw of searchKeywords) {
      try {
        // Query specifically for Tbilisi, Georgia and Georgia (country)
        const locations = ['Tbilisi, Georgia', 'Georgia'];
        for (const loc of locations) {
          const searchUrl = `${this.baseUrl}/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(
            kw
          )}&location=${encodeURIComponent(loc)}&start=0`;

          const items = await this.scrapeSearchPage(searchUrl);
          for (const item of items) {
            // Filter out US Georgia state postings
            if (this.isUSLocation(item.location)) continue;

            if (!listingsMap.has(item.id)) {
              listingsMap.set(item.id, item);
            }
          }
          await this.sleep(300);
        }
      } catch (err) {
        logger.warn(`[${this.name}] Search query failed for "${kw}":`, err);
      }
    }

    const allItems = Array.from(listingsMap.values());
    logger.info(`[${this.name}] Discovered ${allItems.length} unique job postings.`);

    if (allItems.length === 0) {
      return [];
    }

    const rawJobs: RawJob[] = [];
    // Limit detailed fetching to top 15 candidates per scan to be polite to guest API
    const itemsToFetch = allItems.slice(0, 15);

    for (const item of itemsToFetch) {
      const detailed = await this.fetchJobDetail(item);
      rawJobs.push(detailed);
      await this.sleep(350);
    }

    // Add remaining items as basic records
    for (let i = 15; i < allItems.length; i++) {
      const item = allItems[i];
      rawJobs.push({
        source: 'linkedin',
        sourceJobId: item.id,
        title: item.title,
        company: item.company,
        location: item.location || 'Georgia',
        description: `${item.title} at ${item.company}. View details on LinkedIn.`,
        url: item.url,
        postedAt: this.parseDate(item.dateText),
      });
    }

    logger.info(`[${this.name}] Successfully processed ${rawJobs.length} jobs.`);
    return rawJobs;
  }

  private async scrapeSearchPage(url: string): Promise<LinkedInJobItem[]> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching LinkedIn search`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const items: LinkedInJobItem[] = [];

    $('li, div.base-search-card').each((_, el) => {
      const card = $(el).is('div.base-search-card') ? $(el) : $(el).find('div.base-search-card').first();
      if (!card.length) return;

      const urn = card.attr('data-entity-urn') || '';
      const idMatch = urn.match(/jobPosting:(\d+)/);
      if (!idMatch || !idMatch[1]) return;

      const id = idMatch[1];
      const title = card.find('h3.base-search-card__title').text().trim();
      const company = card.find('h4.base-search-card__subtitle').text().trim() || 'Direct Employer';
      const location = card.find('span.job-search-card__location').text().trim() || 'Tbilisi, Georgia';
      const rawUrl = card.find('a.base-card__full-link').attr('href') || '';
      const cleanUrl = rawUrl.split('?')[0] || `https://www.linkedin.com/jobs/view/${id}`;
      const dateText = card.find('time.job-search-card__listdate').attr('datetime') || card.find('time').text().trim();

      if (title && id) {
        items.push({
          id,
          title,
          company,
          location,
          url: cleanUrl,
          dateText,
        });
      }
    });

    return items;
  }

  private async fetchJobDetail(item: LinkedInJobItem): Promise<RawJob> {
    try {
      const detailUrl = `${this.baseUrl}/jobs-guest/jobs/api/jobPosting/${item.id}`;
      const response = await fetch(detailUrl, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'text/html,application/xhtml+xml',
        },
      });

      if (!response.ok) {
        return this.createFallbackJob(item);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      let description = $('div.show-more-less-html__markup').text().trim();
      if (!description) {
        description = $('section.description').text().trim();
      }
      if (!description) {
        description = `${item.title} at ${item.company}`;
      }

      return {
        source: 'linkedin',
        sourceJobId: item.id,
        title: item.title,
        company: item.company,
        location: item.location,
        description,
        url: item.url,
        postedAt: this.parseDate(item.dateText),
      };
    } catch {
      return this.createFallbackJob(item);
    }
  }

  private createFallbackJob(item: LinkedInJobItem): RawJob {
    return {
      source: 'linkedin',
      sourceJobId: item.id,
      title: item.title,
      company: item.company,
      location: item.location,
      description: `${item.title} at ${item.company}`,
      url: item.url,
      postedAt: this.parseDate(item.dateText),
    };
  }

  private parseDate(dateStr?: string): Date {
    if (!dateStr) return new Date();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private isUSLocation(location?: string): boolean {
    if (!location) return false;
    const l = location.toLowerCase();
    return (
      l.includes(', ga') ||
      l.includes('ga, united states') ||
      l.includes('atlanta') ||
      l.includes('alpharetta') ||
      l.includes('savannah') ||
      l.includes('marietta') ||
      l.includes('united states') ||
      l.includes('usa')
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const linkedInSource = new LinkedInSource();
