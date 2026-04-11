import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Github, User, Calendar, KeyRound } from 'lucide-angular';
import { CommunicationService } from '../../services/communication.service';
import { LoadingService } from '../../services/loading.service';
import { FormData } from '../../models/github-api.model';

@Component({
  selector: 'app-github-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './github-form.component.html',
  styleUrls: ['./github-form.component.scss'],
})
export class GithubFormComponent {
  constructor(
    private communicationService: CommunicationService,
    private loadingService: LoadingService
  ) {}

  form: FormData = {
    username: '',
    repo: '',
    range: 'Last 7 days',
    author: '',
    token: '',
  };

  readonly GithubIcon = Github;
  readonly UserIcon = User;
  readonly CalendarIcon = Calendar;
  readonly KeyIcon = KeyRound;

  async onFetchCommits(): Promise<void> {
    try {
      const repoName = `${this.form.username}/${this.form.repo}`;
      const days = this.getDaysFromRange(this.form.range);

      // Afficher le modal immédiatement
      this.loadingService.showLoading(repoName);

      await this.communicationService.fetchGitHubCommits(
        repoName,
        this.form.token || undefined,
        days,
        this.form.author || undefined,
        {
          username: this.form.username,
          repo: this.form.repo,
          range: this.form.range,
          author: this.form.author,
        },
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des commits:', error);
      this.loadingService.showError('Impossible de récupérer les commits.');
    }
  }

  private getDaysFromRange(range: string): number {
    switch (range) {
      case 'Last 1 day':
        return 1;
      case 'Last 7 days':
        return 7;
      case 'Last 30 days':
        return 30;
      case 'Last 3 months':
        return 90;
      case 'Last 1 year':
        return 365;
      default:
        return 7;
    }
  }

  async pasteFromClipboard(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      this.form.token = text;
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }
}
