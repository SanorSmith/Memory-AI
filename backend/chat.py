import os
import json
import re
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv(override=True)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are an intelligent and proactive memory coach named "Azur" 
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
{"score": <0-100>, "topic": "<topic name>", "confidence": "<weak|medium|strong>"}"""

EXAM_SYSTEM_PROMPT = """You are a professional AZ-900 exam question generator.
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
For scenario: add scenario text in the scenario field"""

conversation_history = []


def reset_conversation():
    global conversation_history
    conversation_history = []


def chat_with_claude(user_message: str, topic_id: int = None) -> dict:
    global conversation_history
    conversation_history.append({"role": "user", "content": user_message})
    if len(conversation_history) > 20:
        conversation_history = conversation_history[-20:]
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=conversation_history
    )
    ai_text = response.content[0].text
    score = None
    topic = None
    confidence = None
    clean_text = ai_text
    json_match = re.search(r'\{"score":\s*\d+.*?\}', ai_text, re.DOTALL)
    if json_match:
        try:
            score_data = json.loads(json_match.group())
            score = score_data.get("score")
            topic = score_data.get("topic")
            confidence = score_data.get("confidence")
            clean_text = ai_text[:json_match.start()].strip()
        except Exception:
            pass
    conversation_history.append({"role": "assistant", "content": clean_text})
    return {"response": clean_text, "score": score, "topic": topic, "confidence": confidence}


def generate_exam(num_questions: int, weak_topics: list, difficulty: str = "mixed") -> dict:
    weak_str = ", ".join(weak_topics) if weak_topics else "all topics"
    prompt = f"""Generate an AZ-900 exam with exactly {num_questions} questions in Arabic.
