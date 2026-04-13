import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LoadingState {
  isVisible: boolean;
  isLoading: boolean;
  error: string | null;
  repoName: string;
  title: string;
  subtitle: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingState$ = new BehaviorSubject<LoadingState>({
    isVisible: false,
    isLoading: false,
    error: null,
    repoName: '',
    title: '',
    subtitle: ''
  });
  private abortController: AbortController | null = null;

  // Observable pour que les composants puissent s'abonner
  public loadingState = this.loadingState$.asObservable();

  // Méthodes pour contrôler l'état
  showLoading(repoName: string, title: string = '', subtitle: string = ''): AbortController {
    // Créer un nouvel AbortController pour cette opération
    this.abortController = new AbortController();
    
    this.loadingState$.next({
      isVisible: true,
      isLoading: true,
      error: null,
      repoName,
      title,
      subtitle
    });
    
    return this.abortController;
  }

  hideLoading(): void {
    this.loadingState$.next({
      isVisible: false,
      isLoading: false,
      error: null,
      repoName: '',
      title: '',
      subtitle: ''
    });
    this.abortController = null;
  }

  cancelOperation(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.hideLoading();
  }

  getAbortSignal(): AbortSignal | null {
    return this.abortController?.signal || null;
  }

  showError(error: string, repoName: string = '', title: string = '', subtitle: string = ''): void {
    this.loadingState$.next({
      isVisible: true,
      isLoading: false,
      error,
      repoName,
      title,
      subtitle
    });
  }

  // Getter pour l'état actuel
  get currentState(): LoadingState {
    return this.loadingState$.value;
  }
}
