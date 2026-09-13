import * as cheerio from 'cheerio';
import { RawJob, SearchQuery } from '../../jobs/types.js';
import { logger } from '../../utils/logger.js';
import { JobSource } from '../source.interface.js';

interface JobsGeListingItem {
  id: string;
  title: string;
  company: string;
  url: string;
  publishedText: string;
  deadlineText: string;
  isNew: boolean;
}

export class JobsGeSource implements JobSource {
  public readonly name = 'Jobs.ge';
  public readonly baseUrl = 'https://jobs.ge';
  public readonly isEnabled = true;

  private readonly userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  /**
   * Keywords indicating a job might be relevant to Tech / Frontend / Design
   */
  private readonly candidateKeywords = [
    'frontend',
    'front-end',
    'developer',
    'engineer',
    'programmer',
    'software',
    'web',
    'angular',
    'vue',
    'nuxt',
    'react',
    'javascript',
    'typescript',
    'html',
    'css',
    'ui',
    'ux',
    'designer',
    'product designer',
    'product design',
    'figma',
    'full stack',
    'fullstack',
    'it',
    'tech',
  ];

  /**
   * Fetches IT category jobs and keyword search results from Jobs.ge
   */
  public async fetchJobs(queries?: SearchQuery[]): Promise<RawJob[]> {
    logger.info(`[${this.name}] Starting job scan...`);
    const listingsMap = new Map<string, JobsGeListingItem>();

    try {
      // 1. Fetch IT category listing (cid=6 contains all programming/IT jobs in Georgia)
      const itCategoryUrl = `${this.baseUrl}/en/?cid=6`;
      logger.info(`[${this.name}] Fetching IT Category listing: ${itCategoryUrl}`);
      const itItems = await this.scrapeListingPage(itCategoryUrl);
      for (const item of itItems) {
        listingsMap.set(item.id, item);
      }
      logger.info(`[${this.name}] Found ${itItems.length} active listings in IT category.`);

      // 2. Fetch specific keyword queries if provided (e.g., frontend, angular, vue, design)
      if (queries && queries.length > 0) {
        const uniqueKeywords = ['frontend', 'angular', 'vue', 'nuxt', 'designer', 'product designer'];
        for (const kw of uniqueKeywords) {
          const searchUrl = `${this.baseUrl}/en/?q=${encodeURIComponent(kw)}`;
          try {
            await this.sleep(400); // Respectful pause
            const searchItems = await this.scrapeListingPage(searchUrl);
            for (const item of searchItems) {
              if (!listingsMap.has(item.id)) {
                listingsMap.set(item.id, item);
              }
            }
          } catch (err) {
            logger.warn(`[${this.name}] Search failed for keyword "${kw}":`, err);
          }
        }
      }

      const allItems = Array.from(listingsMap.values());
      logger.info(`[${this.name}] Total unique job listings found: ${allItems.length}`);

      if (allItems.length === 0) {
        return [];
      }

      // 3. Pre-filter candidate items: only fetch details for jobs that match tech/design keywords
      const candidateItems = allItems.filter((item) => this.isCandidateTitle(item.title));
      const nonCandidateItems = allItems.filter((item) => !this.isCandidateTitle(item.title));

      logger.info(
        `[${this.name}] Filtered ${candidateItems.length} candidate tech/design jobs for detailed inspection (skipping ${nonCandidateItems.length} non-tech entries).`
      );

      const rawJobs: RawJob[] = [];

      // Fetch details sequentially with respectful delay to avoid IP rate-limiting
      for (const item of candidateItems) {
        const detailJob = await this.fetchJobDetail(item);
        if (detailJob) {
          rawJobs.push(detailJob);
        }
        await this.sleep(300);
      }

      // For non-candidate items, include basic info without hammering detail endpoints
      for (const item of nonCandidateItems) {
        rawJobs.push({
          source: 'jobsge',
          sourceJobId: item.id,
          title: item.title,
          company: item.company,
          location: 'Tbilisi, Georgia',
          description: `${item.title} at ${item.company}`,
          url: item.url,
          postedAt: this.parsePublishDate(item.publishedText, item.isNew),
        });
      }

      logger.info(`[${this.name}] Successfully processed ${rawJobs.length} jobs.`);
      return rawJobs;
    } catch (error) {
      logger.error(`[${this.name}] Failed to fetch jobs:`, error);
      return [];
    }
  }

  /**
   * Checks if a job title appears to be a tech/design candidate
   */
  private isCandidateTitle(title: string): boolean {
    const t = title.toLowerCase();
    return this.candidateKeywords.some((kw) => t.includes(kw));
  }

