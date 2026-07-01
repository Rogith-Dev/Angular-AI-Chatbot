import { ChatMessage } from './message.model';

/** In-memory conversation thread stored by ThreadService. */
export interface Thread {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

/** Creates a new empty thread with a default title. */
export function createThread(id: string): Thread {
  const now = new Date();
  return {
    id,
    title: 'New Chat',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}
