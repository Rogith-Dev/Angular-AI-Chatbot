import { MessageRole } from '../interfaces/message-role.interface';

/** A single message within a conversation thread. */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

/** Factory helper to create consistently typed messages. */
export function createMessage(role: MessageRole, content: string): ChatMessage {
  return {
    role,
    content,
    timestamp: new Date(),
  };
}