Focus on weak topics: {weak_str}
Difficulty: {difficulty}
Distribution: 50% multiple_choice, 20% multiple_select, 20% scenario, 10% true_false
Return ONLY valid JSON, nothing else."""
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4000,
        system=EXAM_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.content[0].text.strip()
    text = re.sub(r'^```json\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    try:
        return json.loads(text.strip())
    except Exception:
        return {"questions": get_fallback_questions(num_questions)}


def get_fallback_questions(num: int) -> list:
    questions = [
        {
            "id": 1, "type": "multiple_choice",
            "category": "مفاهيم السحابة", "difficulty": "easy", "scenario": None,
            "question": "ما هو التعريف الصحيح للحوسبة السحابية؟",
            "options": ["أ) تخزين البيانات محلياً", "ب) تقديم خدمات عبر الإنترنت مع الدفع حسب الاستخدام", "ج) استخدام شبكة LAN", "د) تثبيت برامج على خوادم خاصة"],
            "correct": [1], "explanation": "الحوسبة السحابية هي تقديم خدمات عبر الإنترنت بنموذج الدفع حسب الاستخدام.",
            "time_limit": 60, "points": 10
        },
        {
            "id": 2, "type": "multiple_choice",
            "category": "مفاهيم السحابة", "difficulty": "medium", "scenario": None,
            "question": "ما الفرق الرئيسي بين IaaS و PaaS؟",
            "options": ["أ) IaaS أرخص دائماً", "ب) في IaaS تتحكم بالـ OS في PaaS لا", "ج) PaaS يدعم .NET فقط", "د) لا فرق"],
            "correct": [1], "explanation": "IaaS تتحكم بالـ OS، PaaS لا تتحكم به.",
            "time_limit": 60, "points": 10
        },
        {
            "id": 3, "type": "true_false",
            "category": "بنية Azure", "difficulty": "medium", "scenario": None,
            "question": "Availability Zones توفر حماية من فشل Region كاملة.",
            "options": ["صح", "خطأ"], "correct": [1],
            "explanation": "خطأ. Availability Zones تحمي من فشل مركز بيانات واحد. Region Pairs تحمي من فشل Region.",
            "time_limit": 30, "points": 10
        },
        {
            "id": 4, "type": "multiple_select",
            "category": "مفاهيم السحابة", "difficulty": "medium", "scenario": None,
            "question": "اختر جميع فوائد السحابة الصحيحة (اختر 3):",
            "options": ["أ) التوسع التلقائي", "ب) تكلفة ثابتة", "ج) الدفع حسب الاستخدام", "د) التوفر العالي", "هـ) لا تحتاج إنترنت"],
            "correct": [0, 2, 3],
            "explanation": "التوسع والدفع حسب الاستخدام والتوفر العالي من أهم فوائد السحابة.",
            "time_limit": 90, "points": 15
        },
        {
            "id": 5, "type": "scenario",
            "category": "خدمات الحوسبة", "difficulty": "hard",
            "scenario": "شركة تريد نشر تطبيق Python بدون إدارة خوادم.",
            "question": "أي خدمة Azure الأنسب؟",
            "options": ["أ) Azure Virtual Machines", "ب) Azure App Service", "ج) Azure Kubernetes Service", "د) Azure Virtual Desktop"],
            "correct": [1],
            "explanation": "App Service هو PaaS مثالي لتطبيقات الويب بدون إدارة OS.",
            "time_limit": 90, "points": 15
        }
    ]
    return questions[:min(num, len(questions))]


def analyze_exam_results(questions: list, answers: dict) -> dict:
    total_points = 0
    earned_points = 0
    category_stats = {}
    wrong_questions = []
    for q in questions:
        qid = str(q["id"])
        points = q.get("points", 10)
        total_points += points
        category = q.get("category", "عام")
        if category not in category_stats:
            category_stats[category] = {"correct": 0, "total": 0, "points": 0, "earned": 0}
        category_stats[category]["total"] += 1
        category_stats[category]["points"] += points
        user_answer = answers.get(qid, [])
        correct_answer = q.get("correct", [])
        is_correct = sorted(user_answer) == sorted(correct_answer)
        if is_correct:
            earned_points += points
            category_stats[category]["correct"] += 1
            category_stats[category]["earned"] += points
        else:
            wrong_questions.append({
                "id": q["id"], "question": q["question"],
                "category": category, "explanation": q.get("explanation", "")
            })
    score_1000 = int((earned_points / total_points) * 1000) if total_points > 0 else 0
    passed = score_1000 >= 700
    category_percentages = {}
    for cat, stats in category_stats.items():
        pct = int((stats["earned"] / stats["points"]) * 100) if stats["points"] > 0 else 0
        category_percentages[cat] = {
            "percentage": pct, "correct": stats["correct"], "total": stats["total"],
            "color": "green" if pct >= 80 else "yellow" if pct >= 60 else "orange" if pct >= 40 else "red",
            "emoji": "🟢" if pct >= 80 else "🟡" if pct >= 60 else "🟠" if pct >= 40 else "🔴"
        }
    weak_categories = [cat for cat, data in category_percentages.items() if data["percentage"] < 70]
    if score_1000 >= 900:
        rec = "🏆 ممتاز! أنت جاهز للامتحان الحقيقي!"
    elif score_1000 >= 700:
        rec = f"✅ ناجح! ركز على: {', '.join(weak_categories[:2])} قبل الامتحان."
    else:
        rec = f"📚 ادرس أكثر: {', '.join(weak_categories[:3])}. استمر!"
    return {
        "score_1000": score_1000, "passed": passed,
        "earned_points": earned_points, "total_points": total_points,
        "percentage": int((earned_points / total_points) * 100) if total_points > 0 else 0,
        "correct_count": len(questions) - len(wrong_questions),
        "wrong_count": len(wrong_questions), "total_questions": len(questions),
        "category_stats": category_percentages, "wrong_questions": wrong_questions,
        "weak_categories": weak_categories, "tonight_activation": weak_categories[:5],
        "recommendation": rec
    }


def get_conversation_history():
    return conversation_history
