import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getAllowedHosts, getContext, getTrustProxyHeaders } from '@netlify/angular-runtime/app-engine.js';

const angularAppEngine = new AngularAppEngine({
  allowedHosts: getAllowedHosts(),
  trustProxyHeaders: getTrustProxyHeaders(),
});

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const context = getContext();
  const url = new URL(request.url);

  if (url.pathname === '/api/chat' && request.method === 'POST') {
    try {
      const body = (await request.json()) as { threadId?: string; message?: string } | null;
      const { threadId, message } = body ?? {};

      if (!threadId || !message) {
        return Response.json({ message: 'threadId and message are required.' }, { status: 400 });
      }

      const geminiApiKey = process.env['GEMINI_API_KEY'];
      const geminiModel = process.env['GEMINI_MODEL'] || 'gemini-2.5-flash';

      if (!geminiApiKey) {
        return Response.json(
          {
            message:
              'GEMINI_API_KEY is not set. Configure the Netlify environment variable and redeploy.',
          },
          { status: 500 },
        );
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': geminiApiKey,
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: message }] }],
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return Response.json(
          { message: data?.error?.message ?? 'Gemini request failed.' },
          { status: response.status },
        );
      }

      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return Response.json({ threadId, reply });
    } catch (error) {
      console.error('Gemini request failed:', error);
      return Response.json(
        { message: 'Unable to reach Gemini. Check your network connection and API key.' },
        { status: 502 },
      );
    }
  }

  const result = await angularAppEngine.handle(request, context);
  return result || new Response('Not found', { status: 404 });
}

export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
