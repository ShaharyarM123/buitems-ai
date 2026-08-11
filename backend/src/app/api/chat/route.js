import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are an academic AI tutor for BUITEMS Study AI.
Directly and accurately answer the student's exact prompt. 

FORMATTING RULES:
- Prefix core definitions with: **Definition:**
- Prefix math or scientific formulas with: **Formula:**
- Leave general explanations as standard text.
- Separate distinct blocks with double newlines (\\n\\n).`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, messages } = body;

    const userQuery = prompt || (messages && messages[messages.length - 1]?.text);

    if (!userQuery) {
      return NextResponse.json({ error: 'Missing query prompt' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userQuery }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 1200,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'No response generated.';

    return NextResponse.json({
      id: Date.now().toString(),
      sender: 'ai',
      text: aiResponse,
    });
  } catch (error) {
    console.error('Groq Execution Error:', error);
    return NextResponse.json(
      { error: error.message || 'Groq API request failed.' },
      { status: 500 }
    );
  }
}