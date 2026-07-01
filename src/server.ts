import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import {
  getAllowedHosts,
  getContext,
  getTrustProxyHeaders,
} from '@netlify/angular-runtime/app-engine.js';

const angularAppEngine = new AngularAppEngine({
  allowedHosts: getAllowedHosts(),
  trustProxyHeaders: getTrustProxyHeaders(),
});

/** Mock ChatGPT-compatible endpoint for production SSR builds. */
async function handleMockChat(request: Request): Promise<Response> {
  const { threadId, message } = (await request.json().catch(() => ({}))) as {
    threadId?: string;
    message?: string;
  };

  if (!threadId || !message) {
    return Response.json(
      { message: 'threadId and message are required.' },
      { status: 400 },
    );
  }

  const delay = 800 + Math.random() * 1200;
  await new Promise((resolve) => setTimeout(resolve, delay));

  return Response.json({
    threadId,
    reply: `Thanks for your message! You said: "${message}".\n\nThis is a mock response. To connect a real AI provider, update AiService and environment.apiUrl.`,
  });
}

export async function netlifyAppEngineHandler(
  request: Request,
): Promise<Response> {
  const context = getContext();

  const pathname = new URL(request.url).pathname;
  if (pathname === '/api/chat' && request.method === 'POST') {
    return handleMockChat(request);
  }

  const result = await angularAppEngine.handle(request, context);
  return result || new Response('Not found', { status: 404 });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
