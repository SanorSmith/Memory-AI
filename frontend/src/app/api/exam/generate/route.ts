import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const EXAM_SYSTEM_PROMPT = `You are a professional AZ-900 exam question generator.
Generate questions in Arabic only.
Return ONLY valid JSON, no other text, no markdown, no explanation.
Use exactly this format:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "category": "مفاهيم السحابة",
      "difficulty": "easy",
      "scenario": null,
      "question": "question text in Arabic",
      "options": ["أ) option1", "ب) option2", "ج) option3", "د) option4"],
      "correct": [0],
      "explanation": "explanation in Arabic",
      "time_limit": 60,
      "points": 10
    }
  ]
}
Question types: multiple_choice, multiple_select, scenario, true_false
For multiple_select: correct has 2-3 indices
For true_false: options are ["صح", "خطأ"], correct is [0] or [1]
For scenario: add scenario text in the scenario field`;

const FALLBACK_QUESTIONS = [
  {
    id: 1, type: "multiple_choice",
    category: "مفاهيم السحابة", difficulty: "easy", scenario: null,
    question: "ما هو التعريف الصحيح للحوسبة السحابية؟",
    options: ["أ) تخزين البيانات محلياً", "ب) تقديم خدمات عبر الإنترنت مع الدفع حسب الاستخدام", "ج) استخدام شبكة LAN", "د) تثبيت برامج على خوادم خاصة"],
    correct: [1], explanation: "الحوسبة السحابية هي تقديم خدمات عبر الإنترنت بنموذج الدفع حسب الاستخدام.",
    time_limit: 60, points: 10
  },
  {
    id: 2, type: "multiple_choice",
    category: "مفاهيم السحابة", difficulty: "medium", scenario: null,
    question: "ما الفرق الرئيسي بين IaaS و PaaS؟",
    options: ["أ) IaaS أرخص دائماً", "ب) في IaaS تتحكم بالـ OS في PaaS لا", "ج) PaaS يدعم .NET فقط", "د) لا فرق"],
    correct: [1], explanation: "IaaS تتحكم بالـ OS، PaaS لا تتحكم به.",
    time_limit: 60, points: 10
  },
  {
    id: 3, type: "true_false",
    category: "بنية Azure", difficulty: "medium", scenario: null,
    question: "Availability Zones توفر حماية من فشل Region كاملة.",
    options: ["صح", "خطأ"], correct: [1],
    explanation: "خطأ. Availability Zones تحمي من فشل مركز بيانات واحد. Region Pairs تحمي من فشل Region.",
    time_limit: 30, points: 10
  },
  {
    id: 4, type: "multiple_select",
    category: "مفاهيم السحابة", difficulty: "medium", scenario: null,
    question: "اختر جميع فوائد السحابة الصحيحة (اختر 3):",
    options: ["أ) التوسع التلقائي", "ب) تكلفة ثابتة", "ج) الدفع حسب الاستخدام", "د) التوفر العالي", "هـ) لا تحتاج إنترنت"],
    correct: [0, 2, 3],
    explanation: "التوسع والدفع حسب الاستخدام والتوفر العالي من أهم فوائد السحابة.",
    time_limit: 90, points: 15
  },
  {
    id: 5, type: "scenario",
    category: "خدمات الحوسبة", difficulty: "hard",
    scenario: "شركة تريد نشر تطبيق Python بدون إدارة خوادم.",
    question: "أي خدمة Azure الأنسب؟",
    options: ["أ) Azure Virtual Machines", "ب) Azure App Service", "ج) Azure Kubernetes Service", "د) Azure Virtual Desktop"],
    correct: [1],
    explanation: "App Service هو PaaS مثالي لتطبيقات الويب بدون إدارة OS.",
    time_limit: 90, points: 15
  }
];

export async function POST(request: NextRequest) {
  try {
    const { num_questions, weak_topics, difficulty } = await request.json();

    if (num_questions < 5) {
      return NextResponse.json({ error: 'Minimum 5 questions' }, { status: 400 });
    }
    if (num_questions > 60) {
      return NextResponse.json({ error: 'Maximum 60 questions' }, { status: 400 });
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const weakStr = weak_topics?.length ? weak_topics.join(', ') : 'all topics';
    const prompt = `Generate an AZ-900 exam with exactly ${num_questions} questions in Arabic.
Focus on weak topics: ${weakStr}
Difficulty: ${difficulty || 'mixed'}
Distribution: 50% multiple_choice, 20% multiple_select, 20% scenario, 10% true_false
Return ONLY valid JSON, nothing else.`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      system: EXAM_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    let text = (response.content[0] as { type: 'text'; text: string }).text.trim();
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    let questions;
    try {
      const parsed = JSON.parse(text);
      questions = parsed.questions || [];
    } catch {
      questions = FALLBACK_QUESTIONS.slice(0, Math.min(num_questions, FALLBACK_QUESTIONS.length));
    }

    return NextResponse.json({
      questions,
      total_questions: questions.length,
      time_limit_minutes: num_questions,
      passing_score: 700,
      message: `Generated ${questions.length} questions`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
