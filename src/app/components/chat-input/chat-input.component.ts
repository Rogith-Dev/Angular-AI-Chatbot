import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  output,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AiService } from '../../services/ai.service';

/** Multiline input with Enter-to-send, auto-resize, and Shift+Enter for new lines. */
@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss',
})
export class ChatInputComponent implements AfterViewInit {
  private readonly aiService = inject(AiService);
  private readonly platformId = inject(PLATFORM_ID);

  /** Emits trimmed message text when the user sends. */
  readonly send = output<string>();

  message = '';

  /** Reflects AI loading state to disable input while waiting. */
  readonly isDisabled = this.aiService.isLoading;

  private readonly textarea = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');

  ngAfterViewInit(): void {
    this.resizeTextarea();
  }

  onSend(): void {
    const trimmed = this.message.trim();
    if (!trimmed || this.isDisabled()) {
      return;
    }

    this.send.emit(trimmed);
    this.message = '';
    queueMicrotask(() => this.resizeTextarea());
  }

  /** Enter sends; Shift+Enter inserts a newline. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  /** Auto-grow textarea up to --input-max-height. */
  resizeTextarea(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const el = this.textarea()?.nativeElement;
    if (!el) {
      return;
    }

    el.style.height = 'auto';
    const maxHeight =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--input-max-height')) ||
      192;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }

  /** Prefill input from empty-state hint chips. */
  setMessage(text: string): void {
    this.message = text;
    queueMicrotask(() => this.resizeTextarea());
  }
}
