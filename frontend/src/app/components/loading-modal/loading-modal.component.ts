import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Loader2, X, AlertCircle, GitBranch, Sparkles } from 'lucide-angular';
import { LoadingService, LoadingState } from '../../services/loading.service';
import { CommunicationService } from '../../services/communication.service';
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
  readonly SparklesIcon = Sparkles;

  constructor(private loadingService: LoadingService, private communicationService: CommunicationService) {}

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

  cancelOperation(): void {
    // Annuler les requêtes HTTP en cours
    this.communicationService.cancelOperations();
    // Fermer le modal
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

  get isPostGeneration(): boolean {
    return this.loadingState.title?.toLowerCase().includes('génération') || 
           this.loadingState.title?.toLowerCase().includes('post');
  }

  get getHeaderIcon(): any {
    return this.isPostGeneration ? this.SparklesIcon : this.GitBranchIcon;
  }
}
