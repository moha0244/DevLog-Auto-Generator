import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommunicationService } from '../../services/communication.service';
import { AppEventType } from '../../models/github-api.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  FileText,
  Copy,
  Linkedin,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Check,
  Twitter
} from 'lucide-angular';

@Component({
  selector: 'app-social-preview',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './social-preview.component.html',
  styleUrls: ['./social-preview.component.scss']
})
export class SocialPreviewComponent implements OnChanges, OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() content: string | null = null;
  @Input() platformName: string = 'LinkedIn';
  @Input() platform: string = 'LinkedIn';
  @Input() emptyMessage: string = 'Your generated post will appear here';
  @Input() generatedTime: string = '';
  @Input() isGenerated: boolean = false;
  @Input() githubUsername: string = '';
  @Input() githubRepo: string = '';
  @Input() githubAuthor: string = '';

  readonly FileTextIcon = FileText;
  readonly CopyIcon = Copy;
  readonly LinkedinIcon = Linkedin;
  readonly TwitterIcon = Twitter;
  readonly ThumbsUpIcon = ThumbsUp;
  readonly MessageCircleIcon = MessageCircle;
  readonly Repeat2Icon = Repeat2;
  readonly CheckIcon = Check;

  isEditing = false;
  editedContent = '';
  previewContent = '';
  originalAiContent = '';

  constructor(
    private communicationService: CommunicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.communicationService.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (!event) return;

        if (event.type === AppEventType.POST_GENERATED && event.data?.content) {
          const nextContent = event.data.content;
          this.originalAiContent = nextContent;
          this.previewContent = nextContent;

          if (!this.isEditing) {
            this.editedContent = nextContent;
          }

          this.cdr.detectChanges();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content']) {
      const nextValue = this.content ?? '';
      this.originalAiContent = nextValue;
      this.previewContent = nextValue;

      if (!this.isEditing) {
        this.editedContent = nextValue;
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isXPlatform(): boolean {
    const p = (this.platform || this.platformName || '').toLowerCase();
    return p === 'x' || p === 'twitter';
  }

  getPlatformIcon() {
    return this.isXPlatform() ? this.TwitterIcon : this.LinkedinIcon;
  }

  getPlatformName(): string {
    return this.isXPlatform() ? 'X' : 'LinkedIn';
  }

  getPlatformClass(): string {
    return this.isXPlatform() ? 'x-platform' : 'linkedin-platform';
  }

  toggleEditMode(): void {
    if (this.isEditing) {
      this.isEditing = false;
      this.previewContent = this.originalAiContent;
      this.editedContent = this.originalAiContent;
      return;
    }

    this.editedContent = this.previewContent || this.content || '';
    this.isEditing = true;
  }

  confirmEdit(): void {
    this.previewContent = this.editedContent.trim();
    this.isEditing = false;
  }

  async copyContent(): Promise<void> {
    const textToCopy = this.isEditing
      ? this.editedContent
      : (this.previewContent || this.originalAiContent);

    if (!textToCopy?.trim()) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  }

  formatContent(content: string | null): string {
    if (!content) return '';

    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  getDisplayedContent(): string {
    return this.previewContent || this.content || '';
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  getAuthorName(): string {
    return this.githubUsername?.trim() || 'janedoe';
  }

  getAuthorHandle(): string {
    const base = this.githubUsername?.trim() || this.githubAuthor?.trim() || 'janedoe';
    return base.toLowerCase().replace(/\s+/g, '');
  }

  getAuthorHeadline(): string {
    if (this.githubAuthor?.trim()) {
      return `${this.githubAuthor} · Software Engineer`;
    }

    return 'Software Engineer · Building things';
  }
}