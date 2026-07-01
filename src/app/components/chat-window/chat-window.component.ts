import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AiService } from '../../services/ai.service';
import { Thread } from '../../models/thread.model';
import { MessageComponent } from '../message/message.component';

/** Scrollable message list with auto-scroll and loading indicator. */
@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [MessageComponent, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
})
export class ChatWindowComponent implements AfterViewChecked {
  private readonly aiService = inject(AiService);

  readonly thread = input<Thread | null>(null);
  readonly isLoading = this.aiService.isLoading;

  private readonly messagesContainer = viewChild<ElementRef<HTMLElement>>('messagesContainer');
  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  /** Called by parent when messages change to trigger scroll. */
  markForScroll(): void {
    this.shouldScroll = true;
  }

  private scrollToBottom(): void {
    const el = this.messagesContainer()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
