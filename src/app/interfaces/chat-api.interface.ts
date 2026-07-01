/**
 * Contract for the ChatGPT-compatible REST API.
 * Swap the backend URL in environment.ts; the AiService stays unchanged.
 */
export interface ChatApiRequest {
  threadId: string;
  message: string;
}

export interface ChatApiResponse {
  threadId: string;
  reply: string;
}
