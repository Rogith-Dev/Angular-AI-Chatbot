import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AiService } from '../../services/ai.service';
import { ThemeService } from '../../services/theme.service';
import { Thread } from '../../models/thread.model';
import { MessageComponent } from '../message/message.component';

/** Scrollable message list with auto-scroll and loading indicator. */
@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [MessageComponent, MatIconModule, MatButtonModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
})
export class ChatWindowComponent implements AfterViewChecked {
  private readonly aiService = inject(AiService);
  readonly themeService = inject(ThemeService);

  readonly thread = input<Thread | null>(null);
  readonly isLoading = this.aiService.isLoading;

  /** Emits when user clicks an empty-state hint chip. */
  readonly hintSelected = output<string>();

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

  useHint(text: string): void {
    this.hintSelected.emit(text);
  }

  private scrollToBottom(): void {
    const el = this.messagesContainer()?.nativeElement;
    if (!el) {
      return;
    }

    if (typeof el.scrollTo === 'function') {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }
}
