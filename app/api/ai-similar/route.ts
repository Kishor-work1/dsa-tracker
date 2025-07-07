import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const link = searchParams.get('link');
  const id = searchParams.get('id');

  const prompt = `
Given the following DSA problem:
Title: ${name}
Link: ${link}
ID: ${id}

Suggest the top 5 similar DSA problems to practice. For each, return:
- title (string)
- link (string, if available)
- tags (array of strings, e.g. ["DP", "String"])
- description (1-line summary)
- difficulty (Easy/Medium/Hard/Unknown)

ONLY return a valid JSON array, no explanation, no markdown, no code block, just the array:
[
  {
    "title": "...",
    "link": "...",
    "tags": ["...", "..."],
    "description": "...",
    "difficulty": "..."
  }
]
`;

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

  let similar: { title: string; link: string; tags?: string[]; description?: string; difficulty?: string }[] = [];
  try {
    const geminiRes = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });
    const geminiData = await geminiRes.json();
    if (geminiData.error) {
      console.error("Gemini API error:", geminiData.error);
      return NextResponse.json({ similar: [], error: geminiData.error }, { status: 500 });
    }
    const text: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      console.log("Gemini FULL response:", JSON.stringify(geminiData, null, 2));
    }
    let jsonText = text;
    // Remove code block markers if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json|```$/g, '').trim();
    }
    const match = jsonText.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        similar = JSON.parse(match[0]);
      } catch (e) {
        similar = [];
      }
    }
  } catch (e) {
    // fallback: return empty
    similar = [];
  }

  return NextResponse.json({ similar });
} 