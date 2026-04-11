import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommunicationService } from '../services/communication.service';
import { LoadingService } from '../services/loading.service';
import { Commit, GitHubCommitsResponse, AppEventType } from '../models/github-api.model';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Github, GitCommit, Linkedin, FileText } from 'lucide-angular';
import { GithubFormComponent } from '../components/github-form/github-form.component';
import { CommitTimelineComponent } from '../components/commit-timeline/commit-timeline.component';
import { SocialPreviewComponent } from '../components/social-preview/social-preview.component';
import { GeneratePostComponent } from '../components/generate-post/generate-post.component';
import { LoadingModalComponent } from '../components/loading-modal/loading-modal.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    GithubFormComponent,
    CommitTimelineComponent,
    SocialPreviewComponent,
    GeneratePostComponent,
    LoadingModalComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  commitsResponse: GitHubCommitsResponse | null = null;
  commits: Commit[] = [];
  generatedContent: string | null = null;
  selectedPlatform: string = 'LinkedIn';
  githubInfo: { username: string; repo: string; range: string; author?: string } | null = null;
  isGeneratingPost: boolean = false;
  GithubIcon = Github;
  LinkedinIcon = Linkedin;

  private destroy$ = new Subject<void>();

  constructor(
    private communicationService: CommunicationService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.communicationService.events$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (!event) return;

      if (event.type === AppEventType.COMMITS_LOADED && event.data) {
        this.commitsResponse = event.data as GitHubCommitsResponse;
        this.commits = this.commitsResponse.commits ?? [];
        // Récupérer les infos du GitHub Form
        if (event.data.githubInfo) {
          this.githubInfo = event.data.githubInfo;
        }
        // Fermer le modal après succès
        this.loadingService.hideLoading();
        
        this.cdr.detectChanges();
      }

      if (event.type === AppEventType.POST_GENERATION_STARTED) {
        this.isGeneratingPost = true;
        this.loadingService.showLoading(
          '', // repoName
          'Génération du post', // title
          'Analyse et création du contenu en cours...' // subtitle
        );
        this.cdr.detectChanges();
      }

      if (event.type === AppEventType.POST_GENERATED && event.data?.content) {
        console.log('Dashboard: Contenu généré reçu:', event.data.content);
        console.log('Dashboard: Author headline reçu:', event.data.authorHeadline);
        setTimeout(() => {
          this.generatedContent = event.data.content;
          // Mettre à jour le githubInfo avec le headline si disponible
          if (event.data.authorHeadline && this.githubInfo) {
            this.githubInfo.author = event.data.authorHeadline;
          }
          this.isGeneratingPost = false;
          this.loadingService.hideLoading();
          this.cdr.detectChanges();
        }, 0);
      }

      if (event.type === AppEventType.ERROR) {
        this.commitsResponse = null;
        this.loadingService.showError(event.message || 'Une erreur est survenue');
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasCommits(): boolean {
    return !!this.commits?.length;
  }
}
