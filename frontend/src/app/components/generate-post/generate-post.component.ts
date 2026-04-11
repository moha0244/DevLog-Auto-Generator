import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, Sparkles } from 'lucide-angular';

import { CommunicationService } from '../../services/communication.service';
import { Commit, PostGenerationRequest } from '../../models/github-api.model';

@Component({
  selector: 'app-generate-post',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './generate-post.component.html',
  styleUrls: ['./generate-post.component.scss'],
})
export class GeneratePostComponent implements OnInit, OnDestroy {
  tone = 'Professional';
  platform = 'LinkedIn';
  selectedCommits: Commit[] = [];
  githubInfo: { username: string; repo: string; range: string; author: string } | null = null;
  readonly SparklesIcon = Sparkles;

  private destroy$ = new Subject<void>();

  constructor(private communicationService: CommunicationService) {}

  ngOnInit(): void {
    this.communicationService.events$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (!event) return;

      if (event.type === 'commits_loaded' && event.data?.commits) {
        this.selectedCommits = event.data.commits.filter((c: Commit) => c.selected);
        // Récupérer les infos du GitHub Form depuis les données de l'événement
        if (event.data.githubInfo) {
          this.githubInfo = event.data.githubInfo;
        }
      }

      if (event.type === 'selected_commits_changed' && event.data) {
        this.selectedCommits = event.data;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedCount(): number {
    return this.selectedCommits.length;
  }

  get effectiveCommitCount(): number {
    return this.selectedCommits.length;
  }

  async onGenerate(): Promise<void> {
    if (!this.selectedCount) return;

    console.log('Generate post with:', {
      tone: this.tone,
      platform: this.platform,
      commits: this.selectedCommits,
    });

    // Préparer la requête pour le backend
    const request: PostGenerationRequest = {
      commits: this.selectedCommits,
      tone: this.tone,
      platform: this.platform,
      language: 'French', // Gardé pour compatibilité mais non utilisé dans le prompt
      github_info: this.githubInfo || undefined
    };

    try {
      // Appeler le backend
      const response = await this.communicationService.generatePost(request);
      
      if (response.error) {
        console.error('Erreur lors de la génération:', response.error);
      } else {
        console.log('Post généré avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel au backend:', error);
    }
  }
}
