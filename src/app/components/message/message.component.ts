import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ChatMessage } from '../../models/message.model';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

/** Renders a single chat bubble (user or assistant). */
@Component({
  selector: 'app-message',
  standalone: true,
  imports: [DatePipe, MatIconModule, MarkdownPipe],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent {
  readonly message = input.required<ChatMessage>();
}
