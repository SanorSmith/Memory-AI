import { NextRequest, NextResponse } from 'next/server';

interface Question {
  id: number;
  category: string;
  correct: number[];
  points?: number;
  question: string;
  explanation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { questions, answers, time_taken_seconds } = await request.json();

    let totalPoints = 0;
    let earnedPoints = 0;
    const categoryStats: Record<string, { correct: number; total: number; points: number; earned: number }> = {};
    const wrongQuestions: { id: number; question: string; category: string; explanation: string }[] = [];

    for (const q of questions as Question[]) {
      const qid = String(q.id);
      const points = q.points || 10;
      totalPoints += points;
      const category = q.category || 'عام';

      if (!categoryStats[category]) {
        categoryStats[category] = { correct: 0, total: 0, points: 0, earned: 0 };
      }
      categoryStats[category].total += 1;
      categoryStats[category].points += points;

      const userAnswer = answers[qid] || [];
      const correctAnswer = q.correct || [];
      const isCorrect = JSON.stringify([...userAnswer].sort()) === JSON.stringify([...correctAnswer].sort());

      if (isCorrect) {
        earnedPoints += points;
        categoryStats[category].correct += 1;
        categoryStats[category].earned += points;
      } else {
        wrongQuestions.push({
          id: q.id,
          question: q.question,
          category,
          explanation: q.explanation || '',
        });
      }
    }

    const score1000 = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 1000) : 0;
    const passed = score1000 >= 700;

    const categoryPercentages: Record<string, { percentage: number; correct: number; total: number; color: string; emoji: string }> = {};
    for (const [cat, stats] of Object.entries(categoryStats)) {
      const pct = stats.points > 0 ? Math.round((stats.earned / stats.points) * 100) : 0;
      categoryPercentages[cat] = {
        percentage: pct,
        correct: stats.correct,
        total: stats.total,
        color: pct >= 80 ? 'green' : pct >= 60 ? 'yellow' : pct >= 40 ? 'orange' : 'red',
        emoji: pct >= 80 ? '🟢' : pct >= 60 ? '🟡' : pct >= 40 ? '🟠' : '🔴',
      };
    }

    const weakCategories = Object.entries(categoryPercentages)
      .filter(([, data]) => data.percentage < 70)
      .map(([cat]) => cat);

    let recommendation: string;
    if (score1000 >= 900) {
      recommendation = '🏆 ممتاز! أنت جاهز للامتحان الحقيقي!';
    } else if (score1000 >= 700) {
      recommendation = `✅ ناجح! ركز على: ${weakCategories.slice(0, 2).join(', ')} قبل الامتحان.`;
    } else {
      recommendation = `📚 ادرس أكثر: ${weakCategories.slice(0, 3).join(', ')}. استمر!`;
    }

    const mins = Math.floor(time_taken_seconds / 60);
    const secs = time_taken_seconds % 60;

    return NextResponse.json({
      score_1000: score1000,
      passed,
      earned_points: earnedPoints,
      total_points: totalPoints,
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
      correct_count: questions.length - wrongQuestions.length,
      wrong_count: wrongQuestions.length,
      total_questions: questions.length,
      category_stats: categoryPercentages,
      wrong_questions: wrongQuestions,
      weak_categories: weakCategories,
      tonight_activation: weakCategories.slice(0, 5),
      recommendation,
      time_taken_seconds,
      time_taken_formatted: `${mins} min ${secs} sec`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
