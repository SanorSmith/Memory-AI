'use client'

import { useState, useEffect } from 'react'
import { submitAnswer } from '@/lib/api'

interface QuizCardProps {
  topicId: number
  onComplete: () => void
}

export default function QuizCard({ topicId, onComplete }: QuizCardProps) {
  const [answer, setAnswer] = useState('')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{
    score: number
    memory_strength: number
    feedback: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (submitted) return

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [submitted])

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return

    setLoading(true)
    try {
      const data = await submitAnswer(topicId.toString(), answer, timeElapsed)
      setResult(data)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-dark-100 border border-slate-700 rounded-xl p-6">
      {/* Timer */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">⏱️ الوقت</span>
        <span className={`font-mono text-lg ${timeElapsed > 60 ? 'text-red-400' : 'text-blue-400'}`}>
          {formatTime(timeElapsed)}
        </span>
      </div>

      {!submitted ? (
        <>
          <div className="mb-4">
            <p className="text-slate-300 text-sm mb-2">اكتب إجابتك بكلماتك الخاصة:</p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="إجابتك هنا..."
              className="w-full bg-dark-200 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-blue-500 transition-colors"
              rows={4}
              dir="rtl"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !answer.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-medium"
          >
            {loading ? 'جاري التقييم...' : 'إرسال الإجابة'}
          </button>
        </>
      ) : result && (
        <div className="space-y-4">
          <div className="text-center">
            <p className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
              {Math.round(result.score)}%
            </p>
            <p className="text-sm text-slate-400 mt-1">النتيجة</p>
          </div>

          <div className="bg-dark-200 rounded-lg p-4">
            <p className="text-slate-300 text-sm">{result.feedback}</p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">قوة الذاكرة:</span>
            <span className="text-blue-400 font-bold">{Math.round(result.memory_strength)}%</span>
          </div>

          <button
            onClick={onComplete}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
          >
            متابعة
          </button>
        </div>
      )}
    </div>
  )
}
