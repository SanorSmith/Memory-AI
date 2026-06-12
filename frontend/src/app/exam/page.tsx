'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateExam, submitExam, ExamQuestion } from '@/lib/api'

type ExamState = 'setup' | 'loading' | 'active'

export default function ExamPage() {
  const router = useRouter()
  const [state, setState] = useState<ExamState>('setup')
  const [numQuestions, setNumQuestions] = useState(10)
  const [difficulty, setDifficulty] = useState('mixed')
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [startTime, setStartTime] = useState(0)

  // Timer
  useEffect(() => {
    if (state !== 'active' || timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [state, timeLeft])

  const handleStartExam = async () => {
    setState('loading')
    try {
      const data = await generateExam(numQuestions, [], difficulty)
      setQuestions(data.questions)
      setTimeLeft(data.time_limit_minutes * 60)
      setStartTime(Date.now())
      setAnswers({})
      setFlagged(new Set())
      setCurrentIndex(0)
      setState('active')
    } catch {
      alert('فشل في توليد الأسئلة. حاول مرة أخرى.')
      setState('setup')
    }
  }

  const handleSubmit = useCallback(async () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    try {
      const result = await submitExam(questions, answers, timeTaken)
      localStorage.setItem('examResult', JSON.stringify(result))
      router.push('/results')
    } catch {
      alert('فشل في إرسال النتائج')
    }
  }, [questions, answers, startTime, router])

  const handleOptionClick = (optionIndex: number) => {
    const qid = String(questions[currentIndex].id)
    const qType = questions[currentIndex].type

    if (qType === 'multiple_select') {
      const current = answers[qid] || []
      const updated = current.includes(optionIndex)
        ? current.filter(i => i !== optionIndex)
        : [...current, optionIndex]
      setAnswers({ ...answers, [qid]: updated })
    } else {
      setAnswers({ ...answers, [qid]: [optionIndex] })
      // Auto-advance after 400ms for single choice
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1)
        }
      }, 400)
    }
  }

  const toggleFlag = () => {
    const newFlagged = new Set(flagged)
    if (newFlagged.has(currentIndex)) {
      newFlagged.delete(currentIndex)
    } else {
      newFlagged.add(currentIndex)
    }
    setFlagged(newFlagged)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const answeredCount = Object.keys(answers).length

  // SETUP STATE
  if (state === 'setup') {
    return (
      <div className="max-w-2xl mx-auto" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">📝 Practice Exam — AZ-900</h1>
          <Link href="/study" className="text-blue-400 hover:text-blue-300 text-sm">
            ← العودة للدراسة
          </Link>
        </div>

        <div className="bg-[#111b2e] border border-slate-700 rounded-2xl p-6 space-y-6">
          {/* Number of questions */}
          <div>
            <label className="block text-slate-300 mb-3 font-medium">عدد الأسئلة</label>
            <div className="flex gap-3">
              {[10, 20, 30, 40].map(n => (
                <button
                  key={n}
                  onClick={() => setNumQuestions(n)}
                  className={`px-5 py-2 rounded-xl font-bold transition-all ${
                    numQuestions === n
                      ? 'bg-[#f5c842] text-[#05080f]'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-slate-300 mb-3 font-medium">مستوى الصعوبة</label>
            <div className="flex gap-3">
              {[
                { value: 'easy', label: 'سهل' },
                { value: 'mixed', label: 'مختلط' },
                { value: 'hard', label: 'صعب' },
              ].map(d => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`px-5 py-2 rounded-xl font-bold transition-all ${
                    difficulty === d.value
                      ? 'bg-[#f5c842] text-[#05080f]'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <p className="text-[#f5c842] font-bold">700/1000</p>
              <p className="text-slate-400 text-xs">درجة النجاح</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <p className="text-[#f5c842] font-bold">{numQuestions} دقيقة</p>
              <p className="text-slate-400 text-xs">المدة</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <p className="text-[#f5c842] font-bold">4 أنواع</p>
              <p className="text-slate-400 text-xs">أسئلة متنوعة</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <p className="text-[#f5c842] font-bold">AI</p>
              <p className="text-slate-400 text-xs">أسئلة مخصصة</p>
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleStartExam}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-[#05080f] font-bold text-lg rounded-xl transition-all"
          >
            🚀 ابدأ الامتحان
          </button>
        </div>
      </div>
    )
  }

  // LOADING STATE
  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-[#f5c842] border-t-transparent rounded-full mb-6"></div>
        <p className="text-white text-lg">جاري توليد أسئلة مخصصة لك...</p>
        <div className="flex gap-1 mt-3">
          <span className="w-2 h-2 bg-[#f5c842] rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-[#f5c842] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-2 h-2 bg-[#f5c842] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>
    )
  }

  // ACTIVE STATE
  const currentQ = questions[currentIndex]
  if (!currentQ) return null

  const isMultiSelect = currentQ.type === 'multiple_select'
  const currentAnswer = answers[String(currentQ.id)] || []

  return (
    <div className="flex gap-4 min-h-[80vh]" dir="rtl">
      {/* Left Sidebar */}
      <div className="w-[160px] flex-shrink-0 space-y-3">
        <div className="bg-[#111b2e] border border-slate-700 rounded-xl p-3">
          <div className="grid grid-cols-5 gap-1">
            {questions.map((_, idx) => {
              const qid = String(questions[idx].id)
              let bg = 'bg-slate-700'
              if (idx === currentIndex) bg = 'bg-[#f5c842] text-[#05080f]'
              else if (answers[qid]) bg = 'bg-green-600'
              else if (flagged.has(idx)) bg = 'bg-orange-500'
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded text-xs font-bold ${bg} transition-colors`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-[#111b2e] border border-slate-700 rounded-xl p-3 text-xs space-y-1">
          <p className="text-green-400">✓ {answeredCount} مجاب</p>
          <p className="text-orange-400">⚑ {flagged.size} معلّم</p>
          <p className="text-slate-400">○ {questions.length - answeredCount} متبقي</p>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors"
        >
          📤 تسليم
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between bg-[#111b2e] border border-slate-700 rounded-xl px-4 py-3">
          <div className={`font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-700 rounded-full h-2 w-40">
              <div
                className="bg-[#f5c842] h-2 rounded-full transition-all"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-slate-300 text-sm">{answeredCount}/{questions.length}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-[#111b2e] border border-slate-700 rounded-2xl p-6">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">{currentQ.category}</span>
            <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-xs">{currentQ.difficulty}</span>
            <span className="px-3 py-1 bg-slate-700 text-[#f5c842] rounded-full text-xs">{currentQ.points} نقطة</span>
            <button
              onClick={toggleFlag}
              className={`mr-auto px-3 py-1 rounded-full text-xs transition-colors ${
                flagged.has(currentIndex) ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              ⚑ علّم
            </button>
          </div>

          {/* Scenario */}
          {currentQ.scenario && (
            <div className="border-r-4 border-teal-500 bg-teal-900/20 rounded-lg p-4 mb-4">
              <p className="text-teal-300 text-sm font-medium">📋 السيناريو:</p>
              <p className="text-slate-200 text-sm mt-1">{currentQ.scenario}</p>
            </div>
          )}

          {/* Question */}
          <h2 className="text-white text-lg font-bold mb-4 leading-relaxed">
            {currentIndex + 1}. {currentQ.question}
          </h2>

          {/* Multi-select warning */}
          {isMultiSelect && (
            <p className="text-orange-400 text-sm mb-3">⚠️ اختر جميع الإجابات الصحيحة</p>
          )}

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = currentAnswer.includes(idx)
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  className={`w-full text-right p-4 rounded-xl border transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-[#f5c842] bg-[#f5c842]/10 text-white'
                      : 'border-slate-600 bg-slate-800 text-slate-200 hover:border-slate-400'
                  }`}
                >
                  <span className={`w-5 h-5 flex-shrink-0 border-2 ${
                    isMultiSelect ? 'rounded' : 'rounded-full'
                  } ${isSelected ? 'border-[#f5c842] bg-[#f5c842]' : 'border-slate-500'}`}>
                    {isSelected && (
                      <span className="flex items-center justify-center text-[#05080f] text-xs font-bold h-full">✓</span>
                    )}
                  </span>
                  <span className="text-sm">{option}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            ← السابق
          </button>
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors"
            >
              ✅ تسليم الامتحان
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
            >
              التالي →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
