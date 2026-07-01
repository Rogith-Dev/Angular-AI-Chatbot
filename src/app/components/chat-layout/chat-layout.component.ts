import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AiService } from '../../services/ai.service';
import { ThreadService } from '../../services/thread.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';

/**
 * Root chat layout orchestrating sidebar, messages, and input.
 * Coordinates ThreadService and AiService for the full send/receive flow.
 */
@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    SidebarComponent,
    ChatWindowComponent,
    ChatInputComponent,
  ],
  templateUrl: './chat-layout.component.html',
  styleUrl: './chat-layout.component.scss',
})
export class ChatLayoutComponent implements OnInit {
  private readonly threadService = inject(ThreadService);
  private readonly aiService = inject(AiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly currentThread = this.threadService.currentThread;

  private readonly chatWindow = viewChild(ChatWindowComponent);
  readonly sidenavOpen = signal(false);

  constructor() {
    // Auto-scroll whenever the current thread's messages change.
    effect(() => {
      const thread = this.currentThread();
      if (thread) {
        queueMicrotask(() => this.chatWindow()?.markForScroll());
      }
    });
  }

  ngOnInit(): void {
    // Ensure at least one thread exists on first load.
    if (this.threadService.threads().length === 0) {
      this.threadService.createThread();
    }
  }

  onSendMessage(content: string): void {
    let thread = this.currentThread();

    if (!thread) {
      thread = this.threadService.createThread();
    }

    const threadId = thread.id;
    this.threadService.addUserMessage(threadId, content);
    this.chatWindow()?.markForScroll();

    this.aiService.sendMessage({ threadId, message: content }).subscribe({
      next: (response) => {
        this.threadService.addAssistantMessage(response.threadId, response.reply);
        this.chatWindow()?.markForScroll();
      },
      error: (message: string) => {
        this.snackBar.open(message, 'Dismiss', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: 'error-snackbar',
        });
      },
    });
  }

  onThreadSelected(): void {
    this.sidenavOpen.set(false);
  }

  toggleSidenav(): void {
    this.sidenavOpen.update((open) => !open);
  }

  closeSidenav(): void {
    this.sidenavOpen.set(false);
  }
}
