const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export interface ExamQuestion {
  id: number;
  type: 'multiple_choice' | 'multiple_select' | 'scenario' | 'true_false';
  category: string;
  difficulty: string;
  scenario: string | null;
  question: string;
  options: string[];
  correct: number[];
  explanation: string;
  time_limit: number;
  points: number;
}

export interface ExamResult {
  score_1000: number;
  passed: boolean;
  earned_points: number;
  total_points: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  total_questions: number;
  category_stats: Record<string, {
    percentage: number;
    correct: number;
    total: number;
    color: string;
    emoji: string;
  }>;
  wrong_questions: Array<{
    id: number;
    question: string;
    category: string;
    explanation: string;
  }>;
  weak_categories: string[];
  tonight_activation: string[];
  recommendation: string;
  time_taken_formatted: string;
}

export async function sendMessage(message: string) {
  return apiFetch('/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export async function getMemoryMap() {
  return apiFetch('/memory-map')
}

export async function submitAnswer(topicId: string, answer: string, timeSeconds: number) {
  return apiFetch('/answer', {
    method: 'POST',
    body: JSON.stringify({
      topic_id: parseInt(topicId),
      answer,
      time_seconds: timeSeconds,
    }),
  })
}

export async function getWeakTopics() {
  return apiFetch('/weak-topics')
}

export async function getTonightReview() {
  return apiFetch('/tonight-review')
}

export async function getTopics() {
  return apiFetch('/topics')
}

export async function resetChat() {
  return apiFetch('/chat/reset', { method: 'POST' })
}

export async function generateExam(
  numQuestions: number,
  weakTopics?: string[],
  difficulty?: string
): Promise<{ questions: ExamQuestion[]; total_questions: number; time_limit_minutes: number; passing_score: number }> {
  return apiFetch('/api/exam/generate', {
    method: 'POST',
    body: JSON.stringify({
      num_questions: numQuestions,
      weak_topics: weakTopics || [],
      difficulty: difficulty || 'mixed'
    }),
  })
}

export async function submitExam(
  questions: ExamQuestion[],
  answers: Record<string, number[]>,
  timeTakenSeconds: number
): Promise<ExamResult> {
  return apiFetch('/api/exam/submit', {
    method: 'POST',
    body: JSON.stringify({
      questions,
      answers,
      time_taken_seconds: timeTakenSeconds
    }),
  })
}

export async function resetChatApi(): Promise<{ message: string }> {
  return apiFetch('/api/chat/reset', { method: 'DELETE' })
}
