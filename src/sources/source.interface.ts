import { RawJob, SearchQuery } from '../jobs/types.js';

export interface SourceFetchResult {
  source: string;
  totalFound: number;
  jobs: RawJob[];
  durationMs: number;
  error?: string;
}

export interface JobSource {
  readonly name: string;
  readonly baseUrl: string;
  readonly isEnabled: boolean;

  /**
   * Fetches raw job listings from the source
   */
  fetchJobs(queries?: SearchQuery[]): Promise<RawJob[]>;
}
