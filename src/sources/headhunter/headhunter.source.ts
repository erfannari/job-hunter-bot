import * as cheerio from 'cheerio';
import { RawJob, SearchQuery } from '../../jobs/types.js';
import { logger } from '../../utils/logger.js';
import { JobSource } from '../source.interface.js';

interface HeadHunterJobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  salaryText?: string;
}

export class HeadHunterSource implements JobSource {
  public readonly name = 'HeadHunter.ge';
  public readonly baseUrl = 'https://tbilisi.headhunter.ge';
  public readonly isEnabled = true;

  private readonly userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  /**
   * Fetches tech vacancies for Georgia from HeadHunter
   */
  public async fetchJobs(queries?: SearchQuery[]): Promise<RawJob[]> {
    logger.info(`[${this.name}] Starting HeadHunter Georgia job scan...`);
    const listingsMap = new Map<string, HeadHunterJobItem>();

    const searchKeywords = queries && queries.length > 0
      ? Array.from(new Set(queries.map((q) => q.keyword))).slice(0, 5)
      : ['frontend developer', 'angular developer', 'vue developer', 'ui ux designer', 'product designer'];

    for (const kw of searchKeywords) {
      try {
        const searchUrl = `${this.baseUrl}/search/vacancy?text=${encodeURIComponent(kw)}&area=2758`;
        const items = await this.scrapeSearchPage(searchUrl);
        for (const item of items) {
          if (!listingsMap.has(item.id)) {
            listingsMap.set(item.id, item);
          }
        }
        await this.sleep(400);
      } catch (err) {
        logger.warn(`[${this.name}] Search failed for "${kw}":`, err);
      }
    }

    const allItems = Array.from(listingsMap.values());
    logger.info(`[${this.name}] Found ${allItems.length} unique job listings.`);

    if (allItems.length === 0) {
      return [];
    }

    const rawJobs: RawJob[] = [];
    const itemsToFetch = allItems.slice(0, 15);

    for (const item of itemsToFetch) {
      const detailed = await this.fetchJobDetail(item);
      rawJobs.push(detailed);
      await this.sleep(350);
    }

    // Add remaining items as basic entries
    for (let i = 15; i < allItems.length; i++) {
      const item = allItems[i];
      rawJobs.push({
        source: 'headhunter',
        sourceJobId: item.id,
        title: item.title,
        company: item.company,
        location: item.location,
        description: `${item.title} at ${item.company}`,
        url: item.url,
        postedAt: new Date(),
      });
    }

    logger.info(`[${this.name}] Successfully processed ${rawJobs.length} jobs.`);
    return rawJobs;
  }

  private async scrapeSearchPage(url: string): Promise<HeadHunterJobItem[]> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching HeadHunter search`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const items: HeadHunterJobItem[] = [];

    $('a[href*="/vacancy/"]').each((_, a) => {
      const href = $(a).attr('href') || '';
      const idMatch = href.match(/vacancy\/(\d+)/);
      if (!idMatch || !idMatch[1]) return;

      const id = idMatch[1];
      const title = $(a).text().trim();
      if (!title || title.length < 3) return;

      const card = $(a).closest('div');
      const company = card.find('a[href*="/employer/"]').text().trim() || 'Direct Employer';
      const cleanUrl = `https://tbilisi.headhunter.ge/vacancy/${id}`;

      items.push({
        id,
        title,
        company,
        location: 'Tbilisi, Georgia',
        url: cleanUrl,
      });
    });

    return items;
  }

  private async fetchJobDetail(item: HeadHunterJobItem): Promise<RawJob> {
    try {
      const response = await fetch(item.url, {
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

      let description = $('div[data-qa="vacancy-description"]').text().trim();
      if (!description) {
        description = $('div.g-user-content').text().trim();
      }
      if (!description) {
        description = `${item.title} at ${item.company}`;
      }

      return {
        source: 'headhunter',
        sourceJobId: item.id,
        title: item.title,
        company: item.company,
        location: item.location,
        description,
        url: item.url,
        postedAt: new Date(),
      };
    } catch {
      return this.createFallbackJob(item);
    }
  }

  private createFallbackJob(item: HeadHunterJobItem): RawJob {
    return {
      source: 'headhunter',
      sourceJobId: item.id,
      title: item.title,
      company: item.company,
      location: item.location,
      description: `${item.title} at ${item.company}`,
      url: item.url,
      postedAt: new Date(),
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const headHunterSource = new HeadHunterSource();