  /**
   * Scrapes a listing table from Jobs.ge
   */
  private async scrapeListingPage(url: string): Promise<JobsGeListingItem[]> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status} fetching ${url}`);
    }

    const html = await response.text();

    if (html.includes('too many times')) {
      logger.warn(`[${this.name}] IP rate limit reached temporarily on ${url}`);
      return [];
    }

    const $ = cheerio.load(html);
    const items: JobsGeListingItem[] = [];

    $('tr').each((_, tr) => {
      const jobLink = $(tr).find('a[href*="view=jobs&id="]').first();
      if (!jobLink.length) return;

      const href = jobLink.attr('href') || '';
      const idMatch = href.match(/id=(\d+)/);
      if (!idMatch || !idMatch[1]) return;

      const id = idMatch[1];
      const title = jobLink.text().trim();
      if (!title) return;

      const companyLink = $(tr).find('a[href*="view=client&client="]').first();
      const company = companyLink.text().trim() || 'Confidential / Direct Employer';
      const isNew = $(tr).find('img[src*="new.gif"]').length > 0;

      const cells = $(tr).find('td');
      let publishedText = '';
      let deadlineText = '';

      if (cells.length >= 4) {
        publishedText = $(cells[cells.length - 2]).text().trim();
        deadlineText = $(cells[cells.length - 1]).text().trim();
      }

      items.push({
        id,
        title,
        company,
        url: `${this.baseUrl}/en/?view=jobs&id=${id}`,
        publishedText,
        deadlineText,
        isNew,
      });
    });

    return items;
  }

  /**
   * Fetches and parses the individual job details page
   */
  private async fetchJobDetail(item: JobsGeListingItem): Promise<RawJob | null> {
    try {
      const response = await fetch(item.url, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'text/html,application/xhtml+xml',
        },
      });

      if (!response.ok) {
        return this.createFallbackRawJob(item);
      }

      const html = await response.text();
      if (html.includes('too many times')) {
        return this.createFallbackRawJob(item);
      }

      const $ = cheerio.load(html);

      let description = '';
      const descCell = $('table.dtable tr td[style*="padding-top"]').first();

      if (descCell.length) {
        description = descCell.text().trim();
      } else {
        description = $('table.dtable').text().trim();
      }

      if (!description) {
        description = `${item.title} at ${item.company}`;
      }

      const postedAt = this.parsePublishDate(item.publishedText, item.isNew);

      return {
        source: 'jobsge',
        sourceJobId: item.id,
        title: item.title,
        company: item.company,
        location: 'Tbilisi, Georgia',
        description,
        url: item.url,
        postedAt,
        rawPayload: {
          deadline: item.deadlineText,
          publishedText: item.publishedText,
          isNew: item.isNew,
        },
      };
    } catch (err) {
      logger.debug(`[${this.name}] Error fetching details for job ${item.id}:`, err);
      return this.createFallbackRawJob(item);
    }
  }

  private createFallbackRawJob(item: JobsGeListingItem): RawJob {
    return {
      source: 'jobsge',
      sourceJobId: item.id,
      title: item.title,
      company: item.company,
      location: 'Tbilisi, Georgia',
      description: `${item.title} at ${item.company}`,
      url: item.url,
      postedAt: this.parsePublishDate(item.publishedText, item.isNew),
    };
  }

  private parsePublishDate(publishedText: string, isNew: boolean): Date {
    const now = new Date();
    if (!publishedText) {
      if (isNew) return now;
      return new Date(now.getTime() - 24 * 3600 * 1000 * 3);
    }

    const months: Record<string, number> = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
      იანვარი: 0,
      თებერვალი: 1,
      მარტი: 2,
      აპრილი: 3,
      მაისი: 4,
      ივნისი: 5,
      ივლისი: 6,
      აგვისტო: 7,
      სექტემბერი: 8,
      ოქტომბერი: 9,
      ნოემბერი: 10,
      დეკემბერი: 11,
    };

    const parts = publishedText.toLowerCase().trim().split(/\s+/);
    if (parts.length >= 2) {
      const day = parseInt(parts[0], 10);
      const monthStr = parts[1];
      const month = months[monthStr];

      if (!isNaN(day) && month !== undefined) {
        let year = now.getFullYear();
        if (month > now.getMonth()) {
          year -= 1;
        }
        return new Date(year, month, day, 12, 0, 0);
      }
    }

    return now;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const jobsGeSource = new JobsGeSource();
