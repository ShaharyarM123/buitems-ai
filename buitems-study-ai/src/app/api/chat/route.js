import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { messages, notesContext } = await req.json();

    const systemPrompt = {
      role: 'system',
      content: `You are an expert academic tutor and notes assistant for university students at BUITEMS.
Your primary task is to take incomplete, half-done, or rough lecture notes provided by the student and complete them in clear, accurate detail.

Guidelines:
1. Preserve original key terms, topics, and structures provided by the user.
2. Fill in logical details, clear definitions, explanations, and bullet points.
3. Stay strictly within subject relevance (no out-of-scope fluff).
4. Format output in clean, readable Markdown with standard headers, bold terms, and structured lists.`,
    };

    let fullMessages = [systemPrompt];

    if (notesContext) {
      fullMessages.push({
        role: 'user',
        content: `Here are my incomplete lecture notes:\n\n${notesContext}\n\nPlease expand these into comprehensive, structured study notes.`,
      });
    }

    if (messages && messages.length > 0) {
      fullMessages = [...fullMessages, ...messages];
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: fullMessages,
      temperature: 0.3,
      max_tokens: 2048,
    });

    const responseContent = completion.choices[0]?.message?.content || 'No response generated.';

    return NextResponse.json({ result: responseContent });
  } catch (error) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ error: 'Failed to process request via Groq API' }, { status: 500 });
  }
}