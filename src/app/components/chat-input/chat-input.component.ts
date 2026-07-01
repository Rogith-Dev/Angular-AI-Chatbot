import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AiService } from '../../services/ai.service';

/** Multiline input with Enter-to-send and Shift+Enter for new lines. */
@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss',
})
export class ChatInputComponent {
  private readonly aiService = inject(AiService);

  /** Emits trimmed message text when the user sends. */
  readonly send = output<string>();

  message = '';

  /** Reflects AI loading state to disable input while waiting. */
  readonly isDisabled = this.aiService.isLoading;

  onSend(): void {
    const trimmed = this.message.trim();
    if (!trimmed || this.isDisabled()) {
      return;
    }

    this.send.emit(trimmed);
    this.message = '';
  }

  /** Enter sends; Shift+Enter inserts a newline. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }
}
