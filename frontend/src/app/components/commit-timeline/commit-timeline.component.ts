import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, GitCommit, ChevronRight } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { CommunicationService } from '../../services/communication.service';
import { Commit, CommitSummary, GitHubCommitsResponse, AppEventType } from '../../models/github-api.model';

@Component({
  selector: 'app-commit-timeline',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './commit-timeline.component.html',
  styleUrls: ['./commit-timeline.component.scss'],
})
export class CommitTimelineComponent implements OnInit, OnDestroy {
  commits: Commit[] = [];
  summary: CommitSummary = {
    totalCommits: 0,
    languageBreakdown: [],
  };

  readonly GitCommitIcon = GitCommit;
  readonly ChevronRightIcon = ChevronRight;

  private destroy$ = new Subject<void>();

  constructor(
    private communicationService: CommunicationService,
    private cdr: ChangeDetectorRef
  ) {
  
  }

  ngOnInit(): void {
    this.communicationService.events$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (!event) return;

      if (event.type === AppEventType.COMMITS_LOADED && event.data) {
        const payload = event.data as GitHubCommitsResponse;
        this.commits = payload.commits ?? [];
        this.summary = payload.summary ?? {
          totalCommits: 0,
          languageBreakdown: [],
        };
        this.cdr.detectChanges();
      }

      if (event.type === AppEventType.ERROR) {
       
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByCommit(_: number, commit: Commit): string {
    return commit.id || commit.sha;
  }

  get selectedCount(): number {
    return this.commits.filter((commit) => commit.selected).length;
  }

  toggleCommit(commit: Commit): void {
    commit.selected = !commit.selected;
    this.emitSelectedCommitsChange();
    this.cdr.detectChanges();
  }

  selectAll(): void {
    this.commits = this.commits.map((commit) => ({
      ...commit,
      selected: true,
    }));
    this.emitSelectedCommitsChange();
    this.cdr.detectChanges();
  }

  selectNone(): void {
    this.commits = this.commits.map((commit) => ({
      ...commit,
      selected: false,
    }));
    this.emitSelectedCommitsChange();
    this.cdr.detectChanges();
  }

  private emitSelectedCommitsChange(): void {
    const selectedCommits = this.commits.filter((commit) => commit.selected);
    this.communicationService.emitEvent({
      type: AppEventType.SELECTED_COMMITS_CHANGED,
      data: selectedCommits
    });
  }

  getFilesChangedLabel(count: number): string {
    return count > 1 ? `${count} fichiers modifiés` : `${count} fichier modifié`;
  }

  getDisplayDate(commit: Commit): string {
    return commit.displayDate || commit.date || '';
  }
}
