interface Env {
  GEMINI_API_KEY: string;
}

type ConsultRequest = {
  prompt?: string;
  history?: Array<{ role: string; parts: Array<{ text: string }> }>;
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const JSON_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json',
};

const SYSTEM_INSTRUCTION =
  'You are "Jaira\'s Digital Consultant", a premium virtual stylist for "Braids By Jaira". Your tone is warm, sophisticated, professional, and boutique-inspired. You recommend elegant braid styles (Knotless, Goddess Locs, Stitch, Fulani) based on client needs. Focus on hair health, luxury maintenance, and timeless beauty. Keep responses concise, encouraging, and high-end.';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/api/consult') {
      return handleConsult(request, env);
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: JSON_HEADERS,
    });
  },
};

async function handleConsult(request: Request, env: Env): Promise<Response> {
  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Server is missing GEMINI_API_KEY secret.' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  let payload: ConsultRequest;
  try {
    payload = (await request.json()) as ConsultRequest;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const prompt = payload.prompt?.trim();
  const history = Array.isArray(payload.history) ? payload.history : [];

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt is required.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  try {
    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
          },
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      return new Response(JSON.stringify({ error: 'Gemini upstream error', details: errorBody }), {
        status: 502,
        headers: JSON_HEADERS,
      });
    }

    const geminiJson = (await geminiResponse.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: JSON_HEADERS,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Consult request failed.',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: JSON_HEADERS,
      },
    );
  }
}
