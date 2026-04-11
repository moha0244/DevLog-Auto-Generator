import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GitHubRequest, GitHubCommitsResponse } from '../models/github-api.model';

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getCommits(request: GitHubRequest): Observable<GitHubCommitsResponse> {
    return this.http.post<GitHubCommitsResponse>(`${this.baseUrl}/github/commits`, request);
  }

  healthCheck(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.baseUrl}/health`);
  }
}
