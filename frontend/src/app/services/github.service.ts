import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GitHubCommit, GitHubRepo } from '../models/github-api.model';

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private readonly baseUrl = 'https://api.github.com';
  private readonly headers = {
    'Accept': 'application/vnd.github.v3+json'
  };

  constructor(private http: HttpClient) {}

  getCommits(owner: string, repo: string, branch: string = 'main', days: number = 7, token?: string): Observable<GitHubCommit[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceString = since.toISOString();

    let params = new HttpParams()
      .set('sha', branch)
      .set('since', sinceString)
      .set('per_page', '100');

    const headers = token ? { ...this.headers, 'Authorization': `token ${token}` } : this.headers;

    return this.http.get<GitHubCommit[]>(`${this.baseUrl}/repos/${owner}/${repo}/commits`, {
      headers,
      params
    });
  }

  getRepoInfo(owner: string, repo: string, token?: string): Observable<GitHubRepo> {
    const headers = token ? { ...this.headers, 'Authorization': `token ${token}` } : this.headers;

    return this.http.get<GitHubRepo>(`${this.baseUrl}/repos/${owner}/${repo}`, {
      headers
    });
  }

  // Transform GitHub API response to our internal format
  transformCommits(commits: GitHubCommit[]): any[] {
    return commits.map(commit => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url
    }));
  }
}
