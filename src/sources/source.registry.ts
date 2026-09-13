import { headHunterSource } from './headhunter/headhunter.source.js';
import { jobsGeSource } from './jobsge/jobsge.source.js';
import { linkedInSource } from './linkedin/linkedin.source.js';
import { JobSource } from './source.interface.js';

export class SourceRegistry {
  private sources: Map<string, JobSource> = new Map();

  constructor() {
    // Register all supported sources for Georgia
    this.register(jobsGeSource);
    this.register(linkedInSource);
    this.register(headHunterSource);
  }

  public register(source: JobSource): void {
    this.sources.set(source.name.toLowerCase(), source);
  }

  public get(name: string): JobSource | undefined {
    return this.sources.get(name.toLowerCase());
  }

  public getAll(): JobSource[] {
    return Array.from(this.sources.values()).filter((s) => s.isEnabled);
  }
}

export const sourceRegistry = new SourceRegistry();
