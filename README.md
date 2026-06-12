# 🧠 Memory AI - مدرب الذاكرة الذكي

تطبيق ويب ذكي يستخدم الذكاء الاصطناعي لمساعدتك في التحضير لشهادة **Azure AZ-900** باستخدام تقنيات تقوية الذاكرة.

## 🎯 الميزات الرئيسية

- **محادثة ذكية**: تحدث مع مدرب AI يشرح المفاهيم بطريقة تثبت في الذاكرة
- **التكرار المتباعد**: يحدد أفضل وقت لمراجعة كل موضوع
- **خريطة الذاكرة**: تتبع بصري لقوة ذاكرتك في كل موضوع
- **اختبارات فورية**: أسئلة بعد كل شرح لتثبيت المعلومة
- **مراجعة الليل**: مراجعة خفيفة قبل النوم لتفعيل تثبيت الذاكرة

## 🛠️ التقنيات المستخدمة

### الواجهة الأمامية (Frontend)
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- دعم RTL للعربية

### الواجهة الخلفية (Backend)
- Python FastAPI
- SQLAlchemy + SQLite
- Claude API (Anthropic)

## 🚀 التشغيل

### المتطلبات
- Node.js 18+
- Python 3.10+
- مفتاح API من Anthropic

### تشغيل الواجهة الخلفية

```bash
cd backend
pip install -r requirements.txt
# أضف مفتاح API في ملف .env
uvicorn main:app --reload --port 8000
```

### تشغيل الواجهة الأمامية

```bash
cd frontend
npm install
npm run dev
```

التطبيق سيعمل على:
- الواجهة الأمامية: http://localhost:3000
- الواجهة الخلفية: http://localhost:8000

## 📁 هيكل المشروع

```
memory-ai/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # الصفحة الرئيسية
│   │   │   ├── study/page.tsx    # صفحة الدراسة
│   │   │   ├── review/page.tsx   # صفحة المراجعة
│   │   │   ├── layout.tsx        # التخطيط العام
│   │   │   └── globals.css       # الأنماط العامة
│   │   ├── components/
│   │   │   ├── ChatBox.tsx       # واجهة المحادثة
│   │   │   ├── QuizCard.tsx      # بطاقة الاختبار
│   │   │   ├── MemoryMap.tsx     # خريطة الذاكرة
│   │   │   └── ProgressBar.tsx   # شريط التقدم
│   │   └── lib/
│   │       └── api.ts            # دوال الاتصال بالخادم
│   └── package.json
├── backend/
│   ├── main.py                   # تطبيق FastAPI
│   ├── models.py                 # نماذج قاعدة البيانات
│   ├── database.py               # إعداد قاعدة البيانات
│   ├── chat.py                   # تكامل Claude API
│   ├── seed.py                   # بيانات أولية
│   └── requirements.txt
└── README.md
```

## ⚙️ الإعداد

1. انسخ المشروع
2. أنشئ ملف `.env` في مجلد `backend` وأضف:
   ```
   ANTHROPIC_API_KEY=your-api-key-here
   ```
3. شغّل الخادم الخلفي ثم الأمامي

## 📚 المواضيع المغطاة

- مفاهيم السحابة (Cloud Concepts)
- هندسة Azure (Azure Architecture)
- الحوسبة (Compute)
- الشبكات (Networking)
- التخزين (Storage)
- الأمان (Security)
- إدارة التكاليف (Cost Management)
- الحوكمة (Governance)

## 📝 ملاحظات

- تأكد من إضافة مفتاح Anthropic API قبل استخدام ميزة المحادثة
- قاعدة البيانات تُنشأ تلقائياً عند أول تشغيل
- البيانات الأولية تُضاف تلقائياً عند بدء الخادم
