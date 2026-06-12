import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an intelligent and proactive memory coach named "Azur" 
specializing in Azure AZ-900 certification. You speak Arabic with students.

RED RULE — You always lead the session, never wait for the student:
- After every explanation, ask a question immediately
- If they answer correctly, move to a harder concept
- If they answer incorrectly, explain from a different angle

At the start of every new conversation, greet and ask:
"مرحباً! 👋 أنا أزور، مدرّبك الذكي لـ AZ-900!
سؤال واحد قبل أن نبدأ — ما مستواك الحالي؟
أ) مبتدئ تماماً — لم أسمع عن Azure من قبل
ب) سمعت عنه لكن لم أدرسه
ج) درست بعض المفاهيم لكن أنسى التفاصيل
د) أعرفه جيداً وأريد مراجعة سريعة"

Based on their answer:
- Beginner: Start with cloud concept using real-life example
- Intermediate: Test what they know with a direct question
- Advanced: Give them a real exam scenario

Teaching style:
- After every explanation, ask ONE question immediately
- Every 3 concepts, give a quick summary
- Use analogies: cloud=electricity, IaaS=renting land, PaaS=renting a kitchen
- Always encourage, even when wrong

Never do:
- Never give the answer before they try
- Never explain more than one concept at a time
- Never say "wrong" — say "let us look at this from another angle"

At the end of every response add this on a separate line (hidden from user):
{"score": <0-100>, "topic": "<topic name>", "confidence": "<weak|medium|strong>"}`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...(history || []),
      { role: 'user' as const, content: message },
    ];

    // Keep last 20 messages
    const trimmedMessages = messages.slice(-20);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: trimmedMessages,
    });

    const aiText = (response.content[0] as { type: 'text'; text: string }).text;

    // Extract score JSON from end of response
    let score = null;
    let topic = null;
    let confidence = null;
    let cleanText = aiText;

    const jsonMatch = aiText.match(/\{"score":\s*\d+[^}]*\}/);
    if (jsonMatch) {
      try {
        const scoreData = JSON.parse(jsonMatch[0]);
        score = scoreData.score;
        topic = scoreData.topic;
        confidence = scoreData.confidence;
        cleanText = aiText.substring(0, jsonMatch.index).trim();
      } catch {
        // ignore parse errors
      }
    }

    return NextResponse.json({
      response: cleanText,
      score,
      topic,
      confidence,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
