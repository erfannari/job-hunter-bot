export type JobProfile = 'frontend' | 'design';

export type WorkplaceType = 'onsite' | 'hybrid' | 'remote' | 'unknown';

export type LocationType = 'georgia_onsite' | 'georgia_remote' | 'foreign_remote' | 'unknown';

export type JobStatus = 'new' | 'sent' | 'saved' | 'ignored' | 'applied';

export interface RawJob {
  source: string;
  sourceJobId?: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  url: string;
  postedAt?: Date | string;
  employmentType?: string;
  workplaceType?: string;
  salaryText?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  rawPayload?: Record<string, unknown>;
}

export interface Job {
  id: string; // Unique deterministic ID (fingerprint or source+id)
  source: string;
  sourceJobId?: string;
  title: string;
  normalizedTitle: string;
  company: string;
  normalizedCompany: string;
  location: string;
  locationType: LocationType;
  description: string;
  url: string;
  postedAt?: Date;
  discoveredAt: Date;
  updatedAt: Date;
  employmentType?: string;
  workplaceType: WorkplaceType;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  requiredExperienceYears?: number;
  skills: string[];
  profile?: JobProfile;
  matchScore?: number;
  matchReason?: string;
  status: JobStatus;
  fingerprint: string;
}

export interface MatchScoreBreakdown {
  techMatch: number; // Max 30
  experienceMatch: number; // Max 20
  roleMatch: number; // Max 15
  locationMatch: number; // Max 15
  seniorityMatch: number; // Max 10
  workplaceMatch: number; // Max 5
  freshnessMatch: number; // Max 5
}

export interface MatchResult {
  score: number; // 0 to 100
  profile?: JobProfile;
  isMatch: boolean;
  reasons: string[];
  concerns: string[];
  breakdown: MatchScoreBreakdown;
  recommendation: 'strongly_apply' | 'apply' | 'consider' | 'skip';
}

export interface SearchQuery {
  keyword: string;
  profile: JobProfile;
  location?: string;
}
