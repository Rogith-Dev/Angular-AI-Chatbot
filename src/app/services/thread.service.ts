import { Injectable, computed, signal } from '@angular/core';
import { createMessage } from '../models/message.model';
import { createThread, Thread } from '../models/thread.model';
import { generateTitleFromMessage } from '../shared/utils/title.util';
import { ChatMessage } from '../models/message.model';

/**
 * Manages conversation threads in memory.
 * Designed so persistence (localStorage, API) can be added later without UI changes.
 */
@Injectable({ providedIn: 'root' })
export class ThreadService {
  /** All conversation threads, newest first. */
  private readonly _threads = signal<Thread[]>([]);

  /** ID of the currently active thread. */
  private readonly _currentThreadId = signal<string | null>(null);

  readonly threads = this._threads.asReadonly();
  readonly currentThreadId = this._currentThreadId.asReadonly();

  /** Resolved current thread, or null when none is selected. */
  readonly currentThread = computed(() => {
    const id = this._currentThreadId();
    return this._threads().find((thread) => thread.id === id) ?? null;
  });

  /** Creates a new thread and selects it. */
  createThread(): Thread {
    const thread = createThread(crypto.randomUUID());
    this._threads.update((threads) => [thread, ...threads]);
    this._currentThreadId.set(thread.id);
    return thread;
  }

  /** Removes a thread; selects another if the active one was deleted. */
  deleteThread(threadId: string): void {
    this._threads.update((threads) => threads.filter((t) => t.id !== threadId));

    if (this._currentThreadId() === threadId) {
      const remaining = this._threads();
      this._currentThreadId.set(remaining[0]?.id ?? null);
    }
  }

  /** Sets the active thread by ID. */
  selectThread(threadId: string): void {
    const exists = this._threads().some((t) => t.id === threadId);
    if (exists) {
      this._currentThreadId.set(threadId);
    }
  }

  /** Appends a message and bumps the thread's updatedAt timestamp. */
  addMessage(threadId: string, message: ChatMessage): void {
    this._threads.update((threads) =>
      threads.map((thread) => {
        if (thread.id !== threadId) {
          return thread;
        }

        return {
          ...thread,
          updatedAt: new Date(),
          messages: [...thread.messages, message],
        };
      }),
    );
  }

  /**
   * Sets the thread title from the first user message.
   * Only applies when the thread still has the default title.
   */
  setTitleFromFirstMessage(threadId: string, content: string): void {
    this._threads.update((threads) =>
      threads.map((thread) => {
        if (thread.id !== threadId || thread.title !== 'New Chat') {
          return thread;
        }

        return {
          ...thread,
          title: generateTitleFromMessage(content),
        };
      }),
    );
  }

  /** Convenience helper for adding a user message with auto-title. */
  addUserMessage(threadId: string, content: string): void {
    const thread = this._threads().find((t) => t.id === threadId);
    if (thread && thread.messages.length === 0) {
      this.setTitleFromFirstMessage(threadId, content);
    }

    this.addMessage(threadId, createMessage('user', content));
  }

  /** Convenience helper for adding an assistant reply. */
  addAssistantMessage(threadId: string, content: string): void {
    this.addMessage(threadId, createMessage('assistant', content));
  }
}
