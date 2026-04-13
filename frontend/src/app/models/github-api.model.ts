export interface LanguageBreakdown {
  name: string;
  count: number;
}

export interface CommitSummary {
  totalCommits: number;
  languageBreakdown: LanguageBreakdown[];
}

export interface Commit {
  id: string;
  sha: string;
  fullSha: string;
  message: string;
  date: string | null;
  displayDate: string;
  author: string;
  url: string;
  filesChanged: number;
  languages: string[];
  selected: boolean;
}

export interface GitHubCommitsResponse {
  summary: CommitSummary;
  commits: Commit[];
  error?: string;
}

export interface GitHubRequest {
  repo_name: string;
  token?: string;
  days?: number;
  author?: string;
}

// Interfaces from DevLog service
export interface DevLogRequest {
  repo_owner: string;
  repo_name: string;
  branch?: string;
  days?: number;
  tone?: 'professional' | 'casual' | 'technical' | 'decontracted';
  format?: 'markdown' | 'html' | 'plain';
}

export interface DevLogResponse {
  content: string;
  commits_count: number;
  generated_at: string;
}

// Interfaces from GitHub service
export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
}

// Enums pour les types d'événements
export enum AppEventType {
  COMMITS_LOADED = 'commits_loaded',
  POST_GENERATED = 'post_generated',
  POST_GENERATION_STARTED = 'post_generation_started',
  ERROR = 'error',
  LOADING = 'loading',
  SELECTED_COMMITS_CHANGED = 'selected_commits_changed',
  PLATFORM_CHANGED = 'platform_changed',
}

// Interface from Communication service
export interface AppEvent {
  type: AppEventType;
  data?: any;
  message?: string;
}

// Interface from GitHub form
export interface FormData {
  username: string;
  repo: string;
  range: string;
  author: string;
  token: string;
}

// Interface pour la génération de post
export interface PostGenerationRequest {
  commits: Commit[];
  tone: string;
  platform: string;
  language: string;
  github_info?: {
    username: string;
    repo: string;
    range: string;
    author: string;
  };
}

export interface PostGenerationResponse {
  generated_content?: string;
  author_headline?: string;
  error?: string;
}
