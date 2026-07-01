/**
 * Development API proxy for local testing.
 * The Angular app still calls /api/chat, but the actual Gemini request is handled here
 * on the server so the API key never needs to be exposed in browser code.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || process.env.MOCK_API_PORT || 3001;
const geminiApiKey = process.env['GEMINI_API_KEY'];
const geminiModel = process.env['GEMINI_MODEL'] || 'gemini-2.5-flash';

// app.use(cors());
app.use(cors({
  origin: [
    "https://angular-ai-chatbot.netlify.app",
    "http://localhost:4200"
  ]
}));

app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { threadId, message } = req.body ?? {};

  if (!threadId || !message) {
    res.status(400).json({ message: 'threadId and message are required.' });
    return;
  }

  if (!geminiApiKey) {
    res.status(500).json({
      message: 'GEMINI_API_KEY is not set. Start the server with your key in the environment.',
    });
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      res.status(response.status).json({
        message: data?.error?.message ?? 'Gemini request failed.',
      });
      return;
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    res.json({ threadId, reply });
  } catch (error) {
    console.error('Failed to reach Gemini:', error);
    res.status(502).json({
      message: 'Unable to reach Gemini. Check your network connection and API key.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI API listening on http://localhost:${PORT}`);
});
