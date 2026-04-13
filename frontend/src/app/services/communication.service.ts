import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import {
  GitHubCommitsResponse,
  AppEvent,
  AppEventType,
  PostGenerationRequest,
  PostGenerationResponse,
} from '../models/github-api.model';
import { LoadingService } from './loading.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  private eventSubject = new BehaviorSubject<AppEvent | null>(null);
  private readonly baseUrl = environment.apiUrl;
  private cancelSubject = new Subject<void>();

  // Observable pour que les composants puissent s'abonner
  public events$: Observable<AppEvent | null> = this.eventSubject.asObservable();

  constructor(private http: HttpClient, private loadingService: LoadingService) {}

  // Émettre un événement
  emitEvent(event: AppEvent): void {
    this.eventSubject.next(event);
  }

  // Méthodes spécifiques pour faciliter l'utilisation
  emitCommitsLoaded(
    payload: GitHubCommitsResponse,
    githubInfo?: { username: string; repo: string; range: string; author: string },
  ): void {
    this.emitEvent({
      type: AppEventType.COMMITS_LOADED,
      data: {
        ...payload,
        githubInfo: githubInfo,
      },
    });
  }

  emitPostGenerated(content: string, authorHeadline?: string): void {
    this.emitEvent({
      type: AppEventType.POST_GENERATED,
      data: { content, authorHeadline },
    });
  }

  emitPostGenerationStarted(): void {
    this.emitEvent({
      type: AppEventType.POST_GENERATION_STARTED,
      data: {},
    });
  }

  emitError(message: string): void {
    this.emitEvent({
      type: AppEventType.ERROR,
      message,
    });
  }

  emitLoading(isLoading: boolean): void {
    this.emitEvent({
      type: AppEventType.LOADING,
      data: { isLoading },
    });
  }

  // Méthode pour communiquer avec le backend et récupérer les commits GitHub
  async fetchGitHubCommits(
    repoName: string,
    token?: string,
    days: number = 7,
    author?: string,
    githubInfo?: { username: string; repo: string; range: string; author: string },
  ): Promise<GitHubCommitsResponse> {
    try {
      this.emitLoading(true);

      const request = {
        repo_name: repoName,
        token: token || undefined,
        days: days,
        author: author || undefined,
      };

      const response = await this.http
        .post<GitHubCommitsResponse>(`${this.baseUrl}/github/commits`, request)
        .pipe(takeUntil(this.cancelSubject))
        .toPromise();

      if (response?.error) {
        this.emitError(response.error);
      } else {
        this.emitCommitsLoaded(
          response || { summary: { totalCommits: 0, languageBreakdown: [] }, commits: [] },
          githubInfo,
        );
      }

      return response || { summary: { totalCommits: 0, languageBreakdown: [] }, commits: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.emitError(errorMessage);

      const errorResponse: GitHubCommitsResponse = {
        summary: {
          totalCommits: 0,
          languageBreakdown: [],
        },
        commits: [],
        error: errorMessage,
      };

      return errorResponse;
    } finally {
      this.emitLoading(false);
    }
  }

  // Méthode pour générer un post LinkedIn à partir des commits sélectionnés
  async generatePost(request: PostGenerationRequest): Promise<PostGenerationResponse> {
    try {
      this.emitLoading(true);
      this.emitPostGenerationStarted();

      const response = await this.http
        .post<PostGenerationResponse>(`${this.baseUrl}/api/generate`, request)
        .pipe(takeUntil(this.cancelSubject))
        .toPromise();

      if (response?.error) {
        this.emitError(response.error);
      } else if (response?.generated_content) {
        this.emitPostGenerated(response.generated_content, response.author_headline);
      }

      return response || { error: 'Aucune réponse du serveur' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.emitError(errorMessage);

      const errorResponse: PostGenerationResponse = {
        error: errorMessage,
      };

      return errorResponse;
    } finally {
      this.emitLoading(false);
    }
  }

  cancelOperations(): void {
    this.cancelSubject.next();
    this.cancelSubject = new Subject<void>();
  }
}
