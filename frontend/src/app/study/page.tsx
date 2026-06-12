'use client'

import { useState } from 'react'
import ChatBox from '@/components/ChatBox'
import QuizCard from '@/components/QuizCard'

export default function StudyPage() {
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentTopicId, setCurrentTopicId] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[80vh]">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold mb-4 text-blue-400">💬 الدراسة مع المدرب الذكي</h1>
        <ChatBox
          onQuizTriggered={(topicId) => {
            setCurrentTopicId(topicId)
            setShowQuiz(true)
          }}
        />
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-purple-400">📝 اختبار سريع</h2>
        {showQuiz && currentTopicId ? (
          <QuizCard
            topicId={currentTopicId}
            onComplete={() => setShowQuiz(false)}
          />
        ) : (
          <div className="bg-dark-100 border border-slate-700 rounded-xl p-6 text-center">
            <p className="text-slate-400">
              ابدأ محادثة مع المدرب وسيظهر هنا سؤال اختبار بعد كل شرح
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
