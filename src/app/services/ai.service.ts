import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatApiRequest, ChatApiResponse } from '../interfaces/chat-api.interface';

/**
 * Handles AI chat HTTP communication.
 *
 * To connect a real provider (OpenAI, Azure, Claude, Gemini, Ollama, etc.),
 * update the endpoint URL and request/response mapping here only.
 * The rest of the app depends on this service's public API.
 */
@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly http = inject(HttpClient);

  /** True while an AI request is in flight. */
  readonly isLoading = signal(false);

  /**
   * Sends a user message to the chat API and returns the assistant reply.
   * Exposes loading state via the `isLoading` signal.
   */
  sendMessage(request: ChatApiRequest): Observable<ChatApiResponse> {
    this.isLoading.set(true);

    return this.http
      .post<ChatApiResponse>(`${environment.apiUrl}/chat`, request)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => this.toFriendlyError(error)),
        ),
        finalize(() => this.isLoading.set(false)),
      );
  }

  /** Maps HTTP failures to user-friendly error messages. */
  private toFriendlyError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to reach the AI server. Check your connection and try again.';
    }

    if (error.status >= 500) {
      return 'The AI server encountered an error. Please try again later.';
    }

    const serverMessage =
      typeof error.error === 'object' && error.error?.['message']
        ? String(error.error['message'])
        : null;

    return serverMessage ?? `Request failed (${error.status}). Please try again.`;
  }
}
