import { SearchQuery } from './types.js';

export interface FrontendProfileConfig {
  enabled: boolean;
  userExperienceYears: number;
  preferredMinExperienceYears: number;
  primaryTechnologies: string[];
  supportedTitles: string[];
  negativeKeywords: string[];
}

export interface DesignProfileConfig {
  enabled: boolean;
  uiUxPreferredExperienceYears: { min: number; max: number };
  productDesignerPreferredExperienceYears: { min: number; max: number };
  skills: string[];
  supportedTitles: string[];
  negativeKeywords: string[];
}

export interface LocationConfig {
  primaryCountry: string;
  preferredCities: string[];
  countryKeywords: string[];
  remoteAllowKeywords: string[];
  remoteDisallowKeywords: string[];
}

export interface LanguageConfig {
  preferred: string[];
  disallowedRequiredLanguages: string[];
  russianKeywords: string[];
}

export interface HunterProfileConfig {
  frontend: FrontendProfileConfig;
  design: DesignProfileConfig;
  location: LocationConfig;
  languages: LanguageConfig;
}

export const HUNTER_PROFILE: HunterProfileConfig = {
  frontend: {
    enabled: true,
    userExperienceYears: 5,
    preferredMinExperienceYears: 4,
    primaryTechnologies: [
      'angular',
      'vue',
      'vue.js',
      'vuejs',
      'nuxt',
      'nuxtjs',
      'typescript',
      'javascript',
      'html',
      'css',
      'sass',
      'scss',
      'tailwind',
      'web development',
    ],
    supportedTitles: [
      'frontend developer',
      'front-end developer',
      'frontend engineer',
      'front-end engineer',
      'senior frontend developer',
      'senior front-end developer',
      'senior frontend engineer',
      'senior front-end engineer',
      'angular developer',
      'senior angular developer',
      'vue developer',
      'vue.js developer',
      'nuxt developer',
      'javascript developer',
      'typescript developer',
      'web developer',
      'html/css developer',
      'ui developer',
      'software engineer - frontend',
      'software engineer — frontend',
      'software engineer - web',
      'frontend',
    ],
    negativeKeywords: [
      'golang',
      'go developer',
      'go engineer',
      'backend developer',
      'back-end developer',
      'backend engineer',
      'back-end engineer',
      'java developer',
      'java engineer',
      'c# developer',
      '.net developer',
      'dotnet developer',
      'php developer',
      'php engineer',
      'python developer',
      'python backend',
      'ruby developer',
      'ruby on rails',
      'c++ developer',
      'rust developer',
      'devops engineer',
      'devops',
      'sre',
      'cloud engineer',
      'system administrator',
      'sysadmin',
      'data engineer',
      'data scientist',
      'machine learning',
      'ai engineer',
      'internship',
      'qa engineer',
      'qa automation',
      'tester',
      'sales manager',
      'sales',
      'accountant',
      'marketing',
      'social media',
      'seo specialist',
      'recruiter',
      'hr manager',
    ],
  },
  design: {
    enabled: true,
    uiUxPreferredExperienceYears: { min: 3, max: 4 },
    productDesignerPreferredExperienceYears: { min: 1, max: 2 },
    skills: [
      'figma',
      'ux',
      'ui',
      'ui/ux',
      'ux/ui',
      'user research',
      'wireframing',
      'wireframes',
      'prototyping',
      'prototypes',
      'design systems',
      'design system',
      'interaction design',
      'product design',
      'usability',
      'user flows',
      'responsive design',
    ],
    supportedTitles: [
      'ui designer',
      'ux designer',
      'ui/ux designer',
      'ux/ui designer',
      'user experience designer',
      'user interface designer',
      'product designer',
      'digital product designer',
      'ux product designer',
      'lead product designer',
      'senior product designer',
    ],
    negativeKeywords: [
      'graphic designer print',
      'interior designer',
      'fashion designer',
      'architect',
      'marketing manager',
      'sales',
      'accountant',
      'social media',
      'backend',
      'golang',
      'java',
      'devops',
    ],
  },
  location: {
    primaryCountry: 'Georgia',
    preferredCities: ['tbilisi', 'batumi', 'kutaisi', 'rustavi'],
    countryKeywords: ['georgia', 'sakartvelo', 'tbilisi', 'batumi', 'kutaisi', 'თბილისი', 'ბათუმი', 'ქუთაისი', 'საქართველო'],
    remoteAllowKeywords: [
      'worldwide',
      'anywhere',
      'emea',
      'europe',
      'cet',
      'eet',
      'georgia remote',
      'remote (georgia)',
      'remote from georgia',
      'global remote',
    ],
    remoteDisallowKeywords: [
      'us only',
      'usa only',
      'uk only',
      'germany only',
      'canada only',
      'must reside in us',
      'eu citizens only',
      'latin america only',
      'apac only',
    ],
  },
  languages: {
    preferred: ['english'],
    disallowedRequiredLanguages: ['russian', 'german', 'french', 'spanish', 'italian'],
    russianKeywords: [
      'russian mandatory',
      'russian is mandatory',
      'russian required',
      'russian is required',
      'must speak russian',
      'fluent russian required',
      'native russian required',
      'russian only',
      'обязательно русский',
      'обязательное знание русского',
      'требуется свободный русский',
      'только с русским языком',
    ],
  },
};

export const DEFAULT_SEARCH_QUERIES: SearchQuery[] = [
  // Frontend Queries
  { keyword: 'Angular Developer', profile: 'frontend', location: 'Georgia' },
  { keyword: 'Angular Frontend', profile: 'frontend', location: 'Georgia' },
  { keyword: 'Senior Angular', profile: 'frontend', location: 'Georgia' },
  { keyword: 'Vue Developer', profile: 'frontend', location: 'Georgia' },
  { keyword: 'Vue.js Developer', profile: 'frontend', location: 'Georgia' },
  { keyword: 'Nuxt Developer', profile: 'frontend', location: 'Georgia' },
  { keyword: 'Frontend Developer', profile: 'frontend', location: 'Georgia' },
  { keyword: 'Frontend Engineer', profile: 'frontend', location: 'Georgia' },
  { keyword: 'Frontend Software Engineer', profile: 'frontend', location: 'Georgia' },
  { keyword: 'JavaScript Developer', profile: 'frontend', location: 'Georgia' },
  { keyword: 'TypeScript Developer', profile: 'frontend', location: 'Georgia' },
  { keyword: 'HTML CSS Developer', profile: 'frontend', location: 'Georgia' },
  { keyword: 'Web Developer', profile: 'frontend', location: 'Georgia' },

  // Design Queries
  { keyword: 'UI Designer', profile: 'design', location: 'Georgia' },
  { keyword: 'UX Designer', profile: 'design', location: 'Georgia' },
  { keyword: 'UI UX Designer', profile: 'design', location: 'Georgia' },
  { keyword: 'UX UI Designer', profile: 'design', location: 'Georgia' },
  { keyword: 'Product Designer', profile: 'design', location: 'Georgia' },
  { keyword: 'Digital Product Designer', profile: 'design', location: 'Georgia' },
  { keyword: 'UX Product Designer', profile: 'design', location: 'Georgia' },
];
