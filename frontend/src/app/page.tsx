'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="mb-8">
        <span className="text-7xl mb-4 block">🧠</span>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-l from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Memory AI
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl">
          مدرب الذاكرة الذكي لشهادة Azure AZ-900
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
        <div className="bg-dark-100 border border-slate-700 rounded-2xl p-6 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10">
          <span className="text-4xl mb-4 block">💬</span>
          <h2 className="text-xl font-semibold mb-2">تعلّم مع الذكاء الاصطناعي</h2>
          <p className="text-slate-400 text-sm mb-4">
            تحدث مع المدرب الذكي الذي يشرح لك المفاهيم بطريقة تثبت في الذاكرة
          </p>
          <Link
            href="/study"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            ابدأ الدراسة
          </Link>
        </div>

        <div className="bg-dark-100 border border-slate-700 rounded-2xl p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10">
          <span className="text-4xl mb-4 block">📊</span>
          <h2 className="text-xl font-semibold mb-2">خريطة الذاكرة</h2>
          <p className="text-slate-400 text-sm mb-4">
            تابع قوة ذاكرتك لكل موضوع واعرف ما يحتاج مراجعة
          </p>
          <Link
            href="/review"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            عرض الخريطة
          </Link>
        </div>

        <div className="bg-dark-100 border border-slate-700 rounded-2xl p-6 hover:border-green-500 transition-all hover:shadow-lg hover:shadow-green-500/10">
          <span className="text-4xl mb-4 block">🌙</span>
          <h2 className="text-xl font-semibold mb-2">مراجعة الليل</h2>
          <p className="text-slate-400 text-sm mb-4">
            مراجعة خفيفة قبل النوم لتفعيل تثبيت الذاكرة أثناء النوم
          </p>
          <Link
            href="/review?mode=tonight"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            مراجعة الليلة
          </Link>
        </div>
      </div>

      <div className="mt-16 bg-dark-100 border border-slate-700 rounded-2xl p-8 max-w-3xl w-full">
        <h3 className="text-2xl font-bold mb-4 text-blue-400">كيف يعمل التطبيق؟</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
          <div className="flex items-start gap-3">
            <span className="text-green-400 text-xl">✓</span>
            <p className="text-slate-300">يستخدم تقنية التكرار المتباعد لتقوية الذاكرة</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 text-xl">✓</span>
            <p className="text-slate-300">يحلل نقاط ضعفك ويركز عليها</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 text-xl">✓</span>
            <p className="text-slate-300">يربط المفاهيم الجديدة بمعلومات سابقة</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 text-xl">✓</span>
            <p className="text-slate-300">يولد أسئلة اختبار بعد كل شرح</p>
          </div>
        </div>
      </div>
    </div>
  )
}
