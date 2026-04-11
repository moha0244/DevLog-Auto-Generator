import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Loader2, X, AlertCircle, GitBranch } from 'lucide-angular';
import { LoadingService, LoadingState } from '../../services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loading-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './loading-modal.component.html',
  styleUrls: ['./loading-modal.component.scss']
})
export class LoadingModalComponent implements OnInit, OnDestroy {
  loadingState: LoadingState = {
    isVisible: false,
    isLoading: false,
    error: null,
    repoName: '',
    title: '',
    subtitle: ''
  };

  private subscription: Subscription | null = null;

  readonly Loader2Icon = Loader2;
  readonly XIcon = X;
  readonly AlertCircleIcon = AlertCircle;
  readonly GitBranchIcon = GitBranch;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    // S'abonner aux changements d'état de chargement
    this.subscription = this.loadingService.loadingState.subscribe(state => {
      this.loadingState = state;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closeModal(): void {
    this.loadingService.hideLoading();
  }

  get is404Error(): boolean {
    if (!this.loadingState.error) return false;
    const errorLower = this.loadingState.error.toLowerCase();
    return errorLower.includes('404') || 
           errorLower.includes('not found') ||
           (errorLower.includes('repository') && errorLower.includes('not found'));
  }

  get isLoadingState(): boolean {
    return this.loadingState.isLoading && !this.loadingState.error;
  }

  get isErrorState(): boolean {
    return !!this.loadingState.error;
  }
}
