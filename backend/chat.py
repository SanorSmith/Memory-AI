import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """أنت مدرب ذاكرة ذكي متخصص في شهادة Azure AZ-900. 
مهمتك هي:
1. شرح المفاهيم بطريقة بسيطة وممتعة باللغة العربية
2. ربط المعلومات الجديدة بمعلومات سابقة لتقوية الذاكرة
3. استخدام تقنيات التكرار المتباعد (Spaced Repetition)
4. بعد كل شرح، اطرح سؤال اختبار قصير لتثبيت المعلومة
5. حلل جودة الإجابة وقدم تغذية راجعة بناءة
6. استخدم أمثلة من الحياة اليومية لتبسيط المفاهيم السحابية

تذكر: هدفك هو مساعدة الطالب على تثبيت المعلومات في الذاكرة طويلة المدى، 
وليس فقط حفظها مؤقتاً. استخدم تقنيات مثل القصص والربط والتصور الذهني."""

conversation_history: list = []


def chat_with_claude(message: str) -> str:
    conversation_history.append({
        "role": "user",
        "content": message
    })

    response = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=conversation_history
    )

    assistant_message = response.content[0].text
    conversation_history.append({
        "role": "assistant",
        "content": assistant_message
    })

    return assistant_message


def reset_conversation():
    global conversation_history
    conversation_history = []


def get_conversation_history():
    return conversation_history
