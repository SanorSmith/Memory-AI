'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ExamResult } from '@/lib/api'

type Tab = 'overview' | 'categories' | 'wrong' | 'tonight'

export default function ResultsPage() {
  const [result, setResult] = useState<ExamResult | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  useEffect(() => {
    const stored = localStorage.getItem('examResult')
    if (stored) {
      setResult(JSON.parse(stored))
    }
  }, [])

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]" dir="rtl">
        <p className="text-slate-400 text-lg mb-4">لا توجد نتائج</p>
        <Link href="/exam" className="px-6 py-3 bg-[#f5c842] text-[#05080f] font-bold rounded-xl">
          📝 ابدأ امتحان
        </Link>
      </div>
    )
  }

  const scoreEmoji = result.score_1000 >= 700 ? '🏆' : result.score_1000 >= 600 ? '📈' : '📚'
  const scoreColor = result.passed ? 'text-green-400' : result.score_1000 >= 600 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
      {/* Score Card */}
      <div className="bg-[#111b2e] border border-slate-700 rounded-2xl p-8 text-center">
        <span className="text-6xl block mb-4">{scoreEmoji}</span>
        <p className={`text-5xl font-bold ${scoreColor}`}>{result.score_1000}</p>
        <p className="text-slate-400 mt-2">من 1000 — درجة النجاح: 700</p>
        <div className={`inline-block mt-4 px-4 py-2 rounded-full font-bold text-sm ${
          result.passed ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
        }`}>
          {result.passed ? '✅ ناجح' : '❌ لم ينجح'}
        </div>
        <p className="text-slate-300 mt-4 text-sm">{result.recommendation}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#111b2e] border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-green-400 text-2xl font-bold">{result.correct_count}</p>
          <p className="text-slate-400 text-xs">صحيح</p>
        </div>
        <div className="bg-[#111b2e] border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-red-400 text-2xl font-bold">{result.wrong_count}</p>
          <p className="text-slate-400 text-xs">خطأ</p>
        </div>
        <div className="bg-[#111b2e] border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-[#f5c842] text-2xl font-bold">{result.percentage}%</p>
          <p className="text-slate-400 text-xs">النسبة</p>
        </div>
        <div className="bg-[#111b2e] border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-blue-400 text-2xl font-bold">{result.time_taken_formatted}</p>
          <p className="text-slate-400 text-xs">الوقت</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {([
          { key: 'overview', label: '📊 نظرة عامة' },
          { key: 'categories', label: '📂 التصنيفات' },
          { key: 'wrong', label: '❌ الأخطاء' },
          { key: 'tonight', label: '🌙 مراجعة الليلة' },
        ] as { key: Tab; label: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#111b2e] text-[#f5c842] border border-slate-700 border-b-0'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[#111b2e] border border-slate-700 rounded-2xl p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {Object.entries(result.category_stats).map(([cat, stats]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{stats.emoji} {cat}</span>
                  <span className="text-slate-400">{stats.correct}/{stats.total} ({stats.percentage}%)</span>
                </div>
                <div className="bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      stats.percentage >= 80 ? 'bg-green-500' :
                      stats.percentage >= 60 ? 'bg-yellow-500' :
                      stats.percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(result.category_stats).map(([cat, stats]) => (
              <div key={cat} className="bg-slate-800 rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">{stats.emoji}</p>
                <p className="text-white font-medium text-sm">{cat}</p>
                <p className={`text-lg font-bold mt-1 ${
                  stats.percentage >= 80 ? 'text-green-400' :
                  stats.percentage >= 60 ? 'text-yellow-400' :
                  stats.percentage >= 40 ? 'text-orange-400' : 'text-red-400'
                }`}>{stats.percentage}%</p>
                <p className="text-slate-400 text-xs">{stats.correct}/{stats.total}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'wrong' && (
          <div className="space-y-4">
            {result.wrong_questions.length === 0 ? (
              <p className="text-center text-green-400 text-lg py-8">🎉 لا أخطاء!</p>
            ) : (
              result.wrong_questions.map((wq, idx) => (
                <div key={idx} className="border border-slate-600 rounded-xl p-4">
                  <p className="text-white text-sm font-medium mb-2">{wq.id}. {wq.question}</p>
                  <span className="text-xs px-2 py-1 bg-blue-900 text-blue-300 rounded-full">{wq.category}</span>
                  <div className="border-r-4 border-teal-500 bg-teal-900/20 rounded-lg p-3 mt-3">
                    <p className="text-teal-300 text-xs">{wq.explanation}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tonight' && (
          <div className="space-y-4">
            {result.tonight_activation.length === 0 ? (
              <p className="text-center text-green-400 text-lg py-8">🎉 أداء ممتاز — لا حاجة لمراجعة إضافية!</p>
            ) : (
              <>
                <div className="bg-purple-900/30 border border-purple-700 rounded-xl p-4 mb-4">
                  <p className="text-purple-300 text-sm font-medium">🌙 تقنية TMR — تفعيل الذاكرة أثناء النوم</p>
                  <p className="text-slate-400 text-xs mt-1">راجع هذه المواضيع قبل النوم مباشرة لتثبيتها في الذاكرة طويلة المدى</p>
                </div>
                {result.tonight_activation.map((topic, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-800 rounded-xl p-3">
                    <span className="text-[#f5c842] font-bold">{idx + 1}</span>
                    <span className="text-white text-sm">{topic}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Link
          href="/exam"
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-[#05080f] font-bold rounded-xl"
        >
          📝 امتحان جديد
        </Link>
        <Link
          href="/study"
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl"
        >
          📚 الدراسة
        </Link>
        <Link
          href="/"
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl"
        >
          🗺️ خريطة الذاكرة
        </Link>
      </div>
    </div>
  )
}
