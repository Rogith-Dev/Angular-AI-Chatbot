import { DatePipe } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../services/theme.service';
import { ThreadService } from '../../services/thread.service';

/** Left sidebar listing conversation threads. */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatListModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly threadService = inject(ThreadService);
  readonly themeService = inject(ThemeService);

  readonly threads = this.threadService.threads;
  readonly currentThreadId = this.threadService.currentThreadId;

  /** Emits when a thread is selected (used to close mobile drawer). */
  readonly threadSelected = output<void>();

  onNewChat(): void {
    this.threadService.createThread();
  }

  onSelectThread(threadId: string): void {
    this.threadService.selectThread(threadId);
    this.threadSelected.emit();
  }

  onDeleteThread(event: MouseEvent, threadId: string): void {
    event.stopPropagation();
    this.threadService.deleteThread(threadId);
  }
}
